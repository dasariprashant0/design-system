// Landing page: hero with a drawn kit, install pill, three real numbers, a live tabbed showcase, the three promises,
// the AI and tooling cards, and a footer. Numbers come from the registry at build time, so they never go stale.
import {useState} from 'react';
import {Button, Tabs, TabsContent, TabsList, TabsTrigger} from '@monoline/react';
import {ArrowIcon, CheckIcon, CopyIcon} from './Logo';
import {Board, Conversation, Dashboard, Onboarding, Settings, Users} from './home-mocks';
import {ACCENT_COUNT} from './prefs';
import {components, entryAt, hooks, pathOf} from './registry';
import {href} from './router';
import {GITHUB} from './Topbar';
import './home.css';

const INSTALL = 'npm install @monoline/react';
const THEMES = 3;
const a11yChecks = [...components, ...hooks].reduce((n, m) => n + m.a11y.length, 0);

/** A one-click copy pill showing the install command. */
function InstallPill() {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(INSTALL); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* clipboard blocked */ }
  };
  return (
    <button type="button" className="home-install" onClick={copy} aria-label={done ? 'Copied the install command' : `Copy ${INSTALL}`}>
      <code>{INSTALL}</code>
      {done ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

/** The hero drawing: a window, a bar chart, a tag stack and a few controls, all from the kit's own shapes. */
function HeroArt() {
  return (
    <svg className="home-art" viewBox="0 0 520 250" fill="none" role="img" aria-label="Drawing of Monoline controls: a window with a toggle and a button, a bar chart, tags and a progress bar">
      <defs>
        <pattern id="home-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v7" stroke="currentColor" strokeWidth="1.2" opacity="0.35" /></pattern>
      </defs>
      <path d="M10 228h500" stroke="currentColor" strokeWidth="1.5" />
      {/* bar chart */}
      <g stroke="currentColor" strokeWidth="1.5"><rect x="28" y="150" width="24" height="78" fill="var(--background)" /><rect x="58" y="116" width="24" height="112" fill="var(--accent)" stroke="none" /><rect x="88" y="136" width="24" height="92" fill="url(#home-hatch)" /><rect x="118" y="92" width="24" height="136" fill="var(--background)" /></g>
      {/* window */}
      <g>
        <rect x="170" y="30" width="190" height="198" fill="var(--background)" stroke="currentColor" strokeWidth="1.5" />
        <path d="M170 58h190" stroke="currentColor" strokeWidth="1.5" />
        <rect x="182" y="40" width="9" height="9" fill="var(--accent)" /><rect x="197" y="40" width="9" height="9" stroke="currentColor" strokeWidth="1.5" /><rect x="212" y="40" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
        <rect x="186" y="76" width="86" height="6" fill="currentColor" opacity="0.8" />
        <rect x="186" y="92" width="140" height="4" fill="currentColor" opacity="0.3" /><rect x="186" y="104" width="112" height="4" fill="currentColor" opacity="0.3" />
        <rect x="186" y="124" width="140" height="28" stroke="currentColor" strokeWidth="1.5" />
        <rect x="196" y="135" width="62" height="6" fill="currentColor" opacity="0.4" />
        <rect x="186" y="166" width="38" height="18" stroke="currentColor" strokeWidth="1.5" /><rect x="206" y="166" width="18" height="18" fill="var(--accent)" />
        <rect x="236" y="170" width="52" height="5" fill="currentColor" opacity="0.4" />
        <rect x="186" y="196" width="62" height="20" fill="var(--accent)" /><rect x="256" y="196" width="48" height="20" stroke="currentColor" strokeWidth="1.5" />
      </g>
      {/* tag stack, checkbox, avatar, progress */}
      <g stroke="currentColor" strokeWidth="1.5">
        <rect x="392" y="40" width="84" height="22" fill="var(--background)" /><rect x="392" y="40" width="5" height="22" fill="var(--accent)" stroke="none" />
        <rect x="404" y="72" width="76" height="22" fill="var(--background)" /><rect x="392" y="104" width="62" height="22" fill="var(--background)" />
        <rect x="392" y="146" width="18" height="18" fill="var(--background)" /><path d="m396 156 4 4 7-8" strokeWidth="2" stroke="var(--accent)" />
        <rect x="418" y="151" width="58" height="6" fill="currentColor" opacity="0.4" stroke="none" />
        <circle cx="408" cy="196" r="13" fill="var(--background)" /><path d="M402 199c2-5 10-5 12 0M408 189v.01" /><rect x="432" y="188" width="52" height="5" fill="currentColor" opacity="0.4" stroke="none" />
        <rect x="432" y="200" width="52" height="8" fill="var(--background)" /><rect x="432" y="200" width="34" height="8" fill="var(--accent)" stroke="none" />
      </g>
    </svg>
  );
}

function Stats() {
  const rows = [
    {n: components.length, label: 'Components', note: `and ${hooks.length} hooks, each with a live demo`},
    {n: THEMES * ACCENT_COUNT, label: 'Theme and accent combinations', note: `${THEMES} themes times ${ACCENT_COUNT} accent settings, all contrast-checked`},
    {n: a11yChecks, label: 'Accessibility checks', note: 'keyboard and screen reader behaviours written into meta.json'},
  ];
  return (
    <dl className="home-stats">
      {rows.map((r) => (
        <div key={r.label} className="home-stat">
          <dt className="home-stat-n">{r.n}</dt>
          <dd><strong>{r.label}</strong><span>{r.note}</span></dd>
        </div>
      ))}
    </dl>
  );
}

const SCREENS = [
  {id: 'components', label: 'Components', body: <Board />},
  {id: 'dashboard', label: 'Dashboard', body: <Dashboard />},
  {id: 'users', label: 'Users', body: <Users />},
  {id: 'settings', label: 'Settings', body: <Settings />},
  {id: 'onboarding', label: 'Onboarding', body: <Onboarding />},
  {id: 'conversation', label: 'Conversation', body: <Conversation />},
];

function Showcase() {
  return (
    <section className="home-section" aria-labelledby="home-components">
      <h2 id="home-components" className="home-h2" data-no-toc>Components in use</h2>
      <p className="home-sub">Six views, built from the same parts you install. Click around: nothing is a screenshot.</p>
      <Tabs defaultValue="components" className="home-tabs">
        <TabsList aria-label="Example screens">{SCREENS.map((s) => <TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>)}</TabsList>
        {SCREENS.map((s) => <TabsContent key={s.id} value={s.id}><div className={s.id === 'components' ? 'home-screen home-board' : 'home-screen'}>{s.body}</div></TabsContent>)}
      </Tabs>
    </section>
  );
}

const PROMISES = [
  {title: 'Accessible', text: 'Native elements first, then ARIA. Every component has an axe test, keyboard behaviour in its docs and a real-browser audit in three themes.', to: 'docs/guides/accessibility', icon: <path d="M8 2.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM3 6.5l5 1 5-1M8 7.5v3M5.5 14l2.5-3.5 2.5 3.5" />},
  {title: 'Extensible', text: 'Copy a component into your project with the CLI and change it, or import the package. Parts are named exports; props only ever get added.', to: 'docs/tools/cli', icon: <path d="M2.5 2.5h4v4h-4ZM9.5 2.5h4v4h-4ZM2.5 9.5h4v4h-4ZM11.5 9v5M9 11.5h5" />},
  {title: 'Themeable', text: `Three themes, ${ACCENT_COUNT} accent settings, three fonts, corners and densities. Each is one attribute on <html>, and every colour is a token.`, to: 'docs/theming', icon: <path d="M8 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM8 2v12M8 8h6" />},
];

function Promises() {
  return (
    <section className="home-section" aria-labelledby="home-purpose">
      <h2 id="home-purpose" className="home-h2" data-no-toc>Designed with purpose, built for scale</h2>
      <p className="home-sub">Every component starts from accessibility and ends with tokens, so a large product stays consistent as it grows.</p>
      <ul className="home-cards home-cards-3">
        {PROMISES.map((p) => (
          <li key={p.title}>
            <a className="home-card" href={href(p.to)}>
              <svg viewBox="0 0 16 16" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" focusable="false">{p.icon}</svg>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

const TOOLS = [
  {title: 'Registry', text: 'A JSON file per component with its files, props and accessibility notes.', code: 'registry/button.json', to: 'docs/tools/for-ai-tools'},
  {title: 'llms.txt', text: 'A short index and one full file, so an assistant can pick the right component.', code: 'llms-full.txt', to: 'docs/tools/for-ai-tools'},
  {title: 'MCP', text: 'An MCP server that lists, searches and reads components from your editor.', code: 'npx -y @monoline/mcp', to: 'docs/tools'},
  {title: 'CLI', text: 'Copy a component and its styles into your project. Diff and update later.', code: 'npx monoline add button', to: 'docs/tools/cli'},
];

function Tooling() {
  return (
    <section className="home-section" aria-labelledby="home-ai">
      <h2 id="home-ai" className="home-h2" data-no-toc>Made for people and for AI tools</h2>
      <p className="home-sub">The same data that builds this site is published for coding assistants, so they use real component names instead of guessing.</p>
      <ul className="home-cards home-cards-4">
        {TOOLS.map((t) => (
          <li key={t.title}>
            <a className="home-card" href={href(t.to)}>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <code className="home-card-code">{t.code}</code>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

const FOOT: Array<{title: string; links: string[]}> = [
  {title: 'Get started', links: ['docs/getting-started', 'docs/frameworks/nextjs', 'docs/theming', 'docs/guides/forms', 'docs/guides/accessibility']},
  {title: 'Components', links: ['docs/components', 'docs/components/button', 'docs/components/dialog', 'docs/components/data-table', 'docs/components/select']},
  {title: 'Tools', links: ['docs/tools/themes', 'docs/tools/blocks', 'docs/tools/cli', 'docs/editor', 'docs/tools/upgrade']},
];

function Footer() {
  return (
    <footer className="home-foot">
      <div className="home-foot-top">
        <div className="home-foot-brand">
          <p className="home-foot-tag">Accessible, themeable, plain CSS and React components for products that need to stay readable at scale.</p>
        </div>
        <nav className="home-foot-nav" aria-label="Footer">
          {FOOT.map((g) => (
            <div key={g.title}>
              <p className="home-foot-h">{g.title}</p>
              <ul>{g.links.map((l) => { const e = entryAt(l); return e ? <li key={l}><a href={href(l)}>{e.title}</a></li> : null; })}</ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="home-foot-bottom">
        <p>Built with <span aria-label="love">❤️</span> in the open. <a href={GITHUB}>Source on GitHub</a></p>
        <p>Copyright © 2026 Monoline contributors. MIT licence.</p>
      </div>
    </footer>
  );
}

export function Home() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <HeroArt />
        <h1 id="home-title" className="home-title">Monoline is a calm component kit that helps you build <em>accessible interfaces faster.</em></h1>
        <p className="home-lede">Plain CSS tokens and typed React components with thin rules, one accent and no runtime styling. Install the package, or copy a single component.</p>
        <div className="home-cta">
          <Button asChild><a href={href('docs/getting-started')}>Start Building <ArrowIcon /></a></Button>
          <InstallPill />
        </div>
      </section>
      <Stats />
      <Showcase />
      <Promises />
      <Tooling />
      <Footer />
    </>
  );
}
