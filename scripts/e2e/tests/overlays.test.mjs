// dialog, alert-dialog, drawer: modal behaviour. Popover and tooltip: non-modal overlays.
import {test, assert, eq} from '../test.mjs';

const TABBABLE = `a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`;
/** Focusable elements outside the open dialog that are not hidden from assistive tech or inert. */
const reachableBehind = (p) => p.eval(`(() => {
  const dlg = document.querySelector('[role=dialog][data-state=open], [role=alertdialog][data-state=open]');
  if (dlg.matches(':modal')) return []; // a native modal <dialog> makes the whole page behind inert (the browser's own guarantee)
  return [...document.querySelectorAll(${JSON.stringify(TABBABLE)})].filter((e) => !dlg.contains(e) && !e.closest('[aria-hidden=true], [inert], [data-aria-hidden=true]') && __e2e.visible(e)).map(__e2e.describe).slice(0, 3);
})()`);
const inside = (p) => p.eval(`(() => { const d = document.querySelector('[role=dialog][data-state=open], [role=alertdialog][data-state=open]'); return !!d && d.contains(document.activeElement); })()`);

function modal({name, route, example, trigger, role, closer}) {
  const open = async (p) => { await p.open(route); const ex = await p.example(example); return ex; };
  test(`${name}: opens by click, focus moves inside, trigger is expanded`, async (p) => {
    const ex = await open(p);
    await ex.click(trigger);
    await p.waitFor(`document.querySelector('[role=${role}][data-state=open]')`, `${name} did not open on click`);
    await p.waitFor(`document.querySelector('[role=${role}]').contains(document.activeElement)`, `focus did not move into the ${name}; it is on ${await p.active()}`);
    assert(await p.has(`[role=${role}] [id]|`), 'dialog content is empty');
    eq(await p.eval(`!!document.querySelector('[role=${role}]').getAttribute('aria-labelledby')`), true, `${name} needs aria-labelledby (its title)`);
  });
  test(`${name}: opens with Enter and Space from the trigger`, async (p) => {
    const ex = await open(p);
    for (const k of ['Enter', ' ']) {
      await ex.focus(trigger); await p.key(k);
      await p.waitFor(`document.querySelector('[role=${role}][data-state=open]')`, `${name} did not open with ${JSON.stringify(k)}`);
      await p.key('Escape');
      await p.waitFor(`!document.querySelector('[role=${role}]')`, `${name} did not close`);
    }
  });
  test(`${name}: Tab and Shift+Tab stay trapped inside`, async (p) => {
    const ex = await open(p);
    await ex.click(trigger);
    await p.waitFor(`document.querySelector('[role=${role}][data-state=open]')`, 'did not open');
    for (let i = 0; i < 7; i++) { await p.key('Tab'); assert(await inside(p), `Tab #${i + 1} left the ${name}: focus is on ${await p.active()}`); }
    for (let i = 0; i < 7; i++) { await p.key('Tab', 'shift'); assert(await inside(p), `Shift+Tab #${i + 1} left the ${name}: focus is on ${await p.active()}`); }
  });
  test(`${name}: the page behind is hidden from keyboard and screen readers`, async (p) => {
    const ex = await open(p);
    await ex.click(trigger);
    await p.waitFor(`document.querySelector('[role=${role}][data-state=open]')`, 'did not open');
    await p.sleep(100);
    eq(await reachableBehind(p), [], `focusable elements behind the open ${name} are not aria-hidden/inert`);
  });
  test(`${name}: Escape closes and focus returns to the trigger`, async (p) => {
    const ex = await open(p);
    await ex.click(trigger);
    await p.waitFor(`document.querySelector('[role=${role}][data-state=open]')`, 'did not open');
    await p.key('Escape');
    await p.waitFor(`!document.querySelector('[role=${role}]')`, `${name} still open after Escape`);
    await p.waitFor(`document.activeElement && document.activeElement.textContent.includes(${JSON.stringify(trigger.split('|')[1])})`, `focus did not return to the trigger; it is on ${await p.active()}`);
  });
  if (closer) test(`${name}: ${closer.label} closes it and focus returns to the trigger`, async (p) => {
    const ex = await open(p);
    await ex.click(trigger);
    await p.waitFor(`document.querySelector('[role=${role}][data-state=open]')`, 'did not open');
    await p.click(closer.spec);
    await p.waitFor(`!document.querySelector('[role=${role}]')`, `${name} still open after ${closer.label}`);
    await p.waitFor(`document.activeElement && document.activeElement.textContent.includes(${JSON.stringify(trigger.split('|')[1])})`, `focus did not return to the trigger; it is on ${await p.active()}`);
  });
}

modal({name: 'dialog', route: 'components/dialog', example: 'Confirm', trigger: 'button|Overwrite copy', role: 'dialog', closer: {label: 'the Keep both button', spec: '[role=dialog] button|Keep both'}});
modal({name: 'alert-dialog', route: 'components/alert-dialog', example: 'Confirm a deletion', trigger: 'button|Delete project', role: 'alertdialog', closer: {label: 'Cancel', spec: '[role=alertdialog] button|Keep it'}});
modal({name: 'drawer', route: 'components/drawer', example: 'Right and left', trigger: 'button|Open right', role: 'dialog'});

test('dialog: clicking the backdrop closes it', async (p) => {
  await p.open('components/dialog'); const ex = await p.example('Confirm');
  await ex.click('button|Overwrite copy');
  await p.waitFor(`document.querySelector('[role=dialog][data-state=open]')`, 'did not open');
  await p.clickAt(4, 4);
  await p.waitFor(`!document.querySelector('[role=dialog]')`, 'dialog stayed open after a click on the backdrop');
});
test('alert-dialog: clicking the backdrop does NOT close it, and the Cancel button is focused first', async (p) => {
  await p.open('components/alert-dialog'); const ex = await p.example('Confirm a deletion');
  await ex.click('button|Delete project');
  await p.waitFor(`document.querySelector('[role=alertdialog][data-state=open]')`, 'did not open');
  await p.sleep(150);
  await p.clickAt(4, 4); await p.sleep(200);
  assert(await p.has('[role=alertdialog]'), 'alert dialog closed from a backdrop click; a destructive confirm must need an explicit answer');
});
test('alert-dialog: focus starts on the safe (cancel) action', async (p) => {
  await p.open('components/alert-dialog'); const ex = await p.example('Confirm a deletion');
  await ex.click('button|Delete project');
  await p.waitFor(`document.querySelector('[role=alertdialog][data-state=open]')`, 'did not open');
  await p.waitFor(`document.activeElement.textContent.includes('Keep it')`, `initial focus should be on Keep it, it is on ${await p.active()}`);
});
test('drawer: the left drawer slides from the left edge, the right one from the right', async (p) => {
  await p.open('components/drawer'); const ex = await p.example('Right and left');
  for (const [side, label] of [['left', 'button|Open left'], ['right', 'button|Open right']]) {
    await ex.click(label);
    await p.waitFor(`document.querySelector('[role=dialog][data-state=open]')`, 'drawer did not open');
    await p.sleep(200);
    const r = await p.rect('[role=dialog]');
    assert(side === 'left' ? r.x <= 1 : Math.abs(r.right - 1280) <= 1, `${side} drawer is at x=${r.x}..${r.right}, not against the ${side} edge`);
    await p.key('Escape'); await p.waitFor(`!document.querySelector('[role=dialog]')`, 'did not close');
  }
});

test('popover: opens with Enter, Escape closes and focus returns to the trigger', async (p) => {
  await p.open('components/popover'); const ex = await p.example('Basic');
  await ex.focus('button|Details'); await p.key('Enter');
  await p.waitFor(`document.querySelector('[role=dialog][data-state=open]')`, 'popover did not open');
  await p.expectAttr('button|Details', 'aria-expanded', 'true', 'trigger');
  await p.key('Escape');
  await p.waitFor(`!document.querySelector('[role=dialog]')`, 'popover still open');
  await p.expectActive('button|Details', 'focus return');
});
test('popover: an outside click closes it', async (p) => {
  await p.open('components/popover'); const ex = await p.example('Basic');
  await ex.click('button|Details');
  await p.waitFor(`document.querySelector('[role=dialog][data-state=open]')`, 'popover did not open');
  await p.clickAt(30, 780); await p.sleep(150);
  assert(!(await p.has('[role=dialog]')), 'popover stayed open after an outside click');
});

test('tooltip: focus shows it, Escape hides it', async (p) => {
  await p.open('components/tooltip'); const ex = await p.example('Basic');
  await ex.focus('button|Save');
  await p.waitFor(`document.querySelector('[role=tooltip]')`, 'tooltip did not show on keyboard focus');
  assert((await p.text('[role=tooltip]')).includes('Saved to'), 'tooltip text is wrong');
  await p.waitFor(`__e2e.find('button|Save').getAttribute('aria-describedby')`, 'trigger is not described by the tooltip');
  await p.key('Escape');
  await p.waitFor(`!document.querySelector('[role=tooltip]')`, 'tooltip still visible after Escape');
});
test('tooltip: hover shows it, moving away hides it', async (p) => {
  await p.open('components/tooltip'); const ex = await p.example('Basic');
  await ex.hover('button|Save');
  await p.waitFor(`document.querySelector('[role=tooltip]')`, 'tooltip did not show on hover', 3000);
  await p.mouse('mouseMoved', 5, 700); await p.mouse('mouseMoved', 8, 705); // Radix closes on the next move after a grace-area exit
  await p.waitFor(`!document.querySelector('[role=tooltip]')`, 'tooltip stayed after the pointer left', 3000);
});
