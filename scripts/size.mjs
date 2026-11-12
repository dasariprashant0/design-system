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
console.log('JS (gzip, minified, react external)');
for (const [name, code, budget] of cases) {
  const r = await build({stdin: {contents: code, resolveDir: root, loader: 'js'}, bundle: true, minify: true, format: 'esm', write: false, treeShaking: true, external: ['react', 'react-dom', 'react/jsx-runtime'], alias: {'@monoline/react': dist}, logLevel: 'silent'});
  const kb = gzipSync(r.outputFiles[0].contents).length / KB;
  const ok = kb <= budget;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(32)} ${kb.toFixed(1).padStart(6)} KB   budget ${budget} KB`);
}
const css = join(root, 'packages/css/dist/monoline.min.css');
if (existsSync(css)) {
  const kb = gzipSync(readFileSync(css)).length / KB;
  const budget = 20; const ok = kb <= budget; if (!ok) failed++;
  console.log('CSS');
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${'All components, 3 themes, 9 accents'.padEnd(32)} ${kb.toFixed(1).padStart(6)} KB   budget ${budget} KB`);
}
process.exit(failed ? 1 : 0);
