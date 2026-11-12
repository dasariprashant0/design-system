import {CodeBlock} from '@monoline/react';
import {Section, P} from './guide-parts';

const dirHtml = '<html lang="ar" dir="rtl" data-theme="warm" data-accent="orange">';
const dirProvider = `import {Direction} from 'radix-ui';

// Radix primitives (Tabs, Select, menus, Slider, Accordion...) read their direction from this provider,
// not from the dir attribute. Without it, arrow keys and popover placement stay left-to-right.
export function App({dir, children}: {dir: 'ltr' | 'rtl'; children: React.ReactNode}) {
  return <Direction.Provider dir={dir}>{children}</Direction.Provider>;
}`;
const switchDir = `// Keep the document and the Radix provider in step.
useEffect(() => { document.documentElement.dir = dir; }, [dir]);`;
const locale = `import {Calendar, DatePicker, Field} from '@monoline/react';

const locale = 'de-DE';
<Field label="Datum">
  <DatePicker locale={locale} weekStartsOn={1} format={{dateStyle: 'long'}} placeholder="Datum wählen" />
</Field>
<Calendar locale={locale} weekStartsOn={1} aria-label="Kalender" />`;
const intl = `const nf = new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'});
nf.format(1234.5);                      // "1.234,50 €"
new Intl.DateTimeFormat('ar-EG', {dateStyle: 'medium'}).format(new Date());
new Intl.PluralRules('en').select(1);   // "one", use it to pick the right string
new Intl.RelativeTimeFormat('fr', {numeric: 'auto'}).format(-1, 'day'); // "hier"`;
const copy = `import {Form, Combobox, Spinner} from '@monoline/react';

const t = (key: string) => messages[key]; // your i18n library goes here

<Form errors={errors} errorsTitle={t('form.fixThese')}>...</Form>
<Combobox options={options} emptyText={t('combobox.empty')} aria-label={t('country.label')} />
<Spinner label={t('loading')} />`;

export const i18n = () => (
  <>
    <Section title="Direction">
      <P>Set <code>lang</code> and <code>dir</code> on <code>&lt;html&gt;</code>. Layout that follows the document direction flips on its own. The Customise panel in these docs has a Direction switch that sets <code>dir</code> on <code>&lt;html&gt;</code> and remembers it, so you can try any component in right-to-left.</P>
      <CodeBlock title="index.html" code={dirHtml} />
      <P>An RTL pass over the component stylesheets is in progress on a separate branch (logical properties instead of left and right). Until it is merged, some components may still look left-biased in right-to-left; check the ones you use.</P>
    </Section>
    <Section title="DirectionProvider">
      <P>Radix primitives decide arrow-key behaviour and popover placement from a direction provider, not from the <code>dir</code> attribute. A <code>DirectionProvider</code> re-export from <code>@monoline/react</code> is coming with the RTL work and is not in this version. Until then use Radix's own, which Monoline already depends on (<code>radix-ui</code>; install it in your app if it is not hoisted). Once the Monoline one is merged the import will change and the props will be the same.</P>
      <CodeBlock title="app.tsx" code={dirProvider} />
      <CodeBlock title="app.tsx" code={switchDir} />
      <P><code>SegmentedControl</code> does not accept a <code>dir</code> prop; it takes the direction from the provider.</P>
    </Section>
    <Section title="Locale props">
      <P>Components that print dates take a BCP 47 locale. <code>Calendar</code> has <code>locale</code> for month and weekday names and <code>weekStartsOn</code> (0 for Sunday, 1 for Monday). <code>DatePicker</code> passes both through, plus <code>format</code> (Intl.DateTimeFormat options) for the text on the button and <code>placeholder</code>. Neither sets the first day of the week from the locale for you.</P>
      <CodeBlock title="date.tsx" code={locale} />
      <P><code>NumberInput</code> wraps a native <code>type="number"</code> input, so the browser decides how the digits and the decimal separator look and there is no locale prop. To show a formatted number as text (a price, a total), use <code>Intl.NumberFormat</code> yourself.</P>
      <CodeBlock title="intl.ts" code={intl} />
    </Section>
    <Section title="Long text and wrapping">
      <ul className="why">
        <li>Translated labels are often 30% to 50% longer than English. Do not size buttons or table columns to the English text; let them grow and wrap.</li>
        <li>In a flex or grid child that holds text, set <code>min-width: 0</code> so a long word can wrap instead of pushing the layout wide.</li>
        <li>For user-generated or very long strings (file names, emails) add <code>overflow-wrap: anywhere</code> on the element.</li>
        <li>Write your own CSS with logical properties: <code>margin-inline-start</code>, <code>padding-inline</code>, <code>text-align: start</code>, <code>inset-inline-end</code>. They follow <code>dir</code>; <code>margin-left</code> does not.</li>
        <li>Icons that point (arrows, chevrons) need mirroring in right-to-left. Icons that mean something physical (a clock, a play button) do not.</li>
        <li>Numerals, code and URLs stay left-to-right inside right-to-left text. Wrap them in an element with <code>dir="ltr"</code> where it matters.</li>
      </ul>
    </Section>
    <Section title="Translating copy">
      <P>Monoline has no translation layer. Every visible string is a prop or a child, so pass the translated value from your own i18n library. Props that carry a string:</P>
      <dl className="kv">
        <dt><code>Form</code></dt><dd><code>errorsTitle</code>, default &ldquo;Fix these to continue&rdquo;.</dd>
        <dt><code>Combobox</code>, <code>MultiSelect</code></dt><dd><code>emptyText</code>, default &ldquo;No matches&rdquo;.</dd>
        <dt><code>DatePicker</code></dt><dd><code>placeholder</code>, default &ldquo;Pick a date&rdquo;.</dd>
        <dt><code>Command</code></dt><dd><code>title</code>, <code>placeholder</code>, <code>emptyText</code>.</dd>
        <dt><code>Spinner</code>, <code>FileUpload</code></dt><dd><code>label</code>.</dd>
        <dt>Names</dt><dd><code>aria-label</code> on Breadcrumb, ColorPicker, OtpInput, Rating, Slider, SegmentedControl, Pagination.</dd>
      </dl>
      <CodeBlock title="copy.tsx" code={copy} />
      <P>Known English strings with no prop yet (checked in the source at the time of writing): the Calendar buttons &ldquo;Previous month&rdquo; and &ldquo;Next month&rdquo;, the DatePicker popover name &ldquo;Choose a date&rdquo;, the NumberInput buttons &ldquo;Decrease&rdquo; and &ldquo;Increase&rdquo;, PasswordInput &ldquo;Show&rdquo; and &ldquo;Hide&rdquo;, the DataTable &ldquo;Select all rows&rdquo; checkbox and the FileUpload list name &ldquo;Selected files&rdquo;. Adding a prop for each is a compatible change; open an issue if you need one.</P>
    </Section>
  </>
);

export const accessibility = () => (
  <>
    <Section title="What we commit to">
      <P>The target is WCAG 2.2 level AA for every component. This is a goal for the components, not a certificate: an app built from them can still fail if it is used badly (missing labels, headings out of order, colour overrides).</P>
      <ul className="why">
        <li><strong>Native first.</strong> A native element, then a Radix primitive, then hand-written ARIA. Never a <code>div</code> with <code>onClick</code>.</li>
        <li><strong>Keyboard.</strong> Every interactive part is reachable and operable from the keyboard. Escape closes overlays and focus returns to the trigger. Nothing traps focus except modal dialogs, which are meant to.</li>
        <li><strong>Names.</strong> Every control has an accessible name. Icon-only buttons and controls without a visible label (OtpInput, Rating, Slider, SegmentedControl) require an <code>aria-label</code> in their types.</li>
        <li><strong>Errors.</strong> <code>Field</code> sets <code>aria-invalid</code> and <code>aria-describedby</code> and announces the message; <code>Form</code> adds a summary that links to each field.</li>
        <li><strong>Colour is never the only signal.</strong> Badges, alerts and errors carry a word as well.</li>
        <li><strong>Target size.</strong> Interactive targets are meant to be at least 24 by 24 CSS pixels (WCAG 2.2, 2.5.8). This is a rule in <code>AGENTS.md</code>; it is not checked by a script.</li>
      </ul>
    </Section>
    <Section title="Keyboard patterns">
      <dl className="kv">
        <dt>Buttons, links</dt><dd>Enter, and Space for buttons.</dd>
        <dt>Dialogs, popovers, menus</dt><dd>Escape closes. Focus moves in on open and back to the trigger on close.</dd>
        <dt>Menus, tabs, radio groups, toolbars</dt><dd>Arrow keys move between items, Home and End jump. Only one item is a Tab stop. This comes from Radix.</dd>
        <dt>Combobox, Select</dt><dd>Arrow keys move through options, Enter picks, Escape closes.</dd>
        <dt>Slider</dt><dd>Arrows step, Home and End jump, PageUp and PageDown take larger steps.</dd>
        <dt>Calendar</dt><dd>Arrows move by day and week, Home and End go to the ends of the week, PageUp and PageDown change month.</dd>
      </dl>
      <P>The exact behaviour of each component is listed in the Accessibility section of its page, from <code>meta.json</code>, and each item is covered by a test.</P>
    </Section>
    <Section title="Focus ring and motion">
      <P>Focus uses one shared rule in <code>base.css</code>: <code>:focus-visible</code> draws a 2px outline in <code>--accent</code> with a 3px offset. Components must not remove it. Under <code>prefers-reduced-motion: reduce</code> the same file turns off all animations and transitions. Components in the <code>effects</code> category are exempt from the shared rule but must respect the preference themselves. In your own code, the <code>useReducedMotion</code> hook reads the preference.</P>
    </Section>
    <Section title="Contrast rules and npm run check">
      <P><code>npm run check</code> runs <code>packages/css/scripts/check.mjs</code>, which computes WCAG contrast ratios from the token files and fails the build when one is too low. For each of the three themes it requires:</P>
      <ul className="why">
        <li>4.5:1 for foreground, muted, danger, warning and ok text on the background.</li>
        <li>4.5:1 for white text on the surface colour.</li>
        <li>For every theme and accent pair: 4.5:1 for accent text on the background and for the on-accent text on the accent fill, and 3:1 for the accent itself on the background (the focus ring and marks, which need 3:1 under WCAG 1.4.11).</li>
      </ul>
      <P>The same script fails if a component stylesheet contains a raw hex colour, so every colour passes through a checked token. <code>npm run check</code> then runs the type check and the tests. This checks tokens, not your pages: custom colours you add (see the Theme builder, which shows a ratio) are yours to verify.</P>
    </Section>
    <Section title="How components are tested">
      <P>Each component has a test file with behaviour tests written with Testing Library and <code>@testing-library/user-event</code> (real key presses and clicks, found by role and name) and one <code>vitest-axe</code> test. A shared test, <code>all-demos.test.tsx</code>, renders every demo on this site once and runs axe on it, so a broken example fails before it ships.</P>
      <P>Be aware of what axe can and cannot do here. It runs in jsdom, which has no layout and no real colours, so the shared axe helper turns off the <code>color-contrast</code> and <code>region</code> rules. Contrast is covered by the token check above, not by axe. axe finds about a third of accessibility problems at best; it does not judge whether a label makes sense or a focus order is logical.</P>
    </Section>
    <Section title="Known limits">
      <ul className="why">
        <li><strong>No manual screen reader testing has been done yet.</strong> Nobody has tried these components with NVDA, JAWS, VoiceOver or TalkBack. Names, roles and states are as good as the specs and automated tests can show, which is not the same as a good experience. Treat the accessibility notes as intent.</li>
        <li>No automated check of target size, zoom to 400%, text spacing overrides or forced-colours mode.</li>
        <li>Right-to-left support is being worked on; see the i18n guide.</li>
        <li>Some built-in English strings cannot be translated yet (listed in the i18n guide).</li>
        <li>Pages built from the Blocks category are examples. Heading levels and landmarks depend on where you place them.</li>
      </ul>
      <P>If you find a barrier, an issue with the component name, the browser, the assistive technology and the steps is the most useful thing you can send.</P>
    </Section>
  </>
);

const worked = {
  tsx: `import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'ok' | 'warning' | 'danger';
  /** The status in words. The colour alone is not enough, so this is required. */
  label: string;
}

/** A small coloured dot with a text label for screen readers and for sighted users. */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot({tone = 'ok', label, className, ...rest}, ref) {
  return (
    <span ref={ref} className={cx('status-dot', \`status-dot-\${tone}\`, className)} {...rest}>
      <span className="status-dot-mark" aria-hidden="true" />
      {label}
    </span>
  );
});`,
  css: `/* packages/css/src/components/status-dot.css: tokens only, no raw colours. */
.status-dot { display: inline-flex; align-items: center; gap: var(--s2); font-size: var(--text-sm); }
.status-dot-mark { inline-size: var(--s2); block-size: var(--s2); background: currentColor; border-radius: var(--round); }
.status-dot-ok .status-dot-mark { color: var(--ok); }
.status-dot-warning .status-dot-mark { color: var(--warning); }
.status-dot-danger .status-dot-mark { color: var(--danger); }`,
  test: `import {render, screen} from '@testing-library/react';
import {createRef} from 'react';
import {axe} from '../../test/axe';
import {StatusDot} from './status-dot';

describe('StatusDot', () => {
  it('shows the label and defaults to the ok tone', () => {
    render(<StatusDot label="Online" />);
    expect(screen.getByText('Online')).toHaveClass('status-dot', 'status-dot-ok');
  });
  it('applies the tone class and forwards the ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<StatusDot ref={ref} tone="danger" label="Offline" />);
    expect(ref.current).toHaveClass('status-dot-danger');
  });
  it('has no axe violations', async () => {
    const {container} = render(<StatusDot label="Online" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});`,
  demo: `import type {Demo} from '../../demo';
import {StatusDot} from './status-dot';

export const demos: Demo[] = [
  {
    title: 'Tones',
    description: 'The label carries the meaning; the colour is extra.',
    render: () => (
      <div style={{display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap'}}>
        <StatusDot label="Online" />
        <StatusDot tone="warning" label="Degraded" />
        <StatusDot tone="danger" label="Offline" />
      </div>
    ),
  },
];`,
  meta: `{
  "name": "status-dot",
  "title": "Status dot",
  "category": "feedback",
  "description": "A coloured dot with a text label that shows the state of something.",
  "status": "beta",
  "css": ["status-dot.css"],
  "a11y": [
    "The status is text, so it is read as is; the dot is hidden from assistive technology.",
    "Colour is never the only signal."
  ],
  "keywords": ["presence", "indicator", "state"]
}`,
  index: `export {StatusDot} from './status-dot';
export type {StatusDotProps} from './status-dot';`,
};

export const contributing = () => (
  <>
    <Section title="Before you start">
      <P>Read <code>AGENTS.md</code> (layout, API conventions, accessibility bar, ownership rules) and <code>DESIGN.md</code> (look, tokens, copy). Look at <code>packages/react/src/components/button/</code> and copy its shape. This guide follows that recipe with a small example.</P>
      <CodeBlock title="bash" code={'npm install --cache "$TMPDIR/npm-cache"   # once\nnpm run dev                               # docs on :5180, live components and CSS\nnpm test                                  # vitest + axe for every component\nnpm run typecheck                         # react and docs\nnpm run check                             # css contrast and colour lint, typecheck, tests\nnpm run build                             # css dist, react dist, docs site\nnpm run registry                          # regenerate registry/ and llms*.txt'} />
    </Section>
    <Section title="The recipe">
      <P>One folder per component, five files, plus one stylesheet. Hooks use <code>packages/react/src/hooks/&lt;name&gt;/</code> with the same shape.</P>
      <CodeBlock title="layout" code={'packages/react/src/components/status-dot/\n  status-dot.tsx        the component\n  status-dot.test.tsx   behaviour tests and one axe test\n  status-dot.demo.tsx   export const demos: Demo[]\n  meta.json             name, title, category, description, status, css, a11y, keywords\n  index.ts              export the component and its Props type, nothing else\npackages/css/src/components/status-dot.css   styles, tokens only'} />
    </Section>
    <Section title="A worked example: StatusDot">
      <P>The component: <code>forwardRef</code> to the root element, <code>className</code> merged with <code>cx()</code>, a string-union variant with the common value as the default, remaining props spread onto the root, a named export and no default export.</P>
      <CodeBlock title="status-dot.tsx" code={worked.tsx} />
      <P>The stylesheet uses tokens only. <code>npm run check</code> fails on a raw hex colour. The build picks up every <code>.css</code> file in that folder, so there is no list to edit.</P>
      <CodeBlock title="status-dot.css" code={worked.css} />
      <P>Tests check what a user sees: roles, names, keyboard, ref forwarding, plus one axe test. Portal content is found with <code>screen</code>, not <code>container</code>.</P>
      <CodeBlock title="status-dot.test.tsx" code={worked.test} />
      <P>The demo is picked up by this site and by <code>all-demos.test.tsx</code> (axe, no console errors) with no further wiring.</P>
      <CodeBlock title="status-dot.demo.tsx" code={worked.demo} />
      <P><code>meta.json</code> is validated by <code>npm run registry</code>: <code>name</code> equals the folder, <code>category</code> is one of the eleven (layout, typography, buttons, forms, data-display, feedback, overlays, navigation, effects, blocks, hooks), <code>status</code> is <code>stable</code> or <code>beta</code>, and <code>a11y</code> has at least one line.</P>
      <CodeBlock title="meta.json" code={worked.meta} />
      <CodeBlock title="index.ts" code={worked.index} />
      <P>This example is for illustration; it is not in the repository. Prefer composing an existing component over adding a new one when a small variant will do.</P>
    </Section>
    <Section title="Checklist: definition of done">
      <ul className="why">
        <li>The folder has all five files, <code>meta.json</code> is valid and <code>index.ts</code> exports the component and its <code>*Props</code> types.</li>
        <li>CSS is in its own file, uses tokens only, and works in warm, dark and midnight, all nine accents, the font, corner and density options, at 360px and 1200px.</li>
        <li>Keyboard and screen reader behaviour is implemented, listed in <code>meta.json</code> and tested.</li>
        <li><code>npm test</code>, <code>npm run typecheck</code> and <code>npm run check</code> pass.</li>
        <li>Your demos render in <code>all-demos.test.tsx</code> without errors or axe violations.</li>
        <li>The docs site shows every demo with no console errors (<code>npm run dev</code>).</li>
        <li>Copy follows <code>DESIGN.md</code> section 7: verbs, plain words, no exclamation marks.</li>
        <li>No new dependency, or the reason is written in the pull request.</li>
      </ul>
      <P>Add props, never change or remove one. Commit small, with messages like <code>status-dot: add danger tone</code>.</P>
    </Section>
    <Section title="What is generated">
      <P>Do not edit these by hand and do not commit them unless you are the maintainer (see the ownership rules in <code>AGENTS.md</code>).</P>
      <dl className="kv">
        <dt><code>packages/react/src/index.ts</code></dt><dd>Written by <code>scripts/gen-index.mjs</code> (run by build, test and typecheck): one <code>export *</code> for each folder that has an <code>index.ts</code>. Gitignored.</dd>
        <dt><code>registry/*.json</code></dt><dd>Written by <code>npm run registry</code> (<code>scripts/gen-registry.mjs</code>): one file per component with its metadata and full source, plus <code>index.json</code>. The CLI reads these.</dd>
        <dt><code>llms.txt</code>, <code>llms-full.txt</code></dt><dd>Written by the same script: a short index and a full reference for language models.</dd>
        <dt><code>apps/docs/src/props.generated.json</code></dt><dd>The props tables on component pages, written before dev and build.</dd>
      </dl>
      <P>CI runs <code>npm run registry</code> and fails if <code>registry/</code>, <code>llms.txt</code> or <code>llms-full.txt</code> differ from what is committed, so the maintainer regenerates them when a component lands.</P>
    </Section>
  </>
);
