// Builds the distributable files into dist/. Run: npm run build (in packages/css).
//   dist/core.css               tokens, base, utilities, accents, options (layered; declares the layer order)
//   dist/components/<name>.css  everything one React component needs, one file per component
//   dist/components/parts/      each source stylesheet on its own (the numbered legacy files too)
//   dist/components/index.json  component name -> the source files its bundle contains
//   dist/monoline.css           everything as one (CDN link, npm main); monoline.min.css is the minified build
//   dist/fonts/                 the bundled fonts the CSS points at
//   dist/monoline.js            optional vanilla behaviours
//   dist/tokens.json            every token, in the W3C design-tokens shape
import {cpSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {read, parseTokens, isColor} from './lib.mjs';
import {bundles, minify} from './bundle.mjs';

const pkg = JSON.parse(read('package.json'));
const b = bundles();
const min = minify(b.all);

const out = new URL('../dist/', import.meta.url);
const comps = new URL('components/', out);
rmSync(comps, {recursive: true, force: true});
mkdirSync(new URL('parts/', comps), {recursive: true});
writeFileSync(new URL('monoline.css', out), b.all);
writeFileSync(new URL('monoline.min.css', out), b.banner + min + '\n');
writeFileSync(new URL('core.css', out), b.core);
for (const [name, css] of Object.entries(b.components)) writeFileSync(new URL(`${name}.css`, comps), css);
for (const [file, css] of Object.entries(b.parts)) writeFileSync(new URL(`parts/${file}`, comps), css);
writeFileSync(new URL('index.json', comps), JSON.stringify(b.index, null, 2) + '\n');
cpSync(new URL('../src/fonts/', import.meta.url), new URL('fonts/', out), {recursive: true});
cpSync(new URL('../js/monoline.js', import.meta.url), new URL('monoline.js', out));

const {base, themes, accents} = parseTokens();
const tok = (v) => ({$value: v, ...(isColor(v) ? {$type: 'color'} : {})});
const map = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.slice(2), tok(v)]));
const tokens = {
  $description: `Monoline ${pkg.version} design tokens, generated from src/tokens.css and src/accents.css.`,
  base: map(base),
  theme: Object.fromEntries(Object.entries(themes).map(([t, v]) => [t, map(v)])),
  accent: Object.fromEntries(Object.entries(accents).map(([a, byTheme]) => [a, Object.fromEntries(Object.entries(byTheme).map(([t, v]) => [t, map(v)]))])),
};
writeFileSync(new URL('tokens.json', out), JSON.stringify(tokens, null, 2) + '\n');
console.log(`built dist/monoline.css ${(b.all.length / 1024).toFixed(1)} KB (${b.order.length} component files), min ${(min.length / 1024).toFixed(1)} KB; core.css; ${Object.keys(b.components).length} component bundles`);
