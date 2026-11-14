// App shell, sidebar, navbar: landmarks, skip link, collapsed state, mobile drawer, keyboard, RTL and overflow in a real layout engine.
import {test, assert, eq} from '../test.mjs';

const ROUTE = 'components/app-shell';
const SHELL = '[data-e2e="e2e-app-shell"] .app-shell';
const MOBILE = {width: 375, height: 812, mobile: true};
const q = (sel, expr) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); return e ? (${expr})(e) : null; })()`;
const inDialog = (p) => p.eval(`!!document.activeElement.closest('[role=dialog]')`);

test('shell: banner, navigation, main and a skip link that lands on main', async (p) => {
  await p.open(ROUTE); const ex = await p.example('App shell');
  eq(await p.eval(q(SHELL, (e) => ({banner: e.querySelectorAll('header').length, nav: [...e.querySelectorAll('nav')].map((n) => n.getAttribute('aria-label')), main: e.querySelectorAll('main').length}))), {banner: 1, nav: ['Main', 'Breadcrumb'], main: 1}, 'landmarks inside the shell');
  const skip = `${SHELL} > .skip-link`;
  const off = await p.eval(q(skip, (e) => e.getBoundingClientRect().bottom));
  assert(off <= 0, `the skip link should be off screen until focused, bottom is ${off}`);
  await p.eval(q(skip, (e) => e.focus()));
  const on = await p.eval(q(skip, (e) => { const r = e.getBoundingClientRect(); return {top: r.top, left: r.left}; }));
  assert(on.top >= 0 && on.left >= 0, `a focused skip link must be visible: ${JSON.stringify(on)}`);
  await p.key('Enter'); await p.settle();
  assert(await p.eval(q(SHELL + ' main', (m) => document.activeElement === m)), `Enter on the skip link should focus main, focus is ${await p.active()}`);
  await ex.need('h1|Reports');
});

test('shell: the sidebar collapses to icons, keeps names, shows a tooltip, and expands again', async (p) => {
  await p.open(ROUTE); const ex = await p.example('App shell');
  const width = () => p.eval(q(SHELL + ' .sidebar', (e) => e.getBoundingClientRect().width));
  const open = await width();
  await ex.click('button|Toggle sidebar'); await p.sleep(100);
  const closed = await width();
  assert(closed < open / 2, `collapsed sidebar should be much narrower: ${open} -> ${closed}`);
  await ex.expectAttr('button|Toggle sidebar', 'aria-expanded', 'false', 'toggle state');
  const label = await p.eval(q(SHELL + ' .sidebar .sidebar-label', (e) => e.getBoundingClientRect().width));
  assert(label <= 1, `labels should be visually hidden when collapsed, width ${label}`);
  assert((await ex.attr('.sidebar a|Reports', 'href')) === '#reports', 'the link is still in the accessibility tree by name');
  await ex.focus('.sidebar a|Reports'); await p.key('ArrowUp'); await p.key('ArrowDown');
  await p.waitFor(`document.querySelector('[role=tooltip]')`, 'tooltip did not show on keyboard focus');
  eq(await p.eval(`document.querySelector('[role=tooltip]').textContent`), 'Reports', 'tooltip text');
  await ex.click('button|Toggle sidebar'); await p.sleep(100);
  eq(Math.round(await width()), Math.round(open), 'expanded again');
  await ex.expectAttr('button|Toggle sidebar', 'aria-expanded', 'true', 'toggle state');
});

test('shell: ArrowDown, ArrowUp, Home and End move between sidebar items', async (p) => {
  await p.open(ROUTE); const ex = await p.example('App shell');
  await ex.focus('.sidebar a|Overview');
  await p.key('ArrowDown'); await p.expectActive('.sidebar a|Reports', 'ArrowDown');
  await p.key('End'); await p.expectActive('.sidebar a|Team', 'End');
  await p.key('ArrowUp'); await p.expectActive('.sidebar a|Reports', 'ArrowUp');
  await p.key('Home'); await p.expectActive('.sidebar a|Overview', 'Home');
  await ex.expectAttr('.sidebar a|Overview', 'aria-current', 'page', 'current page');
});

test('shell: below 800px the sidebar is a drawer: focus moves in, stays in, Escape closes and returns', async (p) => {
  await p.open(ROUTE, MOBILE); const ex = await p.example('App shell');
  assert(!(await ex.has('.sidebar')), 'the inline sidebar should be hidden at 375px');
  await ex.click('button|Menu'); await p.waitFor(`document.querySelector('[role=dialog][data-state=open]')`, 'drawer did not open'); await p.sleep(250);
  assert(await inDialog(p), `focus should move into the drawer, it is on ${await p.active()}`);
  const r = await p.rect('[role=dialog]');
  assert(r.x >= -1 && r.right <= MOBILE.width + 1, `drawer is inside the viewport: x ${Math.round(r.x)}..${Math.round(r.right)}`);
  eq(await p.eval(`[...document.querySelectorAll('[role=dialog] nav a')].map(a => a.textContent.trim())`), ['Overview', 'Reports', 'Team'], 'drawer links');
  for (let i = 0; i < 6; i++) { await p.key('Tab'); assert(await inDialog(p), `Tab ${i + 1} left the drawer, focus is on ${await p.active()}`); }
  await p.key('Escape'); await p.waitFor(`!document.querySelector('[role=dialog]')`, 'drawer did not close');
  await p.expectActive('button|Menu', 'after Escape');
});

test('shell: choosing a link in the drawer closes it', async (p) => {
  await p.open(ROUTE, MOBILE); const ex = await p.example('App shell');
  await ex.click('button|Menu'); await p.waitFor(`document.querySelector('[role=dialog][data-state=open]')`, 'drawer did not open'); await p.sleep(250);
  await p.click('[role=dialog] a|Team'); await p.waitFor(`!document.querySelector('[role=dialog]')`, 'drawer stayed open');
});

test('shell: rtl mirrors the layout: sidebar on the right, drawer from the right, ArrowDown unchanged', async (p) => {
  await p.open(ROUTE, {dir: 'rtl'}); const ex = await p.example('App shell');
  const side = await p.rect(SHELL + ' .sidebar'), main = await p.rect(SHELL + ' main');
  assert(side.x > main.x, `the sidebar should be to the right of main in rtl: sidebar x=${Math.round(side.x)}, main x=${Math.round(main.x)}`);
  await ex.focus('.sidebar a|Overview'); await p.key('ArrowDown'); await p.expectActive('.sidebar a|Reports', 'ArrowDown in rtl');
  await p.open(ROUTE, {...MOBILE, dir: 'rtl'}); const m = await p.example('App shell');
  await m.click('button|Menu'); await p.waitFor(`document.querySelector('[role=dialog][data-state=open]')`, 'drawer did not open'); await p.sleep(250);
  const r = await p.rect('[role=dialog]');
  assert(r.right >= MOBILE.width - 1, `the drawer should open from the right in rtl: x ${Math.round(r.x)}..${Math.round(r.right)}`);
});

test('shell: the aside sits beside the page from 1100px and under it below', async (p) => {
  await p.open(ROUTE); await p.example('With an aside');
  const A = '[data-e2e="e2e-with-an-aside"] .app-shell';
  const wide = await p.eval(q(A, (e) => { const m = e.querySelector('main').getBoundingClientRect(), a = e.querySelector('aside').getBoundingClientRect(); return a.left >= m.right - 1 && Math.abs(a.top - m.top) < 2; }));
  assert(wide, 'at 1280px the aside should be beside main');
  await p.open(ROUTE, {width: 900, height: 800}); await p.example('With an aside');
  const narrow = await p.eval(q(A, (e) => { const m = e.querySelector('main').getBoundingClientRect(), a = e.querySelector('aside').getBoundingClientRect(); return a.top >= m.bottom - 1; }));
  assert(narrow, 'at 900px the aside should be under main');
});

for (const [w, h, mobile] of [[375, 812, true], [1280, 800, false]]) {
  test(`shell: no horizontal overflow at ${w}px on the shell pages`, async (p) => {
    const bad = [];
    for (const route of ['components/app-shell', 'components/sidebar', 'components/navbar', 'components/page-header', 'components/breadcrumbs-auto', 'components/block-dashboard-shell']) {
      await p.open(route, {width: w, height: h, mobile});
      const o = await p.eval(`({sw: document.documentElement.scrollWidth, iw: innerWidth})`);
      if (o.sw > o.iw + 1) bad.push(`${route}: ${o.sw}px in a ${o.iw}px viewport`);
    }
    eq(bad, [], 'pages that overflow horizontally');
  }, {timeout: 60000});
}
