// The Playground page: edit a snippet on the left, see it run on the right. The snippet is TypeScript with JSX; it is
// compiled in the browser with the TypeScript compiler (loaded only when this page opens) and run against the real
// @monoline/react and React. A snippet is imports, optional helpers, and a last JSX expression (or `export default`).
import {Component, useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import * as React from 'react';
import * as Monoline from '@monoline/react';
import {Button, Field, NativeSelect} from '@monoline/react';
import {Logo} from '../shell/Logo';
import {CustomisePanel, usePrefsContext} from '../shell/prefs';
import {components, hooks} from '../shell/registry';
import {href} from '../shell/router';
import {GITHUB} from '../shell/Topbar';
import './live.css';

type DemoCode = {title: string; description?: string; code: string};
const extras: Record<string, {demos: DemoCode[]}> = Object.values(import.meta.glob<Record<string, {demos: DemoCode[]}>>('./demos.generated.json', {eager: true, import: 'default'}))[0] ?? {};

const FALLBACK = `import {Button} from '@monoline/react';\n\n<Button>Hello</Button>`;
const withDemos = [...components, ...hooks].filter((m) => (extras[m.name]?.demos.length ?? 0) > 0);

/** Turn a snippet into runnable JS. The last statement may be a bare JSX expression: it becomes the default export. */
async function compile(code: string): Promise<{js?: string; error?: string}> {
  const mod = await import('typescript');
  const ts = (mod as unknown as {default?: typeof import('typescript')}).default ?? (mod as unknown as typeof import('typescript'));
  const sf = ts.createSourceFile('snippet.tsx', code, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const last = sf.statements[sf.statements.length - 1];
  let src = code;
  if (last && ts.isExpressionStatement(last)) src = `${code.slice(0, last.getStart(sf))}export default (${code.slice(last.getStart(sf), last.getEnd()).replace(/;\s*$/, '')});`;
  const out = ts.transpileModule(src, {reportDiagnostics: true, fileName: 'snippet.tsx', compilerOptions: {jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true}});
  const bad = out.diagnostics?.find((d) => d.category === ts.DiagnosticCategory.Error);
  if (bad) {
    const pos = bad.file && bad.start !== undefined ? bad.file.getLineAndCharacterOfPosition(bad.start) : undefined;
    return {error: `${pos ? `Line ${pos.line + 1}: ` : ''}${ts.flattenDiagnosticMessageText(bad.messageText, '\n')}`};
  }
  return {js: out.outputText};
}

function run(js: string): ReactNode {
  const exports: {default?: unknown} = {};
  const req = (name: string) => {
    if (name === 'react') return React;
    if (name === '@monoline/react') return Monoline;
    throw new Error(`Cannot import "${name}". The playground has "react" and "@monoline/react".`);
  };
  new Function('require', 'exports', 'module', 'React', js)(req, exports, {exports}, React);
  const d = exports.default;
  if (typeof d === 'function') return React.createElement(d as React.ComponentType);
  if (d === undefined) throw new Error('Nothing to show. End the snippet with a JSX element, or export a component as the default.');
  return d as ReactNode;
}

class Boundary extends Component<{onError: (m: string) => void; children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  componentDidCatch(e: Error) { this.props.onError(e.message); }
  render() { return this.state.failed ? null : this.props.children; }
}

const encode = (s: string) => btoa(unescape(encodeURIComponent(s)));
const decode = (s: string) => { try { return decodeURIComponent(escape(atob(s))); } catch { return null; } };

/** What the address asks for: `?c=button&d=1` picks an example, `#code=` carries shared code. Browser only. */
function fromUrl() {
  const q = new URLSearchParams(location.search);
  const shared = location.hash.startsWith('#code=') ? decode(location.hash.slice(6)) : null;
  const name = q.get('c') && extras[q.get('c')!] ? q.get('c')! : 'button';
  const demos = extras[name]?.demos ?? [];
  const di = Math.min(Math.max(Number(q.get('d') ?? 0) || 0, 0), Math.max(demos.length - 1, 0));
  return {name, di, code: shared ?? demos[di]?.code ?? FALLBACK};
}

export function PlaygroundPage() {
  const [prefs, set] = usePrefsContext();
  // The server render and the first client render show the default example; the address is applied right after mount.
  const [name, setName] = useState('button');
  const [di, setDi] = useState(0);
  const [code, setCode] = useState(extras.button?.demos[0]?.code ?? FALLBACK);
  useEffect(() => { const u = fromUrl(); setName(u.name); setDi(u.di); setCode(u.code); }, []);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [note, setNote] = useState('');
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<Root | null>(null);
  const demos = extras[name]?.demos ?? [];

  const pick = useCallback((n: string, i: number) => {
    const d = extras[n]?.demos[i];
    setName(n); setDi(i); setCode(d?.code ?? FALLBACK);
    history.replaceState(null, '', `${href('playground')}?c=${n}&d=${i}`);
  }, []);

  // Compile and run 350ms after the last keystroke. A stale run never overwrites a newer one.
  useEffect(() => {
    let live = true;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const {js, error: e} = await compile(code);
        if (!live) return;
        if (e || js === undefined) { setError(e ?? 'Could not compile.'); setBusy(false); return; }
        const node = run(js);
        if (!stage.current) return;
        root.current ??= createRoot(stage.current);
        setError(null);
        root.current.render(<Boundary key={code} onError={(m) => live && setError(m)}>{node}</Boundary>);
      } catch (e) { if (live) setError(e instanceof Error ? e.message : String(e)); }
      if (live) setBusy(false);
    }, 350);
    return () => { live = false; clearTimeout(t); };
  }, [code]);
  useEffect(() => () => { const r = root.current; root.current = null; setTimeout(() => r?.unmount()); }, []);

  const say = (m: string) => { setNote(m); setTimeout(() => setNote(''), 1800); };
  const copy = async (text: string, msg: string) => { try { await navigator.clipboard.writeText(text); say(msg); } catch { say('Copy failed'); } };
  return (
    <div className="pl" data-busy={busy || undefined}>
      <header className="pl-bar">
        <a className="brand" href={href()} aria-label="Monoline home"><Logo /></a>
        <h1 className="pl-title">Playground</h1>
        <div className="pl-pick">
          <Field label="Component"><NativeSelect value={name} onChange={(e) => pick(e.target.value, 0)}>{withDemos.map((m) => <option key={m.name} value={m.name}>{m.title}</option>)}</NativeSelect></Field>
          <Field label="Example"><NativeSelect value={String(di)} onChange={(e) => pick(name, Number(e.target.value))}>{demos.map((d, i) => <option key={d.title} value={i}>{d.title}</option>)}</NativeSelect></Field>
        </div>
        <div className="pl-actions">
          <Button size="sm" variant="line" onClick={() => pick(name, di)}>Reset</Button>
          <Button size="sm" variant="line" onClick={() => copy(code, 'Code copied')}>Copy code</Button>
          <Button size="sm" variant="line" onClick={() => copy(`${location.origin}${href('playground')}#code=${encode(code)}`, 'Link copied')}>Copy link</Button>
          <a className="pl-docs" href={name ? href(`docs/${components.some((m) => m.name === name) ? 'components' : 'hooks'}/${name}`) : href('docs/components')}>Docs</a>
          <a className="pl-docs" href={GITHUB}>GitHub</a>
          <CustomisePanel prefs={prefs} set={set} />
        </div>
        <span className="pl-note" role="status">{note}</span>
      </header>
      <main className="pl-main" id="main">
        <section className="pl-pane" aria-labelledby="pl-code-h">
          <h2 id="pl-code-h" className="pl-h">Code <span className="pl-file">snippet.tsx</span></h2>
          <textarea className="pl-editor" aria-label="Snippet code" aria-describedby="pl-help" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" />
          <p id="pl-help" className="pl-help">Imports from <code>react</code> and <code>@monoline/react</code> work. End with a JSX element or <code>export default</code> a component. It runs as you type, and Tab moves focus on.</p>
        </section>
        <section className="pl-pane" aria-labelledby="pl-prev-h">
          <h2 id="pl-prev-h" className="pl-h">Preview</h2>
          <div className="pl-stage"><div ref={stage} /></div>
          {error && <pre className="pl-error" role="alert">{error}</pre>}
        </section>
      </main>
    </div>
  );
}

