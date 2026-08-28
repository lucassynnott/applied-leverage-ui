import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import type { Status, Task } from './components';

/**
 * Adapted from the Beautiful UI copyable component catalog.
 * Upstream: https://www.beautifului.dev
 * MIT License — Copyright (c) 2026 Shane Levine.
 * See THIRD_PARTY_NOTICES.md for the full permission notice.
 */

export type LoadingVariant = 'Drive' | 'Dots' | 'Orbit' | 'Surfer';

const driveDelays = Array.from({ length: 9 }, (_, index) => {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return column + Math.abs(row - 1);
});
const orbitOrder = [0, 1, 2, 5, 8, 7, 6, 3];

export interface LoadingStateProps {
  label?: string;
  variant?: LoadingVariant;
  videoSrc?: string;
  initialSeconds?: number;
}

export function LoadingState({
  label,
  variant = 'Drive',
  videoSrc,
  initialSeconds = 0,
}: LoadingStateProps) {
  const [deciseconds, setDeciseconds] = useState(Math.max(0, Math.round(initialSeconds * 10)));
  const [videoAvailable, setVideoAvailable] = useState(true);
  useEffect(() => {
    const timer = window.setInterval(() => setDeciseconds((value) => value + 1), 100);
    return () => window.clearInterval(timer);
  }, []);
  const seconds = deciseconds / 10;
  const elapsed = seconds < 60
    ? `${seconds.toFixed(1)}s`
    : `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(1)}s`;
  const delays = variant === 'Orbit'
    ? Array.from({ length: 9 }, (_, index) => orbitOrder.indexOf(index))
    : driveDelays;
  const resolvedLabel = label ?? (variant === 'Surfer' ? 'Subway surfing' : 'Churning');

  return (
    <div className="bui-loading" role="status" aria-live="polite" data-variant={variant.toLowerCase()}>
      <span className="bui-pixel-grid" aria-hidden="true">
        {delays.map((delay, index) => (
          <i key={index} style={{ '--bui-delay': `${Math.max(0, delay) * 90}ms` } as React.CSSProperties} />
        ))}
      </span>
      <span className="bui-shimmer">{resolvedLabel}</span>
      <time>{elapsed}</time>
      {variant === 'Surfer' && (
        <span className="bui-surfer">
          {videoSrc && videoAvailable ? (
            <video src={videoSrc} autoPlay muted loop playsInline onError={() => setVideoAvailable(false)} />
          ) : (
            <span>Video unavailable</span>
          )}
        </span>
      )}
    </div>
  );
}

export interface StreamingSource {
  title: string;
  url: string;
  domain?: string;
}

export interface StreamingTextProps {
  text: string;
  speed?: number;
  sources?: StreamingSource[];
  followUps?: string[];
  onFollowUp?: (prompt: string) => void;
  animate?: boolean;
}

export function StreamingText({
  text,
  speed = 18,
  sources = [],
  followUps = [],
  onFollowUp,
  animate = true,
}: StreamingTextProps) {
  const [visible, setVisible] = useState(animate ? 0 : text.length);
  useEffect(() => {
    if (!animate) {
      setVisible(text.length);
      return undefined;
    }
    setVisible(0);
    const timer = window.setInterval(() => {
      setVisible((value) => {
        if (value >= text.length) {
          window.clearInterval(timer);
          return value;
        }
        return value + 1;
      });
    }, speed);
    return () => window.clearInterval(timer);
  }, [animate, speed, text]);
  const complete = visible >= text.length;

  return (
    <article className="bui-streaming" aria-label={text}>
      <p>{text.slice(0, visible)}{!complete && <span className="bui-caret" aria-hidden="true" />}</p>
      {sources.length > 0 && (
        <div className="bui-source-strip" aria-label={`${sources.length} sources`}>
          {sources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              <strong>{source.title}</strong><small>{source.domain ?? new URL(source.url).hostname}</small>
            </a>
          ))}
        </div>
      )}
      {followUps.length > 0 && (
        <div className="bui-followups"><small>Follow-ups</small>{followUps.map((prompt) => (
          <button key={prompt} type="button" onClick={() => onFollowUp?.(prompt)}>{prompt}<span>↗</span></button>
        ))}</div>
      )}
    </article>
  );
}

export interface TaskRow extends Task {
  children?: Omit<Task, 'id'>[];
}

export interface TaskRowsProps {
  tasks: TaskRow[];
  mode?: 'capsules' | 'list';
  onToggle?: (task: TaskRow) => void;
}

const taskStatusLabel: Record<Status, string> = {
  idle: 'Queued',
  running: 'In progress',
  complete: 'Completed',
  failed: 'Failed',
};

export function TaskRows({ tasks, mode = 'list', onToggle }: TaskRowsProps) {
  const [open, setOpen] = useState<string[]>([]);
  const toggle = (task: TaskRow) => {
    setOpen((current) => current.includes(task.id)
      ? current.filter((id) => id !== task.id)
      : [...current, task.id]);
    onToggle?.(task);
  };
  return (
    <div className="bui-task-rows" data-mode={mode}>
      {tasks.map((task, index) => {
        const expanded = open.includes(task.id);
        return (
          <section key={task.id} data-status={task.status}>
            <button type="button" onClick={() => toggle(task)} aria-expanded={expanded}>
              <span className="bui-step">{task.status === 'complete' ? '✓' : index + 1}</span>
              <span><strong>{task.label}</strong>{task.detail && <small>{task.detail}</small>}</span>
              <em>{taskStatusLabel[task.status]}</em>
            </button>
            {expanded && task.children && (
              <ul>{task.children.map((child, childIndex) => (
                <li key={`${task.id}-${childIndex}`} data-status={child.status}>
                  <i className="al-status" /><span>{child.label}</span>{child.detail && <small>{child.detail}</small>}
                </li>
              ))}</ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'reasoning';
  content: ReactNode;
  meta?: string;
}

export interface ChatProps {
  tabs?: string[];
  messages?: ChatMessage[];
  placeholder?: string;
  onSend?: (message: string, tab: string) => void;
}

export function Chat({ tabs = ['Chat'], messages = [], placeholder = 'Ask a follow-up', onSend }: ChatProps) {
  const [activeTab, setActiveTab] = useState(tabs[0] ?? 'Chat');
  const [value, setValue] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const message = value.trim();
    if (!message) return;
    onSend?.(message, activeTab);
    setValue('');
  };
  return (
    <section className="bui-chat">
      <nav aria-label="Chat views">{tabs.map((tab) => (
        <button key={tab} type="button" aria-pressed={tab === activeTab} onClick={() => setActiveTab(tab)}>{tab}</button>
      ))}</nav>
      <div className="bui-chat-log" role="log">
        {messages.map((message) => (
          <article key={message.id} data-role={message.role}>
            {message.meta && <small>{message.meta}</small>}<div>{message.content}</div>
          </article>
        ))}
      </div>
      <form onSubmit={submit}>
        <label className="al-sr" htmlFor="bui-chat-input">Message</label>
        <input id="bui-chat-input" value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} />
        <button type="submit" disabled={!value.trim()} aria-label="Send message">↑</button>
      </form>
    </section>
  );
}

export interface ContextCardItem {
  id: string;
  title: string;
  kind: string;
  content: ReactNode;
  meta?: string;
  source?: string;
}

export function ContextCards({ items, label = 'All chunks' }: { items: ContextCardItem[]; label?: string }) {
  return (
    <section className="bui-context-cards">
      <header><strong>{label}</strong><span>{items.length}</span></header>
      {items.map((item) => (
        <article key={item.id}>
          <header><span>{item.kind}</span>{item.meta && <small>{item.meta}</small>}</header>
          <h3>{item.title}</h3><div>{item.content}</div>
          {item.source && <footer>{item.source}</footer>}
        </article>
      ))}
    </section>
  );
}

export type DiffTableChange = 'add' | 'remove' | 'change' | 'none';
export interface DiffTableRow {
  id: string;
  cells: ReactNode[];
  change?: DiffTableChange;
}
export interface DiffTableProps {
  title?: string;
  columns: string[];
  rows: DiffTableRow[];
  onApply?: (selectedIds: string[]) => void;
}

export function DiffTable({ title = 'Proposed changes', columns, rows, onApply }: DiffTableProps) {
  const changedIds = useMemo(() => rows.filter((row) => row.change && row.change !== 'none').map((row) => row.id), [rows]);
  const [selected, setSelected] = useState<string[]>(changedIds);
  useEffect(() => setSelected(changedIds), [changedIds]);
  const toggle = (id: string) => setSelected((current) => current.includes(id)
    ? current.filter((value) => value !== id)
    : [...current, id]);
  return (
    <section className="bui-diff-table">
      <header><div><strong>{title}</strong><small>Click changed rows to toggle</small></div><span>{selected.length}/{changedIds.length}</span></header>
      <div className="al-table-wrap"><table className="al-table"><thead><tr><th aria-label="Include change" />{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>{rows.map((row) => {
          const changed = row.change && row.change !== 'none';
          const included = selected.includes(row.id);
          return <tr key={row.id} data-change={row.change ?? 'none'} data-selected={included || undefined}>
            <td>{changed && <button type="button" aria-label={`${included ? 'Exclude' : 'Include'} ${row.id}`} aria-pressed={included} onClick={() => toggle(row.id)}>{included ? '✓' : '○'}</button>}</td>
            {row.cells.map((cell, index) => <td key={index}>{cell}</td>)}
          </tr>;
        })}</tbody></table></div>
      <footer><span>{changedIds.length} proposed changes</span><button className="al-primary" type="button" disabled={!selected.length} onClick={() => onApply?.(selected)}>Apply {selected.length} changes</button></footer>
    </section>
  );
}

export interface RecordItem {
  id: string;
  name: string;
  url?: string;
  categories?: string[];
  lastInteraction?: string;
  strength?: string;
  links?: { label: string; url: string }[];
}

export interface RecordsTableProps {
  records: RecordItem[];
  caption?: string;
  onSelect?: (record: RecordItem) => void;
}

export function RecordsTable({ records, caption = 'Records', onSelect }: RecordsTableProps) {
  const [sortAscending, setSortAscending] = useState(true);
  const sorted = useMemo(() => [...records].sort((a, b) => (
    sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  )), [records, sortAscending]);
  return (
    <div className="bui-records al-table-wrap">
      <table className="al-table"><caption>{caption}</caption><thead><tr>
        <th><button type="button" onClick={() => setSortAscending((value) => !value)}>Company {sortAscending ? '↑' : '↓'}</button></th>
        <th>Categories</th><th>Last interaction</th><th>Connection strength</th><th>Links</th>
      </tr></thead><tbody>{sorted.map((record) => (
        <tr key={record.id}>
          <td><button type="button" onClick={() => onSelect?.(record)}>{record.name}</button></td>
          <td><div className="bui-tags">{record.categories?.map((category) => <span key={category}>{category}</span>)}</div></td>
          <td>{record.lastInteraction ?? 'No contact'}</td><td><span className="bui-strength">{record.strength ?? 'No communication'}</span></td>
          <td>{record.links?.length ? record.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>) : '—'}</td>
        </tr>
      ))}</tbody><tfoot><tr><td>{records.length} count</td><td>Add calculation</td><td>—</td><td>—</td><td>{records.reduce((total, record) => total + (record.links?.length ?? 0), 0)} links</td></tr></tfoot></table>
    </div>
  );
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  meta?: string;
}
export interface SidebarNavProps {
  workspace: string;
  items: SidebarItem[];
  recent?: SidebarItem[];
  activeId?: string;
  onNavigate?: (item: SidebarItem) => void;
  defaultCollapsed?: boolean;
}

export function SidebarNav({ workspace, items, recent = [], activeId, onNavigate, defaultCollapsed = false }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <aside className="bui-sidebar" data-collapsed={collapsed || undefined}>
      <header><strong title={workspace}>{collapsed ? workspace.slice(0, 1) : workspace}</strong><button type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed((value) => !value)}>{collapsed ? '→' : '←'}</button></header>
      <nav aria-label={`${workspace} navigation`}>
        {items.map((item) => <button key={item.id} type="button" aria-current={item.id === activeId ? 'page' : undefined} title={item.label} onClick={() => onNavigate?.(item)}>{item.icon && <i>{item.icon}</i>}<span>{item.label}</span>{item.meta && <small>{item.meta}</small>}</button>)}
      </nav>
      {recent.length > 0 && <section><small>Recent</small>{recent.map((item) => <button key={item.id} type="button" title={item.label} onClick={() => onNavigate?.(item)}><span>{item.label}</span></button>)}</section>}
    </aside>
  );
}

export function Search({ items, onSelect, placeholder = 'Search commands' }: { items: string[]; onSelect?: (item: string) => void; placeholder?: string }) {
  const [query, setQuery] = useState('');
  const matches = items.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <section className="bui-search">
      <label><span aria-hidden="true">⌕</span><span className="al-sr">Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} /></label>
      {matches.length > 0 ? <ul>{matches.map((item) => <li key={item}><button type="button" onClick={() => onSelect?.(item)}><span>{item}</span><kbd>↵</kbd></button></li>)}</ul> : <p><strong>No results</strong><span>Try a different search.</span></p>}
    </section>
  );
}

export interface FlowStep {
  id: string;
  kind: 'Trigger' | 'Action' | 'If / Else' | string;
  title: string;
  description?: string;
  conditions?: { field: string; operator: string; value: string }[];
}

export function Flowchart({ steps, onSelect }: { steps: FlowStep[]; onSelect?: (step: FlowStep) => void }) {
  return (
    <div className="bui-flowchart">
      {steps.map((step, index) => (
        <div className="bui-flow-step" key={step.id}>
          {index > 0 && <span className="bui-connector" aria-hidden="true" />}
          <button type="button" onClick={() => onSelect?.(step)}>
            <small>{step.kind}</small><strong>{step.title}</strong>{step.description && <span>{step.description}</span>}
            {step.conditions?.map((condition, conditionIndex) => <code key={conditionIndex}>{condition.field} <em>{condition.operator}</em> {condition.value}</code>)}
          </button>
        </div>
      ))}
    </div>
  );
}

export interface InsightItem {
  id: string;
  title: string;
  body: ReactNode;
  value?: string;
  tone?: 'positive' | 'negative' | 'neutral';
  chart?: number[];
}

export function InsightCards({ insights, onAction, actionLabel = 'Take action' }: { insights: InsightItem[]; onAction?: (insight: InsightItem) => void; actionLabel?: string }) {
  const [index, setIndex] = useState(0);
  const insight = insights[Math.min(index, Math.max(0, insights.length - 1))];
  if (!insight) return <section className="bui-insights"><p>No insights yet.</p></section>;
  const chart = insight.chart ?? [20, 34, 30, 46, 42, 61, 55];
  const width = 240;
  const height = 72;
  const max = Math.max(...chart);
  const min = Math.min(...chart);
  const points = chart.map((value, pointIndex) => `${(pointIndex / Math.max(1, chart.length - 1)) * width},${height - ((value - min) / Math.max(1, max - min)) * height}`).join(' ');
  return (
    <section className="bui-insights" data-tone={insight.tone ?? 'neutral'}>
      <header><strong>Insights</strong><span>{index + 1}/{insights.length}</span><div><button type="button" aria-label="Previous insight" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>←</button><button type="button" aria-label="Next insight" disabled={index === insights.length - 1} onClick={() => setIndex((value) => value + 1)}>→</button></div></header>
      <article><small>{insight.title}</small><div>{insight.body}</div>{insight.value && <strong>{insight.value}</strong>}</article>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${insight.title} trend`} preserveAspectRatio="none"><polyline points={points} /></svg>
      <button type="button" className="bui-insight-action" onClick={() => onAction?.(insight)}>{actionLabel}<span>↗</span></button>
    </section>
  );
}

export interface FineTuneValues {
  width: number;
  height: number;
  radius: number;
  opacity: number;
  font: string;
}

export function FineTuneCard({ title = 'Selection', initialValues, onChange }: { title?: string; initialValues?: Partial<FineTuneValues>; onChange?: (values: FineTuneValues) => void }) {
  const [values, setValues] = useState<FineTuneValues>({ width: 320, height: 180, radius: 12, opacity: 100, font: 'Sans', ...initialValues });
  const update = <K extends keyof FineTuneValues>(key: K, value: FineTuneValues[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    onChange?.(next);
  };
  return (
    <section className="bui-finetune">
      <header><strong>{title}</strong><span>Adjust</span></header>
      <fieldset><legend>Layout</legend><label>W<input aria-label="Width" type="number" value={values.width} onChange={(event) => update('width', Number(event.target.value))} /></label><label>H<input aria-label="Height" type="number" value={values.height} onChange={(event) => update('height', Number(event.target.value))} /></label></fieldset>
      <fieldset><legend>Appearance</legend><label>Radius<input type="range" min="0" max="48" value={values.radius} onChange={(event) => update('radius', Number(event.target.value))} /><output>{values.radius}px</output></label><label>Opacity<input type="range" min="0" max="100" value={values.opacity} onChange={(event) => update('opacity', Number(event.target.value))} /><output>{values.opacity}%</output></label></fieldset>
      <label>Type<select value={values.font} onChange={(event) => update('font', event.target.value)}><option>Sans</option><option>Serif</option><option>Mono</option></select></label>
    </section>
  );
}

export type SelectionAction = 'Explain' | 'Improve' | 'Shorten' | 'Tone' | 'Grammar';

export function SelectionActions({ text, actions = ['Explain', 'Improve', 'Shorten', 'Tone', 'Grammar'], onAction }: { text: string; actions?: SelectionAction[]; onAction?: (action: SelectionAction, selectedText: string) => void }) {
  const passage = useRef<HTMLParagraphElement>(null);
  const [selectedText, setSelectedText] = useState(text);
  const captureSelection = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) setSelectedText(selection);
  };
  return (
    <section className="bui-selection">
      <p ref={passage} onMouseUp={captureSelection}>{text}</p>
      <div role="toolbar" aria-label="Selection actions">
        {actions.map((action) => <button key={action} type="button" onClick={() => onAction?.(action, selectedText)}>{action}</button>)}
      </div>
    </section>
  );
}
