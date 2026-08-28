// @vitest-environment jsdom
import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as UI from '../src/index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const expectedExports = [
  'LoadingState',
  'Thinking',
  'StreamingText',
  'ApprovalCard',
  'ToolChips',
  'TaskRows',
  'Chat',
  'PromptBar',
  'RecommendationCard',
  'ContextCards',
  'DiffTable',
  'RecordsTable',
  'FilterTable',
  'SidebarNav',
  'Search',
  'Flowchart',
  'InsightCards',
  'CodeBlock',
  'FineTuneCard',
  'SelectionActions',
] as const;

const renderProps: Record<(typeof expectedExports)[number], Record<string, unknown>> = {
  LoadingState: { label: 'Churning' },
  Thinking: { summary: 'Thinking', children: 'Inspecting records' },
  StreamingText: { text: 'A grounded answer.' },
  ApprovalCard: { title: 'Proceed?', options: ['Approve', 'Skip'] },
  ToolChips: { items: [{ label: 'Read records', status: 'complete' }] },
  TaskRows: { tasks: [{ id: 'verify', label: 'Verify records', status: 'complete' }] },
  Chat: { messages: [{ id: '1', role: 'assistant', content: 'Ready.' }] },
  PromptBar: { placeholder: 'Ask anything' },
  RecommendationCard: { title: 'Restock', body: 'Order waffle cones.' },
  ContextCards: { items: [{ id: 'sop', title: 'Vendor SOP', kind: 'PDF', content: 'Verify certification.' }] },
  DiffTable: { columns: ['Flavor', 'Supplier'], rows: [{ id: 'mint', cells: ['Mint', 'Maple'], change: 'add' }] },
  RecordsTable: { records: [{ id: '1', name: 'Maple Orbit', categories: ['Supplier'], lastInteraction: 'Today', strength: 'Strong' }] },
  FilterTable: { columns: ['Task', 'Status'], rows: [['Verify', 'Done']], statusColumn: 1 },
  SidebarNav: { workspace: 'Creamery Ops', items: [{ id: 'home', label: 'Home' }] },
  Search: { items: ['Forecast summer demand'] },
  Flowchart: { steps: [{ id: 'trigger', kind: 'Trigger', title: 'New order created' }] },
  InsightCards: { insights: [{ id: 'trend', title: 'Trend', body: 'Pistachio is up 23%.', value: '+23%' }] },
  CodeBlock: { code: 'const ready = true;' },
  FineTuneCard: { title: 'Flavor card' },
  SelectionActions: { text: 'Churn pistachio first.' },
};

let container: HTMLDivElement | undefined;
let root: Root | undefined;

function mount(element: ReactElement) {
  container = document.createElement('div');
  document.body.append(container);
  act(() => {
    root = createRoot(container!);
    root.render(element);
  });
  return container;
}

function click(button: Element | null) {
  expect(button).not.toBeNull();
  act(() => button!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

afterEach(() => {
  if (root) act(() => root!.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

describe('Beautiful UI catalog', () => {
  it('maps all 20 numbered entries to public package exports', () => {
    expect(UI.beautifulUiCatalog).toHaveLength(20);
    expect(UI.beautifulUiCatalog.map((entry) => entry.exportName)).toEqual(expectedExports);
    for (const name of expectedExports) expect(UI[name]).toBeTypeOf('function');
  });

  it('server-renders every catalog export as a reusable component', () => {
    for (const name of expectedExports) {
      const Component = UI[name] as React.ComponentType<Record<string, unknown>>;
      const html = renderToStaticMarkup(createElement(Component, renderProps[name]));
      expect(html, name).not.toBe('');
      expect(html, name).not.toContain('data-demo-only');
    }
  });

  it('submits prompts and clears the composer', () => {
    const onSubmit = vi.fn();
    const view = mount(createElement(UI.PromptBar, { onSubmit }));
    const input = view.querySelector('textarea')!;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
      setter.call(input, 'Compare margins');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => view.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(onSubmit).toHaveBeenCalledWith('Compare margins');
    expect((input as HTMLTextAreaElement).value).toBe('');
  });

  it('filters records and dispatches search selections', () => {
    const filtered = mount(createElement(UI.FilterTable, {
      columns: ['Task', 'Status'],
      rows: [['Verify', 'Done'], ['Draft', 'To do']],
      statusColumn: 1,
    }));
    click([...filtered.querySelectorAll('button')].find((button) => button.textContent?.includes('Done')) ?? null);
    expect(filtered.textContent).toContain('Verify');
    expect(filtered.textContent).not.toContain('Draft');
    act(() => root!.unmount());
    filtered.remove();
    root = undefined;

    const onSelect = vi.fn();
    const searched = mount(createElement(UI.Search, { items: ['Forecast demand', 'Find suppliers'], onSelect }));
    const input = searched.querySelector('input')!;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, 'supplier');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(searched.textContent).not.toContain('Forecast demand');
    click([...searched.querySelectorAll('button')].find((button) => button.textContent?.includes('Find suppliers')) ?? null);
    expect(onSelect).toHaveBeenCalledWith('Find suppliers');
  });

  it('toggles proposed changes and applies only selected diff rows', () => {
    const onApply = vi.fn();
    const view = mount(createElement(UI.DiffTable, {
      columns: ['Flavor'],
      rows: [
        { id: 'rocky', cells: ['Rocky Road'], change: 'remove' },
        { id: 'pistachio', cells: ['Pistachio'], change: 'add' },
      ],
      onApply,
    }));
    click(view.querySelector('tbody button'));
    click([...view.querySelectorAll('button')].find((button) => button.textContent?.startsWith('Apply')) ?? null);
    expect(onApply).toHaveBeenCalledWith(['pistachio']);
  });

  it('runs selection actions with selected text and requested action', () => {
    const onAction = vi.fn();
    const view = mount(createElement(UI.SelectionActions, { text: 'Churn pistachio first.', onAction }));
    click([...view.querySelectorAll('button')].find((button) => button.textContent === 'Shorten') ?? null);
    expect(onAction).toHaveBeenCalledWith('Shorten', 'Churn pistachio first.');
  });
});
