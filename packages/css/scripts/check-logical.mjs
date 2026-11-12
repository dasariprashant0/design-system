// Fails if a stylesheet uses a physical property where start/end is meant (RTL support).
// A line that really means left/right carries `/* physical: reason */` and is skipped.
// Imported by check.mjs, so `npm run check` runs it.
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.css') ? [p] : [];
});
const PHYSICAL = [
  /(?<![\w-])(margin|padding)-(left|right)\s*:/,
  /(?<![\w-])border-(left|right)(-width|-color|-style)?\s*:/,
  /(?<![\w-])border-(top|bottom)-(left|right)-radius\s*:/,
  /(?<![\w-])text-align\s*:\s*(left|right)\b/,
  /(?<![\w-])(left|right)\s*:/,
  /(?<![\w-])float\s*:\s*(left|right)\b/,
];

const bad = [];
let files = 0;
for (const file of walk(root)) {
  files++;
  // blank out comments (keeping line numbers) except `physical:` markers
  const text = readFileSync(file, 'utf8').replace(/\/\*(?!\s*physical:)[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  text.split('\n').forEach((line, i) => {
    if (/\/\*\s*physical:\s*\S/.test(line)) return;
    if (PHYSICAL.some((re) => re.test(line))) bad.push(`FAIL ${file.slice(root.length)}:${i + 1} physical property; use start/end or add /* physical: reason */: ${line.trim().slice(0, 80)}`);
  });
}
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
console.log(`ok: no unmarked physical properties in ${files} stylesheets.`);
