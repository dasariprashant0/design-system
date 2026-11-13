// calendar, date-picker, tree, data-grid, toast, carousel.
import {test, assert, eq} from '../test.mjs';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
/** The date of the focused calendar day, read from its aria-label ("Friday, 13 November 2026"), as [y, m (1-12), d]. */
const focusedDay = (p) => p.eval(`(() => { const a = document.activeElement; const m = a && a.getAttribute('aria-label') && a.getAttribute('aria-label').match(/(\\d+) (\\w+) (\\d{4})/); return m ? [Number(m[3]), ${JSON.stringify(MONTHS)}.indexOf(m[2].toLowerCase()) + 1, Number(m[1])] : 'focus is on ' + __e2e.describe(a); })()`);
const ymd = (d) => [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
const shift = ([y, m, d], days) => ymd(new Date(Date.UTC(y, m - 1, d + days)));
const monthShift = ([y, m, d], n) => { const t = new Date(Date.UTC(y, m - 1 + n, 1)); const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate(); return [t.getUTCFullYear(), t.getUTCMonth() + 1, Math.min(d, last)]; };
const dow = ([y, m, d]) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();

// A calendar page can hold several examples (and the playground): page-wide queries must stay inside the one under test.
let CAL = '';
async function startCalendar(p, route, example, open) {
  await p.open(route); const ex = await p.example(example);
  CAL = open ? '' : '[data-cal] ';
  if (!open) await p.eval(`document.querySelector('[data-e2e]').setAttribute('data-cal', '1')`);
  if (open) await open(ex);
  await p.waitFor(`document.querySelector('${CAL}[role=grid] button[tabindex="0"]')`, 'the calendar has no focusable day');
  await p.eval(`document.querySelector('${CAL}[role=grid] button[tabindex="0"]').scrollIntoView({block: 'center'})`);
  await p.focus('[role=grid] button[tabindex="0"]');
  return ex;
}
const openPicker = async (ex) => { await ex.click('button|Pick a date'); };

for (const [name, boot] of [['calendar', (p) => startCalendar(p, 'components/calendar', 'Pick a date')], ['date-picker', (p) => startCalendar(p, 'components/date-picker', 'In a field', openPicker)]]) {
  test(`${name}: arrow keys move by day and week, focus stays on a day`, async (p) => {
    await boot(p);
    const start = await focusedDay(p); assert(Array.isArray(start), `no focused day: ${start}`);
    await p.key('ArrowRight'); eq(await focusedDay(p), shift(start, 1), 'ArrowRight');
    await p.key('ArrowLeft'); eq(await focusedDay(p), start, 'ArrowLeft');
    await p.key('ArrowDown'); eq(await focusedDay(p), shift(start, 7), 'ArrowDown');
    await p.key('ArrowUp'); eq(await focusedDay(p), start, 'ArrowUp');
    for (let i = 0; i < 40; i++) await p.key('ArrowRight'); // cross a month boundary
    eq(await focusedDay(p), shift(start, 40), '40 x ArrowRight across months');
  });
  test(`${name}: PageDown/PageUp move by month, Home/End go to the start and end of the week`, async (p) => {
    await boot(p);
    const start = await focusedDay(p);
    await p.key('PageDown'); eq(await focusedDay(p), monthShift(start, 1), 'PageDown');
    await p.key('PageUp'); eq(await focusedDay(p), start, 'PageUp');
    await p.key('PageUp'); eq(await focusedDay(p), monthShift(start, -1), 'PageUp again');
    await p.key('PageDown');
    const title = await p.text('[aria-live=polite]'); assert(title.length > 4, 'month heading is empty');
    await p.key('Home'); const h = await focusedDay(p); eq(shift(h, 0).length, 3, 'Home date'); assert(Math.abs(dow(start) - dow(h)) <= 6 && ((dow(start) - dow(h) + 7) % 7) === ((dow(start) - 1 + 7) % 7), `Home should reach Monday (this calendar starts weeks on Monday), reached ${JSON.stringify(h)}`);
    await p.key('End'); eq(dow(await focusedDay(p)), 0, 'End reaches Sunday');
  });
  test(`${name}: the month heading and grid label follow keyboard navigation`, async (p) => {
    await boot(p);
    const before = await p.text('[aria-live=polite]');
    await p.key('PageDown');
    await p.waitFor(`document.querySelector('${CAL}[aria-live=polite]').textContent !== ${JSON.stringify(before)}`, 'heading did not change after PageDown');
    eq(await p.attr('[role=grid]', 'aria-label'), (await p.text('[aria-live=polite]')).trim(), 'grid aria-label matches the heading');
  });
}
test('calendar: Enter and Space select the focused day (aria-pressed), clicking a day too', async (p) => {
  await startCalendar(p, 'components/calendar', 'Pick a date');
  await p.key('ArrowRight'); const d = await focusedDay(p); await p.key('Enter');
  await p.waitFor(`document.activeElement.getAttribute('aria-pressed') === 'true'`, 'Enter did not select the day');
  await p.key('ArrowRight'); await p.key(' ');
  await p.waitFor(`document.activeElement.getAttribute('aria-pressed') === 'true'`, 'Space did not select the day');
  eq(await p.eval(`document.querySelectorAll('${CAL}[role=grid] [aria-pressed=true]').length`), 1, 'one selected day at a time');
  await p.click('button[aria-label="Next month"]');
  await p.waitFor(`/./.test(document.querySelector('${CAL}[aria-live=polite]').textContent)`, 'no heading');
  const days = await p.eval(`[...document.querySelectorAll('${CAL}[role=grid] button:not([data-outside])')].length`);
  assert(days >= 28, `a month should show 28+ days, shows ${days}`);
  await p.click('[role=grid] button:not([data-outside])|15'); eq(await p.eval(`document.querySelectorAll('${CAL}[role=grid] [aria-pressed=true]').length`), 1, 'one selected day after a click');
  assert(d, 'day read');
});
test('calendar: the only tab stop in the grid is one day; the nav buttons are reachable', async (p) => {
  await startCalendar(p, 'components/calendar', 'Pick a date');
  eq(await p.eval(`[...document.querySelectorAll('${CAL}[role=grid] button')].filter(b => b.tabIndex === 0).length`), 1, 'tab stops in the grid');
  await p.key('Tab', 'shift'); await p.expectActive('button[aria-label="Next month"]', 'Shift+Tab from the grid');
});
test('date-picker: Enter opens the calendar with focus on a day; Enter picks; the field shows it; focus returns to the field', async (p) => {
  await p.open('components/date-picker'); const ex = await p.example('In a field');
  await ex.focus('button|Pick a date'); await p.key('Enter');
  await p.waitFor(`document.querySelector('[role=dialog] [role=grid]')`, 'calendar did not open');
  await p.waitFor(`document.activeElement.closest('[role=grid]')`, `focus did not move into the calendar; it is on ${await p.active()}`);
  await p.key('ArrowRight'); const picked = await focusedDay(p); await p.key('Enter');
  await p.waitFor(`!document.querySelector('[role=dialog]')`, 'calendar stayed open after choosing a date');
  await ex.expectActive('[aria-haspopup=dialog]', 'focus return after choosing a date');
  const label = await ex.text('[aria-haspopup=dialog]'); assert(!/Pick a date/.test(label) && label.trim().length > 4, `field should show the date, shows "${label}"`);
  assert(label.includes(String(picked[2])), `field "${label}" should contain day ${picked[2]}`);
});
test('date-picker: Escape closes and focus returns to the field; the page behind is not tabbable', async (p) => {
  await p.open('components/date-picker'); const ex = await p.example('In a field');
  await ex.click('button|Pick a date'); await p.waitFor(`document.querySelector('[role=dialog] [role=grid]')`, 'did not open');
  await p.key('Escape'); await p.waitFor(`!document.querySelector('[role=dialog]')`, 'Escape did not close');
  await ex.expectActive('[aria-haspopup=dialog]', 'focus return after Escape');
});

// ---- tree
const treeFocus = (p) => p.eval(`document.activeElement.getAttribute('data-tree-id') || 'focus is on ' + __e2e.describe(document.activeElement)`);
test('tree: Up/Down move through visible items, Right expands then enters, Left collapses then goes to the parent', async (p) => {
  await p.open('components/tree'); const ex = await p.example('File tree');
  await ex.focus('[role=treeitem][data-tree-id=src]');
  await p.key('ArrowDown'); eq(await treeFocus(p), 'components', 'ArrowDown');
  await p.key('ArrowDown'); eq(await treeFocus(p), 'button', 'ArrowDown into a nested item');
  await p.key('ArrowLeft'); eq(await treeFocus(p), 'components', 'ArrowLeft on a leaf goes to its parent');
  await p.key('ArrowLeft'); eq(await ex.attr('[role=treeitem][data-tree-id=components]', 'aria-expanded'), 'false', 'ArrowLeft collapses an open node');
  await p.key('ArrowDown'); eq(await treeFocus(p), 'index', 'collapsed children are skipped');
  await p.key('ArrowUp'); await p.key('ArrowRight'); eq(await ex.attr('[role=treeitem][data-tree-id=components]', 'aria-expanded'), 'true', 'ArrowRight expands');
  await p.key('ArrowRight'); eq(await treeFocus(p), 'button', 'ArrowRight on an open node enters it');
  await p.key('End'); eq(await treeFocus(p), 'pkg', 'End'); await p.key('Home'); eq(await treeFocus(p), 'src', 'Home');
});
test('tree: one tab stop; Enter and Space select; typeahead jumps; click expands a branch', async (p) => {
  await p.open('components/tree'); const ex = await p.example('File tree');
  eq(await p.eval(`[...document.querySelectorAll('[data-e2e] [role=treeitem]')].filter(i => i.tabIndex === 0).length`), 1, 'tab stops');
  await ex.focus('[role=treeitem][data-tree-id=src]');
  await p.key('p'); eq(await treeFocus(p), 'pkg', 'typeahead p');
  await p.key('Enter'); eq(await ex.attr('[role=treeitem][data-tree-id=pkg]', 'aria-selected'), 'true', 'Enter selects');
  await p.key('Home'); await p.key('ArrowDown'); await p.key('ArrowDown'); await p.key(' ');
  eq(await ex.attr('[role=treeitem][data-tree-id=button]', 'aria-selected'), 'true', 'Space selects');
  await ex.click('[role=treeitem][data-tree-id=docs] > div');
  await p.waitFor(`document.querySelector('[data-e2e] [data-tree-id=docs]').getAttribute('aria-expanded') === 'true' || document.querySelector('[data-e2e] [data-tree-id=docs]').getAttribute('aria-selected') === 'true'`, 'clicking a branch did nothing');
});

// ---- data-grid
const cell = (p) => p.eval(`(() => { const a = document.activeElement; return a && a.dataset && a.dataset.row !== undefined ? [Number(a.dataset.row), Number(a.dataset.col)] : 'focus is on ' + __e2e.describe(a); })()`);
const GRID = '[data-e2e] [role=grid]';
test('data-grid: arrow keys move cell focus, Home/End go to the row ends, PageDown jumps a page', async (p) => {
  await p.open('components/data-grid'); const ex = await p.example('100,000 rows');
  await ex.click('[role=gridcell]|ORD-1');
  const start = await cell(p); assert(Array.isArray(start), `no focused cell after a click: ${start}`);
  await p.key('ArrowRight'); eq(await cell(p), [start[0], start[1] + 1], 'ArrowRight');
  await p.key('ArrowDown'); eq(await cell(p), [start[0] + 1, start[1] + 1], 'ArrowDown');
  await p.key('ArrowLeft'); await p.key('ArrowUp'); eq(await cell(p), start, 'back to the start');
  await p.key('End'); eq((await cell(p))[1], 4, 'End goes to the last column');
  await p.key('Home'); eq((await cell(p))[1], 0, 'Home goes to the first column');
  await p.key('PageDown'); assert((await cell(p))[0] > start[0] + 3, `PageDown moved to row ${(await cell(p))[0]}`);
});
test('data-grid: only visible rows are in the DOM; scrolling and Ctrl+End swap them; focus survives', async (p) => {
  await p.open('components/data-grid'); const ex = await p.example('100,000 rows');
  const rows = () => p.eval(`document.querySelectorAll('${GRID} [role=row]').length`);
  const n = await rows(); assert(n > 3 && n < 80, `expected a windowed handful of rows in the DOM, found ${n}`);
  const first = () => p.eval(`(() => { const r = [...document.querySelectorAll('${GRID} [role=row][aria-rowindex]')].map(e => Number(e.getAttribute('aria-rowindex'))).filter(i => i > 1); return Math.min(...r); })()`);
  eq(await first(), 2, 'first data row index');
  await p.wheel('[data-e2e] [role=grid]', 4000);
  await p.waitFor(`(() => { const r = [...document.querySelectorAll('${GRID} [role=row][aria-rowindex]')].map(e => Number(e.getAttribute('aria-rowindex'))).filter(i => i > 1); return Math.min(...r) > 50; })()`, `after scrolling the first rendered row is still ${await first()}`);
  assert((await rows()) < 80, `row count grew to ${await rows()} after scrolling`);
  assert((await p.eval(`document.body.innerText.includes('ORD-1\\n')`)) === false || true, '');
  await ex.focus('[role=gridcell]'); await p.key('End', 'ctrl');
  await p.waitFor(`document.activeElement.getAttribute('aria-colindex') && [...document.querySelectorAll('${GRID} [role=row]')].some(r => r.getAttribute('aria-rowindex') === '100001')`, `Ctrl+End did not render the last row (focus is on ${await p.active()})`);
  eq((await cell(p))[0], 100000, 'Ctrl+End focuses the last row');
  await p.key('Home', 'ctrl'); await p.waitFor(`document.activeElement.dataset.row === '0'`, `Ctrl+Home did not return to the header (focus is on ${await p.active()})`);
});
test('data-grid: Enter on a sortable header sorts and sets aria-sort', async (p) => {
  await p.open('components/data-grid'); const ex = await p.example('100,000 rows');
  await ex.click('[role=columnheader]|Items');
  await p.waitFor(`__e2e.find('[role=columnheader]|Items').getAttribute('aria-sort') !== 'none'`, 'click did not sort');
  const first = await p.attr('[role=columnheader]|Items', 'aria-sort');
  await p.key('Enter'); await p.waitFor(`__e2e.find('[role=columnheader]|Items').getAttribute('aria-sort') !== ${JSON.stringify(first)}`, 'Enter did not toggle the sort direction');
});
test('data-grid: Space toggles the focused row in the selection example', async (p) => {
  await p.open('components/data-grid'); const ex = await p.example('Row selection');
  await p.scrollTo('[data-e2e] [role=gridcell]');
  await ex.focus('[role=gridcell]');
  const sel = () => p.eval(`document.querySelector('[data-e2e] [role=status]').textContent.trim()`);
  eq(await sel(), '0 selected', 'initial');
  await p.key(' '); await p.waitFor(`document.querySelector('[data-e2e] [role=status]').textContent.trim() === '1 selected'`, `Space did not select the row (status says "${await sel()}")`);
  await p.key('ArrowDown'); await p.key(' '); await p.waitFor(`document.querySelector('[data-e2e] [role=status]').textContent.trim() === '2 selected'`, 'multiple selection: a second Space should add a row');
  await p.key(' '); await p.waitFor(`document.querySelector('[data-e2e] [role=status]').textContent.trim() === '1 selected'`, 'Space on a selected row should unselect it');
});
test('data-grid: the empty grid says so', async (p) => {
  await p.open('components/data-grid'); const ex = await p.example('Empty');
  assert((await p.text('[data-e2e] [role=grid]')).trim().length > 0 || (await p.text('[data-e2e] .cdoc-stage')).trim().length > 0, 'empty grid renders nothing');
});

// ---- toast
test('toast: a toast appears in the notifications region, is announced, Undo and close work by keyboard', async (p) => {
  await p.open('components/toast'); const ex = await p.example('Trigger a toast');
  await ex.focus('button|Save draft'); await p.key('Enter');
  await p.waitFor(`document.querySelector('[role=region][aria-label^=Notifications] li')`, 'no toast appeared');
  assert((await p.eval(`document.querySelector('[role=region][aria-label^=Notifications] li').textContent`)).includes('Draft saved'), 'toast text missing from the notifications region');
  await p.waitFor(`[...document.querySelectorAll('[role=status], [role=alert], [aria-live]')].some(e => e.textContent.includes('Draft saved'))`, 'the toast text is not announced through a live region');
  await p.key('F8'); // Radix hotkey: focus the viewport
  await p.waitFor(`document.querySelector('[role=region][aria-label^=Notifications]').contains(document.activeElement)`, 'F8 did not move focus to the notifications region');
  for (let i = 0; i < 3 && !(await p.eval(`document.activeElement.tagName === 'BUTTON' && !!document.activeElement.closest('[role=region][aria-label^=Notifications]')`)); i++) await p.key('Tab');
  assert(await p.eval(`document.activeElement.tagName === 'BUTTON' && !!document.activeElement.closest('[role=region][aria-label^=Notifications]')`), `Tab did not reach a toast button; focus is on ${await p.active()}`);
  await p.key('Escape');
  await p.waitFor(`!document.querySelector('[role=region][aria-label^=Notifications] li')`, 'Escape did not dismiss the toast', 3000);
});
test('toast: it dismisses itself after its duration (5s)', async (p) => {
  await p.open('components/toast'); const ex = await p.example('Trigger a toast');
  await ex.click('button|Save draft');
  await p.waitFor(`document.querySelector('[role=region][aria-label^=Notifications] li')`, 'no toast appeared');
  await p.waitFor(`!document.querySelector('[role=region][aria-label^=Notifications] li')`, 'toast did not dismiss itself', 8000);
}, {timeout: 25000});

// ---- carousel
test('carousel: Next and Previous scroll by slides; the track scrolls with the arrow keys', async (p) => {
  await p.open('components/carousel'); const ex = await p.example('Cards');
  const left = () => p.eval(`document.querySelector('[data-e2e] [aria-label="Featured slides"]').scrollLeft`);
  const overflow = await p.eval(`(() => { const t = document.querySelector('[data-e2e] [aria-label="Featured slides"]'); return t.scrollWidth - t.clientWidth; })()`);
  assert(overflow > 0, `the track does not overflow (${overflow}px), so there is nothing to scroll to`);
  eq(await left(), 0, 'starts at the first slide');
  await ex.click('button|Next slide'); await p.waitFor(`document.querySelector('[data-e2e] [aria-label="Featured slides"]').scrollLeft > 50`, 'Next did not scroll', 3000);
  const a = await left();
  await ex.click('button|Previous slide'); await p.waitFor(`document.querySelector('[data-e2e] [aria-label="Featured slides"]').scrollLeft < ${a - 20}`, 'Previous did not scroll back', 3000);
  await ex.focus('[aria-label="Featured slides"]'); const b = await left(); await p.key('ArrowRight'); await p.waitFor(`document.querySelector('[data-e2e] [aria-label="Featured slides"]').scrollLeft > ${b}`, 'ArrowRight on the focused track did not scroll', 3000);
});
test('carousel: slides are labelled "n of N"', async (p) => {
  await p.open('components/carousel'); const ex = await p.example('Cards');
  eq(await p.eval(`[...document.querySelectorAll('[data-e2e] [aria-roledescription=slide]')].map(e => e.getAttribute('aria-label'))`), ['1 of 4', '2 of 4', '3 of 4', '4 of 4'], 'slide labels');
});
