// dir=rtl (the docs Direction preference, which also sets the DirectionProvider): ArrowLeft/ArrowRight swap meaning.
import {test, assert, eq} from '../test.mjs';

const RTL = {dir: 'rtl'};

test('rtl: tabs run right to left; ArrowLeft goes to the next tab, ArrowRight to the previous', async (p) => {
  await p.open('components/tabs', RTL); const ex = await p.example('Horizontal');
  const a = await p.rect('[data-e2e] [role=tab]|Overview'), b = await p.rect('[data-e2e] [role=tab]|Activity');
  assert(a.x > b.x, `the first tab should be on the right in rtl: Overview x=${Math.round(a.x)}, Activity x=${Math.round(b.x)}`);
  await ex.focus('[role=tab]|Overview');
  await p.key('ArrowLeft'); await p.expectActive('[role=tab]|Activity', 'ArrowLeft in rtl');
  await p.key('ArrowRight'); await p.expectActive('[role=tab]|Overview', 'ArrowRight in rtl');
  await p.key('ArrowRight'); await p.expectActive('[role=tab]|Settings', 'ArrowRight from the first tab wraps to the last');
});
test('rtl: slider thumb moves left as the value grows; ArrowLeft raises and ArrowRight lowers the value', async (p) => {
  await p.open('components/slider', RTL); const ex = await p.example('Single and range');
  const T = '[role=slider][aria-label="Volume"]'; const v = async () => Number(await p.attr(T, 'aria-valuenow'));
  await ex.focus(T);
  await p.key('ArrowLeft'); eq(await v(), 61, 'ArrowLeft raises the value in rtl');
  await p.key('ArrowRight'); await p.key('ArrowRight'); eq(await v(), 59, 'ArrowRight lowers the value in rtl');
  await p.key('Home'); const lo = await p.rect(T); await p.key('End'); const hi = await p.rect(T);
  assert(hi.x < lo.x - 100, `the maximum should be on the left in rtl: min x=${Math.round(lo.x)}, max x=${Math.round(hi.x)}`);
});
test('rtl: calendar columns run right to left; ArrowRight is the previous day, ArrowLeft the next', async (p) => {
  await p.open('components/calendar', RTL); const ex = await p.example('Pick a date');
  const th = await p.eval(`[...document.querySelectorAll('[data-e2e] th')].map(e => e.getBoundingClientRect().x)`);
  assert(th[0] > th.at(-1), `the first weekday should be on the right in rtl: ${JSON.stringify(th.map(Math.round))}`);
  await ex.focus('[role=grid] button[tabindex="0"]');
  const day = () => p.eval(`Number(document.activeElement.textContent)`);
  const start = await day();
  await p.key('ArrowLeft'); const next = await day(); assert(next === start + 1 || next === 1, `ArrowLeft should move to the next day: ${start} -> ${next}`);
  await p.key('ArrowRight'); eq(await day(), start, 'ArrowRight returns to the previous day');
});
test('rtl: toggle-group and radio-group: ArrowLeft moves to the next item', async (p) => {
  await p.open('components/toggle-group', RTL); const ex = await p.example('Single');
  await ex.focus('[role=radio]|7 days'); await p.key('ArrowLeft'); await p.expectActive('[role=radio]|30 days', 'toggle-group ArrowLeft in rtl');
  await p.open('components/radio-group', RTL); const h = await p.example('Horizontal');
  await h.focus('[role=radio]|=S'); await p.key('ArrowLeft'); await h.expectActive('[role=radio]|=M', 'horizontal radio-group ArrowLeft in rtl');
});
test('rtl: menubar ArrowLeft moves to the next menu; tree ArrowLeft expands and ArrowRight collapses', async (p) => {
  await p.open('components/menubar', RTL); const m = await p.example('App menu');
  await m.focus('[role=menubar] [role=menuitem]|File'); await p.key('ArrowLeft'); await p.expectActive('[role=menubar] [role=menuitem]|Edit', 'menubar ArrowLeft in rtl');
  await p.open('components/tree', RTL); const t = await p.example('File tree');
  await t.focus('[role=treeitem][data-tree-id=docs]');
  await p.key('ArrowLeft'); eq(await t.attr('[role=treeitem][data-tree-id=docs]', 'aria-expanded'), 'true', 'ArrowLeft expands a collapsed branch in rtl');
  await p.key('ArrowRight'); eq(await t.attr('[role=treeitem][data-tree-id=docs]', 'aria-expanded'), 'false', 'ArrowRight collapses it in rtl');
});
test('rtl: carousel starts at the right edge and Next scrolls toward the left', async (p) => {
  await p.open('components/carousel', RTL); const ex = await p.example('Cards');
  const L = () => p.eval(`document.querySelector('[data-e2e] [aria-label="Featured slides"]').scrollLeft`);
  const first = await p.rect('[data-e2e] [aria-roledescription=slide]');
  const track = await p.rect('[data-e2e] [aria-label="Featured slides"]');
  assert(first.right > track.x + track.w / 2, 'the first slide should start at the right edge in rtl');
  await ex.click('button|Next slide'); await p.waitFor(`document.querySelector('[data-e2e] [aria-label="Featured slides"]').scrollLeft < -50`, `Next did not scroll leftwards in rtl (scrollLeft ${await L()})`, 3000);
});
