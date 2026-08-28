import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = join(import.meta.dirname, '..');
const vendorRoot = join(projectRoot, 'vendor', 'untitled-ui');

type ManifestFile = {
  path: string;
  kind: string;
  sha256: string;
  exportSubpath?: string;
};

type Manifest = {
  schemaVersion: number;
  upstream: { repository: string; commit: string; license: string };
  counts: {
    upstreamComponentTsx: number;
    includedComponentTsx: number;
    includedComponentTsxByCategory: Record<string, number>;
    excludedComponentTsx: number;
    excludedComponentTsxByReason: Record<string, number>;
    supportingSourceFiles: number;
    includedUpstreamFiles: number;
  };
  files: {
    included: ManifestFile[];
    excluded: Array<{ path: string; reason: string }>;
  };
};

const walk = (root: string): string[] =>
  readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const sha256 = (contents: Buffer | string) => createHash('sha256').update(contents).digest('hex');

describe('vendored Untitled UI React catalog', () => {
  const manifest = JSON.parse(readFileSync(join(vendorRoot, 'manifest.json'), 'utf8')) as Manifest;

  it('pins and accounts for the complete MIT open-source component snapshot', () => {
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.upstream).toMatchObject({
      repository: 'https://github.com/untitleduico/react.git',
      commit: 'c981a73bcd6b6c68d2a54070f20f020191212828',
      license: 'MIT',
    });
    expect(manifest.counts).toMatchObject({
      upstreamComponentTsx: 296,
      includedComponentTsx: 220,
      includedComponentTsxByCategory: {
        application: 31,
        base: 70,
        foundations: 104,
        'shared-assets': 15,
      },
      excludedComponentTsx: 76,
      excludedComponentTsxByReason: { demo: 36, story: 39, internal: 1 },
      supportingSourceFiles: 18,
      includedUpstreamFiles: 240,
    });
    expect(manifest.files.excluded).toHaveLength(76);
  });

  it('contains exactly the 220 intended component TSX files and no excluded material', () => {
    const componentRoot = join(vendorRoot, 'components');
    const actual = walk(componentRoot)
      .map((path) => relative(vendorRoot, path).replaceAll('\\', '/'))
      .filter((path) => path.endsWith('.tsx'))
      .sort();
    const declared = manifest.files.included
      .map((file) => file.path)
      .filter((path) => path.startsWith('components/') && path.endsWith('.tsx'))
      .sort();

    expect(actual).toEqual(declared);
    expect(actual).toHaveLength(220);
    expect(actual.some((path) => path.endsWith('.demo.tsx'))).toBe(false);
    expect(actual.some((path) => path.endsWith('.story.tsx'))).toBe(false);
    expect(actual.some((path) => path.startsWith('components/internal/'))).toBe(false);
  });

  it('preserves every declared upstream file byte-for-byte by SHA-256', () => {
    expect(manifest.files.included).toHaveLength(240);
    for (const file of manifest.files.included) {
      expect(sha256(readFileSync(join(vendorRoot, file.path))), file.path).toBe(file.sha256);
    }
    expect(sha256(readFileSync(join(vendorRoot, 'LICENSE')))).toBe(
      'c4b824495f1d48ee0b257606dccdb9b0a442d565ce155fc1eb86f497172534e1',
    );
  });

  it('exposes compiled source, styles, manifest, and vendor files through the package', () => {
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8')) as {
      files: string[];
      exports: Record<string, unknown>;
    };
    expect(packageJson.files).toEqual(expect.arrayContaining(['dist', 'vendor', 'THIRD_PARTY_NOTICES.md']));
    expect(packageJson.exports).toHaveProperty('./untitled-ui/*');
    expect(packageJson.exports).toHaveProperty('./untitled-ui/styles.css', './vendor/untitled-ui/styles/package.css');
    expect(packageJson.exports).toHaveProperty('./untitled-ui/manifest.json');
    expect(readFileSync(join(vendorRoot, 'styles', 'package.css'), 'utf8')).toContain('@source "../components"');
    expect(readFileSync(join(vendorRoot, 'styles', 'package.css'), 'utf8')).toContain('@utility transition-inherit-all');
  });

  it('declares the React version required by the pinned upstream components', () => {
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8')) as {
      peerDependencies: Record<string, string>;
    };
    expect(packageJson.peerDependencies).toMatchObject({ react: '>=19.2', 'react-dom': '>=19.2' });
  });

  it('contains no imports from separately licensed Untitled UI PRO packages', () => {
    const source = walk(vendorRoot)
      .filter((path) => /\.(?:ts|tsx)$/.test(path))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');
    expect(source).not.toContain('@untitledui-pro/');
  });
});
