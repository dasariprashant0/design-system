import test from 'node:test';
import assert from 'node:assert/strict';
import {extractDemos, exportedNames, dedent} from './lib/demos.mjs';
import {extractSelectors} from './lib/styling.mjs';
import {keyboardRows} from './lib/a11y.mjs';
import {componentMarkdown} from './lib/markdown.mjs';

const demoFile = `
import type {Demo} from '../../demo';
import {useState} from 'react';
import {Button} from '../../components/button';
import {useClipboard} from './use-clipboard';

const LABELS = ['a', 'b'];

function Helper() {
  const {copy} = useClipboard();
  return <Button onClick={() => copy(LABELS[0])}>Copy</Button>;
}

function Unused() { return null; }

export const demos: Demo[] = [
  {
    title: 'Expression',
    description: 'One ' + 'line.',
    render: () => (
      <div className="x">
        <Button variant="solid">Go</Button>
      </div>
    ),
  },
  {title: 'With helper', render: () => <Helper />},
  {
    title: 'Block',
    render: () => {
      const [n] = useState(0);
      return <Button>{n}</Button>;
    },
  },
];
`;

test('extracts one snippet per demo with title and description', () => {
  const d = extractDemos(demoFile);
  assert.deepEqual(d.map((x) => x.title), ['Expression', 'With helper', 'Block']);
  assert.equal(d[0].description, 'One line.');
  assert.equal(d[1].description, undefined);
});

test('expression demo: de-indented JSX with only the imports it uses', () => {
  const [d] = extractDemos(demoFile);
  assert.equal(d.code, `import {Button} from '@monoline/react';\n\n<div className="x">\n  <Button variant="solid">Go</Button>\n</div>`);
});

test('helper demo includes the helpers it references, transitively, and not the unused ones', () => {
  const d = extractDemos(demoFile)[1];
  assert.match(d.code, /^import \{Button, useClipboard\} from '@monoline\/react';/);
  assert.match(d.code, /const LABELS = \['a', 'b'\];/);
  assert.match(d.code, /function Helper\(\) \{/);
  assert.doesNotMatch(d.code, /Unused/);
  assert.ok(d.code.trimEnd().endsWith('<Helper />'));
  assert.ok(d.code.indexOf('const LABELS') < d.code.indexOf('function Helper'));
});

test('block body keeps its statements and imports from react stay', () => {
  const d = extractDemos(demoFile)[2];
  assert.match(d.code, /^import \{useState\} from 'react';\nimport \{Button\} from '@monoline\/react';/);
  assert.match(d.code, /const \[n\] = useState\(0\);\nreturn <Button>\{n\}<\/Button>;$/);
});

test('a file without a demos array yields nothing', () => assert.deepEqual(extractDemos('export const x = 1;'), []));

test('exportedNames splits values and types', () => {
  const r = exportedNames(`export {Dialog, DialogTitle} from './dialog';\nexport type {DialogContentProps} from './dialog';`);
  assert.deepEqual(r, {values: ['Dialog', 'DialogTitle'], types: ['DialogContentProps']});
});

test('dedent removes the common indent of following lines', () => assert.equal(dedent('a\n    b\n      c\n    d'), 'a\nb\n  c\nd'));

test('extractSelectors finds classes and data/aria attributes, ignoring comments, strings and @-rule preludes', () => {
  const css = `/* .ghost [data-fake] */
.btn { color: red; }
.btn-solid:hover, .btn[data-state="open"] > .btn-icon { background: url(a.b.png); }
@media (max-width: 600px) { .btn[aria-current] { x: 1; } }
.a::after { content: ".not-a-class"; }
.x:not([aria-disabled="true"]) { y: 2 }
input[type="text"] { z: 3 }`;
  const r = extractSelectors(css);
  assert.deepEqual(r.classes, ['a', 'btn', 'btn-icon', 'btn-solid', 'x']);
  assert.deepEqual(r.attributes, ['[aria-current]', '[aria-disabled="true"]', '[data-state="open"]']);
});

test('keyboardRows parses lines that start with keys', () => {
  const rows = keyboardRows([
    'Native <button>: Enter and Space activate, Tab focuses.',
    'Arrow keys move between tabs; Home and End jump to the first and last.',
    'Escape closes and returns focus to the trigger.',
    'Renders a status region.',
    'Escape and the Close button close it.',
    'Tab order follows the DOM.',
    'Move through options, ArrowDown/ArrowUp, Enter picks, Escape closes.',
  ]);
  assert.deepEqual(rows.map((r) => r.keys), ['Enter / Space', 'Tab', 'Arrow keys', 'Home / End', 'Escape', 'Enter', 'Escape']);
  assert.match(rows[2].action, /^Move between tabs/);
});

test('componentMarkdown has the sections in order and marks required props', () => {
  const md = componentMarkdown({
    meta: {name: 'x', title: 'X', category: 'buttons', description: 'D.', status: 'stable', css: ['x.css'], a11y: ['Enter activates.']},
    extra: {importName: 'X', parts: ['X'], demos: [{title: 'One', code: '<X />'}]},
    props: [{name: 'XProps', props: [{name: 'a', type: 'string', optional: false, default: null, description: 'A | B'}]}],
    styling: [{file: 'x.css', classes: ['x'], attributes: ['[data-state="open"]']}],
    hook: false,
  });
  const order = ['# X', '## Installation', '## Usage', '## Examples', '### One', '## API Reference', '## Accessibility', '### Keyboard', '## Styling', '## Details'].map((h) => md.indexOf(h));
  assert.ok(order.every((n, i) => n >= 0 && (i === 0 || n > order[i - 1])), order.join());
  assert.match(md, /`a` \(required\)/);
  assert.match(md, /A \\\| B/);
  assert.doesNotMatch(md, /## Anatomy/);
});
