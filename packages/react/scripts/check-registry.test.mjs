// Regression tests for the AI registry: the props extraction on three real components with known props, and the
// shape of every generated registry file. Run: npm run check:registry (repo root). Reads committed registry/ files,
// so run `npm run registry` first after changing a component.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {extractProps, COMPONENT_PROPS, HOOK_PROPS} from './props-extract.mjs';
import {cssFacts, pruneImports, relatedFor} from './registry-fields.mjs';
import {exportedNames} from '../../../apps/docs/scripts/lib/demos.mjs';
import {repoRoot} from './lib.mjs';

const SRC = join(repoRoot, 'packages', 'react', 'src', 'components');
const REGISTRY = join(repoRoot, 'registry');
const propsOf = (name) => extractProps(join(SRC, name, `${name}.tsx`), {pattern: COMPONENT_PROPS});
const byName = (groups) => Object.fromEntries(groups.flatMap((g) => g.props).map((p) => [p.name, p]));
const load = (file) => JSON.parse(readFileSync(join(REGISTRY, file), 'utf8'));
const components = () => readdirSync(REGISTRY).filter((f) => f.endsWith('.json') && f !== 'index.json').sort();

test('props-extract: button declares ButtonProps with its variants and flags, not the HTML attributes it inherits', () => {
  const groups = propsOf('button');
  assert.deepEqual(groups.map((g) => g.name), ['ButtonProps']);
  const p = byName(groups);
  for (const name of ['variant', 'size', 'loading', 'asChild']) assert.ok(name in p, `missing ${name}`);
  assert.equal(p.variant.optional, true);
  assert.match(p.variant.type, /"solid"/);
  assert.match(p.variant.type, /"danger"/);
  assert.equal(p.size.default, "'md'"); // from the destructuring in button.tsx
  assert.equal(p.loading.default, 'false');
  assert.match(p.loading.description, /spinner/i); // the JSDoc is carried through
  assert.equal('onClick' in p, false, 'inherited ButtonHTMLAttributes are not listed');
});

test('props-extract: combobox lists its controlled pair, the empty text and invalid', () => {
  const p = byName(propsOf('combobox'));
  for (const name of ['options', 'value', 'defaultValue', 'onValueChange', 'emptyText', 'invalid']) assert.ok(name in p, `missing ${name}`);
  assert.equal(p.options.optional, false, 'options is required');
  assert.equal(p.emptyText.default, "'No matches'");
  assert.equal(p.value.optional, true);
});

test('props-extract: data-table lists its columns, data, selection and paging props', () => {
  const p = byName(propsOf('data-table'));
  for (const name of ['columns', 'data', 'getRowId', 'label', 'sort', 'selectable', 'selection', 'defaultSelection', 'onSelectionChange', 'pageSize', 'emptyTitle']) {
    assert.ok(name in p, `missing ${name}`);
  }
  assert.equal(p.columns.optional, false);
  assert.equal(p.data.optional, false, 'data is required');
});

test('props-extract: hook options are read with the hook pattern and skipped by the component pattern', () => {
  const file = join(repoRoot, 'packages', 'react', 'src', 'hooks', 'use-counter', 'use-counter.ts');
  const hook = extractProps(file, {pattern: HOOK_PROPS});
  assert.ok(hook.length > 0, 'use-counter exports an *Options or *Return type');
  assert.deepEqual(extractProps(file, {pattern: COMPONENT_PROPS}), []);
});

test('registry index: one entry per component file, prop names listed, no props or usage inlined', () => {
  const index = load('index.json');
  assert.equal(index.components.length, components().length);
  for (const e of index.components) {
    assert.ok(Array.isArray(e.propNames), `${e.name}.propNames`);
    assert.equal('props' in e, false, `${e.name} must not inline props in index.json`);
    assert.equal('usage' in e, false, `${e.name} must not inline usage in index.json`);
    assert.ok(existsSync(join(REGISTRY, `${e.name}.json`)), `${e.name}.json missing`);
  }
  const button = index.components.find((e) => e.name === 'button');
  assert.ok(button.propNames.includes('variant') && button.propNames.includes('asChild'));
});

test('registry files: props is an array of named groups (empty when a component has no *Props export)', () => {
  for (const file of components()) {
    const c = load(file);
    assert.ok(Array.isArray(c.props), `${file}: props must be an array`);
    for (const g of c.props) {
      assert.equal(typeof g.name, 'string', `${file}: group name`);
      assert.ok(Array.isArray(g.props) && g.props.length > 0, `${file}: group ${g.name} has no props`);
      for (const p of g.props) {
        assert.equal(typeof p.name, 'string', `${file}: prop name`);
        assert.equal(typeof p.type, 'string', `${file}: ${p.name} type`);
        assert.equal(typeof p.optional, 'boolean', `${file}: ${p.name} optional`);
        assert.ok(p.default === null || typeof p.default === 'string', `${file}: ${p.name} default`);
        assert.equal(typeof p.description, 'string', `${file}: ${p.name} description`);
      }
    }
  }
});

test('registry files: every component has a non-empty usage string and an import line', () => {
  for (const file of components()) {
    const c = load(file);
    assert.equal(typeof c.usage, 'string', `${file}: usage`);
    assert.ok(c.usage.trim().length > 0, `${file}: usage is empty`);
    assert.match(c.import, /^import \{\w+\} from '@monoline\/react'$/, `${file}: import`);
    assert.ok(c.usage.includes(c.import.match(/\{(\w+)\}/)[1]), `${file}: usage does not mention the component`);
  }
});

test('registry files: usage imports only names the package exports', () => {
  const exported = new Set();
  for (const dir of [SRC, join(repoRoot, 'packages', 'react', 'src', 'hooks')]) {
    for (const unit of readdirSync(dir)) {
      const idx = join(dir, unit, 'index.ts');
      if (!existsSync(idx)) continue;
      const {values, types} = exportedNames(readFileSync(idx, 'utf8'));
      for (const n of [...values, ...types]) exported.add(n);
    }
  }
  for (const file of components()) {
    for (const m of load(file).usage.matchAll(/^import (.*) from '@monoline\/react';$/gm)) {
      for (const raw of m[1].replace(/[{}]/g, '').split(',').map((s) => s.trim()).filter(Boolean)) {
        const name = raw.replace(/^type /, '').split(' as ')[0];
        assert.ok(exported.has(name), `${file}: usage imports ${name}, which the package does not export`);
      }
    }
  }
});

test('registry files: no dotfiles in the file list or the source', () => {
  for (const file of components()) {
    const c = load(file);
    const paths = [...c.files, ...c.source.map((s) => s.path)];
    for (const p of paths) assert.ok(!p.split('/').some((seg) => seg.startsWith('.')), `${file}: dotfile in ${p}`);
  }
});

test('registry files: classes, data attributes and related names are well-formed', () => {
  const known = new Set(load('index.json').components.map((e) => e.name));
  for (const file of components()) {
    const c = load(file);
    assert.ok(Array.isArray(c.classes), `${file}: classes`);
    assert.ok(Array.isArray(c.dataAttributes), `${file}: dataAttributes`);
    for (const d of c.dataAttributes) assert.match(d.name, /^data-[\w-]+$/, `${file}: ${d.name}`);
    for (const r of c.related) {
      assert.ok(known.has(r), `${file}: related ${r} is not in the registry`);
      assert.notEqual(r, c.name, `${file}: related includes itself`);
    }
  }
  const button = load('button.json');
  assert.ok(button.classes.includes('btn') && button.classes.includes('btn-solid'));
});

test('cssFacts: selectors give classes and data attributes; declarations, comments and @import do not', () => {
  const css = `@import url("x.css");\n/* .ghost is commented out */\n.btn { color: var(--foreground); }\n.btn-solid:hover, .btn[data-state="open"] { background: var(--accent); }\n.menu-item[data-disabled] {}\n@media (min-width: 40em) { .btn-sm { padding: 0; } }\na[href$=".pdf"] {}`;
  const f = cssFacts([css]);
  assert.deepEqual(f.classes, ['btn', 'btn-solid', 'menu-item', 'btn-sm']);
  assert.deepEqual(f.dataAttributes, [
    {name: 'data-state', values: ['open']},
    {name: 'data-disabled', values: []},
  ]);
});

test('pruneImports keeps only exported names and drops a line with none left', () => {
  const publicNames = new Set(['Button', 'useToggle']);
  assert.equal(pruneImports("import {Button, type Demo} from '@monoline/react';\n\n<Button />", publicNames), "import {Button} from '@monoline/react';\n\n<Button />");
  assert.equal(pruneImports("import {Demo} from '@monoline/react';\nx", publicNames), 'x');
  assert.equal(pruneImports("import React from 'react';", publicNames), "import React from 'react';");
});

test('relatedFor prefers explicit names, then up to three category siblings', () => {
  const known = new Set(['a', 'b', 'c', 'd', 'e']);
  assert.deepEqual(relatedFor({meta: {name: 'a', uses: ['b'], related: ['c', 'a', 'nope']}, known, siblings: ['a', 'b', 'c', 'd', 'e']}), ['c', 'b']);
  assert.deepEqual(relatedFor({meta: {name: 'a'}, known, siblings: ['a', 'b', 'c', 'd', 'e']}), ['b', 'c', 'd']);
});
