#!/usr/bin/env node
// Bundle-size budget. Bundles tiny "apps" that import a few components from the built @monoline/react with
// esbuild (minified, tree-shaken, react external) and fails if gzip size exceeds its budget.
//   npm run build && npm run size
// A single Button must stay tiny: the library is built one file per module so unused components and
// Radix primitives drop out. If a case jumps, a new top-level side effect or a barrel import crept in.
import {build} from 'esbuild';
import {gzipSync} from 'node:zlib';
import {readFileSync, writeFileSync, existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'packages/react/dist/index.js');
if (!existsSync(dist)) { console.error('Build first: npm run build -w @monoline/react'); process.exit(2); }

const KB = 1024;
const asJson = process.argv.includes('--json'); // machine-readable output for the docs Compare page
const detail = process.argv.includes('--detail'); // per-component sizes and top contributing packages -> docs/bundle-report.md
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
const bundle = (code) => build({stdin: {contents: code, resolveDir: root, loader: 'js'}, bundle: true, minify: true, format: 'esm', write: false, treeShaking: true, metafile: true, external: ['react', 'react-dom', 'react/jsx-runtime'], alias: {'@monoline/react': dist}, logLevel: 'silent'});
/** Package name of a metafile input path ('' for Monoline's own source). */
const pkgOf = (f) => { const m = f.match(/node_modules\/((?:@[^/]+\/)?[^/]+)\/(?!.*node_modules)/); return m ? m[1] : 'monoline (own code)'; };
/** Minified bytes each package contributes to the bundle, biggest first, with its share of the whole. */
const contributors = (r) => {
  const by = {}; let total = 0;
  for (const out of Object.values(r.metafile.outputs)) for (const [f, v] of Object.entries(out.inputs)) { by[pkgOf(f)] = (by[pkgOf(f)] || 0) + v.bytesInOutput; total += v.bytesInOutput; }
  return Object.entries(by).filter(([, b]) => b).sort((a, b) => b[1] - a[1]).map(([name, b]) => ({name, share: b / total}));
};
if (detail) await writeDetail();
let failed = 0;
say('JS (gzip, minified, react external)');
for (const [name, code, budget] of cases) {
  const r = await bundle(code);
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
if (asJson) console.log(JSON.stringify(report));
process.exit(failed ? 1 : 0);

/** --detail: gzip size of every component alone and of everything, with the packages that make it up. */
async function writeDetail() {
  const dirs = join(root, 'packages/react/src/components');
  const rows = [];
  for (const d of readdirSync(dirs).sort()) {
    const idx = join(dirs, d, 'index.ts'); if (!existsSync(idx)) continue;
    const names = [...readFileSync(idx, 'utf8').matchAll(/^export \{([^}]+)\}/gm)].flatMap((m) => m[1].split(',').map((n) => n.trim()).filter(Boolean));
    if (!names.length) continue;
    const r = await bundle(`import {${names.join(',')}} from '@monoline/react'; console.log(${names.join(',')})`);
    rows.push({name: d, kb: gzipSync(r.outputFiles[0].contents).length / KB, top: contributors(r)});
  }
  const all = await bundle("import * as m from '@monoline/react'; console.log(m)");
  const total = {name: 'everything', kb: gzipSync(all.outputFiles[0].contents).length / KB, top: contributors(all)};
  const fmt = (top, n) => top.slice(0, n).map((t) => `${t.name} ${Math.round(t.share * 100)}%`).join(', ');
  const lines = [
    '# Bundle report', '',
    'Generated by `node scripts/size.mjs --detail` (run `npm run build` first). Every component is bundled alone from the built `@monoline/react` with esbuild (minified, tree-shaken, `react` external) and gzipped. "Top contributors" are the packages behind the minified bytes, as a share of the raw output; `monoline` is the library\'s own code.', '',
    `Everything: **${total.kb.toFixed(1)} KB** gzip. ${fmt(total.top, 6)}.`, '',
    '| Component | gzip KB | Top contributors |', '|---|---:|---|',
    ...rows.sort((a, b) => b.kb - a.kb).map((r) => `| ${r.name} | ${r.kb.toFixed(1)} | ${fmt(r.top, 4)} |`), '',
  ];
  writeFileSync(join(root, 'docs/bundle-report.md'), lines.join('\n'));
  say('wrote docs/bundle-report.md');
}
