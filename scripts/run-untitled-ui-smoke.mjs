#!/usr/bin/env node

import assert from 'node:assert/strict';
import { join } from 'node:path';
import { createServer } from 'vite';

const projectRoot = join(import.meta.dirname, '..');
const server = await createServer({
  root: projectRoot,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true },
});

try {
  const { markup } = await server.ssrLoadModule('/tests/untitled-ui-consumer.smoke.tsx');
  assert.match(markup, /Loading catalog/);
  assert.match(markup, /Open source/);
  assert.match(markup, /Foundation dot/);
  assert.match(markup, /mask0_/);
  console.log('Untitled UI package smoke rendered application, base, foundations, and shared-assets components.');
} finally {
  await server.close();
}

const React = await import('react');
const { renderToStaticMarkup } = await import('react-dom/server');
const { Button } = await import('@applied-leverage/ui/untitled-ui/components/base/buttons/button');
const nodeMarkup = renderToStaticMarkup(React.createElement(Button, null, 'Node ESM works'));
assert.match(nodeMarkup, /Node ESM works/);
console.log('Untitled UI package subpath imported and rendered in native Node ESM.');
