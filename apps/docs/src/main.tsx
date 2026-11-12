// Docs scaffold. It discovers every component from the react package: meta.json (what it is),
// *.demo.tsx (live examples) and the raw demo source (shown as code). A new component needs no change here.
// The docs session replaces this with the real site; keep the discovery contract.
import {StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import '@css/monoline.css';
import type {ComponentMeta, Demo} from '@monoline/react';

const metas = import.meta.glob<ComponentMeta>('../../../packages/react/src/{components,hooks}/*/meta.json', {eager: true, import: 'default'});
const demoModules = import.meta.glob<{demos: Demo[]}>('../../../packages/react/src/{components,hooks}/*/*.demo.tsx', {eager: true});
const demoSources = import.meta.glob<string>('../../../packages/react/src/{components,hooks}/*/*.demo.tsx', {eager: true, query: '?raw', import: 'default'});

const all = Object.values(metas).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
const demosFor = (name: string) => {
  const key = Object.keys(demoModules).find((k) => k.includes(`/${name}/`));
  return key ? {demos: demoModules[key]!.demos, source: demoSources[key] ?? ''} : {demos: [], source: ''};
};

function App() {
  const [name, setName] = useState(() => location.hash.slice(1) || all[0]?.name || '');
  useEffect(() => { const on = () => setName(location.hash.slice(1)); addEventListener('hashchange', on); return () => removeEventListener('hashchange', on); }, []);
  const meta = all.find((m) => m.name === name) ?? all[0];
  const {demos, source} = meta ? demosFor(meta.name) : {demos: [], source: ''};
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><span className="brand-mark" />Monoline</div>
        <nav className="nav">
          {all.map((m) => <a key={m.name} className="nav-item" href={`#${m.name}`} aria-current={m.name === meta?.name}>{m.title}</a>)}
        </nav>
      </aside>
      <main className="main">
        {meta && <>
          <p className="label">{meta.category}</p>
          <h1 className="display display-md">{meta.title}</h1>
          <p className="lede">{meta.description}</p>
          {demos.map((d) => <section key={d.title} className="block"><h2 className="label">{d.title}</h2>{d.description && <p className="muted small">{d.description}</p>}<div className="example">{d.render()}</div></section>)}
          <pre className="code-block">{source}</pre>
        </>}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
