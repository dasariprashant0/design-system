// Fails if a theme or accent breaks the contrast rules, or a component stylesheet uses a raw colour.
// Run: npm run check (in packages/css). CI runs it on every push.
import {readdirSync} from 'node:fs';
import {read, parseTokens, contrast} from './lib.mjs';
import './check-logical.mjs';
import './check-layers.mjs';
import {findDuplicates} from './check-duplicates.mjs';
import './size.mjs';

const {themes, accents} = parseTokens();
const fails = [];
let n = 0;
function need(label, a, b, min) {
  n++;
  const r = contrast(a, b);
  if (r < min) fails.push(`${label}: ${r.toFixed(2)}:1, needs ${min}:1 (${a} on ${b})`);
}

for (const [theme, base] of Object.entries(themes)) {
  const bg = base['--background'];
  for (const k of ['--foreground', '--muted', '--danger', '--warning', '--ok']) need(`${theme} ${k} on background`, base[k], bg, 4.5);
  need(`${theme} surface-text on surface`, '#FFFFFF', base['--surface'], 4.5);
  for (const [accent, byTheme] of Object.entries({default: {[theme]: {}}, ...accents})) {
    const v = {...base, ...(byTheme[theme] || (theme === 'warm' ? byTheme.warm : {}) || {})};
    const id = `${theme}/${accent}`;
    need(`${id} accent-text on background`, v['--accent-text'], bg, 4.5);
    need(`${id} accent on background`, v['--accent'], bg, 3);
    need(`${id} on-accent on accent`, v['--on-accent'], v['--accent'], 4.5);
  }
}

// Code colours sit on the always-dark --surface of every theme.
{
  const tokens = read('src/tokens.css');
  const codeColours = [...tokens.matchAll(/--(code-[a-z]+):\s*(#[0-9A-Fa-f]{6})/g)];
  for (const [theme, base] of Object.entries(themes)) for (const [, name, hex] of codeColours) need(`${theme} --${name} on surface`, hex, base['--surface'], 4.5);
}

// Tokens only: no raw hex in any stylesheet except tokens.css and accents.css.
const linted = ['src/options.css', 'src/base.css', 'src/utilities.css', ...readdirSync(new URL('../src/components/', import.meta.url)).filter((f) => f.endsWith('.css')).map((f) => `src/components/${f}`)];
for (const f of linted) {
  const hits = read(f).replace(/\/\*[\s\S]*?\*\//g, '').match(/#[0-9a-fA-F]{3,8}\b(?![^(]*\))/g) || [];
  for (const h of hits) fails.push(`${f} uses a raw colour ${h}; add a token instead`);
}

// WCAG 2.5.8: the form error summary links are list items, not inline text, so each needs a 24px target.
// (Found by axe in a real app: the links were 17px tall.)
{
  const rule = read('src/components/form.css').split('\n').find((l) => l.startsWith('.form-errors a {')) ?? '';
  if (!/display:\s*inline-block/.test(rule) || !/padding-block:\s*var\(--s1\)/.test(rule)) fails.push('form.css: .form-errors a must be inline-block with padding-block: var(--s1) (24px target)');
}

// The legacy utility `.grid` comes later in the bundle and would override the Grid component's columns and gap.
for (const l of read('src/components/grid.css').replace(/\/\*[\s\S]*?\*\//g, '').split('\n')) {
  if (/^\.grid-(auto|fixed)\b/.test(l.trim())) fails.push(`grid.css: "${l.slice(0, 40)}" must be written .grid.grid-... so the legacy .grid utility cannot override it`);
}

// A Stat without a note sits in a grid row next to Stats with one; it must not stretch and push its value down.
if (!/^\.stat \{[^}]*align-content:\s*start/m.test(read('src/components/19-avatar.css'))) fails.push('19-avatar.css: .stat needs align-content: start so values line up across a row');

// Hover must not restyle an "on" control: `.x:hover:not(:disabled)` (3 classes' worth) beats `.x[data-state="on"]` (2), so
// hovering a selected segment/toggle/day made light text sit on a light fill. Found by hovering after a click in a real app.
for (const [file, sel, on] of [['segmented-control.css', '.segment', 'data-state="on"'], ['slider.css', '.toggle', 'data-state="on"'], ['toolbar.css', '.toolbar-item', 'data-state="on"'], ['calendar.css', '.calendar-day', 'aria-pressed="true"']]) {
  for (const l of read(`src/components/${file}`).split('\n')) {
    if (l.startsWith(`${sel}:`) && l.includes(':hover') && !l.includes(`[${on}]`)) fails.push(`${file}: "${l.slice(0, 60)}" must exclude the selected state with :not([${on}])`);
  }
}

// typography.css (later in the bundle) also defines .heading-md and .heading-sm; Heading size="md" rendered at 34px, not the
// documented 18px, so every block sub-title was oversized. The component's rules must win by specificity.
{
  const h = read('src/components/heading.css');
  for (const s of ['md', 'sm']) if (!h.includes(`.heading.heading-${s} {`)) fails.push(`heading.css: write .heading.heading-${s} (two classes) so typography.css cannot override the documented size`);
}

// One source of truth per selector: the same selector defined in two stylesheets with different values means the later one wins silently.
for (const c of findDuplicates().conflicts) fails.push(`${c.sel} is defined in ${c.files.join(' and ')} with different ${c.props.map((p) => p.prop).join(', ')}; keep one (run node packages/css/scripts/check-duplicates.mjs)`);

if (fails.length) { console.error(fails.map((f) => 'FAIL ' + f).join('\n')); process.exit(1); }
console.log(`ok: ${n} contrast checks across ${Object.keys(themes).length} themes and ${Object.keys(accents).length + 1} accents; no raw colours in components.`);
