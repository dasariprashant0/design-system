// Home page sections below the board: the stat row, the filterable live catalog and the "import once, override tokens" block.
import {useState, type ReactNode} from 'react';
import {Alert, Avatar, Badge, Button, Checkbox, CodeBlock, Input, Progress, SegmentedControl, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Tag} from '@monoline/react';
import {ArrowIcon} from './Logo';
import {ACCENT_COUNT} from './prefs';
import {components, hooks} from './registry';
import {href} from './router';

const THEMES = 3;
const a11yChecks = [...components, ...hooks].reduce((n, m) => n + m.a11y.length, 0);

export function StatRow() {
  const rows = [
    [String(components.length), 'Components'],
    [String(hooks.length), 'Hooks'],
    [String(THEMES * ACCENT_COUNT), 'Theme and accent sets'],
    [String(a11yChecks), 'Accessibility checks'],
    ['MIT', 'Open source'],
  ];
  return (
    <dl className="hc-stats">
      {rows.map(([n, k]) => <div key={k}><dt>{n}</dt><dd>{k}</dd></div>)}
    </dl>
  );
}

type Cat = 'forms' | 'display' | 'feedback' | 'navigation';
const CATS: Array<[Cat | 'all', string]> = [['all', 'All components'], ['forms', 'Forms & inputs'], ['display', 'Display & stats'], ['feedback', 'Feedback & status'], ['navigation', 'Navigation & content']];

interface Card {id: string; title: string; cat: Cat; docs: string; note: string; body: ReactNode}
const CARDS: Card[] = [
  {id: 'button', title: 'Button', cat: 'forms', docs: 'docs/components/button', note: 'Native button with solid, line, ghost and danger variants. asChild renders a link.', body: <div className="hc-row"><Button>Primary</Button><Button variant="line">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Delete</Button></div>},
  {id: 'switch', title: 'Switch & checkbox', cat: 'forms', docs: 'docs/components/switch', note: 'Real switch and checkbox semantics, with a hairline border for the thumb and box.', body: <div className="hc-stack"><Switch label="Strict typing" defaultChecked /><Switch label="Animated state" /><Checkbox label="Tokens enabled" defaultChecked /></div>},
  {id: 'segmented', title: 'Segmented control', cat: 'forms', docs: 'docs/components/segmented-control', note: 'Arrow keys move between options; the selected one is announced.', body: <div className="hc-stack"><SegmentedControl aria-label="Range" defaultValue="daily" options={[{value: 'daily', label: 'Daily'}, {value: 'weekly', label: 'Weekly'}, {value: 'monthly', label: 'Monthly'}]} /><Input aria-label="Filter releases" placeholder="Filter releases..." /></div>},
  {id: 'stat', title: 'Metric', cat: 'display', docs: 'docs/components/stat', note: 'Compact numbers with a trend, for dashboards and reports.', body: <div className="hc-metrics"><div className="hc-metric"><p>0 ms <span aria-hidden="true">→</span></p><small>Runtime CSS</small></div><div className="hc-metric"><p>100% <span aria-hidden="true">↑</span></p><small>Axe tested</small></div></div>},
  {id: 'avatar', title: 'Avatar & tags', cat: 'display', docs: 'docs/components/avatar', note: 'Initials fall back when there is no image. Tags label and filter.', body: <div className="hc-stack"><div className="hc-row"><Avatar name="Ada Ferreira" /><Avatar name="Ben Okafor" variant="line" /><Avatar name="Chen Wei" /></div><div className="hc-row"><Tag>React 19</Tag><Tag>Plain CSS</Tag><Tag>Radix-free overlays</Tag></div></div>},
  {id: 'badge', title: 'Status & badges', cat: 'feedback', docs: 'docs/components/badge', note: 'A stable indicator with a text label, so colour is never the only signal.', body: <div className="hc-stack"><div className="hc-row"><Badge>Operational</Badge><Badge>Standby</Badge><Badge variant="solid">Healthy</Badge></div><div className="hc-row"><Tag>Tokens</Tag><Tag>v{components.length}</Tag></div></div>},
  {id: 'alert', title: 'Callout', cat: 'feedback', docs: 'docs/components/alert', note: 'Editorial notes, warnings and tips. Warnings are announced at once.', body: <Alert tone="success" title="Native by default">Uses semantic CSS variables and the browser's own elements.</Alert>},
  {id: 'progress', title: 'Progress', cat: 'feedback', docs: 'docs/components/progress', note: 'Determinate and indeterminate, with a name for screen readers.', body: <div className="hc-stack"><Progress aria-label="Upload" value={62} /><Progress aria-label="Waiting" /></div>},
  {id: 'tabs', title: 'Tabs', cat: 'navigation', docs: 'docs/components/tabs', note: 'Arrow keys move and select; Tab goes into the panel.', body: <Tabs defaultValue="a"><TabsList aria-label="Example tabs"><TabsTrigger value="a">Overview</TabsTrigger><TabsTrigger value="b">Props</TabsTrigger><TabsTrigger value="c">Styles</TabsTrigger></TabsList><TabsContent value="a"><p className="hc-small">One page per component, same sections every time.</p></TabsContent><TabsContent value="b"><p className="hc-small">A table per part, from the doc comments.</p></TabsContent><TabsContent value="c"><p className="hc-small">Classes and data attributes.</p></TabsContent></Tabs>},
];

export function Catalog() {
  const [cat, setCat] = useState<Cat | 'all'>('all');
  const shown = CARDS.filter((c) => cat === 'all' || c.cat === cat);
  return (
    <section className="hc-section" aria-labelledby="hc-catalog">
      <p className="hc-eyebrow">Live catalog · {components.length} components</p>
      <h2 id="hc-catalog" className="hc-h2" data-no-toc>Try the components in context.</h2>
      <p className="hc-sub">These examples use the same package exports documented in the component reference.</p>
      <div className="hc-filters">
        <div className="hc-pills" role="group" aria-label="Filter the catalog">
          {CATS.map(([id, label]) => <button key={id} type="button" aria-pressed={cat === id} onClick={() => setCat(id)}>{label}</button>)}
        </div>
        <a className="hc-all" href={href('docs/components')}>View all {components.length} components <ArrowIcon /></a>
      </div>
      <ul className="hc-grid">
        {shown.map((c) => (
          <li key={c.id}>
            <section className="hc-card" aria-label={c.title}>
              <div className="hc-card-head"><p className="hc-eyebrow">{c.title}</p><a className="hc-docs" href={href(c.docs)}>Docs <ArrowIcon /></a></div>
              <div className="hc-demo">{c.body}</div>
              <p className="hc-card-note">{c.note}</p>
            </section>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Architecture() {
  return (
    <section className="hc-section" aria-labelledby="hc-arch">
      <p className="hc-eyebrow">Package architecture · CSS variables</p>
      <h2 id="hc-arch" className="hc-h2" data-no-toc>Import the theme once. Override semantic tokens when needed.</h2>
      <p className="hc-sub">Components read shared colour, type, spacing, radius and motion variables from the package stylesheet, so one override restyles everything.</p>
      <div className="hc-arch">
        <CodeBlock title="main.tsx" language="tsx" code={`import '@monoline/css';\nimport {Button} from '@monoline/react';`} />
        <CodeBlock title="brand.css" language="css" code={`:root {\n  --accent: #2563eb;\n  --accent-text: #1d4ed8;\n  --font-body: "Inter", system-ui, sans-serif;\n}`} />
      </div>
    </section>
  );
}
