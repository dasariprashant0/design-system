import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {run, unifiedDiff} from '../src/cli.mjs';

const registry = resolve(import.meta.dirname, '../../../registry');
const tmp = () => mkdtempSync(join(tmpdir(), 'monoline-cmd-'));
const exec = async (args, cwd, extra = {}) => {
  const lines = [], errs = [];
  const code = await run([...args, '--registry', registry, '--cwd', cwd], {out: (s) => lines.push(s), err: (s) => errs.push(s), ...extra});
  return {code, out: lines.join('\n'), err: errs.join('\n')};
};
const button = (cwd) => join(cwd, 'src/components/monoline/button/button.tsx');
const noAsk = async () => { throw new Error('should not ask'); };

test('unifiedDiff: equal texts give nothing; a change gives a hunk with context', () => {
  assert.equal(unifiedDiff('a\nb\n', 'a\nb\n', 'x', 'y'), '');
  const d = unifiedDiff('1\n2\n3\n4\n5\n', '1\n2\nthree\n4\n5\n', 'old', 'new');
  assert.equal(d, '--- old\n+++ new\n@@ -1,5 +1,5 @@\n 1\n 2\n-3\n+three\n 4\n 5\n');
});

test('unifiedDiff: far apart changes make two hunks, close ones merge', () => {
  const a = Array.from({length: 30}, (_, i) => `line ${i}`).join('\n');
  const b = a.replace('line 2\n', 'two\n').replace('line 27', 'twenty-seven');
  assert.equal((unifiedDiff(a, b, 'a', 'b').match(/^@@/gm) ?? []).length, 2);
  assert.equal((unifiedDiff('x\ny\nz\n', 'X\ny\nZ\n', 'a', 'b').match(/^@@/gm) ?? []).length, 1);
});

test('diff: exit 0 when the copy matches the registry, 1 with a diff when it is edited', async () => {
  const cwd = tmp();
  await exec(['add', 'button'], cwd);
  const same = await exec(['diff', 'button'], cwd);
  assert.equal(same.code, 0);
  assert.match(same.out, /same as the registry/);
  writeFileSync(button(cwd), readFileSync(button(cwd), 'utf8').replace('export const Button', 'export const Btn'));
  const edited = await exec(['diff', 'button'], cwd);
  assert.equal(edited.code, 1);
  assert.match(edited.out, /^--- src\/components\/monoline\/button\/button\.tsx \(project\)$/m);
  assert.match(edited.out, /^\+export const Button/m);
  assert.match(edited.out, /^-export const Btn/m);
});

test('diff: a component that is not in the project fails with a hint', async () => {
  const r = await exec(['diff', 'button'], tmp());
  assert.equal(r.code, 1);
  assert.match(r.err, /button is not in the project \(run: monoline add button\)/);
});

test('update: without --yes it asks, and a no leaves the file as it was', async () => {
  const cwd = tmp();
  await exec(['add', 'button'], cwd);
  writeFileSync(button(cwd), 'edited\n');
  const asked = [];
  const r = await exec(['update', 'button'], cwd, {confirm: async (q) => (asked.push(q), false)});
  assert.equal(r.code, 1);
  assert.equal(asked.length, 1);
  assert.match(r.out, /not updated/);
  assert.equal(readFileSync(button(cwd), 'utf8'), 'edited\n');
});

test('update: a yes writes the registry version; --backup keeps the old file as .orig', async () => {
  const cwd = tmp();
  await exec(['add', 'button'], cwd);
  const registryVersion = readFileSync(button(cwd), 'utf8');
  writeFileSync(button(cwd), 'edited\n');
  const r = await exec(['update', 'button', '--backup'], cwd, {confirm: async () => true});
  assert.equal(r.code, 0, r.err);
  assert.equal(readFileSync(button(cwd), 'utf8'), registryVersion);
  assert.equal(readFileSync(`${button(cwd)}.orig`, 'utf8'), 'edited\n');
});

test('update: --yes skips the question; --dry-run writes nothing; up to date is a no-op', async () => {
  const cwd = tmp();
  await exec(['add', 'button'], cwd);
  writeFileSync(button(cwd), 'edited\n');
  const dry = await exec(['update', 'button', '--dry-run'], cwd, {confirm: noAsk});
  assert.equal(dry.code, 0);
  assert.match(dry.out, /would update 1 file/);
  assert.equal(readFileSync(button(cwd), 'utf8'), 'edited\n');
  const yes = await exec(['update', 'button', '--yes'], cwd, {confirm: noAsk});
  assert.equal(yes.code, 0);
  assert.equal(existsSync(`${button(cwd)}.orig`), false);
  const again = await exec(['update', 'button', '--yes'], cwd, {confirm: noAsk});
  assert.match(again.out, /already|same as the registry/);
});

test('update without a terminal and without --yes refuses instead of guessing', async () => {
  const cwd = tmp();
  await exec(['add', 'button'], cwd);
  writeFileSync(button(cwd), 'edited\n');
  const r = await exec(['update', 'button'], cwd, {confirm: undefined});
  if (process.stdin.isTTY) return; // a terminal would ask; the refusal only applies without one
  assert.equal(r.code, 1);
  assert.match(r.err, /pass --yes/);
  assert.equal(readFileSync(button(cwd), 'utf8'), 'edited\n');
});

test('add --all copies every component; --category copies one category', async () => {
  const cwd = tmp();
  const all = await exec(['add', '--all', '--dry-run'], cwd);
  assert.equal(all.code, 0, all.err);
  assert.match(all.out, /would write src\/components\/monoline\/dialog\/dialog\.tsx/);
  assert.match(all.out, /would write src\/components\/monoline\/utils\/cx\.ts/);
  assert.ok(!existsSync(join(cwd, 'src')), 'dry run writes nothing');
  const forms = tmp();
  const r = await exec(['add', '--category', 'forms'], forms);
  assert.equal(r.code, 0, r.err);
  assert.ok(existsSync(join(forms, 'src/components/monoline/input/input.tsx')));
  assert.ok(existsSync(join(forms, 'src/components/monoline/textarea/textarea.tsx')));
  assert.ok(!existsSync(join(forms, 'src/components/monoline/dialog/dialog.tsx')));
  assert.equal((await exec(['add', '--category', 'nope'], tmp())).code, 1);
});

test('search: matches name, keyword and description; all words must match; no match exits 1', async () => {
  const r = await exec(['search', 'text', 'field'], tmp());
  assert.equal(r.code, 0);
  assert.match(r.out, /^input\s/m);
  assert.match(r.out, /^textarea\s/m);
  assert.match((await exec(['search', 'dialog'], tmp())).out.split('\n')[0], /^dialog\s/, 'exact name matches come first');
  const none = await exec(['search', 'zzqqxx'], tmp());
  assert.equal(none.code, 1);
  assert.match(none.out, /no components match "zzqqxx"/);
  assert.equal((await exec(['search'], tmp())).code, 1);
});
