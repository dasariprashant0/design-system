#!/usr/bin/env node
// Bundle-size budget. Bundles tiny "apps" that import a few components from the built @monoline/react with
// esbuild (minified, tree-shaken, react external) and fails if gzip size exceeds its budget.
//   npm run build && npm run size
// A single Button must stay tiny: the library is built one file per module so unused components and
// Radix primitives drop out. If a case jumps, a new top-level side effect or a barrel import crept in.
import {build} from 'esbuild';
import {gzipSync} from 'node:zlib';
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'packages/react/dist/index.js');
if (!existsSync(dist)) { console.error('Build first: npm run build -w @monoline/react'); process.exit(2); }

const KB = 1024;
const asJson = process.argv.includes('--json'); // machine-readable output for the docs Compare page
const report = {js: [], css: null};
const say = (...a) => { if (!asJson) console.log(...a); };
const cases = [
  ['Button', "import {Button} from '@monoline/react'; console.log(Button)", 2.5],
  ['Button + Badge + Card + Input', "import {Button, Badge, Card, Input} from '@monoline/react'; console.log(Button, Badge, Card, Input)", 3.5],
  ['Combobox', "import {Combobox} from '@monoline/react'; console.log(Combobox)", 4],
  ['Calendar', "import {Calendar} from '@monoline/react'; console.log(Calendar)", 4],
  ['BarChart', "import {BarChart} from '@monoline/react'; console.log(BarChart)", 5],
  ['DataTable', "import {DataTable} from '@monoline/react'; console.log(DataTable)", 10],
  ['Dialog (Radix)', "import {Dialog, DialogContent} from '@monoline/react'; console.log(Dialog, DialogContent)", 16],
  ['Select (Radix)', "import {Select, SelectContent} from '@monoline/react'; console.log(Select, SelectContent)", 36],
  ['Everything', "import * as m from '@monoline/react'; console.log(m)", 125],
];
let failed = 0;
say('JS (gzip, minified, react external)');
for (const [name, code, budget] of cases) {
  const r = await build({stdin: {contents: code, resolveDir: root, loader: 'js'}, bundle: true, minify: true, format: 'esm', write: false, treeShaking: true, external: ['react', 'react-dom', 'react/jsx-runtime'], alias: {'@monoline/react': dist}, logLevel: 'silent'});
  const kb = gzipSync(r.outputFiles[0].contents).length / KB;
  const ok = kb <= budget;
  if (!ok) failed++;
  report.js.push({name, kb: +kb.toFixed(2), budget});
  say(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(32)} ${kb.toFixed(1).padStart(6)} KB   budget ${budget} KB`);
}
const css = join(root, 'packages/css/dist/monoline.min.css');
if (existsSync(css)) {
  const kb = gzipSync(readFileSync(css)).length / KB;
  const budget = 20; const ok = kb <= budget; if (!ok) failed++;
  report.css = {name: 'All components, 3 themes, 9 accents', kb: +kb.toFixed(2), budget};
  say('CSS');
  say(`${ok ? 'ok  ' : 'FAIL'} ${'All components, 3 themes, 9 accents'.padEnd(32)} ${kb.toFixed(1).padStart(6)} KB   budget ${budget} KB`);
}
// "Core plus the components you use": the @monoline/css/core.css + components/<name>.css path.
const {bundles, minify} = await import(join(root, 'packages/css/scripts/bundle.mjs'));
const b = bundles();
const gz = (css) => gzipSync(minify(css)).length / KB;
const pick = (names) => b.core + names.map((n) => b.components[n]).join('\n');
const cssCases = [
  ['core only (tokens, themes, accents, base)', b.core, 5],
  ['core + button', pick(['button']), 5],
  ['core + dashboard example (21 components)', pick(['avatar', 'badge', 'bar-chart', 'block-dashboard-shell', 'button', 'card', 'command', 'data-table', 'date-picker', 'dialog', 'dropdown-menu', 'field', 'form', 'grid', 'heading', 'input', 'line-chart', 'segmented-control', 'stat', 'text', 'toast']), 12],
  ['core + landing example (11 components)', pick(['avatar', 'block-cta', 'block-feature-grid', 'block-footer', 'block-hero', 'block-pricing', 'block-testimonials', 'button', 'code-block', 'container', 'link']), 8],
];
report.cssPaths = [];
for (const [name, css, budget] of cssCases) {
  const kb = gz(css); const ok = kb <= budget; if (!ok) failed++;
  report.cssPaths.push({name, kb: +kb.toFixed(2), budget});
  say(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(42)} ${kb.toFixed(1).padStart(6)} KB   budget ${budget} KB`);
}
if (asJson) console.log(JSON.stringify(report));
process.exit(failed ? 1 : 0);
