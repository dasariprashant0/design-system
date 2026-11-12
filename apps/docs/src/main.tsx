// Docs site. Discovers every component from the react package (meta.json, *.demo.tsx and the raw demo source),
// so a new component needs no change here. Preferences (theme, accent, font, radius, density) live on <html>
// data attributes and in localStorage.
import {StrictMode, useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import '@css/monoline.css';
import './docs.css';
import {Badge, Button, CodeBlock, Collapsible, CollapsibleContent, CollapsibleTrigger, SegmentedControl, Kbd} from '@monoline/react';
import type {ComponentMeta, Demo} from '@monoline/react';

const metas = import.meta.glob<ComponentMeta>('../../../packages/react/src/{components,hooks}/*/meta.json', {eager: true, import: 'default'});
const demoModules = import.meta.glob<{demos: Demo[]}>('../../../packages/react/src/{components,hooks}/*/*.demo.tsx', {eager: true});
const demoSources = import.meta.glob<string>('../../../packages/react/src/{components,hooks}/*/*.demo.tsx', {eager: true, query: '?raw', import: 'default'});

const all = Object.values(metas).sort((a, b) => a.name.localeCompare(b.name));
const byCategory = all.reduce<Record<string, ComponentMeta[]>>((acc, m) => ((acc[m.category] ??= []).push(m), acc), {});
const order = ['layout', 'typography', 'buttons', 'forms', 'data-display', 'feedback', 'overlays', 'navigation', 'effects', 'blocks', 'hooks'];
const categories = order.filter((c) => byCategory[c]);
const demosFor = (name: string) => {
  const key = Object.keys(demoModules).find((k) => k.includes(`/${name}/`));
  return key ? {demos: demoModules[key]!.demos, source: demoSources[key] ?? ''} : {demos: [], source: ''};
};

const ACCENTS = ['orange', 'rose', 'amber', 'green', 'teal', 'blue', 'violet', 'slate'] as const;
const SWATCH: Record<string, string> = {orange: '#FF4500', rose: '#E11D48', amber: '#D97706', green: '#0E7A5F', teal: '#0F766E', blue: '#2563EB', violet: '#7C3AED', slate: '#334155'};
const DEFAULTS = {theme: 'system', accent: 'orange', font: 'mono', radius: 'square', density: 'comfortable'};
type Prefs = typeof DEFAULTS;

function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try { return {...DEFAULTS, ...JSON.parse(localStorage.getItem('monoline-prefs') ?? '{}')}; } catch { return DEFAULTS; }
  });
  useEffect(() => {
    const root = document.documentElement;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      root.dataset.theme = prefs.theme === 'system' ? (mq.matches ? 'dark' : 'warm') : prefs.theme;
      root.dataset.accent = prefs.accent; root.dataset.font = prefs.font; root.dataset.radius = prefs.radius; root.dataset.density = prefs.density;
    };
    apply();
    mq.addEventListener('change', apply);
    try { localStorage.setItem('monoline-prefs', JSON.stringify(prefs)); } catch { /* private mode */ }
    return () => mq.removeEventListener('change', apply);
  }, [prefs]);
  return [prefs, (k: keyof Prefs, v: string) => setPrefs((p) => ({...p, [k]: v}))] as const;
}

function useHash() {
  const [hash, setHash] = useState(() => location.hash.slice(1));
  useEffect(() => { const on = () => { setHash(location.hash.slice(1)); window.scrollTo(0, 0); }; addEventListener('hashchange', on); return () => removeEventListener('hashchange', on); }, []);
  return hash;
}

function Customize({prefs, set}: {prefs: Prefs; set: (k: keyof Prefs, v: string) => void}) {
  const opt = (values: string[]) => values.map((v) => ({value: v, label: v}));
  return (
    <div className="custom">
      <div className="custom-row"><span className="label">Theme</span><SegmentedControl aria-label="Theme" value={prefs.theme} onValueChange={(v) => set('theme', v)} options={opt(['system', 'warm', 'dark', 'midnight'])} /></div>
      <div className="custom-row"><span className="label">Accent</span>
        <div className="swatches" role="radiogroup" aria-label="Accent">
          {ACCENTS.map((a) => <button key={a} type="button" role="radio" aria-checked={prefs.accent === a} aria-label={a} title={a} className="swatch" style={{background: SWATCH[a]}} onClick={() => set('accent', a)} />)}
        </div>
      </div>
      <div className="custom-row"><span className="label">Font</span><SegmentedControl aria-label="Font" value={prefs.font} onValueChange={(v) => set('font', v)} options={opt(['mono', 'sans', 'serif'])} /></div>
      <div className="custom-row"><span className="label">Corners</span><SegmentedControl aria-label="Corners" value={prefs.radius} onValueChange={(v) => set('radius', v)} options={opt(['square', 'soft', 'round'])} /></div>
      <div className="custom-row"><span className="label">Density</span><SegmentedControl aria-label="Density" value={prefs.density} onValueChange={(v) => set('density', v)} options={opt(['compact', 'comfortable', 'spacious'])} /></div>
    </div>
  );
}

function Home() {
  return (
    <>
      <p className="label">Open source UI kit</p>
      <h1 className="display display-md hero-title">Monoline</h1>
      <p className="lede">Thin rules, one accent and plain CSS. {all.length} accessible React components on Radix, nine accents, three themes. Switch font, corners and density in the panel above.</p>
      <div className="hero-actions">
        <Button variant="solid" asChild><a href={`#${all[0]?.name ?? ''}`}>Browse components</a></Button>
        <Button asChild><a href="https://github.com/dasariprashant0/design-system">GitHub</a></Button>
      </div>
      <section className="block">
        <h2 className="label">Install</h2>
        <CodeBlock title="bash" code={'npm install @monoline/react @monoline/css'} />
        <CodeBlock title="app.tsx" code={"import '@monoline/css';\nimport {Button} from '@monoline/react';\n\nexport const App = () => <Button variant=\"solid\">Save</Button>;"} />
      </section>
      <section className="block">
        <h2 className="label">Components by category</h2>
        <div className="cat-grid">
          {categories.map((c) => (
            <div key={c} className="cat">
              <h3 className="cat-title">{c.replace('-', ' ')} <Badge>{byCategory[c]!.length}</Badge></h3>
              <p className="cat-list">{byCategory[c]!.map((m) => <a key={m.name} href={`#${m.name}`}>{m.title}</a>)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="block">
        <h2 className="label">Why Monoline</h2>
        <ul className="why">
          <li><strong>Accessible by default.</strong> Radix or native elements underneath; every component has keyboard and axe tests.</li>
          <li><strong>Plain CSS tokens.</strong> No Tailwind, no runtime CSS-in-JS. Restyle by changing variables on <code>:root</code>.</li>
          <li><strong>Made for AI.</strong> Every component has a <code>meta.json</code>; <code>llms.txt</code> and a <code>registry/</code> list them all.</li>
        </ul>
      </section>
    </>
  );
}

function ComponentPage({meta}: {meta: ComponentMeta}) {
  const {demos, source} = demosFor(meta.name);
  const Name = meta.name.split('-').map((p) => p[0]!.toUpperCase() + p.slice(1)).join('');
  return (
    <>
      <p className="label">{meta.category.replace('-', ' ')}</p>
      <h1 className="display display-md">{meta.title}</h1>
      <p className="lede">{meta.description}</p>
      <CodeBlock title="import" code={`import {${Name}} from '@monoline/react';`} />
      {demos.map((d) => (
        <section key={d.title} className="block">
          <h2 className="label">{d.title}</h2>
          {d.description && <p className="muted small">{d.description}</p>}
          <div className="stage">{d.render()}</div>
        </section>
      ))}
      <Collapsible className="block">
        <CollapsibleTrigger asChild><Button size="sm">View demo source</Button></CollapsibleTrigger>
        <CollapsibleContent><CodeBlock title={`${meta.name}.demo.tsx`} code={source} /></CollapsibleContent>
      </Collapsible>
      <section className="block">
        <h2 className="label">Accessibility</h2>
        <ul className="why">{meta.a11y.map((a) => <li key={a}>{a}</li>)}</ul>
      </section>
      <section className="block meta">
        <h2 className="label">Details</h2>
        <dl className="kv">
          <dt>Built on</dt><dd>{meta.primitive ?? 'native elements'}</dd>
          <dt>Stylesheets</dt><dd>{meta.css.length ? meta.css.join(', ') : 'none'}</dd>
          <dt>Status</dt><dd>{meta.status}</dd>
          {meta.keywords?.length ? <><dt>Also called</dt><dd>{meta.keywords.join(', ')}</dd></> : null}
        </dl>
        <p className="muted small">Copy into your project: <code>npx monoline add {meta.name}</code> (CLI in progress; the source lives in <code>registry/{meta.name}.json</code>).</p>
      </section>
    </>
  );
}

function App() {
  const hash = useHash();
  const [prefs, set] = usePrefs();
  const [q, setQ] = useState('');
  const [nav, setNav] = useState(false);
  const meta = all.find((m) => m.name === hash);
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? all.filter((m) => [m.name, m.title, m.description, ...(m.keywords ?? [])].join(' ').toLowerCase().includes(s)) : all;
  }, [q]);
  useEffect(() => setNav(false), [hash]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === '/' && !(e.target as HTMLElement).closest('input,textarea')) { e.preventDefault(); document.getElementById('docs-search')?.focus(); } };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, []);
  return (
    <div className="docs" data-nav={nav || undefined}>
      <header className="docs-bar">
        <button type="button" className="docs-menu btn btn-line btn-sm" aria-expanded={nav} aria-controls="docs-side" onClick={() => setNav((n) => !n)}>Menu</button>
        <a className="brand" href="#"><span className="brand-mark" />Monoline <Badge>{all.length}</Badge></a>
        <Collapsible className="docs-custom">
          <CollapsibleTrigger asChild><Button size="sm">Customise</Button></CollapsibleTrigger>
          <CollapsibleContent className="docs-custom-panel"><Customize prefs={prefs} set={set} /></CollapsibleContent>
        </Collapsible>
      </header>
      <aside className="docs-side" id="docs-side" aria-label="Components">
        <div className="docs-search">
          <input id="docs-search" className="input input-sm" type="search" placeholder="Search components" aria-label="Search components" value={q} onChange={(e) => setQ(e.target.value)} />
          <Kbd>/</Kbd>
        </div>
        <nav>
          {categories.map((c) => {
            const items = matches.filter((m) => m.category === c);
            return items.length ? (
              <div key={c} className="nav-group">
                <p className="label">{c.replace('-', ' ')}</p>
                {items.map((m) => <a key={m.name} className="nav-item" href={`#${m.name}`} aria-current={m.name === hash ? 'page' : undefined}>{m.title}</a>)}
              </div>
            ) : null;
          })}
          {!matches.length && <p className="muted small">Nothing matches “{q}”.</p>}
        </nav>
      </aside>
      <main className="docs-main" id="main">
        {meta ? <ComponentPage meta={meta} /> : <Home />}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
