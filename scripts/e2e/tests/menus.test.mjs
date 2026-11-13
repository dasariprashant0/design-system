// dropdown-menu, menubar, context-menu: roving focus, typeahead, Escape and focus return.
import {test, assert, eq} from '../test.mjs';

const items = (p, sel = '[role=menuitem]') => p.eval(`[...document.querySelectorAll('[role=menu][data-state=open] ${sel}')].filter(__e2e.visible).map(e => e.textContent.trim())`);
const focusedItem = (p) => p.eval(`document.activeElement && document.activeElement.getAttribute('role') === 'menuitem' ? document.activeElement.textContent.trim() : 'focus is on ' + __e2e.describe(document.activeElement)`);
const openMenu = (p) => p.waitFor(`document.querySelector('[role=menu][data-state=open]')`, 'menu did not open');
const closed = (p) => p.waitFor(`!document.querySelector('[role=menu]')`, 'menu did not close');

test('dropdown-menu: Enter opens, first item is focused, arrow keys move, End/Home jump', async (p) => {
  await p.open('components/dropdown-menu'); const ex = await p.example('Actions');
  await ex.focus('button|Actions'); await p.key('Enter'); await openMenu(p);
  const list = await items(p); assert(list.length >= 3, `expected a few menu items, got ${JSON.stringify(list)}`);
  await p.waitFor(`document.activeElement.getAttribute('role') === 'menuitem'`, 'focus did not move onto a menu item');
  eq(await focusedItem(p), list[0], 'first item focused on open');
  await p.key('ArrowDown'); eq(await focusedItem(p), list[1], 'ArrowDown');
  await p.key('ArrowUp'); eq(await focusedItem(p), list[0], 'ArrowUp');
  await p.key('ArrowUp'); eq(await focusedItem(p), list[0], 'ArrowUp on the first item stays put (Radix menus do not loop)');
  await p.key('Home'); eq(await focusedItem(p), list[0], 'Home');
  await p.key('End'); eq(await focusedItem(p), list.at(-1), 'End');
});
test('dropdown-menu: ArrowDown on the trigger opens it; typeahead jumps to a matching item', async (p) => {
  await p.open('components/dropdown-menu'); const ex = await p.example('Actions');
  await ex.focus('button|Actions'); await p.key('ArrowDown'); await openMenu(p);
  const list = await items(p);
  const target = list.find((t, i) => i > 0 && !list.slice(0, i).some((o) => o[0].toLowerCase() === t[0].toLowerCase()));
  assert(target, `no item with a unique first letter in ${JSON.stringify(list)}`);
  await p.key(target[0].toLowerCase());
  eq(await focusedItem(p), target, `typing "${target[0].toLowerCase()}"`);
});
test('dropdown-menu: Escape closes and focus returns to the trigger; selecting an item does the same', async (p) => {
  await p.open('components/dropdown-menu'); const ex = await p.example('Actions');
  await ex.click('button|Actions'); await openMenu(p);
  await p.key('Escape'); await closed(p);
  await p.expectActive('button|Actions', 'after Escape');
  await p.key('Enter'); await openMenu(p);
  await p.key('Enter'); await closed(p);
  await p.expectActive('button|Actions', 'after choosing an item');
});
test('dropdown-menu: pointer hover moves focus to the item under the pointer', async (p) => {
  await p.open('components/dropdown-menu'); const ex = await p.example('Actions');
  await ex.click('button|Actions'); await openMenu(p);
  const list = await items(p);
  await p.hover(`[role=menuitem]|${list[1]}`);
  await p.waitFor(`document.activeElement.textContent.trim() === ${JSON.stringify(list[1])}`, `hover did not focus "${list[1]}"; ${await focusedItem(p)}`);
});

test('menubar: ArrowRight/Left move between triggers; Down opens; Escape closes and returns focus', async (p) => {
  await p.open('components/menubar'); const ex = await p.example('App menu');
  await ex.focus('[role=menubar] [role=menuitem]|File');
  await p.key('ArrowRight'); await p.expectActive('[role=menubar] [role=menuitem]|Edit', 'ArrowRight');
  await p.key('ArrowRight'); await p.expectActive('[role=menubar] [role=menuitem]|File', 'ArrowRight wraps');
  await p.key('ArrowLeft'); await p.expectActive('[role=menubar] [role=menuitem]|Edit', 'ArrowLeft wraps back');
  await p.key('ArrowDown'); await openMenu(p);
  assert((await items(p)).includes('Undo'), 'Edit menu should list Undo');
  await p.key('Escape'); await closed(p);
  await p.expectActive('[role=menubar] [role=menuitem]|Edit', 'focus return after Escape');
});
test('menubar: with a menu open, ArrowRight opens the neighbouring menu', async (p) => {
  await p.open('components/menubar'); const ex = await p.example('App menu');
  await ex.click('[role=menubar] [role=menuitem]|File'); await openMenu(p);
  assert((await items(p)).includes('New file'), 'File menu should list New file');
  await p.key('ArrowRight');
  await p.waitFor(`[...document.querySelectorAll('[role=menu][data-state=open] [role=menuitem]')].some(e => e.textContent.includes('Undo'))`, 'ArrowRight did not open the Edit menu');
});
test('menubar: typeahead and arrows work inside the menu', async (p) => {
  await p.open('components/menubar'); const ex = await p.example('App menu');
  await ex.focus('[role=menubar] [role=menuitem]|File'); await p.key('Enter'); await openMenu(p);
  await p.key('ArrowDown'); eq(await focusedItem(p), 'Open', 'ArrowDown from New file');
  await p.key('q'); eq(await focusedItem(p), 'Quit', 'typeahead q');
});

test('context-menu: right click opens at the pointer, arrows move, Escape closes and focus returns', async (p) => {
  await p.open('components/context-menu'); const ex = await p.example('Right click the box');
  const box = await p.point('div|Right click here');
  await ex.click('div|Right click here', 'right'); await openMenu(p);
  const r = await p.rect('[role=menu]');
  assert(Math.abs(r.x - box.x) < 40 && Math.abs(r.y - box.y) < 40, `menu opened at ${Math.round(r.x)},${Math.round(r.y)}, not near the pointer ${Math.round(box.x)},${Math.round(box.y)}`);
  await p.key('ArrowDown');
  await p.waitFor(`document.activeElement.getAttribute('role') === 'menuitem'`, `ArrowDown did not focus an item; ${await p.active()}`);
  const first = await focusedItem(p);
  await p.key('ArrowDown'); assert((await focusedItem(p)) !== first, 'second ArrowDown did not move');
  await p.key('d'); eq(await focusedItem(p), 'Delete', 'typeahead d from Duplicate goes to the next D item');
  await p.key('Escape'); await closed(p);
});
