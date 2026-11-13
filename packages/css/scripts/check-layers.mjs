// Parses every built stylesheet with esbuild's CSS parser (no warnings allowed) and proves the @layer wrapping
// changed nothing: after minifying, the top-level rules inside the layers must equal the source files' rules,
// so every selector, at-rule and declaration survived. Also checks the layer order is declared once, in core.css.
// Imported by check.mjs, so `npm run check` runs it.
import {transformSync} from 'esbuild';
import {bundles, LAYERS} from './bundle.mjs';
import {read} from './lib.mjs';

const b = bundles();
const fails = [];
const css = (code, label) => {
  const r = transformSync(code, {loader: 'css', minify: true});
  for (const w of r.warnings) fails.push(`${label}: ${w.text}`);
  return r.code;
};
/** Top-level rules of minified CSS; an @layer block is replaced by the rules inside it. */
function rules(min) {
  const out = [];
  let depth = 0, start = 0;
  const walk = (s) => {
    let d = 0, from = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '{') d++;
      else if (c === '}' && --d === 0) { push(s.slice(from, i + 1)); from = i + 1; }
      else if (c === ';' && d === 0) { push(s.slice(from, i + 1)); from = i + 1; }
    }
  };
  const push = (r) => {
    const m = r.match(/^@layer [\w.]+\{([\s\S]*)\}$/);
    if (m) walk(m[1]); else if (!/^@layer [\w.,]+;$/.test(r)) out.push(r);
  };
  walk(min);
  return out.sort();
}

const sources = ['base', 'tokens', 'accents', 'options', 'utilities'].map((f) => `src/${f}.css`).concat(b.order.map((f) => `src/components/${f}`));
for (const f of sources) css(read(f), f); // alone, each source file must be clean: an unclosed brace would swallow the next file in a bundle
const expect = (files) => rules(css(files.map(read).join('\n'), 'source'));
const same = (a, c) => a.length === c.length && a.every((r, i) => r === c[i]);

const outputs = {
  'core.css': [b.core, sources.slice(0, 5)],
  'monoline.css': [b.all, sources],
  ...Object.fromEntries(Object.entries(b.components).map(([n, s]) => [`components/${n}.css`, [s, b.index[n].map((f) => `src/components/${f}`)]])),
  ...Object.fromEntries(Object.entries(b.parts).map(([n, s]) => [`components/parts/${n}`, [s, [`src/components/${n}`]]])),
};
for (const [label, [code, files]] of Object.entries(outputs)) {
  if (!same(rules(css(code, label)), expect(files))) fails.push(`${label}: rules differ from the source files (lost or added by wrapping)`);
  if (/^@layer monoline\.components \{/m.test(code) === false && label !== 'core.css') fails.push(`${label}: not wrapped in the components layer`);
  if (label !== 'core.css' && label !== 'monoline.css' && code.includes(LAYERS)) fails.push(`${label}: declares the layer order; only core.css may`);
}
for (const label of ['core.css', 'monoline.css']) if (outputs[label][0].split(LAYERS).length !== 2) fails.push(`${label}: must declare the layer order exactly once`);

if (fails.length) { console.error(fails.map((f) => 'FAIL layers: ' + f).join('\n')); process.exit(1); }
console.log(`ok: ${Object.keys(outputs).length} built stylesheets parse cleanly with esbuild; layer order declared once; wrapping lost no rule.`);
