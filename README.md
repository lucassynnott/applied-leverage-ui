# Applied Leverage UI

Internal React component library for agent-native software.

## What is included

- 18 original, reusable Applied Leverage primitives: loading, thinking, tool calls, task status, approvals, recommendations, sources, context cards, code, diffs, tables, filtering, prompt input, command search, streaming text, tool chips, and image generation state.
- The complete 20-entry Beautiful UI catalog published on 2026-08-28, adapted into dependency-free React components and mapped in `beautifulUiCatalog`.

```tsx
import { beautifulUiCatalog, Flowchart, SelectionActions } from '@applied-leverage/ui';
```

## Install in another local project

```bash
npm install /home/lucas/projects/al-ui
```

```tsx
import { TaskList, PromptBar } from '@applied-leverage/ui';
import '@applied-leverage/ui/styles.css';
```

## Development

```bash
npm install
npm run dev
npm run check
```

## Design and source policy

- AIcss: used only for agent-state vocabulary and interaction research. Its pricing page says 9 components are free and the full 14-component set requires a paid license. Public code visibility is not treated as permission, and no AIcss component source is included here.
- Beautiful UI: all 20 public registry components were retrieved on 2026-08-28 and adapted to this package's dependency-free React and CSS API under the MIT license, copyright © 2026 Shane Levine. The original retrieved source is retained in `.beautiful-ui-upstream.json`; the catalog map is `src/catalog.ts`; the full notice is in `THIRD_PARTY_NOTICES.md`.
- Zepa UI: used as visual reference only. Its MIT + Commons Clause license explicitly forbids repackaging components in another component library. No Zepa source is included.

Source URLs:

- https://www.aicss.dev
- https://www.aicss.dev/pricing
- https://www.beautifului.dev
- https://www.beautifului.dev/license
- https://zepa.design/components
- https://github.com/zepa-ui/zepa.design/blob/main/LICENSE

## Rules for future builds

1. Import primitives from this package instead of rebuilding agent states ad hoc.
2. Theme via the `--al-*` semantic CSS variables.
3. Keep product-specific layout and branding in the consuming app.
4. Add components only when they represent a repeated cross-product pattern.
5. Preserve reduced-motion support, keyboard semantics, and light/dark token parity.
