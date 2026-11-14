import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build, buildSnippets, snippetFor, usageLines} from '../scripts/build.mjs';

const here = import.meta.dirname;
const button = {
  name: 'button', title: 'Button', description: 'Triggers an action.', import: "import {Button} from '@monoline/react'",
  usage: "import {Button} from '@monoline/react';\n\n<div style={{gap: 'var(--s3)'}}>\n  <Button variant=\"solid\">Write today</Button>\n</div>",
};
const hook = {
  name: 'use-toast', title: 'useToast', description: 'Shows a toast.', import: "import {useToast} from '@monoline/react'",
  usage: "import {useToast} from '@monoline/react';\n\nconst toast = useToast();\ntoast.show('Saved $5');",
};

test('usage keeps the one element that shows the component, whole when it spans lines', () => {
  assert.deepEqual(usageLines(button), ['<Button variant="solid">Write today</Button>']);
  assert.deepEqual(usageLines(hook), ['const toast = useToast();']);
  const dialog = {name: 'dialog', title: 'Dialog', import: "import {Dialog} from '@monoline/react'",
    usage: "import {Dialog, DialogTrigger} from '@monoline/react';\n\n<Dialog>\n  <DialogTrigger>Open</DialogTrigger>\n</Dialog>\n\n<p>after</p>"};
  assert.deepEqual(usageLines(dialog), ['<Dialog>', '  <DialogTrigger>Open</DialogTrigger>', '</Dialog>']);
});

test('a snippet has prefix ml-<name>, the import, and escaped text', () => {
  const s = snippetFor(hook);
  assert.equal(s.prefix, 'ml-use-toast');
  assert.deepEqual(s.body, ["import {useToast} from '@monoline/react';", '', 'const toast = useToast();']);
  assert.equal(snippetFor({...hook, usage: "import {useToast} from 'x';\n\ntoast.show('$5 and \\ backslash');"}).body.at(-1), "toast.show('\\$5 and \\\\ backslash');");
  assert.match(s.description, /^useToast: Shows a toast\./);
});

test('without usage, the body is the import and a placeholder element', () => {
  const s = snippetFor({name: 'thing', title: 'Thing', description: 'd', import: "import {Thing} from '@monoline/react'"});
  assert.deepEqual(s.body, ["import {Thing} from '@monoline/react'", '', '<Thing />']);
});

test('duplicate titles are an error', () => {
  assert.throws(() => buildSnippets([button, button]), /duplicate snippet "Monoline Button"/);
});

test('build writes a snippets file from a registry folder', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ml-snip-'));
  const reg = join(dir, 'registry');
  mkdirSync(reg);
  writeFileSync(join(reg, 'button.json'), JSON.stringify(button));
  writeFileSync(join(reg, 'use-toast.json'), JSON.stringify(hook));
  writeFileSync(join(reg, 'index.json'), '{"components": []}');
  const out = join(dir, 'monoline.code-snippets');
  const {count} = build({registryDir: reg, outFile: out});
  const written = JSON.parse(readFileSync(out, 'utf8'));
  assert.equal(count, 2);
  assert.deepEqual(Object.keys(written), ['Monoline Button', 'Monoline useToast']);
  assert.equal(written['Monoline Button'].prefix, 'ml-button');
});

test('the committed snippets match the registry (run the build to refresh them)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ml-snip-'));
  const {count, text} = build({registryDir: join(here, '../../../registry'), outFile: join(dir, 'x.code-snippets')});
  const snippets = JSON.parse(text);
  assert.equal(readFileSync(join(here, '../snippets/monoline.code-snippets'), 'utf8'), text);
  const prefixes = Object.values(snippets).map((s) => s.prefix);
  assert.equal(new Set(prefixes).size, count, 'prefixes are unique');
  for (const s of Object.values(snippets)) assert.ok(s.body.length >= 3 && s.body[0].startsWith('import'), s.prefix);
});
