// Layout and visual-state checks in a real layout engine: overflow, overlays inside the viewport, focus rings, tap targets.
import {test, assert, eq} from '../test.mjs';

const SAMPLE = ['', 'components/button', 'components/dialog', 'components/data-grid', 'components/tabs', 'components/table', 'components/card', 'components/calendar', 'components/date-picker', 'components/combobox', 'components/carousel', 'components/data-table', 'components/block-pricing', 'guides/getting-started'];

for (const [w, h, mobile] of [[375, 812, true], [1280, 800, false]]) {
  test(`layout: no horizontal overflow at ${w}px on a sample of ${SAMPLE.length} pages`, async (p) => {
    const bad = [];
    for (const route of SAMPLE) {
      try { await p.open(route, {width: w, height: h, mobile}); } catch (e) { bad.push(`${route || '/'}: ${e.message}`); continue; }
      const o = await p.eval(`(() => { const d = document.documentElement; const wide = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1 && !e.closest('pre, .cdoc-code, [data-scroll], table, [role=grid], .carousel-track, [style*=overflow]'); }).slice(0, 2).map(__e2e.describe); return {sw: d.scrollWidth, iw: innerWidth, wide}; })()`);
      if (o.sw > o.iw + 1) bad.push(`${route || '/'}: page is ${o.sw}px wide in a ${o.iw}px viewport; sticking out: ${o.wide.join(', ') || 'unknown'}`);
    }
    eq(bad, [], 'pages that overflow horizontally');
  }, {timeout: 90000});
}

// ---- overlays stay inside the viewport
const inside = (r, vw, vh) => r && r.x >= -1 && r.y >= -1 && r.right <= vw + 1 && r.bottom <= vh + 1;
const OVERLAYS = [
  {name: 'popover', route: 'components/popover', ex: 'Basic', open: (p, ex) => ex.click('button|Details'), sel: '[role=dialog]'},
  {name: 'dropdown-menu', route: 'components/dropdown-menu', ex: 'Actions', open: (p, ex) => ex.click('button|Actions'), sel: '[role=menu]'},
  {name: 'select', route: 'components/select', ex: 'In a field', open: (p, ex) => ex.click('[role=combobox]'), sel: '[role=listbox]'},
  {name: 'combobox', route: 'components/combobox', ex: 'Search and pick', open: async (p, ex) => { await ex.click('input[role=combobox]'); await p.type('a'); }, sel: '[role=listbox]'},
  {name: 'date-picker', route: 'components/date-picker', ex: 'In a field', open: (p, ex) => ex.click('button|Pick a date'), sel: '[role=dialog]'},
  {name: 'tooltip', route: 'components/tooltip', ex: 'Basic', open: (p, ex) => ex.focus('button|Save'), sel: '[role=tooltip]'},
];
for (const [w, h, mobile] of [[375, 667, true], [1280, 800, false]]) {
  for (const o of OVERLAYS) {
    test(`layout: ${o.name} stays inside a ${w}x${h} viewport`, async (p) => {
      await p.open(o.route, {width: w, height: h, mobile}); const ex = await p.example(o.ex);
      await o.open(p, ex); await p.waitFor(`document.querySelector(${JSON.stringify(o.sel)})`, `${o.name} did not open`); await p.sleep(250);
      const r = await p.rect(o.sel);
      assert(inside(r, w, h), `${o.name} is at x ${Math.round(r.x)}..${Math.round(r.right)}, y ${Math.round(r.y)}..${Math.round(r.bottom)}; the viewport is ${w}x${h}`);
    });
  }
}
for (const [w, h, mobile] of [[375, 560, true], [1280, 800, false]]) for (const [name, route, ex, trigger, role] of [['dialog', 'components/dialog', 'Confirm', 'button|Overwrite copy', 'dialog'], ['alert-dialog', 'components/alert-dialog', 'Confirm a deletion', 'button|Delete project', 'alertdialog'], ['drawer', 'components/drawer', 'Right and left', 'button|Open right', 'dialog']]) {
  test(`layout: ${name} fits a ${w}x${h} viewport`, async (p) => {
    await p.open(route, {width: w, height: h, mobile}); const e = await p.example(ex);
    await e.click(trigger); await p.waitFor(`document.querySelector('[role=${role}][data-state=open]')`, 'did not open'); await p.sleep(300);
    const r = await p.rect(`[role=${role}]`);
    assert(inside(r, w, h), `${name} is at x ${Math.round(r.x)}..${Math.round(r.right)}, y ${Math.round(r.y)}..${Math.round(r.bottom)}; the viewport is ${w}x${h}`);
    const over = await p.eval(`(() => { const d = document.querySelector('[role=${role}]'); return d.scrollWidth > d.clientWidth + 1; })()`);
    assert(!over, `${name} content is wider than the ${name}`);
  });
}

// ---- focus ring and tap targets, per component page
const RING_PAGES = ['button', 'icon-button', 'input', 'textarea', 'checkbox', 'switch', 'radio-group', 'select', 'native-select', 'tabs', 'accordion', 'toggle-group', 'segmented-control', 'slider', 'link', 'pagination', 'number-input', 'password-input', 'breadcrumb', 'calendar', 'tree', 'otp-input', 'rating', 'tags-input', 'collapsible', 'button-group', 'toolbar', 'file-upload', 'time-picker', 'data-grid', 'carousel'];
const SIGNATURE = `(e) => { const s = getComputedStyle(e); return [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderTopColor, s.borderBottomColor, s.backgroundColor, s.textDecorationLine].join('|'); }`;
test(`focus ring: every focusable element on ${RING_PAGES.length} component pages shows a change when it gets keyboard focus`, async (p) => {
  const bad = []; const totals = {n: 0, checked: 0};
  for (const page of RING_PAGES) {
    try { await p.open(`components/${page}`); } catch (e) { bad.push(`${page}: ${e.message}`); continue; }
    await p.key('Shift'); // keyboard modality, so :focus-visible applies to the focus() calls below
    const res = await p.eval(`(async () => {
      const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));
      const sig = ${SIGNATURE};
      const out = []; let checked = 0;
      const els = [...document.querySelectorAll('.cdoc-stage a[href], .cdoc-stage button, .cdoc-stage input, .cdoc-stage select, .cdoc-stage textarea, .cdoc-stage [tabindex]:not([tabindex="-1"]), .cdoc-stage [role=slider], .cdoc-stage [role=tab]')]
        .filter((e) => __e2e.visible(e) && !e.disabled && !e.closest('[aria-hidden=true]') && !e.closest('[role=tabpanel][hidden]')).slice(0, 14);
      for (const e of els) {
        if (document.activeElement) document.activeElement.blur(); // a roving group can have moved focus to an item already
        const chain = [e, e.parentElement, e.parentElement && e.parentElement.parentElement, e.closest('label'), e.firstElementChild].filter(Boolean);
        const before = chain.map(sig);
        e.focus({preventScroll: true});
        await frame(); // a transition on the ring would otherwise still show the old value
        const after = chain.map(sig);
        const ring = e.matches(':focus-visible') ? chain.some((c, i) => before[i] !== after[i]) : null;
        if (ring !== null) checked++;
        if (ring === false) out.push(__e2e.describe(e));
        if (document.activeElement) document.activeElement.blur();
      }
      return {n: els.length, checked, missing: out};
    })()`);
    if (res.n === 0) bad.push(`${page}: no focusable element found in the examples`);
    else if (res.checked < res.n / 2) bad.push(`${page}: only ${res.checked} of ${res.n} elements matched :focus-visible after focus(); the test is not proving anything for this page`);
    totals.n += res.n; totals.checked += res.checked;
    for (const m of res.missing) bad.push(`${page}: no visible change on keyboard focus of ${m}`);
  }
  console.log(`       (focus ring: ${totals.checked} of ${totals.n} focusable elements checked)`);
  eq(bad, [], 'focus ring problems');
}, {timeout: 150000});

const TARGET_PAGES = ['button', 'icon-button', 'input', 'checkbox', 'switch', 'radio-group', 'select', 'native-select', 'number-input', 'password-input', 'pagination', 'segmented-control', 'toggle-group', 'tabs', 'rating', 'stepper', 'button-group', 'toolbar', 'tag', 'tags-input'];
for (const [w, h, mobile] of [[375, 812, true], [1280, 800, false]]) {
  test(`tap targets: buttons and inputs are at least 24x24 CSS px at ${w}px (${TARGET_PAGES.length} pages)`, async (p) => {
    const bad = []; let total = 0;
    for (const page of TARGET_PAGES) {
      try { await p.open(`components/${page}`, {width: w, height: h, mobile}); } catch (e) { bad.push(`${page}: ${e.message}`); continue; }
      const {n, small} = await p.eval(`(() => { const els = [...document.querySelectorAll('.cdoc-stage button, .cdoc-stage input:not([type=hidden]):not([type=checkbox]):not([type=radio]), .cdoc-stage select, .cdoc-stage textarea, .cdoc-stage [role=checkbox], .cdoc-stage [role=radio], .cdoc-stage [role=switch], .cdoc-stage [role=slider], .cdoc-stage [role=tab]')]
        .filter((e) => __e2e.visible(e) && !e.disabled && !e.closest('[aria-hidden=true]') && getComputedStyle(e).opacity !== '0');
        const small = els.map((e) => { const r = e.getBoundingClientRect(); const l = e.closest('label'); const lr = l ? l.getBoundingClientRect() : r; return {d: __e2e.describe(e), w: Math.round(Math.max(r.width, lr.width) * 10) / 10, h: Math.round(Math.max(r.height, lr.height) * 10) / 10}; })
        .filter((x) => x.w < 24 || x.h < 24).slice(0, 4); return {n: els.length, small}; })()`);
      total += n;
      for (const s of small) bad.push(`${page}: ${s.d} is ${s.w}x${s.h}`);
    }
    assert(total > 40, `only ${total} controls were measured; the page selectors have drifted`);
    eq(bad, [], 'targets smaller than 24x24');
  }, {timeout: 120000});
}
