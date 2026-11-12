// Prints gzip size (minified) of core.css and every component bundle; fails over budget.
//   npm run size:css -w @monoline/css      (check.mjs runs it too, so `npm run check` enforces it)
import {gzipSync} from 'node:zlib';
import {bundles, minify} from './bundle.mjs';

const gz = (css) => gzipSync(minify(css)).length;
const CORE_BUDGET = 6 * 1024;
const COMPONENT_BUDGET = 4 * 1024;
// A bundle that was already over 4 KB when the budget was set is listed here at its size then plus 10%.
const OVERRIDES = {};

const b = bundles();
const rows = [['core', gz(b.core), CORE_BUDGET], ...Object.entries(b.components).map(([n, css]) => [n, gz(css), OVERRIDES[n] ?? COMPONENT_BUDGET])];
const all = gz(b.all);
const kb = (n) => (n / 1024).toFixed(2).padStart(6);
const fails = rows.filter(([, n, max]) => n > max);
if (process.argv.includes('--all') || import.meta.url === `file://${process.argv[1]}`) {
  for (const [name, n, max] of [...rows].sort((x, y) => y[1] - x[1])) console.log(`${n > max ? 'FAIL' : 'ok  '} ${name.padEnd(28)} ${kb(n)} KB  budget ${(max / 1024).toFixed(1)} KB`);
  console.log(`everything (monoline.css) ${kb(all)} KB gzip`);
}
if (fails.length) { console.error(fails.map(([n, s, m]) => `FAIL size: ${n} is ${(s / 1024).toFixed(2)} KB gzip, budget ${(m / 1024).toFixed(1)} KB`).join('\n')); process.exit(1); }
console.log(`ok: core.css ${kb(rows[0][1]).trim()} KB gzip (budget 6); ${rows.length - 1} component bundles, largest ${kb(Math.max(...rows.slice(1).map((r) => r[1]))).trim()} KB (budget 4).`);
