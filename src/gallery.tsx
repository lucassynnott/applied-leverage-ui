import type { ReactNode } from 'react';
import {
  ApprovalCard,
  Chat,
  CodeBlock,
  ContextCards,
  DiffTable,
  FilterTable,
  FineTuneCard,
  Flowchart,
  InsightCards,
  LoadingState,
  PromptBar,
  RecommendationCard,
  RecordsTable,
  Search,
  SelectionActions,
  SidebarNav,
  StreamingText,
  TaskRows,
  Thinking,
  ToolChips,
} from './index';

const catalogTasks = [
  {
    id: 'vendors',
    label: 'Verified vendor records',
    detail: '12 suppliers',
    status: 'complete' as const,
    children: [{ label: 'Matched tax and contact IDs', detail: '12/12', status: 'complete' as const }],
  },
  {
    id: 'reorder',
    label: 'Build reorder task list',
    detail: '7 SKUs',
    status: 'running' as const,
    children: [{ label: 'Scoring stockout risk', detail: '68%', status: 'running' as const }],
  },
];

export function Gallery() {
  return (
    <main className="gallery">
      <header className="gallery-hero">
        <div>
          <p>Applied Leverage UI × Beautiful UI</p>
          <h1>Twenty AI-native primitives.</h1>
          <span>The complete current Beautiful UI catalog, adapted as reusable typed React components.</span>
        </div>
        <aside className="gallery-count"><strong>20</strong><span>catalog exports</span></aside>
      </header>

      <section className="gallery-grid" aria-label="Beautiful UI component catalog">
        <Demo number="01" title="Loading State"><LoadingState label="Churning" variant="Drive" /></Demo>
        <Demo number="02" title="Thinking"><Thinking summary="Thinking"><p>Reading flavor briefs</p><p>Scanning supplier lists</p></Thinking></Demo>
        <Demo number="03" title="Streaming Text"><StreamingText animate={false} text="Pistachio is your fastest-growing flavor — sales are up 23% this month and margins beat vanilla by 8 points." sources={[{ title: 'Scoop Data', url: 'https://scoopdata.io' }]} followUps={['Which flavors sell best in winter', 'Compare gelato and soft serve margins']} /></Demo>
        <Demo number="04" title="Approval Card"><ApprovalCard title="How many flavors should we launch?" options={['Three (core line)', 'Five (full case)', 'Just one hero']} /></Demo>
        <Demo number="05" title="Tool Chips"><ToolChips items={[{ label: 'Thinking · Planning the churn schedule…', status: 'complete' }, { label: 'Write 204 lines · ChurnSchedule.tsx', status: 'complete' }, { label: 'Rebuild and verify · npm run freeze', status: 'running' }]} /></Demo>
        <Demo number="06" title="Task Rows"><TaskRows tasks={catalogTasks} /></Demo>
        <Demo number="07" title="Chat"><Chat tabs={['Flavors', 'Suppliers']} messages={[{ id: 'q', role: 'user', content: 'Compare mint chip to last summer' }, { id: 'r', role: 'reasoning', content: 'Pulled 3 summers of sales.', meta: 'Sales history · 4s' }, { id: 'a', role: 'assistant', content: 'Mint chip is up 12% with stronger weekend peaks.' }]} /></Demo>
        <Demo number="08" title="Prompt Bar"><PromptBar placeholder="Ask about flavors, files, or sources" /></Demo>
        <Demo number="09" title="Recommendation Card"><RecommendationCard title="Want me to place this restock order?" body="Reorder waffle cones from Cone King with lead time 7 days." confidence="High confidence" /></Demo>
        <Demo number="10" title="Context Cards"><ContextCards items={[{ id: 'rule', title: 'Vendor onboarding rule', kind: 'PDF', meta: '290 characters', content: 'Cold-chain certification must be verified before a new dairy is added.', source: 'Dairy Onboarding SOP.pdf' }, { id: 'velocity', title: 'Seasonal demand row', kind: 'CSV', meta: '1,250 characters', content: 'Q4 velocity: pistachio +18%, vanilla +6%, rocky road -11%.', source: 'Sales Velocity Export.csv' }]} /></Demo>
        <Demo number="11" title="Diff Table"><DiffTable columns={['Flavor', 'Category', 'Supplier']} rows={[{ id: 'rocky', cells: ['Rocky Road', 'Classic', 'Aurora Scoops'], change: 'remove' }, { id: 'pistachio', cells: ['Pistachio', 'Seasonal', 'Maple Orbit'], change: 'add' }]} /></Demo>
        <Demo number="12" title="Records Table"><RecordsTable records={[{ id: 'alpine', name: 'Alpine Churn — Zürich', categories: ['B2B', 'Gelato', 'Wholesale'], lastInteraction: '4 days ago', strength: 'Very strong', links: [{ label: 'Website', url: 'https://alpine-churn.example.com' }] }, { id: 'aurora', name: 'Aurora Scoops — Reykjavík', categories: ['Gelato', 'Seasonal'], lastInteraction: '9 days ago', strength: 'Very strong' }]} /></Demo>
        <Demo number="13" title="Filter Table"><FilterTable columns={['Task name', 'Date', 'Status', 'Advisor']} rows={[["Restock mango sorbet", 'Dec 03', 'To do', 'Mango Moon'], ['Churn black sesame', 'Sep 22', 'In Progress', 'Kumo Creamery'], ['Order waffle cones', 'Apr 14', 'Completed', 'Aurora Scoops']]} statusColumn={2} /></Demo>
        <Demo number="14" title="Sidebar Nav"><SidebarNav workspace="Creamery Ops" activeId="home" items={[{ id: 'new', label: 'New chat', icon: '+' }, { id: 'home', label: 'Home', icon: '⌂' }, { id: 'invite', label: 'Invite users', meta: '3/10' }]} recent={[{ id: 'supplier', label: 'Supplier records' }, { id: 'todos', label: 'Urgent to-dos this morning' }]} /></Demo>
        <Demo number="15" title="Search"><Search items={['Forecast summer demand', 'Find waffle cone suppliers', 'Compare seasonal flavors', 'Draft flavor launch plan', 'Check cold-chain status']} /></Demo>
        <Demo number="16" title="Flowchart"><Flowchart steps={[{ id: 'trigger', kind: 'Trigger', title: 'New order created', description: 'Trigger when a new order is created' }, { id: 'condition', kind: 'If / Else', title: 'Match signature flavor', conditions: [{ field: 'order.flavor', operator: 'is', value: 'Rocky Road' }, { field: 'order.topping', operator: 'is', value: 'Brown butter brittle' }] }]} /></Demo>
        <Demo number="17" title="Insight Cards"><InsightCards insights={[{ id: 'rocky', title: 'Worst performer', body: <>Rocky Road is down across your creamery.</>, value: '-$2,453.44', tone: 'negative', chart: [70, 64, 61, 57, 48, 45, 38] }, { id: 'pistachio', title: 'Top mover', body: <>Pistachio gained share this week.</>, value: '+$617.22', tone: 'positive' }]} actionLabel="Rebalance flavors" /></Demo>
        <Demo number="18" title="Code Block"><CodeBlock filename="churn.ts" code={'export async function churnBatch() {\n  const flavor = await getFlavor("pistachio");\n  return freezer.store(flavor);\n}'} /></Demo>
        <Demo number="19" title="Fine-tune Card"><FineTuneCard title="Flavor card" initialValues={{ width: 360, height: 220, radius: 16 }} /></Demo>
        <Demo number="20" title="Selection Actions"><SelectionActions text="Pistachio holds the top slot all weekend. Churn it first thing Saturday so the batch has time to firm up before the afternoon rush." /></Demo>
      </section>
    </main>
  );
}

function Demo({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <article className="demo" id={`catalog-${number}`}><h2><span>{number}</span>{title}</h2><div>{children}</div></article>;
}
