// Bodies of the whole-site pages added with the redesign: components overview, frameworks, icons, editor, upgrade.
import {useState, type ReactNode} from 'react';
import {useMemo, useState as useS} from 'react';
import {CodeBlock, Field, Input, NativeSelect, RichTextEditor} from '@monoline/react';
import changelog from '../../../../CHANGELOG.md?raw';
import {Markdown} from './markdown';
import {CopyIcon, CheckIcon} from '../shell/Logo';
import {categories, hooks, inCategory, nice, pathOf} from '../shell/registry';
import {href} from '../shell/router';
import {GITHUB} from '../shell/Topbar';

const H2 = ({id, children}: {id: string; children: ReactNode}) => <h2 id={id} className="cdoc-h2">{children}</h2>;

// ---- Components overview ---------------------------------------------------------------------------------------------

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** A small wireframe of the component's category, varied by name. Pure SVG from the kit's rules and one accent block. */
function Thumb({name, category}: {name: string; category: string}) {
  const h = hash(name);
  const a = 14 + (h % 5) * 6, b = 10 + ((h >>> 3) % 5) * 8, c = 8 + ((h >>> 6) % 4) * 8;
  const frame = <rect x="0.75" y="0.75" width="94.5" height="58.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />;
  const accent = 'var(--accent)';
  let body: ReactNode;
  switch (category) {
    case 'forms': body = <><rect x="10" y="12" width={a + 20} height="3" fill="currentColor" opacity="0.5" /><rect x="10" y="20" width="75" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x="10" y="40" width="26" height="10" fill={accent} /></>; break;
    case 'data-display': body = <>{[0, 1, 2, 3].map((i) => <g key={i}><rect x="10" y={10 + i * 12} width={b + 20 + (i % 2) * 14} height="3" fill="currentColor" opacity="0.55" /><rect x="70" y={10 + i * 12} width="15" height="3" fill={i === h % 4 ? accent : 'currentColor'} opacity={i === h % 4 ? 1 : 0.3} /></g>)}</>; break;
    case 'overlays': body = <><rect x="10" y="10" width="75" height="40" fill="currentColor" opacity="0.08" /><rect x={20 + (h % 3) * 4} y="16" width="55" height="28" fill="var(--background)" stroke="currentColor" strokeWidth="1.5" /><rect x="26" y="22" width={c + 14} height="3" fill="currentColor" opacity="0.55" /><rect x="26" y="34" width="14" height="5" fill={accent} /></>; break;
    case 'feedback': body = <><rect x="10" y="20" width="75" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x="10" y="20" width="4" height="20" fill={accent} /><rect x="20" y="27" width={a + 24} height="3" fill="currentColor" opacity="0.55" /></>; break;
    case 'navigation': body = <><rect x="10" y="12" width="75" height="1.5" fill="currentColor" opacity="0.4" />{[0, 1, 2].map((i) => <rect key={i} x={10 + i * 26} y="8" width="20" height="3" fill={i === h % 3 ? accent : 'currentColor'} opacity={i === h % 3 ? 1 : 0.45} />)}<rect x="10" y="26" width="60" height="3" fill="currentColor" opacity="0.3" /><rect x="10" y="34" width="44" height="3" fill="currentColor" opacity="0.3" /></>; break;
    case 'layout': { const w = 18 + (h % 4) * 6, r = 26 + ((h >>> 4) % 3) * 8; body = <><rect x="10" y="10" width={w} height="40" fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x={16 + w} y="10" width={69 - w} height={r - 8} fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x={16 + w} y={r + 4} width={(69 - w) / 2 - 3} height={46 - r} fill={accent} /><rect x={16 + w + (69 - w) / 2 + 3} y={r + 4} width={(69 - w) / 2 - 3} height={46 - r} fill="none" stroke="currentColor" strokeWidth="1.5" /></>; break; }
    case 'buttons': body = <><rect x="10" y="22" width={a + 24} height="16" fill={accent} /><rect x={a + 40} y="22" width="22" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" /></>; break;
    case 'typography': body = <><rect x="10" y="10" width={a + 30} height="7" fill="currentColor" opacity="0.8" />{[0, 1, 2].map((i) => <rect key={i} x="10" y={25 + i * 8} width={75 - i * (8 + (h % 3) * 4)} height="3" fill="currentColor" opacity="0.35" />)}</>; break;
    case 'effects': body = <>{Array.from({length: 18}, (_, i) => <circle key={i} cx={14 + (i % 6) * 13} cy={14 + Math.floor(i / 6) * 16} r={i === h % 18 ? 3.5 : 1.5} fill={i === h % 18 ? accent : 'currentColor'} opacity={i === h % 18 ? 1 : 0.4} />)}</>; break;
    case 'blocks': body = <><rect x="10" y="9" width="75" height="4" fill="currentColor" opacity="0.4" /><rect x="22" y="20" width="51" height="6" fill="currentColor" opacity="0.8" /><rect x="32" y="31" width="31" height="3" fill="currentColor" opacity="0.35" /><rect x="34" y="40" width="27" height="9" fill={accent} /></>; break;
    default: body = <><rect x="10" y="12" width="40" height="3" fill="currentColor" opacity="0.6" /><rect x="10" y="22" width="75" height="3" fill="currentColor" opacity="0.3" /><rect x="10" y="32" width="60" height="3" fill="currentColor" opacity="0.3" /><rect x="10" y="42" width="22" height="8" fill={accent} /></>;
  }
  return <svg className="ov-thumb" viewBox="0 0 96 60" aria-hidden="true" focusable="false">{frame}{body}</svg>;
}

export function Overview() {
  const groups = [...categories.filter((c) => true).map((c) => ({title: nice(c), items: inCategory(c).filter((m) => !['rich-text-editor', 'mentions'].includes(m.name))})), {title: 'hooks', items: hooks}];
  return (
    <>
      {groups.map((g) => (
        <section key={g.title} className="ov-group" aria-labelledby={`ov-${g.title}`}>
          <h2 id={`ov-${g.title}`} className="ov-h2">{g.title}</h2>
          <ul className="ov-grid">
            {g.items.map((m) => (
              <li key={m.name}>
                <a className="ov-card" href={href(pathOf(m))}>
                  <Thumb name={m.name} category={m.category} />
                  <span className="ov-body"><span className="ov-name">{m.title}</span><span className="ov-desc">{m.description}</span></span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

// ---- Frameworks -----------------------------------------------------------------------------------------------------

const Step = ({n, title, children}: {n: number; title: string; children: ReactNode}) => (
  <li className="doc-step"><span className="doc-step-n" aria-hidden="true">{n}</span><div className="doc-step-body"><h3 className="cdoc-h3">{title}</h3>{children}</div></li>
);

export const Nextjs = () => (
  <>
    <section className="cdoc-section" aria-labelledby="nx-install"><H2 id="nx-install">Installation</H2>
      <ol className="doc-steps">
        <Step n={1} title="Install the packages"><CodeBlock language="bash" code="npm install @monoline/react @monoline/css" /></Step>
        <Step n={2} title="Load the stylesheet in the layout"><p className="cdoc-muted">App Router. Import it once, before your own CSS.</p><CodeBlock title="app/layout.tsx" language="tsx" code={`import '@monoline/css';\n\nexport default function RootLayout({children}: {children: React.ReactNode}) {\n  return <html lang="en"><body>{children}</body></html>;\n}`} /></Step>
        <Step n={3} title="Use a component"><p className="cdoc-muted">Components that use state or handlers carry <code>'use client'</code> themselves, so a Server Component file can import and render them.</p><CodeBlock title="app/page.tsx" language="tsx" code={`import {Button} from '@monoline/react';\n\nexport default function Page() {\n  return <Button>Save</Button>;\n}`} /></Step>
      </ol>
    </section>
    <section className="cdoc-section" aria-labelledby="nx-theme"><H2 id="nx-theme">Theme and accent</H2>
      <p className="cdoc-muted">Set the attributes on <code>&lt;html&gt;</code> so the first paint already has the right look.</p>
      <CodeBlock title="app/layout.tsx" language="tsx" code={`<html lang="en" data-theme="warm" data-accent="blue">`} />
    </section>
  </>
);

export const Vite = () => (
  <section className="cdoc-section" aria-labelledby="vt-install"><H2 id="vt-install">Installation</H2>
    <ol className="doc-steps">
      <Step n={1} title="Install the packages"><CodeBlock language="bash" code="npm install @monoline/react @monoline/css" /></Step>
      <Step n={2} title="Import the stylesheet once"><CodeBlock title="src/main.tsx" language="tsx" code={`import '@monoline/css';\nimport {createRoot} from 'react-dom/client';\nimport {App} from './App';\n\ncreateRoot(document.getElementById('root')!).render(<App />);`} /></Step>
      <Step n={3} title="Render a component"><CodeBlock title="src/App.tsx" language="tsx" code={`import {Button} from '@monoline/react';\n\nexport const App = () => <Button>Save</Button>;`} /></Step>
    </ol>
  </section>
);

export const Astro = () => (
  <section className="cdoc-section" aria-labelledby="as-install"><H2 id="as-install">Installation</H2>
    <ol className="doc-steps">
      <Step n={1} title="Add React and the packages"><CodeBlock language="bash" code={'npx astro add react\nnpm install @monoline/react @monoline/css'} /></Step>
      <Step n={2} title="Load the CSS and hydrate with a client directive"><CodeBlock title="src/layouts/Base.astro" language="tsx" code={`---\nimport '@monoline/css';\nimport {Button} from '@monoline/react';\n---\n<Button client:load>Save</Button>`} /></Step>
    </ol>
  </section>
);

export const Remix = () => (
  <section className="cdoc-section" aria-labelledby="rx-install"><H2 id="rx-install">Installation</H2>
    <ol className="doc-steps">
      <Step n={1} title="Install the packages"><CodeBlock language="bash" code="npm install @monoline/react @monoline/css" /></Step>
      <Step n={2} title="Link the stylesheet from the root route"><CodeBlock title="app/root.tsx" language="tsx" code={`import monoline from '@monoline/css?url';\n\nexport const links = () => [{rel: 'stylesheet', href: monoline}];`} /></Step>
    </ol>
  </section>
);

export const PlainCss = () => (
  <>
    <section className="cdoc-section" aria-labelledby="pc-install"><H2 id="pc-install">Installation</H2>
      <ol className="doc-steps">
        <Step n={1} title="Get the stylesheet"><p className="cdoc-muted">Copy <code>monoline.min.css</code> from <code>@monoline/css</code>, or install the package and link <code>node_modules/@monoline/css/dist/monoline.min.css</code>.</p></Step>
        <Step n={2} title="Link it and use the classes"><CodeBlock title="index.html" language="html" code={`<link rel="stylesheet" href="monoline.min.css" />\n<button class="btn btn-solid">Save</button>`} /></Step>
        <Step n={3} title="Optional behaviour"><p className="cdoc-muted"><code>@monoline/css/monoline.js</code> adds tabs, dialog and the theme switch for pages without React.</p></Step>
      </ol>
    </section>
    <section className="cdoc-section" aria-labelledby="pc-small"><H2 id="pc-small">Smaller CSS</H2>
      <p className="cdoc-muted">Load the core and only the components you use, in any setup.</p>
      <CodeBlock language="tsx" code={`import '@monoline/css/core.css';\nimport '@monoline/css/components/button.css';\nimport '@monoline/css/components/dialog.css';`} />
    </section>
  </>
);

// ---- Icons ----------------------------------------------------------------------------------------------------------

const ICONS: Array<[string, string]> = [
  ['search', 'M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM10.5 10.5 14 14'],
  ['copy', 'M5.5 5.5h8v8h-8ZM10.5 3.5v-1h-8v8h1'],
  ['check', 'm3 8.5 3.2 3L13 4.5'],
  ['arrow-right', 'M2 8h11M9 4l4 4-4 4'],
  ['arrow-left', 'M14 8H3M7 4 3 8l4 4'],
  ['menu', 'M2 4h12M2 8h12M2 12h12'],
  ['close', 'm3.5 3.5 9 9M12.5 3.5l-9 9'],
  ['plus', 'M8 2.5v11M2.5 8h11'],
  ['minus', 'M2.5 8h11'],
  ['chevron-down', 'm3.5 6 4.5 4.5L12.5 6'],
  ['chevron-right', 'm6 3.5 4.5 4.5L6 12.5'],
  ['external', 'M9.5 2.5h4v4M13.5 2.5 7.5 8.5M12 9.5v4h-9v-9h4'],
  ['info', 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2ZM8 7.2V11M8 5v.01'],
  ['alert', 'M8 2 14.5 13h-13ZM8 6.5v3.2M8 11.6v.01'],
  ['trash', 'M2.5 4h11M6 4V2.5h4V4M4 4l.6 9.5h6.8L12 4'],
  ['edit', 'm2.5 13.5.7-3.3 7.6-7.6 2.6 2.6-7.6 7.6ZM9.5 3.9l2.6 2.6'],
  ['filter', 'M2 3.5h12L9.5 9v4l-3-1.5V9Z'],
  ['calendar', 'M2.5 3.5h11v10h-11ZM2.5 6.5h11M5.5 2v3M10.5 2v3'],
  ['user', 'M8 2.5a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6ZM2.7 13.5c.4-2.6 2.6-4 5.3-4s4.9 1.4 5.3 4'],
  ['sliders', 'M2 4.5h7M12 4.5h2M2 11.5h2M7 11.5h7M10.5 3v3M5.5 10v3'],
];

const iconSvg = (d: string) => `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="${d}" /></svg>`;

function IconCard({name, d}: {name: string; d: string}) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(iconSvg(d)); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* clipboard blocked */ }
  };
  return (
    <li className="ic-card">
      <svg className="ic-glyph" viewBox="0 0 16 16" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><path d={d} /></svg>
      <span className="ic-name">{name}</span>
      <button type="button" className="ic-copy" onClick={copy} aria-label={`Copy SVG of ${name}`}>{done ? <CheckIcon /> : <CopyIcon />}</button>
    </li>
  );
}

export function IconsPage() {
  return (
    <>
      <section className="cdoc-section" aria-labelledby="ic-install"><H2 id="ic-install">Installation</H2>
        <p className="cdoc-muted">There is nothing to install. An icon is an inline SVG that uses <code>currentColor</code>, so it follows the text colour and the theme.</p>
      </section>
      <section className="cdoc-section" aria-labelledby="ic-usage"><H2 id="ic-usage">Usage</H2>
        <p className="cdoc-muted">Pass it as children. Decorative icons get <code>aria-hidden</code>; an icon-only button needs an <code>aria-label</code>.</p>
        <CodeBlock title="icon-button.tsx" language="tsx" code={`import {IconButton} from '@monoline/react';\n\n<IconButton aria-label="Search">\n  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">\n    <path d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM10.5 10.5 14 14" />\n  </svg>\n</IconButton>`} />
        <p className="cdoc-muted">Bring any set you like (Lucide, Phosphor, your own). Use a 1.5 stroke to match the thin rules. Browse the <a href={href('docs/icons/library')}>icons library</a>.</p>
      </section>
      <section className="cdoc-section" aria-labelledby="ic-props"><H2 id="ic-props">Props</H2>
        <p className="cdoc-muted">An icon is your own SVG, so it takes the SVG attributes. These are the ones to set every time.</p>
        <ul className="cdoc-list"><li><code>width</code> and <code>height</code>: 16 inside buttons and inputs, 24 on their own.</li><li><code>stroke="currentColor"</code> and <code>strokeWidth="1.5"</code>: follow the text colour and the thin rules.</li><li><code>aria-hidden="true"</code> when decorative, or <code>role="img"</code> with <code>aria-label</code> when it carries meaning.</li></ul>
      </section>
    </>
  );
}

export function IconsLibrary() {
  const [q, setQ] = useState('');
  const shown = ICONS.filter(([n]) => n.includes(q.trim().toLowerCase()));
  return (
    <>
      <Field label="Search icons"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="arrow, check, user" /></Field>
      <p className="cdoc-muted" role="status">{shown.length} of {ICONS.length} icons. Copy one as SVG and paste it into your project.</p>
      {shown.length ? <ul className="ic-grid">{shown.map(([n, d]) => <IconCard key={n} name={n} d={d} />)}</ul> : <p className="cdoc-muted">No icon matches that name.</p>}
    </>
  );
}

// ---- Editor ---------------------------------------------------------------------------------------------------------

export function Editor() {
  const [html, setHtml] = useState('<h2>Release notes</h2><p>Select text, then use the toolbar or <strong>Cmd/Ctrl+B</strong>.</p>');
  return (
    <>
      <section className="cdoc-section" aria-labelledby="ed-install"><H2 id="ed-install">Installation</H2>
        <p className="cdoc-muted">The editor ships in <code>@monoline/react</code>, so there is no separate package and no extra peer dependency.</p>
        <CodeBlock language="bash" code="npm install @monoline/react @monoline/css" />
      </section>
      <section className="cdoc-section" aria-labelledby="ed-import"><H2 id="ed-import">Import</H2>
        <CodeBlock language="tsx" code={`import {RichTextEditor, sanitizeHtml} from '@monoline/react';`} />
      </section>
      <section className="cdoc-section" aria-labelledby="ed-usage"><H2 id="ed-usage">Usage</H2>
        <p className="cdoc-muted">Controlled with a value and <code>onValueChange</code>, the same pattern as every other input. The value is an HTML string.</p>
        <div className="cdoc-stage"><RichTextEditor aria-label="Release notes" value={html} onValueChange={setHtml} /></div>
        <CodeBlock title="notes.tsx" language="tsx" code={`const [html, setHtml] = useState('<p>Hello</p>');\n\n<RichTextEditor aria-label="Release notes" value={html} onValueChange={setHtml} />`} />
      </section>
      <section className="cdoc-section" aria-labelledby="ed-data"><H2 id="ed-data">Handling data</H2>
        <p className="cdoc-muted">Run saved HTML through <code>sanitizeHtml</code> before you render it anywhere else, and check links with <code>isSafeUrl</code>.</p>
        <CodeBlock language="tsx" code={`<div dangerouslySetInnerHTML={{__html: sanitizeHtml(html)}} />`} />
        <p className="cdoc-muted">See every prop on the <a href={href('docs/components/rich-text-editor')}>Rich text editor</a> page, and <a href={href('docs/components/mentions')}>Mentions</a> for @-mentions.</p>
      </section>
    </>
  );
}

// ---- Tools ----------------------------------------------------------------------------------------------------------

export function Extensions() {
  return (
    <>
      <section className="cdoc-section" aria-labelledby="tl-official"><H2 id="tl-official">Official</H2>
        <ul className="cdoc-list">
          <li><strong>VS Code snippets</strong>: one per component and hook, generated from the registry. Type <code>ml-</code> and a name, press Tab. Copy <a href={`${GITHUB}/tree/master/packages/vscode`}>packages/vscode/snippets</a> into <code>.vscode/</code>.</li>
          <li><strong>MCP server</strong>: lets Claude Code, Cursor and other AI editors list, search and read components. <code>claude mcp add monoline -- npx -y @monoline/mcp</code></li>
          <li><strong><a href={href('docs/tools/cli')}>CLI</a></strong>: <code>npx monoline add button</code> copies a component and its styles into your project; <code>diff</code> and <code>update</code> keep it current.</li>
          <li><strong><a href={href('docs/tools/for-ai-tools')}>llms.txt and the registry</a></strong>: plain-text and JSON indexes for coding assistants.</li>
        </ul>
      </section>
      <section className="cdoc-section" aria-labelledby="tl-community"><H2 id="tl-community">Online tools</H2>
        <ul className="cdoc-list">
          <li><a href={href('playground')}>Playground</a>: edit code and see it run, with every component imported.</li>
          <li><a href={href('docs/tools/theme-builder')}>Theme builder</a>: try the options and custom colours, then copy the CSS.</li>
          <li><a href={href('docs/tools/themes')}>Themes</a>: named presets with contrast checks.</li>
          <li><a href={href('docs/tools/blocks')}>Blocks</a>: page sections to copy.</li>
        </ul>
      </section>
    </>
  );
}

// ---- Upgrade --------------------------------------------------------------------------------------------------------

/** CHANGELOG.md split into `{version, body}` sections, newest first. */
const SECTIONS = changelog.split(/^## /m).slice(1).map((s) => ({version: s.split('\n')[0]!.trim(), body: s.slice(s.indexOf('\n') + 1).trim()}));

export function Upgrade() {
  const versions = SECTIONS.map((s) => s.version);
  const [from, setFrom] = useS(versions[1] ?? versions[0]!);
  const [to, setTo] = useS(versions[0]!);
  const picked = useMemo(() => {
    const a = versions.indexOf(from), b = versions.indexOf(to);
    if (b >= a) return [];
    return SECTIONS.slice(b, a); // newer than `from`, up to and including `to`
  }, [from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  const text = picked.map((s) => `## ${s.version}\n\n${s.body}`).join('\n\n');
  return (
    <>
      <div className="up-pick">
        <Field label="Current version"><NativeSelect value={from} onChange={(e) => setFrom(e.target.value)}>{versions.map((v) => <option key={v} value={v}>{v}</option>)}</NativeSelect></Field>
        <Field label="Upgrade to"><NativeSelect value={to} onChange={(e) => setTo(e.target.value)}>{versions.map((v) => <option key={v} value={v}>{v}</option>)}</NativeSelect></Field>
      </div>
      <div role="status" className="up-result">
        {picked.length ? <Markdown source={text} label="Changes between the versions" /> : <p className="cdoc-muted">Choose a newer version in "Upgrade to" to see what changes.</p>}
      </div>
      <section className="cdoc-section" aria-labelledby="up-how"><H2 id="up-how">How to upgrade</H2>
        <CodeBlock language="bash" code="npm install @monoline/react@latest @monoline/css@latest" />
        <p className="cdoc-muted">If you copied components with the CLI, run <code>npx monoline diff</code> and then <code>npx monoline update --dry-run</code>. Before 1.0 a minor version may change class names; every change is in the <a href={href('docs/tools/changelog')}>changelog</a>.</p>
      </section>
    </>
  );
}
