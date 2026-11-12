// Guide pages. Plain content, shown under "Guides" in the sidebar. Routes are `#guides/<slug>`.
import type {ReactNode} from 'react';
import {CodeBlock} from '@monoline/react';

export interface Guide {slug: string; title: string; summary: string; body: () => ReactNode}

const Section = ({title, children}: {title: string; children: ReactNode}) => (
  <section className="block"><h2 className="label">{title}</h2>{children}</section>
);
const P = ({children}: {children: ReactNode}) => <p className="prose">{children}</p>;

const gettingStarted = () => (
  <>
    <Section title="Install">
      <P>Monoline is two packages: <code>@monoline/css</code> (plain CSS, works anywhere) and <code>@monoline/react</code> (React components that render the same classes). React 18 or newer is a peer dependency.</P>
      <CodeBlock title="bash" code="npm install @monoline/react @monoline/css" />
    </Section>
    <Section title="A minimal React app">
      <P>Import the stylesheet once at your entry point, then import components by name.</P>
      <CodeBlock title="main.tsx" code={"import {createRoot} from 'react-dom/client';\nimport '@monoline/css';\nimport {Button} from '@monoline/react';\n\ncreateRoot(document.getElementById('root')!).render(\n  <Button variant=\"solid\">Save</Button>\n);"} />
      <P>Set a theme and accent on <code>&lt;html&gt;</code> (see Theming). Without attributes you get the warm theme with the orange accent.</P>
      <CodeBlock title="index.html" code={'<html lang="en" data-theme="warm" data-accent="orange">'} />
    </Section>
    <Section title="Granular CSS imports">
      <P><code>import '@monoline/css'</code> loads everything as one file (<code>dist/monoline.css</code>; a minified <code>@monoline/css/monoline.min.css</code> is also exported). To load less, import the source files yourself, in this order.</P>
      <CodeBlock title="main.tsx" code={"import '@monoline/css/src/tokens.css';\nimport '@monoline/css/src/base.css';\nimport '@monoline/css/src/accents.css';\nimport '@monoline/css/src/options.css';\n// then the stylesheet of each component you use:\nimport '@monoline/css/src/components/button.css';"} />
      <P>Each component page lists its stylesheets under Details.</P>
    </Section>
    <Section title="Plain CSS, no React">
      <P>Every component is a set of class names. Link the stylesheet and write HTML.</P>
      <CodeBlock title="index.html" code={'<link rel="stylesheet" href="node_modules/@monoline/css/dist/monoline.css">\n\n<html data-theme="warm" data-accent="green">\n  <button class="btn btn-solid">Save</button>\n  <button class="btn btn-line">Cancel</button>\n</html>'} />
      <P>An optional script, <code>@monoline/css/monoline.js</code>, adds behaviour through data attributes: <code>data-ml-theme</code> and <code>data-ml-accent</code> buttons, <code>[data-tabs]</code>, <code>data-dialog-open</code>, <code>data-drawer-open</code>, <code>data-toast</code> and <code>data-copy</code>.</P>
    </Section>
    <Section title="Or copy the source">
      <P>If you would rather own the component code, use the CLI (next guide) to copy components into your project.</P>
    </Section>
  </>
);

const cli = () => (
  <>
    <Section title="Overview">
      <P>The <code>monoline</code> CLI copies component source and its CSS from the registry into your project, shadcn-style. It is plain Node (20+) with no dependencies.</P>
      <CodeBlock title="bash" code={'npx monoline init                  # writes monoline.json, prints the tokens import\nnpx monoline list                  # all components   (--category forms)\nnpx monoline info dialog           # description, css, accessibility notes\nnpx monoline add button dialog     # copy source and CSS into your project'} />
    </Section>
    <Section title="Commands">
      <dl className="kv">
        <dt><code>add &lt;name...&gt;</code></dt><dd>Copies each component and any component it imports (for example <code>password-input</code> brings <code>input</code>) into <code>src/components/monoline/&lt;name&gt;/</code>, and its stylesheets into <code>src/styles/monoline/</code>. Writes <code>utils/cx.ts</code> when needed. Prints the CSS imports to add and the npm packages to install.</dd>
        <dt><code>list</code></dt><dd>Lists components with category, status and description. <code>--category &lt;x&gt;</code> filters.</dd>
        <dt><code>info &lt;name&gt;</code></dt><dd>Shows title, category, status, import line, primitive, stylesheets and accessibility notes.</dd>
        <dt><code>init</code></dt><dd>Writes <code>monoline.json</code> (component and style folders) and prints the token imports. Refuses if the file exists unless <code>--overwrite</code>.</dd>
      </dl>
    </Section>
    <Section title="Options">
      <dl className="kv">
        <dt><code>--registry &lt;path|url&gt;</code></dt><dd>Registry folder or URL. Default is the GitHub <code>master</code> registry. A local checkout works: <code>--registry ./registry</code>.</dd>
        <dt><code>--dir &lt;path&gt;</code></dt><dd>Component folder. Default <code>src/components/monoline</code>.</dd>
        <dt><code>--styles &lt;path&gt;</code></dt><dd>CSS folder. Default <code>src/styles/monoline</code>.</dd>
        <dt><code>--overwrite</code></dt><dd>Replace files that already exist. Without it, <code>add</code> refuses and lists the clashes.</dd>
        <dt><code>--dry-run</code></dt><dd>Print what would be written; write nothing.</dd>
        <dt><code>--cwd &lt;path&gt;</code></dt><dd>Project root. Default: the current folder.</dd>
      </dl>
      <P><code>monoline.json</code> stores <code>components</code>, <code>styles</code> and optionally <code>registry</code>; flags win over it.</P>
    </Section>
    <Section title="Example">
      <CodeBlock title="bash" code={'npx monoline add dialog --dry-run\nnpx monoline add dialog\nnpm i radix-ui   # the command prints the exact packages'} />
      <P>The CSS files assume the tokens are loaded: <code>npm i @monoline/css</code> and import <code>tokens.css</code>, <code>base.css</code> and <code>accents.css</code> once (<code>init</code> prints the lines). Only use registries you trust: the CLI writes whatever source the registry serves.</P>
    </Section>
  </>
);

const theming = () => (
  <>
    <Section title="Attributes on <html>">
      <P>Look and feel is controlled by data attributes on the root element. Components never change; only token values do.</P>
      <dl className="kv">
        <dt><code>data-theme</code></dt><dd><code>warm</code> (default, light), <code>dark</code>, <code>midnight</code></dd>
        <dt><code>data-accent</code></dt><dd><code>orange</code> (default), <code>green</code>, <code>blue</code>, <code>violet</code>, <code>rose</code>, <code>teal</code>, <code>amber</code>, <code>slate</code>. Each pair is contrast-checked in all three themes.</dd>
        <dt><code>data-font</code></dt><dd><code>mono</code> (default), <code>sans</code>, <code>serif</code>. System stacks, nothing to download.</dd>
        <dt><code>data-radius</code></dt><dd><code>square</code> (default, <code>--radius: 0</code>), <code>soft</code> (6px), <code>round</code> (12px)</dd>
        <dt><code>data-density</code></dt><dd><code>compact</code>, <code>comfortable</code> (default), <code>spacious</code>. Rescales <code>--s2</code> to <code>--s7</code> and the small text sizes.</dd>
      </dl>
      <CodeBlock title="index.html" code={'<html data-theme="midnight" data-accent="teal" data-font="sans" data-radius="soft" data-density="compact">'} />
      <P>Accents, fonts, radius and density live in <code>accents.css</code> and <code>options.css</code>. Load <code>options.css</code> after the components. The Customise panel on this site sets exactly these attributes.</P>
    </Section>
    <Section title="Override tokens">
      <P>Every colour, size, space and timing is a CSS variable defined in <code>tokens.css</code>. Override them on <code>:root</code>, or scope them to a theme. Load your file after Monoline.</P>
      <CodeBlock title="brand.css" code={':root {\n  --font-body: "Inter", system-ui, sans-serif;\n  --s4: 18px;\n}\n\n/* Brand accent, per theme. Keep the pairs readable. */\n:root, [data-theme="warm"] {\n  --accent: #0057FF;\n  --accent-text: #0047D1;   /* accent used as text */\n  --on-accent: #FFFFFF;     /* text on an accent fill */\n}\n[data-theme="dark"] { --accent: #5B9DFF; --accent-text: #5B9DFF; --on-accent: #07162E; }'} />
    </Section>
    <Section title="Token groups">
      <dl className="kv">
        <dt>Colour</dt><dd><code>--background</code>, <code>--foreground</code>, <code>--muted</code>, <code>--border</code>, <code>--surface</code>, <code>--danger</code>, <code>--warning</code>, <code>--ok</code></dd>
        <dt>Accent</dt><dd><code>--accent</code> (fills, marks, focus), <code>--accent-text</code> (as text), <code>--accent-2</code>, <code>--on-accent</code></dd>
        <dt>Lines and washes</dt><dd><code>--rule</code>, <code>--wash</code>, <code>--wash-2</code>, <code>--ink-1</code> to <code>--ink-5</code></dd>
        <dt>Type</dt><dd><code>--font-display</code>, <code>--font-body</code>, <code>--text-xs</code> to <code>--text-lg</code>, <code>--display-sm</code>, <code>--display-md</code>, <code>--display-xl</code></dd>
        <dt>Space</dt><dd><code>--s1</code> to <code>--s9</code> (4px steps)</dd>
        <dt>Shape and motion</dt><dd><code>--radius</code>, <code>--round</code>, <code>--ease</code>, <code>--fast</code>, <code>--base</code>, <code>--slow</code></dd>
      </dl>
      <P>The same tokens ship as W3C design-tokens JSON: <code>@monoline/css/tokens.json</code>. In your own CSS use tokens, not raw values, so themes keep working.</P>
    </Section>
  </>
);

const forAi = () => (
  <>
    <Section title="Start here">
      <P>The repository is set up so an AI coding tool can use Monoline without guessing. Point it at these files, in this order.</P>
      <dl className="kv">
        <dt><code>AGENTS.md</code></dt><dd>Layout, commands, the component recipe, API conventions, CSS rules and the accessibility bar.</dd>
        <dt><code>DESIGN.md</code></dt><dd>The look, the tokens and the copy rules.</dd>
        <dt><code>llms.txt</code></dt><dd>Short index: what the kit is, links to the docs, and one line per component.</dd>
        <dt><code>llms-full.txt</code></dt><dd>Every component in one file: description, import line, primitive, status, accessibility notes and its file list.</dd>
        <dt><code>registry/</code></dt><dd>One JSON file per component or hook, plus <code>index.json</code> listing them all.</dd>
      </dl>
      <P><code>llms.txt</code>, <code>llms-full.txt</code> and <code>registry/</code> are generated by <code>npm run registry</code>. Do not edit them by hand.</P>
    </Section>
    <Section title="registry/*.json">
      <P><code>registry/index.json</code> lists every entry with <code>name</code>, <code>title</code>, <code>category</code>, <code>description</code>, <code>status</code>, <code>primitive</code>, <code>css</code>, <code>a11y</code>, <code>keywords</code>, <code>kind</code>, <code>import</code>, <code>path</code> and <code>files</code>. Each <code>registry/&lt;name&gt;.json</code> adds <code>dependencies</code> and <code>source</code>, an array of <code>{'{path, content}'}</code> with the full file text. This is what the CLI reads.</P>
      <CodeBlock title="bash" code="curl -s https://raw.githubusercontent.com/dasariprashant0/design-system/master/registry/button.json" />
    </Section>
    <Section title="meta.json fields">
      <P>Every component folder has a <code>meta.json</code>, validated by <code>npm run registry</code>. This site is built from it, so a new component needs no docs change.</P>
      <dl className="kv">
        <dt><code>name</code></dt><dd>Equals the folder name.</dd>
        <dt><code>title</code></dt><dd>Display name.</dd>
        <dt><code>category</code></dt><dd>layout, typography, buttons, forms, data-display, feedback, overlays, navigation, effects, blocks or hooks.</dd>
        <dt><code>description</code></dt><dd>One sentence.</dd>
        <dt><code>status</code></dt><dd>Maturity, such as stable.</dd>
        <dt><code>primitive</code></dt><dd>Optional. The Radix primitive underneath, if any.</dd>
        <dt><code>css</code></dt><dd>Stylesheets in <code>packages/css/src/components/</code> the component needs.</dd>
        <dt><code>a11y</code></dt><dd>Plain-language accessibility notes.</dd>
        <dt><code>keywords</code></dt><dd>Alternative names, used for search.</dd>
      </dl>
    </Section>
    <Section title="Prompt tip">
      <CodeBlock title="prompt" code={'Read AGENTS.md and DESIGN.md. Build a settings page with @monoline/react.\nUse only tokens for colour and spacing. Component list: llms.txt.'} />
    </Section>
  </>
);

export const guides: Guide[] = [
  {slug: 'getting-started', title: 'Getting started', summary: 'Install, import and render your first component.', body: gettingStarted},
  {slug: 'cli', title: 'CLI', summary: 'Copy components into your project with npx monoline.', body: cli},
  {slug: 'theming', title: 'Theming', summary: 'Themes, accents, fonts, corners, density and tokens.', body: theming},
  {slug: 'for-ai-tools', title: 'For AI tools', summary: 'llms.txt, the registry and meta.json.', body: forAi},
];
