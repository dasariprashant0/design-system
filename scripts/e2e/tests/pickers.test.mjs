// select, combobox, command palette.
import {test, assert, eq} from '../test.mjs';

const opts = (p, root = '[role=listbox]') => p.eval(`[...document.querySelectorAll('${root} [role=option]')].filter(__e2e.visible).map(e => e.textContent.replace(/✓$/, '').trim())`);

// ---- select (Radix)
const selOpen = (p) => p.waitFor(`document.querySelector('[role=listbox]') && document.querySelector('[role=combobox][aria-expanded=true]')`, 'select did not open');
const selFocused = (p) => p.eval(`document.activeElement.getAttribute('role') === 'option' ? document.activeElement.textContent.replace(/✓$/, '').trim() : 'focus is on ' + __e2e.describe(document.activeElement)`);
for (const key of ['Enter', ' ', 'ArrowDown']) {
  test(`select: ${JSON.stringify(key)} opens the list with the current value focused`, async (p) => {
    await p.open('components/select'); const ex = await p.example('In a field');
    await ex.focus('[role=combobox]'); await p.key(key); await selOpen(p);
    await p.waitFor(`document.activeElement.getAttribute('role') === 'option'`, 'focus did not move into the list');
    eq(await selFocused(p), '15 minutes', 'the selected option is focused on open');
  });
}
test('select: arrows move, Enter selects, the trigger shows the value and keeps focus', async (p) => {
  await p.open('components/select'); const ex = await p.example('In a field');
  await ex.focus('[role=combobox]'); await p.key('Enter'); await selOpen(p);
  await p.waitFor(`document.activeElement.getAttribute('role') === 'option'`, 'focus did not move into the list');
  const list = await opts(p); assert(list.length >= 3, `options: ${JSON.stringify(list)}`);
  const i = list.indexOf('15 minutes');
  await p.key('ArrowDown'); eq(await selFocused(p), list[i + 1], 'ArrowDown');
  await p.key('ArrowUp'); await p.key('ArrowUp'); eq(await selFocused(p), list[i - 1], 'ArrowUp x2');
  await p.key('End'); eq(await selFocused(p), list.at(-1), 'End');
  await p.key('Home'); eq(await selFocused(p), list[0], 'Home');
  await p.key('Enter');
  await p.waitFor(`!document.querySelector('[role=listbox]')`, 'list did not close on Enter');
  eq((await p.text('[role=combobox]')).trim(), list[0], 'trigger text after choosing');
  await p.expectActive('[role=combobox]', 'focus return after choosing');
});
test('select: typeahead moves to the matching option; Escape closes, value unchanged, focus returns', async (p) => {
  await p.open('components/select'); const ex = await p.example('In a field');
  await ex.focus('[role=combobox]'); await p.key('Enter'); await selOpen(p);
  const list = await opts(p);
  const target = list.find((t) => t[0] !== '1');
  assert(target, `no option to type for: ${JSON.stringify(list)}`);
  await p.key(target[0].toLowerCase()); eq(await selFocused(p), target, `typeahead "${target[0]}"`);
  await p.key('Escape');
  await p.waitFor(`!document.querySelector('[role=listbox]')`, 'list did not close on Escape');
  eq((await p.text('[role=combobox]')).trim(), '15 minutes', 'value after Escape');
  await p.expectActive('[role=combobox]', 'focus return after Escape');
});
test('select: click opens, click on an option selects it', async (p) => {
  await p.open('components/select'); const ex = await p.example('In a field');
  await ex.click('[role=combobox]'); await selOpen(p);
  const list = await opts(p);
  await p.click(`[role=option]|${list[0]}`);
  await p.waitFor(`!document.querySelector('[role=listbox]')`, 'list did not close after a click on an option');
  eq((await p.text('[role=combobox]')).trim(), list[0], 'trigger text');
});

// ---- combobox (autocomplete input)
const active = (p) => p.eval(`(() => { const i = document.querySelector('input[role=combobox]'); const id = i.getAttribute('aria-activedescendant'); const o = id && document.getElementById(id); return o ? o.textContent.trim() : null; })()`);
test('combobox: typing opens and filters the list, ArrowDown moves aria-activedescendant, Enter picks', async (p) => {
  await p.open('components/combobox'); const ex = await p.example('Search and pick');
  await ex.focus('input[role=combobox]');
  await p.type('a');
  await p.waitFor(`document.querySelector('input[role=combobox]').getAttribute('aria-expanded') === 'true'`, 'typing did not open the list');
  const all = await opts(p); assert(all.length >= 2, `options after typing "a": ${JSON.stringify(all)}`);
  await p.type('l'); // "al": Ada Lovelace? Alan Turing
  const narrowed = await opts(p);
  assert(narrowed.length < all.length && narrowed.every((o) => /al/i.test(o)), `filtering "al" gave ${JSON.stringify(narrowed)} from ${JSON.stringify(all)}`);
  await p.key('ArrowDown');
  const first = await active(p); assert(first, 'ArrowDown did not set aria-activedescendant to an option');
  assert(narrowed.includes(first), `active option "${first}" is not in the visible list ${JSON.stringify(narrowed)}`);
  await p.expectActive('input[role=combobox]', 'DOM focus must stay on the input');
  if (narrowed.length > 1) { await p.key('ArrowDown'); assert((await active(p)) !== first, 'second ArrowDown did not move the active option'); await p.key('ArrowUp'); eq(await active(p), first, 'ArrowUp'); }
  await p.key('Enter');
  await p.waitFor(`document.querySelector('input[role=combobox]').getAttribute('aria-expanded') === 'false'`, 'list stayed open after Enter');
  eq(await p.prop('input[role=combobox]', 'e => e.value'), first, 'input value after Enter');
});
test('combobox: Escape closes the list and keeps focus on the input', async (p) => {
  await p.open('components/combobox'); const ex = await p.example('Search and pick');
  await ex.click('input[role=combobox]'); await p.type('g');
  await p.waitFor(`document.querySelector('input[role=combobox]').getAttribute('aria-expanded') === 'true'`, 'did not open');
  await p.key('Escape');
  await p.waitFor(`document.querySelector('input[role=combobox]').getAttribute('aria-expanded') === 'false'`, 'Escape did not close the list');
  await p.expectActive('input[role=combobox]', 'after Escape');
});
test('combobox: clicking an option picks it', async (p) => {
  await p.open('components/combobox'); const ex = await p.example('Search and pick');
  await ex.click('input[role=combobox]'); await p.type('gr');
  await p.waitFor(`document.querySelector('[role=option]')`, 'no options after typing');
  const list = await opts(p);
  await p.click(`[role=option]|${list[0]}`);
  eq(await p.prop('input[role=combobox]', 'e => e.value'), list[0], 'input value after clicking an option');
});
test('combobox: no match shows a status/empty message, not an empty box', async (p) => {
  await p.open('components/combobox'); const ex = await p.example('Search and pick');
  await ex.click('input[role=combobox]'); await p.type('zzzz'); await p.sleep(200);
  const shown = await p.eval(`(() => { const l = document.querySelector('[role=listbox]'); const r = l && l.getBoundingClientRect(); return {opts: document.querySelectorAll('[role=option]').length, h: r ? Math.round(r.height) : 0, text: l ? l.innerText : ''}; })()`);
  assert(shown.opts === 0 && (shown.h === 0 || shown.text.trim().length > 0), `no-match state: ${JSON.stringify(shown)}`);
});

// ---- command palette
const paletteOpen = (p) => p.waitFor(`document.querySelector('[role=dialog][data-state=open] input[role=combobox]')`, 'palette did not open');
const cmdActive = (p) => p.eval(`(() => { const i = document.querySelector('[role=dialog] input[role=combobox]'); const o = document.getElementById(i.getAttribute('aria-activedescendant')); return o ? o.textContent.replace(/\\s+/g, ' ').trim() : null; })()`);
test('command: the button opens the palette with focus in the search field', async (p) => {
  await p.open('components/command'); const ex = await p.example('Palette');
  await ex.click('button|Open palette'); await paletteOpen(p);
  await p.waitFor(`document.activeElement === document.querySelector('[role=dialog] input[role=combobox]')`, `focus is on ${await p.active()}, not the search field`);
});
test('command: its own shortcut (Ctrl+J here) opens it from anywhere and Escape closes it; Ctrl+K belongs to the docs search', async (p) => {
  await p.open('components/command');
  await p.key('j', 'ctrl'); await paletteOpen(p);
  eq(await p.count('[role=dialog]'), 1, 'exactly one palette should open');
  await p.key('Escape'); await p.waitFor(`!document.querySelector('[role=dialog]')`, 'Escape did not close the palette');
});
test('command: typing filters, the result count is announced, ArrowDown moves the active item, Enter runs it and closes', async (p) => {
  await p.open('components/command'); const ex = await p.example('Palette');
  await ex.click('button|Open palette'); await paletteOpen(p);
  const total = await opts(p, '[role=dialog] [role=listbox]');
  eq(await cmdActive(p), total[0].replace(/\s+/g, ' ').trim(), 'first item is active on open');
  await p.key('ArrowDown'); assert((await cmdActive(p)) !== total[0], 'ArrowDown did not move the active item');
  await p.key('ArrowUp'); eq(await cmdActive(p), total[0], 'ArrowUp returns');
  await p.type('save');
  await p.waitFor(`document.querySelectorAll('[role=dialog] [role=option]').length === 1`, `"save" should leave one result, got ${JSON.stringify(await opts(p, '[role=dialog] [role=listbox]'))}`);
  assert(/^1 result/.test(await p.text('[role=dialog] [role=status]')), 'result count is not announced in the status region');
  assert((await cmdActive(p))?.startsWith('Save'), `active item should be Save, is ${await cmdActive(p)}`);
  await p.key('Enter');
  await p.waitFor(`!document.querySelector('[role=dialog]')`, 'Enter did not run the command and close the palette');
  await p.expectActive('button|Open palette', 'focus return after running a command');
});
test('command: Escape closes and returns focus to the trigger; no match shows an empty message', async (p) => {
  await p.open('components/command'); const ex = await p.example('Palette');
  await ex.click('button|Open palette'); await paletteOpen(p);
  await p.type('zzzz');
  await p.waitFor(`document.querySelectorAll('[role=dialog] [role=option]').length === 0`, 'results did not empty');
  assert((await p.text('[role=dialog] [role=status]')).trim().length > 0, 'empty state has no message');
  await p.key('Escape'); await p.waitFor(`!document.querySelector('[role=dialog]')`, 'did not close');
  await p.expectActive('button|Open palette', 'focus return');
});
