// Landing page: hero with the install box, a masonry board of live components, real numbers, a filterable catalog, the token
// block, the three promises, the AI and tooling cards, and the footer. Numbers come from the registry at build time.
import {Button} from '@monoline/react';
import {Board, InstallBox} from './home-board';
import {Footer} from './home-footer';
import {Architecture, Catalog, StatRow} from './home-catalog';
import {ACCENT_COUNT} from './prefs';
import {components} from './registry';
import {href} from './router';
import './home.css';

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

export function Home() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <p className="hc-eyebrow">Open source UI kit · {components.length} components</p>
        <h1 id="home-title" className="home-title">Plain CSS and accessible React, <em>built to stay calm at scale.</em></h1>
        <p className="home-lede">Typed components on shared semantic tokens: thin rules, one accent, three themes and nothing to configure. Install the package, or copy one component.</p>
        <div className="home-cta">
          <Button asChild><a href={href('docs/getting-started')}>Get started</a></Button>
          <Button variant="line" asChild><a href={href('docs/components')}>Explore {components.length} components</a></Button>
          <InstallBox />
        </div>
      </section>
      <section className="home-board" aria-label="Components in use"><Board /></section>
      <StatRow />
      <Catalog />
      <Architecture />
      <Promises />
      <Tooling />
      <Footer />
    </>
  );
}
