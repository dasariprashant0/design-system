// Compare: Monoline against six libraries, from the notes in docs/research/ (read from each project's live docs and
// repo on 2026-11-12) plus the real Monoline bundle sizes captured at build time by scripts/gen-size.mjs.
// Where the notes say "unverified" or have no entry, this page says "not stated on the pages read", never a guess.
import {Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@monoline/react';
import {components, hooks} from '../shell/registry';
import {href} from '../shell/router';
import {inline} from './markdown';

type Size = {name: string; kb: number; budget: number};
type Report = {js: Size[]; css: {name: string; kb: number; budget: number} | null};
const sizes: Report = Object.values(import.meta.glob<Report>('./size.generated.json', {eager: true, import: 'default'}))[0] ?? {js: [], css: null};

const RESEARCH = 'https://github.com/dasariprashant0/design-system/blob/master/docs/research/';

type Row = {lib: string; note: string; distribution: string; styling: string; a11y: string};
const rows: Row[] = [
  {lib: 'Monoline', note: 'monoline', distribution: 'npm packages (`@monoline/react`, `@monoline/css`) and a CLI that copies source. Not published to npm yet.', styling: 'Plain CSS. Tokens are CSS variables, state is `data-*` attributes. No runtime styling, no Tailwind, no PostCSS.', a11y: 'Axe test on every component, 1,182 unit tests, and a real-browser audit of every docs page in 3 themes at desktop and 375px. No manual screen-reader results yet.'},
  {lib: 'shadcn/ui', note: 'shadcn-ui', distribution: 'Copy-paste through a CLI and a JSON registry; also an MCP server. Behaviour layer is your choice: Base UI, Radix or React Aria.', styling: 'Tailwind with CSS variables.', a11y: 'Inherited from the chosen primitive. No audit results on the pages read.'},
  {lib: 'Mantine', note: 'mantine', distribution: 'npm, split into `@mantine/*` packages. Needs PostCSS.', styling: 'CSS Modules and CSS variables from a `createTheme` object; Styles API on every component.', a11y: 'States that components are tested with jest-axe (accessibility FAQ).'},
  {lib: 'MUI', note: 'material-ui', distribution: 'npm, with Emotion as the default styling engine.', styling: 'Emotion at runtime, `sx` prop, `createTheme`; CSS variables are opt-in (`cssVariables: true`).', a11y: 'An Accessibility section on component pages. No audit results on the pages read.'},
  {lib: 'Chakra UI v3', note: 'chakra-ui', distribution: 'npm plus a snippets CLI that copies wrappers into your project.', styling: 'Emotion at runtime today; recipes and tokens. Zero-runtime is a stated goal.', a11y: 'Built on Ark UI. No audit results on the pages read.'},
  {lib: 'daisyUI', note: 'daisyui', distribution: 'npm Tailwind plugin. Class names only, no components and no JavaScript.', styling: 'Tailwind plugin; themes are CSS-variable sets chosen with `data-theme`.', a11y: 'Not stated on the pages read.'},
  {lib: 'HeroUI v3', note: 'heroui', distribution: 'npm: `@heroui/react` and a framework-agnostic `@heroui/styles`.', styling: 'Tailwind v4 and BEM classes on CSS variables.', a11y: 'Built on React Aria Components. No audit results on the pages read.'},
];

type Verdict = 'Smaller' | 'Equal' | 'Behind' | 'Not measured';
const verdicts: Array<{area: string; verdict: Verdict; text: string}> = [
  {area: 'Runtime styling cost', verdict: 'Smaller', text: 'None. MUI and Chakra run Emotion in the browser; Mantine, daisyUI and HeroUI style with CSS (the last two through Tailwind).'},
  {area: 'Install weight for one component', verdict: 'Not measured', text: 'Monoline numbers are below. We have not built the same app in the other libraries, so we make no claim. A same-app benchmark is on the roadmap.'},
  {area: 'Build tooling you must add', verdict: 'Smaller', text: 'None. Mantine needs PostCSS; shadcn/ui, daisyUI and HeroUI need Tailwind.'},
  {area: 'AI-readable docs', verdict: 'Equal', text: 'llms.txt, a JSON registry and Markdown for every page, as shadcn/ui and Mantine publish. An MCP server (shadcn/ui and daisyUI have one) is planned, not shipped.'},
  {area: 'Accessibility proof', verdict: 'Equal', text: 'An axe test per component plus a real-browser audit in CI. Mantine states jest-axe too. Manual NVDA, JAWS and VoiceOver testing is planned, so Radix and React Aria based libraries have the longer track record.'},
  {area: 'Component count', verdict: 'Equal', text: `${components.length} components and ${hooks.length} hooks. By navigation count (2026-11-12) that is above shadcn/ui, MUI, HeroUI and daisyUI and below Mantine (122 components, 83 hooks). Counting methods differ, so read it as a rough guide.`},
  {area: 'Maturity and community', verdict: 'Behind', text: 'Not on npm yet and no outside users. MUI, Mantine, shadcn/ui and Chakra have years of fixed issues, ecosystems and answers on the web.'},
  {area: 'Theming depth', verdict: 'Behind', text: 'Theme, nine accent settings, font, corners and density, plus any token you override. Mantine, Chakra and MUI offer theme objects with per-component defaults and variants; Monoline does not.'},
];

const tone = (v: Verdict) => (v === 'Smaller' ? 'accent' : v === 'Behind' ? 'solid' : 'outline');

export function Compare() {
  const sorted = [...sizes.js].sort((a, b) => a.kb - b.kb);
  return (
    <>
      <p className="prose">An honest side-by-side. The facts about other libraries come from their own docs and repositories, read on 2026-11-12 and written up in <a href={`${RESEARCH}synthesis.md`}>docs/research</a>. Where we did not verify something, the table says so.</p>

      <section className="block" aria-labelledby="where">
        <h2 id="where" className="label">Where Monoline is smaller, equal or behind</h2>
        <Table wrapperLabel="Where Monoline is smaller, equal or behind">
          <TableHeader><TableRow><TableHead scope="col">Area</TableHead><TableHead scope="col">Monoline</TableHead><TableHead scope="col">Detail</TableHead></TableRow></TableHeader>
          <TableBody>
            {verdicts.map((v) => (
              <TableRow key={v.area}><TableCell>{v.area}</TableCell><TableCell><Badge variant={tone(v.verdict)}>{v.verdict}</Badge></TableCell><TableCell>{inline(v.text)}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="block" aria-labelledby="libs">
        <h2 id="libs" className="label">Distribution, styling and accessibility</h2>
        <Table wrapperLabel="Library comparison">
          <TableHeader><TableRow><TableHead scope="col">Library</TableHead><TableHead scope="col">Distribution</TableHead><TableHead scope="col">Styling</TableHead><TableHead scope="col">Accessibility proof</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.lib}>
                <TableCell><a href={`${RESEARCH}${r.note}.md`}>{r.lib}</a></TableCell>
                <TableCell>{inline(r.distribution)}</TableCell>
                <TableCell>{inline(r.styling)}</TableCell>
                <TableCell>{inline(r.a11y)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="block" aria-labelledby="size">
        <h2 id="size" className="label">Monoline bundle size, measured</h2>
        {sizes.js.length === 0 ? (
          <p className="prose">Sizes were not captured in this build. Run <code>npm run build</code> then <code>npm run size</code>.</p>
        ) : (
          <>
            <p className="prose">Each row bundles a few imports from the built package with esbuild (minified, tree-shaken, React external) and compresses with gzip. The budget is the limit CI enforces; going over fails the build. These numbers are captured from <code>npm run size</code> when this site is built.</p>
            <Table wrapperLabel="Monoline bundle size per import">
              <TableHeader><TableRow><TableHead scope="col">What you import</TableHead><TableHead scope="col">Gzip</TableHead><TableHead scope="col">CI budget</TableHead></TableRow></TableHeader>
              <TableBody>
                {sorted.map((s) => <TableRow key={s.name}><TableCell>{s.name}</TableCell><TableCell>{s.kb.toFixed(1)} KB</TableCell><TableCell>{s.budget} KB</TableCell></TableRow>)}
                {sizes.css && <TableRow><TableCell>All CSS: every component, 3 themes, all accents</TableCell><TableCell>{sizes.css.kb.toFixed(1)} KB</TableCell><TableCell>{sizes.css.budget} KB</TableCell></TableRow>}
              </TableBody>
            </Table>
            <p className="prose">Overlays are small because Dialog, Drawer and AlertDialog sit on the native <code>dialog</code> element, and Popover, Tooltip, Select and the menus share one small positioning layer. The widgets still on Radix (tabs, toast, slider, navigation menu and a few more) cost the most; <code>docs/bundle-report.md</code> in the repo lists every component. If you only need a native control, <a href={href('components/native-select')}>Native select</a> costs far less. We did not measure the other libraries here, so the table makes no comparison; it only shows what Monoline costs.</p>
          </>
        )}
      </section>

      <section className="block" aria-labelledby="pick">
        <h2 id="pick" className="label">When to pick something else</h2>
        <ul className="why">
          <li>You need a battle-tested library with a large community today: choose MUI, Mantine or shadcn/ui.</li>
          <li>Your team already writes Tailwind everywhere: shadcn/ui or daisyUI will feel native.</li>
          <li>You want a rich theme object with per-component defaults: Mantine or Chakra.</li>
          <li>You want a small, dependency-light kit with plain CSS, nine accent settings and a CLI that copies source, and you are fine being early: Monoline.</li>
        </ul>
      </section>
    </>
  );
}
