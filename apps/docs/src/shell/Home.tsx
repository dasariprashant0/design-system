// Landing page: hero, install tabs, live previews, categories, guides, AI tools.
import {Badge, Button, CodeBlock, Tabs, TabsContent, TabsList, TabsTrigger, useLocalStorage} from '@monoline/react';
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
    <section className="block" aria-labelledby="install">
      <h2 id="install" className="label">Install</h2>
      <Tabs value={pm in INSTALL ? pm : 'npm'} onValueChange={setPm}>
        <TabsList aria-label="Package manager">{Object.keys(INSTALL).map((k) => <TabsTrigger key={k} value={k}>{k}</TabsTrigger>)}</TabsList>
        {Object.entries(INSTALL).map(([k, cmd]) => <TabsContent key={k} value={k}><CodeBlock title="bash" code={cmd} /></TabsContent>)}
      </Tabs>
      <CodeBlock title="app.tsx" code={"import '@monoline/css';\nimport {Button} from '@monoline/react';\n\nexport const App = () => <Button variant=\"solid\">Save</Button>;"} />
      <p className="muted small">Prefer to own the code? <code>npx monoline add button</code> copies a component and its CSS into your project. See <a href={href('guides/cli')}>the CLI guide</a>.</p>
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
      <p className="label">Open source UI kit</p>
      <h1 className="display display-md hero-title">Monoline</h1>
      <p className="lede">Thin rules, one accent and plain CSS. {components.length} accessible React components on Radix, {hooks.length} hooks, {ACCENT_COUNT} accents and three themes.</p>
      <div className="hero-actions">
        <Button variant="solid" asChild><a href={href('guides/getting-started')}>Get started</a></Button>
        <Button asChild><a href={href(first)}>Components</a></Button>
        <Button asChild><a href={GITHUB}>GitHub</a></Button>
      </div>
      <Install />
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
