#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, relative, sep } from 'node:path';
import { execFileSync } from 'node:child_process';

const REPOSITORY = 'https://github.com/untitleduico/react.git';
const COMMIT = 'c981a73bcd6b6c68d2a54070f20f020191212828';
const projectRoot = join(import.meta.dirname, '..');
const vendorRoot = join(projectRoot, 'vendor', 'untitled-ui');
const temporaryRoot = process.env.UNTITLED_UI_SOURCE ? undefined : mkdtempSync(join(tmpdir(), 'al-ui-untitled-ui-'));
const sourceRoot = process.env.UNTITLED_UI_SOURCE ?? join(temporaryRoot, 'react');

const runGit = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const toPosix = (path) => path.split(sep).join('/');
const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const walk = (root) =>
  readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

try {
  if (temporaryRoot) {
    mkdirSync(sourceRoot, { recursive: true });
    runGit(['init'], sourceRoot);
    runGit(['remote', 'add', 'origin', REPOSITORY], sourceRoot);
    runGit(['fetch', '--depth', '1', '--filter=blob:none', 'origin', COMMIT], sourceRoot);
    runGit(['checkout', '--detach', 'FETCH_HEAD'], sourceRoot);
  }

  const actualCommit = runGit(['rev-parse', 'HEAD'], sourceRoot);
  if (actualCommit !== COMMIT) {
    throw new Error(`Expected Untitled UI commit ${COMMIT}, received ${actualCommit}. Update the pin and catalog test deliberately before refreshing.`);
  }

  const componentTsx = walk(join(sourceRoot, 'components')).filter((path) => extname(path) === '.tsx');
  const excluded = componentTsx
    .filter((path) => basename(path).endsWith('.demo.tsx') || basename(path).endsWith('.story.tsx') || toPosix(relative(sourceRoot, path)).startsWith('components/internal/'))
    .map((path) => {
      const relativePath = toPosix(relative(sourceRoot, path));
      const reason = relativePath.startsWith('components/internal/') ? 'internal' : relativePath.endsWith('.demo.tsx') ? 'demo' : 'story';
      return { path: relativePath, reason };
    })
    .sort((a, b) => a.path.localeCompare(b.path));

  const includedPaths = [join(sourceRoot, 'LICENSE'), join(sourceRoot, 'README.md')];
  const sourceRules = [
    ['components', new Set(['.ts', '.tsx', '.json'])],
    ['hooks', new Set(['.ts', '.tsx'])],
    ['utils', new Set(['.ts', '.tsx'])],
    ['styles', new Set(['.css'])],
  ];

  for (const [directory, extensions] of sourceRules) {
    for (const path of walk(join(sourceRoot, directory))) {
      const relativePath = toPosix(relative(sourceRoot, path));
      const isExcluded = excluded.some((entry) => entry.path === relativePath);
      if (extensions.has(extname(path)) && !isExcluded) includedPaths.push(path);
    }
  }

  rmSync(vendorRoot, { recursive: true, force: true });
  mkdirSync(vendorRoot, { recursive: true });

  const included = [...new Set(includedPaths)]
    .sort((a, b) => toPosix(relative(sourceRoot, a)).localeCompare(toPosix(relative(sourceRoot, b))))
    .map((sourcePath) => {
      const relativePath = toPosix(relative(sourceRoot, sourcePath));
      const destination = join(vendorRoot, relativePath);
      mkdirSync(dirname(destination), { recursive: true });
      cpSync(sourcePath, destination, { preserveTimestamps: false });

      let kind = 'metadata';
      if (relativePath === 'LICENSE') kind = 'license';
      else if (relativePath === 'README.md') kind = 'readme';
      else if (relativePath.startsWith('components/') && relativePath.endsWith('.tsx')) kind = 'component';
      else if (relativePath.startsWith('components/')) kind = 'component-support';
      else if (relativePath.startsWith('hooks/')) kind = 'hook';
      else if (relativePath.startsWith('utils/')) kind = 'utility';
      else if (relativePath.startsWith('styles/')) kind = 'style';

      const entry = { path: relativePath, kind, sha256: sha256(sourcePath) };
      if (/\.(?:ts|tsx)$/.test(relativePath)) {
        entry.exportSubpath = `./untitled-ui/${relativePath.replace(/\.(?:ts|tsx)$/, '')}`;
      }
      return entry;
    });

  const includedComponentTsx = included.filter((file) => file.kind === 'component');
  const includedComponentTsxByCategory = Object.fromEntries(
    ['application', 'base', 'foundations', 'shared-assets'].map((category) => [
      category,
      includedComponentTsx.filter((file) => file.path.startsWith(`components/${category}/`)).length,
    ]),
  );
  const excludedComponentTsxByReason = Object.fromEntries(
    ['demo', 'story', 'internal'].map((reason) => [reason, excluded.filter((file) => file.reason === reason).length]),
  );
  const supportingSourceFiles = included.filter((file) => ['component-support', 'hook', 'utility', 'style'].includes(file.kind)).length;

  const manifest = {
    schemaVersion: 1,
    upstream: {
      repository: REPOSITORY,
      commit: COMMIT,
      commitDate: runGit(['show', '-s', '--format=%cI', 'HEAD'], sourceRoot),
      license: 'MIT',
    },
    policy: {
      included: ['LICENSE', 'README.md', 'components/**/*.{ts,tsx,json}', 'hooks/**/*.{ts,tsx}', 'utils/**/*.{ts,tsx}', 'styles/**/*.css'],
      excluded: ['components/**/*.demo.tsx', 'components/**/*.story.tsx', 'components/internal/**'],
      note: 'Only source from the MIT-licensed open-source repository is included. Untitled UI React PRO is not included.',
    },
    counts: {
      upstreamComponentTsx: componentTsx.length,
      includedComponentTsx: includedComponentTsx.length,
      includedComponentTsxByCategory,
      excludedComponentTsx: excluded.length,
      excludedComponentTsxByReason,
      supportingSourceFiles,
      includedUpstreamFiles: included.length,
    },
    files: { included, excluded },
  };

  writeFileSync(join(vendorRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(manifest.counts, null, 2));
} finally {
  if (temporaryRoot) rmSync(temporaryRoot, { recursive: true, force: true });
}
