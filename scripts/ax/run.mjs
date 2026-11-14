#!/usr/bin/env node
// Accessibility-tree check in real Chrome against the BUILT docs site (apps/docs/dist).
// This reads the tree Chrome gives screen readers (Accessibility.getFullAXTree). It is NOT a screen reader test.
//
//   npm run build        (once; this runner builds nothing)
//   npm run ax                          check everything, rewrite docs/a11y-report.md
//   npm run ax -- --grep dialog         only components whose id contains "dialog" (report is not rewritten)
//   npm run ax -- --dump dialog         print the tree of each phase of one component, for writing expectations
//   npm run ax -- --no-write            check without writing the report
// Expectations live in ./expectations.mjs (data). Chrome: CHROME=/path/to/chrome.
import {existsSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome, serveDist} from '../lib/cdp.mjs';
import {createPage} from '../e2e/page.mjs';
import {announce, domSubtree, focusedNode, fullTree, inScope, isInteractive, NAMED} from './ax.mjs';
import {components, pageChecks} from './expectations.mjs';
import {renderReport} from './report.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const grep = opt('grep', ''); const dump = opt('dump', '');
const dist = join(root, 'apps/docs/dist');
if (!existsSync(join(dist, 'index.html'))) { console.error('Build the docs first: npm run build'); process.exit(2); }

const {server, base} = await serveDist(dist);
let browser;
try { browser = await launchChrome({label: 'monoline-ax'}); } catch (e) { console.error(e.message); server.close(); process.exit(2); }
process.on('exit', () => { browser.close(); try { server.close(); } catch {} });
const page = await createPage(browser, base);
const {cdp} = browser;
page.begin();

const slug = (t) => `e2e-${t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const J = JSON.stringify;

// ---- step runner: ['click', spec] ['rclick', spec] ['key', 'Enter'] ['keys', 'ArrowDown', 'Enter'] ['focus', spec] ['type', 'abc'] ['tab', n] ['hover', spec] ['wait', ms] ['eval', js] ['waitFor', js]
// A spec starting with ^ is looked up on the whole page (portalled overlays); others stay inside the example.
async function step(ex, [op, ...a]) {
  // Example-scoped specs are prefixed with the example's preview panel (its tab buttons would otherwise match 'button'); ^ looks on the whole page.
  const target = (s) => { if (s.startsWith('^')) return [page, s.slice(1)]; const [sel, ...rest] = s.split('|'); const pre = `${ex.scope} [role=tabpanel] `; return [page, [sel.split(',').map((x) => pre + x.trim()).join(', '), ...rest].join('|')]; };
  switch (op) {
    case 'click': { const [t, s] = target(a[0]); return t.click(s); }
    case 'rclick': { const [t, s] = target(a[0]); return t.click(s, 'right'); }
    case 'hover': { const [t, s] = target(a[0]); return t.hover(s); }
    case 'focus': { const [t, s] = target(a[0]); return t.focus(s); }
    case 'key': return page.key(a[0], ...a.slice(1));
    case 'keys': return page.keys(...a);
    case 'type': return page.type(a[0]);
    case 'tab': return page.tab(a[0] ?? 1);
    case 'wait': return page.sleep(a[0]);
    case 'eval': return page.eval(a[0]);
    case 'waitFor': return page.waitFor(a[0], `waitFor ${a[0]}`, 4000);
    default: throw new Error(`unknown step ${op}`);
  }
}

// ---- matching
const matches = (pat, s) => (pat === undefined ? true : pat instanceof RegExp ? pat.test(s) : String(s).toLowerCase() === String(pat).toLowerCase());
const stateOk = (n, k, want) => {
  const have = k === 'name' ? n.name : k === 'description' ? n.description : k === 'value' ? n.value : n.props[k];
  if (want instanceof RegExp) return want.test(String(have ?? ''));
  if (want === false) return have === undefined || have === false || have === 'false';
  if (want === true) return have === true || have === 1 || have === 'true';
  return have === want || String(have) === String(want);
};
const show = (n) => `${n.role} "${n.name}"`;

function evaluate(phase, nodes, scoped, focused, scope) {
  const findings = []; const rows = [];
  const live = scoped.filter((n) => !n.ignored);
  const known = phase.known ?? {};
  const add = (kind, msg) => findings.push({kind, msg, known: known[kind]});

  // 1. expectations from data
  for (const e of phase.expect ?? []) {
    const hits = live.filter((n) => n.role === e.role && matches(e.name, n.name));
    const want = `${e.role}${e.name !== undefined ? ` ${e.name}` : ''}`;
    if (e.count !== undefined ? hits.length !== e.count : hits.length === 0) { add('expect', `expected ${e.count ?? 'a'} ${want}, found ${hits.length}. Nearby: ${live.filter((n) => n.role === e.role).slice(0, 4).map(show).join('; ') || 'none of that role'}`); continue; }
    const n = hits[e.nth ?? 0] ?? hits[0];
    if (e.value !== undefined && !matches(e.value, String(n.value ?? ''))) add('state', `${show(n)}: expected value ${e.value}, got "${n.value}"`);
    for (const [k, v] of Object.entries(e.states ?? {})) if (!stateOk(n, k, v)) add('state', `${show(n)}: expected ${k}=${v}, got ${JSON.stringify(k in n.props ? n.props[k] : undefined)}`);
    if (e.description !== undefined && !matches(e.description, n.description)) add('description', `${show(n)}: expected description ${e.description}, got "${n.description}"`);
    for (const [k, v] of Object.entries(e.rel ?? {})) { const got = n.rel[k] ?? []; if (!got.length || (v && !got.some((t) => matches(v, t)))) add('relation', `${show(n)}: expected ${k} ${v ?? '(any)'}, got ${JSON.stringify(got)}`); }
    rows.push({node: n, note: e.note});
  }
  // 2. focused node after the real key presses
  if (phase.focus) {
    const f = phase.focus;
    if (!focused) add('focus', `expected focus on ${f.role} ${f.name ?? ''}, nothing in the tree is focused`);
    else {
      if (f.role && !matches(f.role, focused.role)) add('focus', `focus is on ${show(focused)}, expected role ${f.role}`);
      if (f.name !== undefined && !matches(f.name, focused.name)) add('focus', `focus is on ${show(focused)}, expected name ${f.name}`);
      for (const [k, v] of Object.entries(f.states ?? {})) if (!stateOk(focused, k, v)) add('state', `focused ${show(focused)}: expected ${k}=${v}, got ${JSON.stringify(focused.props[k])}`);
      if (f.activedescendant !== undefined) { const t = focused.rel.activedescendant ?? []; if (!t.length || !matches(f.activedescendant, t[0])) add('relation', `focused ${show(focused)}: expected activedescendant ${f.activedescendant}, got ${JSON.stringify(t)}`); }
      if (f.controls) { const t = focused.rel.controls ?? []; if (!t.length) add('relation', `focused ${show(focused)}: expected aria-controls to resolve, got none`); }
      rows.push({node: focused, focus: true});
    }
  }
  // 3. generic checks on everything in scope
  const unnamedOk = phase.allowUnnamed ?? [];
  for (const n of live) {
    if (NAMED.has(n.role) && !n.name && !unnamedOk.includes(n.role)) add('name', `${n.role} has no accessible name${n.description ? ` (description: ${n.description})` : ''}`);
    if (n.props.focusable && !n.guard && ['generic', 'none', 'GenericContainer', ''].includes(n.role) && !phase.allowGenericFocusable) add('generic', `focusable element with role "${n.role || 'none'}" ${n.name ? `"${n.name}"` : ''}: a screen reader has nothing to announce`);
    for (const k of ['labelledby', 'describedby']) for (const t of n.rel[k] ?? []) if (!t) add('relation', `${show(n)}: ${k} points at an element with no text`);
    if (n.props.invalid && n.props.invalid !== 'false' && !n.rel.describedby?.length && !n.rel.errormessage?.length && !n.description && !phase.allowInvalidWithoutMessage) add('invalid', `${show(n)} is invalid but nothing tells the user why (no describedby or errormessage)`);
    if (['dialog', 'alertdialog'].includes(n.role)) {
      if (!n.name) add('dialog', `${n.role} has no name`);
      if (!n.description && !phase.noDescription) add('dialog', `${n.role} "${n.name}" has no description`);
    }
  }
  // 4. modal: nothing outside the overlay can be reached
  if (phase.modal) {
    const modalNode = live.find((n) => ['dialog', 'alertdialog'].includes(n.role));
    if (!modalNode) add('modal', 'no dialog node in the tree while the overlay should be open');
    else {
      if (modalNode.props.modal === false) add('modal', `${modalNode.role} "${modalNode.name}" does not report modal (aria-modal)`);
      const inside = scope ? scope.ids : new Set();
      const behind = nodes.filter((n) => !n.ignored && n.backend && !inside.has(n.backend) && NAMED.has(n.role) && n.name);
      if (behind.length) add('modal', `${behind.length} control(s) behind the modal are still in the accessibility tree: ${behind.slice(0, 4).map(show).join('; ')}`);
    }
  }
  if (phase.noInteractive) { const bad = live.filter((n) => NAMED.has(n.role)); if (bad.length) add('modal', `expected no controls, found ${bad.map(show).join('; ')}`); }
  return {findings, rows};
}

// ---- run
const results = [];
const list = [...components, ...pageChecks].filter((c) => c.id.includes(grep) && (!dump || c.id === dump));
for (const comp of list) {
  const res = {comp, phases: [], error: null};
  results.push(res);
  try {
    let ex = null; let open = false;
    for (const phase of comp.phases) {
      if (!open || phase.reset) { await page.open(comp.route, comp.open ?? {}); if (comp.example) { await page.example(comp.example); ex = {scope: `[data-e2e="${slug(comp.example)}"]`}; } else ex = {scope: '.docs-main'}; open = true; }
      for (const s of phase.steps ?? []) await step(ex, s);
      await page.settle();
      if (typeof phase.scope === 'string' && phase.scope !== 'page') await page.waitFor(`document.querySelector(${J(phase.scope)})`, `${phase.scope} did not appear`, 4000);
      await page.sleep(150);
      // Default scope: the example's preview plus everything portalled to <body> outside the docs app (overlays, toasts, tooltips).
      const sel = phase.scope === 'page' ? null : phase.scope ?? (comp.example ? [`[data-e2e="${slug(comp.example)}"] [role=tabpanel]`, 'body > *:not(#root):not(script)'] : '.docs-main');
      const scope = sel ? await domSubtree(cdp, sel) : null;
      if (sel && !scope) throw new Error(`scope ${sel} not found in phase "${phase.name}"`);
      const nodes = await fullTree(cdp);
      const guards = await domSubtree(cdp, '[data-radix-focus-guard]'); // Radix's invisible Tab-trap sentinels; they are meant to be focusable and unannounced
      if (guards) for (const n of nodes) if (guards.ids.has(n.backend)) n.guard = true;
      const scoped = inScope(nodes, scope);
      const focused = await focusedNode(cdp, nodes);
      const {findings, rows} = phase.custom ? phase.custom({nodes, scoped, focused, scope, add: (kind, msg) => {}}) : evaluate(phase, nodes, scoped, focused, scope);
      // Attributes Chrome's accessibility protocol does not surface as AX properties (aria-current, aria-sort): read from the DOM instead.
      for (const d of phase.dom ?? []) {
        const got = await page.eval(`(() => { const e = document.querySelector(${J(d.sel)}); return e ? e.getAttribute(${J(d.attr)}) : '__missing__'; })()`);
        if (got === '__missing__') findings.push({kind: 'dom', msg: `no element matches ${d.sel}`, known: (phase.known ?? {}).dom});
        else if (!matches(d.value, got ?? '')) findings.push({kind: 'dom', msg: `${d.sel}: expected ${d.attr}=${d.value}, got ${J(got)}`, known: (phase.known ?? {}).dom});
        else rows.push({dom: d});
      }
      if (phase.after) findings.push(...(phase.after({nodes, scoped, focused}) ?? []).map((msg) => ({kind: 'check', msg, known: (phase.known ?? {}).check})));
      const live = scoped.filter((n) => !n.ignored && !['StaticText', 'InlineTextBox', 'LineBreak'].includes(n.role));
      res.phases.push({phase, findings, rows, focused, interactive: live.filter((n) => isInteractive(n) || n.props.live || ['status', 'alert', 'dialog', 'alertdialog', 'heading', 'progressbar', 'main', 'navigation', 'banner', 'contentinfo'].includes(n.role)), live});
      if (dump) {
        console.log(`\n--- ${comp.id} / ${phase.name} (scope ${sel ?? 'page'}); focused: ${focused ? show(focused) : 'none'}`);
        for (const n of live) console.log(`${'  '.repeat(Math.max(0, n.depth - (live[0]?.depth ?? 0)))}${n.role} ${J(n.name)}${n.description ? ` desc=${J(n.description)}` : ''} ${J(n.props)}${Object.keys(n.rel).length ? ` rel=${J(n.rel)}` : ''}${n.value !== undefined ? ` value=${J(n.value)}` : ''}`);
        console.log('findings:', findings.map((f) => `${f.kind}: ${f.msg}`));
      }
    }
  } catch (e) { res.error = e.message; }
}

// ---- summary
let bad = 0; let knownCount = 0;
for (const r of results) {
  const all = r.phases.flatMap((p) => p.findings);
  const hard = all.filter((f) => !f.known); knownCount += all.length - hard.length;
  if (r.error) { bad++; console.log(`  ERROR ${r.comp.id}: ${r.error}`); continue; }
  if (hard.length) { bad++; console.log(`  FAIL ${r.comp.id}`); for (const f of hard) console.log(`       [${f.kind}] ${f.msg}`); } else console.log(`  ok   ${r.comp.id}${all.length ? ` (${all.length} known finding${all.length > 1 ? 's' : ''})` : ''}`);
}
console.log(`\n${results.length - bad}/${results.length} components pass, ${knownCount} known finding(s) listed in the report`);
if (!grep && !dump && !args.includes('--no-write')) { writeFileSync(join(root, 'docs/a11y-report.md'), renderReport(results)); console.log('wrote docs/a11y-report.md'); }
process.exit(bad ? 1 : 0);
