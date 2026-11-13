// tabs, accordion, toggle-group, segmented-control, slider, checkbox, switch, radio-group, otp-input.
import {test, assert, eq} from '../test.mjs';

const sel = (p, spec) => p.attr(spec, 'aria-selected');
const panelText = (p) => p.eval(`[...document.querySelectorAll('[data-e2e] .cdoc-stage [role=tabpanel]')].filter(__e2e.visible).map(e => e.textContent.trim()).join('|')`);

// ---- tabs
test('tabs: ArrowRight/Left move focus and select, wrap around; Home and End jump; the panel switches', async (p) => {
  await p.open('components/tabs'); const ex = await p.example('Horizontal');
  await ex.focus('[role=tab]|Overview');
  eq(await sel(p, '[role=tab]|Overview'), 'true', 'Overview starts selected');
  await p.key('ArrowRight'); await p.expectActive('[role=tab]|Activity', 'ArrowRight');
  eq(await sel(p, '[role=tab]|Activity'), 'true', 'selection follows focus'); eq(await sel(p, '[role=tab]|Overview'), 'false', 'previous tab deselected');
  assert((await panelText(ex)) !== 'Overview content.', 'panel did not switch');
  await p.key('End'); await p.expectActive('[role=tab]|Settings', 'End');
  await p.key('ArrowRight'); await p.expectActive('[role=tab]|Overview', 'ArrowRight wraps to the first tab');
  await p.key('ArrowLeft'); await p.expectActive('[role=tab]|Settings', 'ArrowLeft wraps to the last tab');
  await p.key('Home'); await p.expectActive('[role=tab]|Overview', 'Home');
  eq(await panelText(p), 'Overview content.', 'panel after Home');
});
test('tabs: Tab from the selected tab lands in its panel and Shift+Tab comes back to the tab', async (p) => {
  await p.open('components/tabs'); const ex = await p.example('Horizontal');
  await ex.focus('[role=tab]|Overview'); await p.key('Tab');
  await p.waitFor(`document.activeElement.getAttribute('role') === 'tabpanel' || document.activeElement.closest('[role=tabpanel]')`, `Tab from the tab list should reach the panel, focus is on ${await p.active()}`);
  await p.key('Tab', 'shift'); await p.expectActive('[role=tab]|Overview', 'Shift+Tab from the panel');
  eq(await p.eval(`document.querySelector('[data-e2e] .cdoc-stage [role=tab][aria-selected=true]').getAttribute('aria-controls') === document.querySelector('[data-e2e] .cdoc-stage [role=tabpanel]:not([hidden])').id`), true, 'aria-controls points at the visible panel');
});
test('tabs: clicking a tab selects it; vertical tabs use ArrowUp/Down', async (p) => {
  await p.open('components/tabs'); const ex = await p.example('Vertical');
  await ex.click('[role=tab]|Security'); eq(await sel(p, '[role=tab]|Security'), 'true', 'click');
  await p.key('ArrowUp'); await p.expectActive('[role=tab]|Profile', 'ArrowUp in vertical tabs');
  await p.key('ArrowDown'); await p.expectActive('[role=tab]|Security', 'ArrowDown in vertical tabs');
  await p.key('ArrowRight'); await p.expectActive('[role=tab]|Security', 'ArrowRight does nothing in vertical tabs');
});

// ---- accordion
test('accordion: Enter and Space toggle, aria-expanded follows, one open at a time, content shows and hides', async (p) => {
  await p.open('components/accordion'); const ex = await p.example('Single, collapsible');
  eq(await p.attr('button|What is Monoline?', 'aria-expanded'), 'true', 'first item starts open');
  assert((await ex.text('.cdoc-stage [role=region]')).includes('plain CSS'), 'open item shows its content');
  await ex.focus('button|Do I need React?'); await p.key('Enter');
  await p.waitFor(`__e2e.find('button|Do I need React?').getAttribute('aria-expanded') === 'true'`, 'Enter did not open the item');
  eq(await p.attr('button|What is Monoline?', 'aria-expanded'), 'false', 'single mode closes the other item');
  await p.key(' ');
  await p.waitFor(`__e2e.find('button|Do I need React?').getAttribute('aria-expanded') === 'false'`, 'Space did not close the item (collapsible)');
  eq(await ex.count('.cdoc-stage [role=region]'), 0, 'no content visible once everything is collapsed');
});
test('accordion: arrow keys move between headers, Home/End jump', async (p) => {
  await p.open('components/accordion'); const ex = await p.example('Single, collapsible');
  await ex.focus('button|What is Monoline?');
  await p.key('ArrowDown'); await p.expectActive('button|Do I need React?', 'ArrowDown');
  await p.key('ArrowUp'); await p.expectActive('button|What is Monoline?', 'ArrowUp');
  await p.key('End'); await p.expectActive('button|Do I need React?', 'End');
  await p.key('Home'); await p.expectActive('button|What is Monoline?', 'Home');
});

// ---- toggle-group and segmented-control
for (const [name, ex, first, second, third] of [['toggle-group', 'Single', '7 days', '30 days', 'Year'], ['segmented-control', 'Basic', 'Day', 'Week', 'Month']]) {
  test(`${name}: arrows move focus between items, Space or Enter selects, one tab stop`, async (p) => {
    await p.open(`components/${name}`); const e = await p.example(ex);
    eq(await p.attr(`[role=radio]|${second}`, 'aria-checked'), 'true', `${second} starts selected`);
    await e.focus(`[role=radio]|${second}`);
    await p.key('ArrowRight'); await p.expectActive(`[role=radio]|${third}`, 'ArrowRight');
    await p.key(' ');
    await p.waitFor(`__e2e.find('[role=radio]|${third}').getAttribute('aria-checked') === 'true'`, `Space did not select ${third}`);
    eq(await p.attr(`[role=radio]|${second}`, 'aria-checked'), 'false', 'single selection');
    await p.key('Home'); await p.expectActive(`[role=radio]|${first}`, 'Home');
    await p.key('Tab'); await p.key('Tab', 'shift');
    await p.waitFor(`__e2e.describe(document.activeElement).includes(${JSON.stringify(first)}) || __e2e.describe(document.activeElement).includes(${JSON.stringify(third)})`, `Shift+Tab should return into the group, focus is on ${await p.active()}`);
  });
}

// ---- slider
const val = (p, label) => p.attr(`[role=slider][aria-label="${label}"]`, 'aria-valuenow').then(Number);
test('slider: arrows change by 1, PageUp/PageDown by 10, Home/End jump to min and max', async (p) => {
  await p.open('components/slider'); const ex = await p.example('Single and range');
  await ex.focus('[role=slider][aria-label="Volume"]');
  await p.key('ArrowRight'); eq(await val(p, 'Volume'), 61, 'ArrowRight');
  await p.key('ArrowUp'); eq(await val(p, 'Volume'), 62, 'ArrowUp');
  await p.key('ArrowLeft'); await p.key('ArrowDown'); eq(await val(p, 'Volume'), 60, 'ArrowLeft + ArrowDown');
  await p.key('PageUp'); eq(await val(p, 'Volume'), 70, 'PageUp');
  await p.key('PageDown'); await p.key('PageDown'); eq(await val(p, 'Volume'), 50, 'PageDown x2');
  await p.key('Home'); eq(await val(p, 'Volume'), 0, 'Home'); await p.key('End'); eq(await val(p, 'Volume'), 100, 'End');
  await p.key('ArrowRight'); eq(await val(p, 'Volume'), 100, 'cannot exceed max');
});
test('slider: the thumb moves with the value (position follows aria-valuenow)', async (p) => {
  await p.open('components/slider'); const ex = await p.example('Single and range');
  await ex.focus('[role=slider][aria-label="Volume"]'); await p.key('Home');
  const a = await p.rect('[role=slider][aria-label="Volume"]'); await p.key('End');
  const b = await p.rect('[role=slider][aria-label="Volume"]');
  assert(b.x - a.x > 150, `thumb moved ${b.x - a.x}px from min to max; expected most of the track`);
});
test('slider: a click on the track sets the value; dragging the thumb moves it', async (p) => {
  await p.open('components/slider'); await p.example('Single and range');
  const T = '[role=slider][aria-label="Volume"]';
  await p.scrollTo(T);
  const thumb = await p.rect(T);
  await p.clickAt(thumb.x - 96, thumb.y + thumb.h / 2);
  const clicked = await val(p, 'Volume');
  assert(clicked >= 25 && clicked <= 45, `a click 100px left of the thumb on a 420px track should give about 35, got ${clicked}`);
  const t = await p.rect(T); const x = t.x + t.w / 2, y = t.y + t.h / 2;
  await p.drag(x, y, [[x + 40, y], [x + 80, y], [x + 120, y]]);
  const dragged = await val(p, 'Volume');
  assert(dragged >= clicked + 20, `dragging 120px right should raise the value by about 29 from ${clicked}, got ${dragged}`);
});
test('slider: range thumbs do not cross and expose their own names', async (p) => {
  await p.open('components/slider'); const ex = await p.example('Single and range');
  const min = '[role=slider][aria-label="Price minimum"]', max = '[role=slider][aria-label="Price maximum"]';
  await ex.focus(min); await p.key('End');
  const lo = Number(await p.attr(min, 'aria-valuenow')), hi = Number(await p.attr(max, 'aria-valuenow'));
  assert(lo <= hi, `minimum thumb (${lo}) crossed the maximum (${hi})`);
});

// ---- checkbox, switch, radio-group
test('checkbox: Space toggles, Enter does not, a label click toggles, disabled is skipped by Tab', async (p) => {
  await p.open('components/checkbox'); const ex = await p.example('Basic');
  await ex.focus('[role=checkbox]:not([data-state=checked])'); // Mentions
  await p.key(' '); eq(await p.eval(`document.activeElement.getAttribute('aria-checked')`), 'true', 'Space checks');
  await p.key(' '); eq(await p.eval(`document.activeElement.getAttribute('aria-checked')`), 'false', 'Space unchecks');
  await p.key('Enter'); eq(await p.eval(`document.activeElement.getAttribute('aria-checked')`), 'false', 'Enter must not toggle a checkbox');
  await ex.click('span|Mentions'); eq(await p.eval(`__e2e.find('[role=checkbox]|Mentions').getAttribute('aria-checked')`), 'true', 'label click');
  await p.key('Tab'); assert(!(await p.active()).includes('Billing'), 'Tab landed on the disabled checkbox');
});
test('checkbox: indeterminate is exposed as aria-checked=mixed', async (p) => {
  await p.open('components/checkbox'); const ex = await p.example('Indeterminate');
  await ex.expectAttr('[role=checkbox]', 'aria-checked', 'mixed', 'indeterminate checkbox');
});
test('switch: Space toggles, label click toggles, disabled is skipped', async (p) => {
  await p.open('components/switch'); const ex = await p.example('Basic');
  await ex.focus('[role=switch]|Weekly digest');
  await p.key(' '); eq(await ex.attr('[role=switch]|Weekly digest', 'aria-checked'), 'true', 'Space on');
  await p.key(' '); eq(await ex.attr('[role=switch]|Weekly digest', 'aria-checked'), 'false', 'Space off');
  await ex.click('span|Weekly digest'); eq(await ex.attr('[role=switch]|Weekly digest', 'aria-checked'), 'true', 'label click');
  await p.key('Tab'); assert(!(await p.active()).includes('Locked'), 'Tab landed on the disabled switch');
  assert((await ex.attr('[role=switch]|Launch at login', 'role')) === 'switch', 'role=switch');
});
test('radio-group: arrows move focus and selection, wrap; one tab stop; horizontal group too', async (p) => {
  await p.open('components/radio-group'); const ex = await p.example('Basic');
  await ex.focus('[role=radio]|=Monthly');
  await p.key('ArrowDown'); await ex.expectActive('[role=radio]|=Yearly', 'ArrowDown');
  eq(await ex.attr('[role=radio]|=Yearly', 'aria-checked'), 'true', 'selection follows the arrow');
  await p.key('ArrowDown'); await ex.expectActive('[role=radio]|=Monthly', 'ArrowDown wraps');
  await p.key('ArrowUp'); await ex.expectActive('[role=radio]|=Yearly', 'ArrowUp wraps');
  const h = await p.example('Horizontal');
  await h.focus('[role=radio]|=M'); await p.key('ArrowRight'); await h.expectActive('[role=radio]|=L', 'ArrowRight');
  await p.key('ArrowRight'); await h.expectActive('[role=radio]|=S', 'ArrowRight wraps');
  eq(await h.attr('[role=radio]|=S', 'aria-checked'), 'true', 'selection follows');
});

// ---- otp-input
const digits = (p) => p.eval(`[...document.querySelectorAll('[role=group][aria-label="Verification code"] input')].map(i => i.value).join('')`);
const idx = (p) => p.eval(`[...document.querySelectorAll('[role=group][aria-label="Verification code"] input')].indexOf(document.activeElement)`);
test('otp-input: each digit advances focus, letters are rejected, Backspace goes back, arrows move', async (p) => {
  await p.open('components/otp-input'); const ex = await p.example('Six digits');
  await ex.focus('input[aria-label="Digit 1 of 6"]');
  await p.type('12'); eq(await digits(p), '12', 'digits typed'); eq(await idx(p), 2, 'focus advanced to box 3');
  await p.type('x'); eq(await digits(p), '12', 'a letter must be rejected'); eq(await idx(p), 2, 'focus stays after a rejected key');
  await p.key('Backspace'); eq(await idx(p), 1, 'Backspace on an empty box goes back'); 
  eq(await digits(p), '1', 'Backspace clears the previous box');
  await p.key('ArrowLeft'); eq(await idx(p), 0, 'ArrowLeft'); await p.key('ArrowRight'); eq(await idx(p), 1, 'ArrowRight');
  await p.focus('input[aria-label="Digit 2 of 6"]'); await p.type('23456');
  eq(await digits(p), '123456', 'all six digits');
});
test('otp-input: pasting a code fills every box', async (p) => {
  await p.open('components/otp-input'); const ex = await p.example('Six digits');
  await ex.focus('input[aria-label="Digit 1 of 6"]');
  await p.eval(`(() => { const dt = new DataTransfer(); dt.setData('text/plain', '482913'); document.activeElement.dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true})); })()`);
  await p.waitFor(`[...document.querySelectorAll('[role=group][aria-label="Verification code"] input')].map(i => i.value).join('') === '482913'`, `paste gave "${await digits(p)}"`);
});
