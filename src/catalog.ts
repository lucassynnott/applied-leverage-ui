/**
 * Source-of-truth map for the 20 numbered entries published at beautifului.dev.
 * Source was retrieved from each live “View code” dialog / registry endpoint on
 * 2026-08-28 and adapted to this package's dependency-free React + CSS API.
 */
export const beautifulUiCatalog = [
  { number: 1, title: 'Loading State', exportName: 'LoadingState', slug: 'loading-state', upstreamPath: 'components/LoadingState.tsx' },
  { number: 2, title: 'Thinking', exportName: 'Thinking', slug: 'thinking-state', upstreamPath: 'components/ThinkingState.tsx' },
  { number: 3, title: 'Streaming Text', exportName: 'StreamingText', slug: 'streaming-text', upstreamPath: 'components/StreamingText.tsx' },
  { number: 4, title: 'Approval Card', exportName: 'ApprovalCard', slug: 'approval-card', upstreamPath: 'components/ApprovalCard.tsx' },
  { number: 5, title: 'Tool Chips', exportName: 'ToolChips', slug: 'tool-chips', upstreamPath: 'components/ToolChips.tsx' },
  { number: 6, title: 'Task Rows', exportName: 'TaskRows', slug: 'task-rows', upstreamPath: 'components/primitives/TaskRows.tsx' },
  { number: 7, title: 'Chat', exportName: 'Chat', slug: 'chat-composer', upstreamPath: 'components/ChatComposer.tsx' },
  { number: 8, title: 'Prompt Bar', exportName: 'PromptBar', slug: 'prompt-bar', upstreamPath: 'components/PromptBar.tsx' },
  { number: 9, title: 'Recommendation Card', exportName: 'RecommendationCard', slug: 'recommendation-card', upstreamPath: 'components/RecommendationCard.tsx' },
  { number: 10, title: 'Context Cards', exportName: 'ContextCards', slug: 'context-cards', upstreamPath: 'components/ContextCards.tsx' },
  { number: 11, title: 'Diff Table', exportName: 'DiffTable', slug: 'diff-table', upstreamPath: 'components/DiffTable.tsx' },
  { number: 12, title: 'Records Table', exportName: 'RecordsTable', slug: 'records-table', upstreamPath: 'components/RecordsTable.tsx' },
  { number: 13, title: 'Filter Table', exportName: 'FilterTable', slug: 'filter-table', upstreamPath: 'components/FilterTable.tsx' },
  { number: 14, title: 'Sidebar Nav', exportName: 'SidebarNav', slug: 'sidebar-nav', upstreamPath: 'components/SidebarNav.tsx' },
  { number: 15, title: 'Search', exportName: 'Search', slug: 'search', upstreamPath: 'components/SearchList.tsx' },
  { number: 16, title: 'Flowchart', exportName: 'Flowchart', slug: 'flowchart', upstreamPath: 'components/Flowchart.tsx' },
  { number: 17, title: 'Insight Cards', exportName: 'InsightCards', slug: 'insight-cards', upstreamPath: 'components/InsightCards.tsx' },
  { number: 18, title: 'Code Block', exportName: 'CodeBlock', slug: 'code-block', upstreamPath: 'components/CodeBlock.tsx' },
  { number: 19, title: 'Fine-tune Card', exportName: 'FineTuneCard', slug: 'fine-tune-card', upstreamPath: 'components/FineTuneCard.tsx' },
  { number: 20, title: 'Selection Actions', exportName: 'SelectionActions', slug: 'selection-actions', upstreamPath: 'components/SelectionActions.tsx' },
] as const;

export type BeautifulUiCatalogEntry = (typeof beautifulUiCatalog)[number];
export type BeautifulUiExportName = BeautifulUiCatalogEntry['exportName'];

export function beautifulUiRegistryUrl(entry: BeautifulUiCatalogEntry) {
  return `https://www.beautifului.dev/r/${entry.slug}.json`;
}
