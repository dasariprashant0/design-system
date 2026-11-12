import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {run} from '../src/cli.mjs';

const registry = resolve(import.meta.dirname, '../../../registry');
const tmp = () => mkdtempSync(join(tmpdir(), 'monoline-'));
const exec = async (args, cwd) => {
  const lines = [], errs = [];
  const code = await run([...args, '--registry', registry, '--cwd', cwd], {out: (s) => lines.push(s), err: (s) => errs.push(s)});
  return {code, out: lines.join('\n'), err: errs.join('\n')};
};

test('add copies source and css, skips meta.json, lists deps', async () => {
  const cwd = tmp();
  const r = await exec(['add', 'button'], cwd);
  assert.equal(r.code, 0, r.err);
  assert.ok(existsSync(join(cwd, 'src/components/monoline/button/button.tsx')));
  assert.ok(existsSync(join(cwd, 'src/components/monoline/button/index.ts')));
  assert.ok(!existsSync(join(cwd, 'src/components/monoline/button/meta.json')));
  assert.ok(existsSync(join(cwd, 'src/styles/monoline/button.css')));
  assert.equal(readdirCss(cwd).length, 0, 'legacy numbered files are not copied');
  assert.match(r.out, /npm i radix-ui/);
});

const readdirCss = (cwd) => ['02-buttons.css', '13-loading.css'].filter((f) => existsSync(join(cwd, 'src/styles/monoline', f)));

test('rewrites the shared cx import and writes utils/cx.ts', async () => {
  const cwd = tmp();
  await exec(['add', 'button'], cwd);
  const src = readFileSync(join(cwd, 'src/components/monoline/button/button.tsx'), 'utf8');
  assert.match(src, /from '\.\.\/utils\/cx'/);
  assert.ok(existsSync(join(cwd, 'src/components/monoline/utils/cx.ts')));
});

test('adds components that a component imports', async () => {
  const cwd = tmp();
  const r = await exec(['add', 'password-input'], cwd);
  assert.equal(r.code, 0, r.err);
  assert.ok(existsSync(join(cwd, 'src/components/monoline/input/input.tsx')));
});

test('refuses to overwrite, allows --overwrite, --dry-run writes nothing', async () => {
  const cwd = tmp();
  await exec(['add', 'badge'], cwd);
  const again = await exec(['add', 'badge'], cwd);
  assert.equal(again.code, 1);
  assert.match(again.err, /refusing to overwrite/);
  assert.equal((await exec(['add', 'badge', '--overwrite'], cwd)).code, 0);
  const dry = tmp();
  const r = await exec(['add', 'badge', '--dry-run'], dry);
  assert.equal(r.code, 0);
  assert.match(r.out, /would write/);
  assert.ok(!existsSync(join(dry, 'src')));
});

test('--dir and monoline.json set the target', async () => {
  const cwd = tmp();
  await exec(['add', 'badge', '--dir', 'ui', '--styles', 'css'], cwd);
  assert.ok(existsSync(join(cwd, 'ui/badge/badge.tsx')));
  const cwd2 = tmp();
  writeFileSync(join(cwd2, 'monoline.json'), JSON.stringify({components: 'lib/ml', styles: 'lib/css'}));
  await exec(['add', 'badge'], cwd2);
  assert.ok(existsSync(join(cwd2, 'lib/ml/badge/badge.tsx')));
});

test('unknown component fails', async () => {
  const r = await exec(['add', 'nope'], tmp());
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown component "nope"/);
});

test('list, list --category, info', async () => {
  const all = await exec(['list'], tmp());
  assert.match(all.out, /button/);
  const forms = await exec(['list', '--category', 'forms'], tmp());
  assert.match(forms.out, /input/);
  assert.doesNotMatch(forms.out, /^button /m);
  assert.match((await exec(['info', 'button'], tmp())).out, /Button \(button\)/);
});

test('init writes monoline.json', async () => {
  const cwd = tmp();
  const r = await exec(['init'], cwd);
  assert.equal(r.code, 0);
  assert.equal(JSON.parse(readFileSync(join(cwd, 'monoline.json'), 'utf8')).styles, 'src/styles/monoline');
  assert.match(r.out, /@monoline\/css/);
  assert.equal((await exec(['init'], cwd)).code, 1);
});

test('copies one layered css bundle per component, deduplicated', async () => {
  const cwd = tmp();
  const r = await exec(['add', 'button'], cwd);
  const css = readFileSync(join(cwd, 'src/styles/monoline/button.css'), 'utf8');
  assert.match(css, /^@layer monoline\.components \{/);
  assert.match(css, /\.btn\b/);
  assert.equal(css.split('@layer').length, 2, 'one wrapper, not one per file');
  assert.match(r.out, /import '\.\/src\/styles\/monoline\/button\.css'/);
});
