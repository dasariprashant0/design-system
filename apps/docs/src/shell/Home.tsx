// Landing page: hero, install tabs, live previews, categories, guides, AI tools.
import {Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, CodeBlock, Field, Input, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Tag, useLocalStorage} from '@monoline/react';
import {categories, components, demosFor, guides, guidePath, hooks, inCategory, nice, pathOf} from './registry';
import {href} from './router';
import {ACCENT_COUNT} from './prefs';
import {GITHUB} from './Topbar';

const PACKAGES = '@monoline/react @monoline/css';
const INSTALL: Record<string, string> = {
  pnpm: `pnpm add ${PACKAGES}`,
  npm: `npm install ${PACKAGES}`,
  yarn: `yarn add ${PACKAGES}`,
  bun: `bun add ${PACKAGES}`,
};
const PREVIEW = ['button', 'badge', 'switch', 'progress', 'tag', 'alert'];

function Install() {
  // The chosen package manager is remembered across visits (and tabs).
  const [pm, setPm] = useLocalStorage('monoline-pm', 'npm');
  return (
    <div className="block" role="group" aria-labelledby="install">
      <h2 id="install" className="label">Install</h2>
      <Tabs value={pm in INSTALL ? pm : 'npm'} onValueChange={setPm}>
        <TabsList aria-label="Package manager">{Object.keys(INSTALL).map((k) => <TabsTrigger key={k} value={k}>{k}</TabsTrigger>)}</TabsList>
        {Object.entries(INSTALL).map(([k, cmd]) => <TabsContent key={k} value={k}><CodeBlock title="bash" code={cmd} /></TabsContent>)}
      </Tabs>
      <CodeBlock title="or copy one component" code="npx monoline add button" />
    </div>
  );
}

function Demo() {
  return (
    <div className="home-demo" role="group" aria-label="Live demo">
      <p className="label">Live: this is the real component</p>
      <Card>
        <CardHeader><CardTitle>Invite a teammate</CardTitle><CardDescription>They get an email with a link.</CardDescription></CardHeader>
        <CardContent>
          <Field label="Work email"><Input placeholder="ada@example.com" /></Field>
          <div className="home-demo-row"><Switch label="Admin access" /><Badge variant="accent">new</Badge><Tag>design</Tag></div>
          <div className="home-demo-row"><Button variant="solid">Send invite</Button><Button>Cancel</Button></div>
        </CardContent>
      </Card>
      <p className="muted small">Change the look with <a href={href('themes')}>Themes</a>, or the Customise button above.</p>
    </div>
  );
}

const sizes: {js: Array<{name: string; kb: number}>; css: {kb: number} | null} = Object.values(import.meta.glob<{js: Array<{name: string; kb: number}>; css: {kb: number} | null}>('../site/size.generated.json', {eager: true, import: 'default'}))[0] ?? {js: [], css: null};
const button = sizes.js.find((s) => s.name === 'Button');

function Why() {
  return (
    <section className="block" aria-labelledby="why">
      <h2 id="why" className="label">Why Monoline</h2>
      <div className="home-points">
        <div className="home-point"><strong>Small</strong><span>{button && sizes.css ? <>One Button is {button.kb.toFixed(1)} KB gzip and all the CSS is {sizes.css.kb.toFixed(0)} KB. </> : null}No runtime styling, no Tailwind. <a href={href('compare')}>Measured numbers</a>.</span></div>
        <div className="home-point"><strong>Accessible</strong><span>An axe test on every component and a real-browser audit of every page in three themes. Built on Radix and native elements.</span></div>
        <div className="home-point"><strong>Themeable</strong><span>Three themes, {ACCENT_COUNT} accent settings, three fonts, three corner styles and three densities, each one attribute. <a href={href('themes')}>Try presets</a>.</span></div>
        <div className="home-point"><strong>AI-first</strong><span>A <code>meta.json</code> per component, a JSON registry, <code>llms.txt</code> and Markdown for every page. <a href="#ai">How it works</a>.</span></div>
      </div>
    </section>
  );
}

function Previews() {
  const shown = PREVIEW.map((n) => components.find((m) => m.name === n)).filter((m) => m && demosFor(m.name)[0]);
  return (
    <section className="block" aria-labelledby="previews">
      <h2 id="previews" className="label">A few components</h2>
      <div className="cat-grid">
        {shown.map((m) => (
          <div key={m!.name} className="cat">
            <h3 className="cat-title"><a href={href(pathOf(m!))}>{m!.title}</a></h3>
            <div className="preview">{demosFor(m!.name)[0]!.render()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Home() {
  const first = pathOf(components[0]!);
  return (
    <>
      <div className="home-hero">
        <div>
          <p className="label">Open source UI kit · pre-1.0</p>
          <h1 className="display display-md hero-title">Monoline</h1>
          <p className="lede">A small, accessible UI kit: plain CSS tokens and {components.length} React components on Radix, with {hooks.length} hooks. Thin rules, one accent, {ACCENT_COUNT} accent settings and three themes.</p>
          <div className="hero-actions">
            <Button variant="solid" asChild><a href={href('guides/getting-started')}>Get started</a></Button>
            <Button asChild><a href={href(first)}>Components</a></Button>
            <Button asChild><a href={href('themes')}>Themes</a></Button>
            <Button asChild><a href={href('blocks')}>Blocks</a></Button>
            <Button asChild><a href={href('compare')}>Compare</a></Button>
          </div>
          <Install />
        </div>
        <Demo />
      </div>
      <Why />
      <Previews />
      <section className="block" aria-labelledby="components">
        <h2 id="components" className="label">Components by category</h2>
        <div className="cat-grid">
          {categories.map((c) => (
            <div key={c} className="cat">
              <h3 className="cat-title">{nice(c)} <Badge>{inCategory(c).length}</Badge></h3>
              <p className="cat-list">{inCategory(c).map((m) => <a key={m.name} href={href(pathOf(m))}>{m.title}</a>)}</p>
            </div>
          ))}
          <div className="cat">
            <h3 className="cat-title">hooks <Badge>{hooks.length}</Badge></h3>
            <p className="cat-list">{hooks.map((m) => <a key={m.name} href={href(pathOf(m))}>{m.title}</a>)}</p>
          </div>
        </div>
      </section>
      <section className="block" aria-labelledby="guides">
        <h2 id="guides" className="label">Guides</h2>
        <div className="cat-grid">
          {guides.map((g) => <a key={g.slug} className="cat guide-card" href={href(guidePath(g))}><span className="cat-title">{g.title}</span><span className="muted small">{g.summary}</span></a>)}
        </div>
      </section>
      <section className="block" aria-labelledby="ai">
        <h2 id="ai" className="label">Made for AI tools</h2>
        <p className="prose">Every component has a <code>meta.json</code>. The same data is published as a plain-text index and a machine-readable registry, so a coding assistant can pick the right component without guessing.</p>
        <p className="cat-list">
          <a href={href('llms.txt')}>llms.txt</a>
          <a href={href('llms-full.txt')}>llms-full.txt</a>
          <a href={href('registry/index.json')}>registry</a>
          <a href={href('guides/for-ai-tools')}>How to use them</a>
        </p>
      </section>
    </>
  );
}
