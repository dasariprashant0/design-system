// What goes inside a component page: header, Installation, Usage, Examples, Anatomy, API Reference, Accessibility,
// Styling, Related, Details. Everything is data-driven from meta.json plus the build-time JSON written by
// scripts/gen-props, gen-demos and gen-styling, so a new component needs no change here.
import {useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode} from 'react';
import {
  Badge, Button, CodeBlock, Collapsible, CollapsibleTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@monoline/react';
import type {ComponentMeta, Demo} from '@monoline/react';
import {keyboardRows} from '../../scripts/lib/a11y.mjs';
import {Playground} from './playground';
import './page.css';

type PropRow = {name: string; type: string; optional: boolean; default: string | null; description: string};
type PropGroup = {name: string; props: PropRow[]};
type DemoCode = {title: string; description?: string; code: string};
type Extra = {importName: string; parts: string[]; dependencies: string[]; demos: DemoCode[]};
type StyleFile = {file: string; classes: string[]; attributes: string[]};

// Generated files; the globs tolerate them being absent (first run before the scripts).
const first = <T,>(m: Record<string, T>): T | undefined => Object.values(m)[0];
const propsByName: Record<string, PropGroup[]> = first(import.meta.glob<Record<string, PropGroup[]>>('../props.generated.json', {eager: true, import: 'default'})) ?? {};
const extras: Record<string, Extra> = first(import.meta.glob<Record<string, Extra>>('./demos.generated.json', {eager: true, import: 'default'})) ?? {};
const styling: Record<string, StyleFile[]> = first(import.meta.glob<Record<string, StyleFile[]>>('./styling.generated.json', {eager: true, import: 'default'})) ?? {};
const metas = import.meta.glob<ComponentMeta>('../../../../packages/react/src/{components,hooks}/*/meta.json', {eager: true, import: 'default'});
const demoModules = import.meta.glob<{demos: Demo[]}>('../../../../packages/react/src/{components,hooks}/*/*.demo.tsx', {eager: true});
const allMetas = Object.values(metas).sort((a, b) => a.name.localeCompare(b.name));

const GITHUB = 'https://github.com/dasariprashant0/design-system/tree/master/packages/react/src';
const PMS = ['npm', 'pnpm', 'yarn', 'bun'] as const;
type Pm = (typeof PMS)[number];
const INSTALL: Record<Pm, string> = {npm: 'npm install', pnpm: 'pnpm add', yarn: 'yarn add', bun: 'bun add'};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---- package manager choice: one value shared by every install block on the page, kept in localStorage -------------
const pmListeners = new Set<() => void>();
const readPm = (): Pm => { try { const v = localStorage.getItem('monoline-pm'); return (PMS as readonly string[]).includes(v ?? '') ? (v as Pm) : 'npm'; } catch { return 'npm'; } };
let pmValue: Pm | null = null;
const getPm = () => (pmValue ??= readPm());
const setPm = (v: Pm) => { pmValue = v; try { localStorage.setItem('monoline-pm', v); } catch { /* private mode */ } pmListeners.forEach((l) => l()); };
const subscribePm = (cb: () => void) => {
  pmListeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === 'monoline-pm') { pmValue = null; cb(); } };
  addEventListener('storage', onStorage);
  return () => { pmListeners.delete(cb); removeEventListener('storage', onStorage); };
};
const usePm = () => useSyncExternalStore(subscribePm, getPm, () => 'npm' as Pm);

/** An install command with npm / pnpm / yarn / bun tabs. `packages` are appended to the manager's add command. */
function PmCode({packages, label}: {packages: string; label: string}) {
  const pm = usePm();
  return (
    <Tabs value={pm} onValueChange={(v) => setPm(v as Pm)} className="cdoc-pm">
      <TabsList aria-label={`Package manager for ${label}`}>{PMS.map((p) => <TabsTrigger key={p} value={p}>{p}</TabsTrigger>)}</TabsList>
      {PMS.map((p) => <TabsContent key={p} value={p}><CodeBlock language="bash" code={`${INSTALL[p]} ${packages}`} /></TabsContent>)}
    </Tabs>
  );
}

function Section({id, title, children}: {id: string; title: string; children: ReactNode}) {
  return <section className="cdoc-section" aria-labelledby={id}><h2 id={id} className="cdoc-h2">{title}</h2>{children}</section>;
}

/** Doc URL for the Markdown page, relative to the site base so it works under a sub-path. */
const markdownUrl = (name: string) => new URL(`docs/${name}.md`, new URL(import.meta.env.BASE_URL, typeof document === 'undefined' ? 'http://localhost/' : document.baseURI)).href;

function CopyMarkdown({name}: {name: string}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => { if (state === 'idle') return; const t = setTimeout(() => setState('idle'), 2000); return () => clearTimeout(t); }, [state]);
  const copy = useCallback(async () => {
    try {
      const res = await fetch(markdownUrl(name));
      if (!res.ok) throw new Error(String(res.status));
      await navigator.clipboard.writeText(await res.text());
      setState('copied');
    } catch { setState('failed'); }
  }, [name]);
  return (
    <>
      <Button size="sm" variant="line" onClick={copy}>Copy page as Markdown</Button>
      <span className="cdoc-status" role="status">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : ''}</span>
    </>
  );
}

/** One example: Preview / Code tabs. The Code tab holds only this demo's source and collapses when long. */
function Example({id, demo, code}: {id: string; demo: Demo; code?: DemoCode}) {
  const [open, setOpen] = useState(false);
  const long = !!code && code.code.split('\n').length > 14;
  return (
    <div className="cdoc-example">
      <h3 id={id} className="cdoc-h3">{demo.title}</h3>
      {demo.description && <p className="cdoc-muted">{demo.description}</p>}
      <Tabs defaultValue="preview" className="cdoc-tabs">
        <TabsList aria-label={`${demo.title}: preview or code`}>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          {code && <TabsTrigger value="code">Code</TabsTrigger>}
        </TabsList>
        <TabsContent value="preview"><div className="cdoc-stage">{demo.render()}</div></TabsContent>
        {code && (
          <TabsContent value="code">
            <Collapsible open={open || !long} onOpenChange={setOpen} className="cdoc-code" data-long={long || undefined}>
              <div className="cdoc-code-body"><CodeBlock title="example.tsx" language="tsx" code={code.code} /></div>
              {long && <CollapsibleTrigger asChild><Button size="sm" variant="line">{open ? 'Hide code' : 'View code'}</Button></CollapsibleTrigger>}
            </Collapsible>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function PropsTables({groups}: {groups: PropGroup[]}) {
  return (
    <>
      {groups.map((g) => (
        <div key={g.name} className="cdoc-props">
          <h3 id={`api-${slug(g.name)}`} className="cdoc-h3"><code>{g.name}</code></h3>
          <Table wrapperLabel={`${g.name} props`}>
            <TableHeader><TableRow><TableHead scope="col">Prop</TableHead><TableHead scope="col">Type</TableHead><TableHead scope="col">Default</TableHead><TableHead scope="col">Description</TableHead></TableRow></TableHeader>
            <TableBody>
              {g.props.map((p) => (
                <TableRow key={p.name}>
                  <TableCell><code>{p.name}</code>{!p.optional && <> <Badge>required</Badge></>}</TableCell>
                  <TableCell><code className="cdoc-type">{p.type}</code></TableCell>
                  <TableCell>{p.default ? <code>{p.default}</code> : <span className="cdoc-muted" aria-label="no default">–</span>}</TableCell>
                  <TableCell>{p.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </>
  );
}

function Installation({meta, extra}: {meta: ComponentMeta; extra: Extra}) {
  const deps = extra.dependencies.join(' ');
  const importLine = `import '@monoline/css';\nimport {${extra.importName}} from '@monoline/react';`;
  return (
    <Section id="installation" title="Installation">
      <Tabs defaultValue="cli" className="cdoc-tabs">
        <TabsList aria-label="Installation method">
          <TabsTrigger value="cli">CLI</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="npm">npm</TabsTrigger>
        </TabsList>
        <TabsContent value="cli">
          <p className="cdoc-muted">Copies the source and its styles into your project.</p>
          <CodeBlock language="bash" code={`npx monoline add ${meta.name}`} />
          {deps && <><p className="cdoc-muted">It needs <code>{deps}</code>; install it if your project does not have it:</p><PmCode packages={deps} label="the CLI route" /></>}
        </TabsContent>
        <TabsContent value="manual">
          <ol className="cdoc-steps">
            {deps && <li><p>Install the dependency.</p><PmCode packages={deps} label="the manual route" /></li>}
            <li><p>Copy the source files listed in <code>registry/{meta.name}.json</code> (under <code>source</code>) into your project, from <a href={`${GITHUB}/${meta.category === 'hooks' ? 'hooks' : 'components'}/${meta.name}`}><code>packages/react/src/{meta.category === 'hooks' ? 'hooks' : 'components'}/{meta.name}</code></a>.</p></li>
            {meta.css.length > 0 && <li><p>Copy the stylesheets, or load the full <code>@monoline/css</code>.</p><CodeBlock language="text" code={meta.css.map((f) => `packages/css/src/components/${f}`).join('\n')} /></li>}
            <li><p>Import it.</p><CodeBlock language="tsx" code={`import {${extra.importName}} from './${meta.name}';`} /></li>
          </ol>
        </TabsContent>
        <TabsContent value="npm">
          <PmCode packages="@monoline/react @monoline/css" label="npm" />
          <CodeBlock language="tsx" code={importLine} />
        </TabsContent>
      </Tabs>
    </Section>
  );
}

/** Nesting snippet from the parts in index.ts order: the root wraps the rest, each part on its own line. */
function anatomySnippet(parts: string[]) {
  const [root, ...rest] = parts;
  return [`<${root}>`, ...rest.map((p) => `  <${p} />`), `</${root}>`].join('\n');
}

export interface ComponentDocProps {
  meta: ComponentMeta;
  /** Where a related component lives. Default: the hash route `#<name>`. */
  linkTo?: (name: string) => string;
}

/** The body of a component or hook page. The page shell renders the title area around it, and reads the h2 ids for its "On this page" list. */
export function ComponentDoc({meta, linkTo = (n) => `#${n}`}: ComponentDocProps) {
  const hook = meta.category === 'hooks';
  const extra: Extra = extras[meta.name] ?? {importName: meta.title, parts: [], dependencies: [], demos: []};
  const demos = useMemo(() => {
    const key = Object.keys(demoModules).find((k) => k.includes(`/${meta.name}/`));
    return key ? demoModules[key]!.demos : [];
  }, [meta.name]);
  const groups = propsByName[meta.name] ?? [];
  const styleFiles = styling[meta.name] ?? [];
  const keys = useMemo(() => keyboardRows(meta.a11y), [meta.a11y]);
  const related = allMetas.filter((m) => m.category === meta.category && m.name !== meta.name).slice(0, 4);
  const usage = extra.demos[0]?.code ?? `import {${extra.importName}} from '@monoline/react';`;
  const kind = hook ? 'hooks' : 'components';
  const styleRows = styleFiles.flatMap((s) => [...s.classes.map((c) => ({sel: `.${c}`, file: s.file})), ...s.attributes.map((a) => ({sel: a, file: s.file}))]);
  const showAnatomy = !hook && extra.parts.length > 1;

  return (
    <div className="cdoc">
      <header className="cdoc-head">
        <h1 className="cdoc-title display display-md">{meta.title}</h1>
        <p className="cdoc-lede">{meta.description}</p>
        <div className="cdoc-links">
          <a href={`${GITHUB}/${kind}/${meta.name}`}>Source on GitHub</a>
          <a href="https://www.npmjs.com/package/@monoline/react"><code>@monoline/react</code></a>
          <a href={markdownUrl(meta.name)}>Markdown</a>
          <CopyMarkdown name={meta.name} />
        </div>
      </header>

      <Installation meta={meta} extra={extra} />

      <Section id="usage" title="Usage"><CodeBlock title="example.tsx" language="tsx" code={usage} /></Section>

      {!hook && <Playground name={meta.name} importName={extra.importName} groups={groups} />}

      {demos.length > 0 && (
        <Section id="examples" title="Examples">
          {demos.map((d, i) => <Example key={d.title} id={`example-${slug(d.title)}`} demo={d} code={extra.demos[i]?.title === d.title ? extra.demos[i] : extra.demos.find((x) => x.title === d.title)} />)}
        </Section>
      )}

      {showAnatomy && (
        <Section id="anatomy" title="Anatomy">
          <p className="cdoc-muted">Import the parts you need and nest them like this.</p>
          <CodeBlock language="tsx" code={`import {${extra.parts.join(', ')}} from '@monoline/react';\n\n${anatomySnippet(extra.parts)}`} />
        </Section>
      )}

      {groups.length > 0 && <Section id="api-reference" title="API Reference"><PropsTables groups={groups} /></Section>}

      <Section id="accessibility" title={hook ? 'Behaviour' : 'Accessibility'}>
        <ul className="cdoc-list">{meta.a11y.map((a) => <li key={a}>{a}</li>)}</ul>
        {keys.length > 0 && (
          <>
            <h3 id="keyboard" className="cdoc-h3">Keyboard</h3>
            <Table wrapperLabel="Keyboard interactions">
              <TableHeader><TableRow><TableHead scope="col">Keys</TableHead><TableHead scope="col">Action</TableHead></TableRow></TableHeader>
              <TableBody>{keys.map((k, i) => <TableRow key={i}><TableCell><kbd className="cdoc-kbd">{k.keys}</kbd></TableCell><TableCell>{k.action}</TableCell></TableRow>)}</TableBody>
            </Table>
          </>
        )}
      </Section>

      {styleRows.length > 0 && (
        <Section id="styling" title="Styling">
          <p className="cdoc-muted">Classes and attribute selectors in the stylesheets this component uses. Style state through the attributes, not through class toggles.</p>
          <Table wrapperLabel="Styling selectors">
            <TableHeader><TableRow><TableHead scope="col">Selector</TableHead><TableHead scope="col">Stylesheet</TableHead></TableRow></TableHeader>
            <TableBody>{styleRows.map((r) => <TableRow key={`${r.file}${r.sel}`}><TableCell><code>{r.sel}</code></TableCell><TableCell><code>{r.file}</code></TableCell></TableRow>)}</TableBody>
          </Table>
        </Section>
      )}

      {related.length > 0 && (
        <Section id="related" title="Related">
          <ul className="cdoc-related">{related.map((m) => <li key={m.name}><a href={linkTo(m.name)}>{m.title}</a><span className="cdoc-muted">{m.description}</span></li>)}</ul>
        </Section>
      )}

      <Section id="details" title="Details">
        <dl className="cdoc-kv">
          {!hook && <><dt>Built on</dt><dd>{meta.primitive ?? 'native elements'}</dd><dt>Stylesheets</dt><dd>{meta.css.length ? meta.css.join(', ') : 'none'}</dd></>}
          <dt>Status</dt><dd>{meta.status}</dd>
          {meta.keywords?.length ? <><dt>Also called</dt><dd>{meta.keywords.join(', ')}</dd></> : null}
        </dl>
      </Section>
    </div>
  );
}
