// Props playground: controls generated from the props JSON (select for unions, switch for booleans, text for
// strings, number for numbers) that drive the real component live and print the matching JSX.
// Components that cannot be rendered from their props alone have a small config in ./playgrounds.ts.
import {Component, createElement, useEffect, useId, useMemo, useState, type ReactNode} from 'react';
import * as M from '@monoline/react';
import {Button, CodeBlock, Input, NativeSelect, Switch} from '@monoline/react';
import {autoProps, playgrounds, type Control, type Node, type Values, type Val} from './playgrounds';

export type PropRow = {name: string; type: string; optional: boolean; default: string | null; description: string};
export type PropGroup = {name: string; props: PropRow[]};

const library = M as unknown as Record<string, unknown>;

// ---- tree -> live element and JSX text ------------------------------------------------------------------------
const isHandler = (v: Val) => typeof v === 'string' && v.startsWith('{') && v.endsWith('}');

function toElement(n: Node, key?: number): ReactNode {
  if (typeof n === 'string') return n;
  const type = /^[a-z]/.test(n.c) ? n.c : (library[n.c] as never);
  const props: Record<string, unknown> = {key};
  for (const [k, v] of Object.entries(n.p ?? {})) if (v !== undefined) props[k] = isHandler(v) ? () => {} : v;
  return createElement(type, props, ...(n.k ?? []).map((c, i) => toElement(c, i)));
}

const attr = (k: string, v: Val) => (typeof v === 'string' ? (isHandler(v) ? `${k}=${v}` : `${k}="${v.replaceAll('"', '&quot;')}"`) : v === true ? k : `${k}={${String(v)}}`);

/** Print a tree as JSX, two spaces per level. */
export function toJsx(n: Node, depth = 0): string {
  const pad = '  '.repeat(depth);
  if (typeof n === 'string') return pad + n;
  const attrs = Object.entries(n.p ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => attr(k, v));
  const open = `<${n.c}${attrs.map((a) => ` ${a}`).join('')}`;
  const kids = n.k ?? [];
  if (!kids.length) return `${pad}${open} />`;
  if (kids.length === 1 && typeof kids[0] === 'string') return `${pad}${open}>${kids[0]}</${n.c}>`;
  return `${pad}${open}>\n${kids.map((k) => toJsx(k, depth + 1)).join('\n')}\n${pad}</${n.c}>`;
}

// ---- controls derived from the generated props -----------------------------------------------------------------
const kebab = (n: string) => n.replace(/[A-Z]/g, (c, i) => (i ? '-' : '') + c.toLowerCase());

const NEVER = /^(className|children|asChild|ref|key|style|id|htmlFor|dir|lang|value|defaultValue|open|checked|pressed|selected|aria-.*|data-.*|on[A-Z].*)$/;
const TEXT_NODES = /^(label|title|description|placeholder|content)$/;
const unquote = (s: string) => s.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');

function derive(rows: PropRow[], skip: string[] = []): Control[] {
  const out: Control[] = [];
  for (const p of rows) {
    if (NEVER.test(p.name) || skip.includes(p.name) || !p.optional) continue;
    const t = p.type.replace(/\s*\|\s*undefined$/, '');
    const def = p.default ? unquote(p.default) : undefined;
    const lits = t.match(/^("[^"]*")(\s*\|\s*"[^"]*")+$/) ? t.split('|').map((x) => unquote(x.trim())) : null;
    if (lits) out.push({name: p.name, kind: 'select', options: lits, initial: def && lits.includes(def) ? def : undefined, description: p.description});
    else if (t === 'boolean') out.push({name: p.name, kind: 'switch', initial: def === 'true', description: p.description});
    else if (t === 'string' || (t === 'ReactNode' && TEXT_NODES.test(p.name))) out.push({name: p.name, kind: 'text', initial: def, description: p.description});
    else if (t === 'number') out.push({name: p.name, kind: 'number', initial: def !== undefined && !isNaN(Number(def)) ? Number(def) : undefined, description: p.description});
  }
  return out;
}

const initialOf = (c: Control): Val => (c.kind === 'switch' ? c.initial ?? false : c.kind === 'number' ? c.initial : c.initial ?? '');

/** The default of a prop, as the control would hold it: used to keep default values out of the snippet. */
function defaultsOf(rows: PropRow[]): Record<string, string | undefined> {
  return Object.fromEntries(rows.map((p) => [p.name, p.default ? unquote(p.default) : undefined]));
}

function autoNode(importName: string, controls: Control[], defaults: Record<string, string | undefined>, v: Values, withChildren: boolean): Node {
  const p: Values = {...autoProps[kebab(importName)]};
  for (const c of controls) {
    const val = v[c.name];
    if (val === undefined || val === '' || val === false) continue;
    if (String(val) === defaults[c.name]) continue;
    p[c.name] = val;
  }
  return {c: importName, p, k: withChildren ? [typeof v.children === 'string' && v.children ? v.children : 'Label'] : []};
}

// ---- probe: can this component render from its props alone? ----------------------------------------------------
const probes = new Map<string, Promise<'children' | 'plain' | 'no'>>();

function probe(importName: string): Promise<'children' | 'plain' | 'no'> {
  let hit = probes.get(importName);
  if (!hit) {
    hit = (async () => {
      const {renderToStaticMarkup} = await import('react-dom/server');
      const quiet = console.error;
      console.error = () => {};
      try {
        for (const [mode, k] of [['children', ['Label']], ['plain', []]] as Array<['children' | 'plain', string[]]>) {
          try {
            const html = renderToStaticMarkup(toElement({c: importName, p: autoProps[kebab(importName)], k}) as never);
            if (mode === 'children' && !html.includes('Label')) continue; // the component ignores children
            return mode;
          } catch { /* try the next shape */ }
        }
        return 'no' as const;
      } finally { console.error = quiet; }
    })();
    probes.set(importName, hit);
  }
  return hit;
}

// ---- UI --------------------------------------------------------------------------------------------------------
class Boundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() { return this.state.failed ? <p className="cdoc-muted">This combination could not render.</p> : this.props.children; }
}

function ControlRow({control, value, onChange}: {control: Control; value: Val; onChange: (v: Val) => void}) {
  const id = useId();
  const label = control.name === 'defaultChecked' ? 'checked' : control.name;
  if (control.kind === 'switch') {
    return <div className="pg-control"><Switch label={label} checked={!!value} onCheckedChange={onChange} /></div>;
  }
  return (
    <div className="pg-control">
      <label htmlFor={id} className="pg-label">{label}</label>
      {control.kind === 'select' ? (
        <NativeSelect id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          {control.initial === undefined && <option value="">default</option>}
          {control.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </NativeSelect>
      ) : control.kind === 'number' ? (
        <Input id={id} type="number" value={value === undefined ? '' : String(value)} min={control.min} max={control.max} step={control.step}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
      ) : (
        <Input id={id} value={String(value ?? '')} spellCheck={false} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function Panel({importName, controls, build}: {importName: string; controls: Control[]; build: (v: Values) => Node}) {
  const start = useMemo(() => Object.fromEntries(controls.map((c) => [c.name, initialOf(c)])) as Values, [controls]);
  const [values, setValues] = useState<Values>(start);
  const node = build(values);
  const changed = JSON.stringify(values) !== JSON.stringify(start);
  return (
    <div className="pg">
      <div className="pg-stage cdoc-stage" data-no-toc>
        <Boundary key={JSON.stringify(values)}>{toElement(node)}</Boundary>
      </div>
      <div className="pg-controls" role="group" aria-label={`${importName} props`}>
        {controls.map((c) => <ControlRow key={c.name} control={c} value={values[c.name]} onChange={(v) => setValues((p) => ({...p, [c.name]: v}))} />)}
        {changed && <Button size="sm" variant="ghost" onClick={() => setValues(start)}>Reset</Button>}
      </div>
      <div className="pg-code"><CodeBlock title="example.tsx" language="tsx" code={toJsx(node)} /></div>
    </div>
  );
}

/** Auto playground: controls from the props JSON, rendered as `<Name {...props}>Label</Name>` once a probe says it can. */
function Auto({importName, group}: {importName: string; group: PropGroup}) {
  const [mode, setMode] = useState<'children' | 'plain' | 'no' | null>(null);
  useEffect(() => { let live = true; probe(importName).then((m) => { if (live) setMode(m); }); return () => { live = false; }; }, [importName]);
  const base = useMemo(() => derive(group.props), [group]);
  const defaults = useMemo(() => defaultsOf(group.props), [group]);
  const controls = useMemo<Control[]>(() => (mode === 'children' ? [...base, {name: 'children', kind: 'text', initial: 'Label'}] : base), [base, mode]);
  if (!mode || mode === 'no') return null;
  return <Section><Panel key={mode} importName={importName} controls={controls} build={(v) => autoNode(importName, base, defaults, v, mode === 'children')} /></Section>;
}

const Section = ({children}: {children: ReactNode}) => (
  <section className="cdoc-section" aria-labelledby="playground">
    <h2 id="playground" className="cdoc-h2">Playground</h2>
    <p className="cdoc-muted">Change the props and the component updates. The code below is what you would write.</p>
    {children}
  </section>
);

/** Components that cannot be shown inside a docs page: full-page blocks (see /blocks), fixed overlays and toasts. */
const NO_AUTO = /^(block-.*|scroll-progress|confetti|toast|spotlight|image)$/;

/** True when a page can show a playground (a hand-written config or derivable controls). */
export function hasPlayground(name: string, importName: string, groups: PropGroup[]): boolean {
  return !!playgrounds[name] || !!groups.find((g) => g.name === `${importName}Props`);
}

/** The playground section of a component page, or nothing. */
export function Playground({name, importName, groups}: {name: string; importName: string; groups: PropGroup[]}) {
  const cfg = playgrounds[name];
  const group = groups.find((g) => g.name === (cfg?.props ?? `${importName}Props`));
  const controls = useMemo(() => (cfg?.controls ?? [...derive(group?.props ?? [], cfg?.skip), ...(cfg?.extra ?? [])]), [cfg, group]);
  if (cfg) return controls.length ? <Section><Panel importName={importName} controls={controls} build={cfg.build} /></Section> : null;
  if (NO_AUTO.test(name) || !group || derive(group.props).length === 0) return null;
  return <Auto importName={importName} group={group} />;
}
