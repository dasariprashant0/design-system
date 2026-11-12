// Fails if a theme or accent breaks the contrast rules, or a component stylesheet uses a raw colour.
// Run: npm run check (in packages/css). CI runs it on every push.
import {readdirSync} from 'node:fs';
import {read, parseTokens, contrast} from './lib.mjs';
import './check-logical.mjs';
import './check-layers.mjs';
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

if (fails.length) { console.error(fails.map((f) => 'FAIL ' + f).join('\n')); process.exit(1); }
console.log(`ok: ${n} contrast checks across ${Object.keys(themes).length} themes and ${Object.keys(accents).length + 1} accents; no raw colours in components.`);
