// Turns the results of run.mjs into docs/a11y-report.md. Deterministic (no dates, no ports) so the file only changes when the tree does.
import {announce} from './ax.mjs';

/** Problems this check found in components and the change that fixed each. History, kept here so the report can say what the check is worth. */
const FIXED = [
  ['accordion, select, combobox, multi-select, tree-select, breadcrumb', 'CSS generated content ("+", "−", "↓", "✓", "/") was part of the accessible name or value, so a screen reader would read "What is Monoline? minus" or "15 minutes down arrow". The glyphs now have empty alternative text (`content: "+" / ""`), so they stay visible and are not announced.'],
  ['dialog, alert-dialog, drawer, command', 'The dialog did not report itself as modal (`aria-modal`). The page behind was hidden by Radix, but not every assistive technology relies on that. `aria-modal="true"` is now set on the content and can still be overridden through props.'],
  ['carousel', 'The scrollable slide track was a focusable `div` with a label and no role, which Chrome exposes with no role ("generic"). It is now `role="group"`, so focus announces "Featured slides, group".'],
  ['combobox', 'The suggestion list had no name unless `aria-label` was passed, so inside a `Field` it was announced as just "list box". It now takes its name from the input.'],
  ['context-menu (docs example)', 'The menu had no accessible name. The example now passes `aria-label`; any real use needs one too.'],
];

const ATS = [
  {name: 'NVDA with Firefox and Chrome (Windows)', how: 'Start NVDA, open the docs site, press `Insert+Space` once to be sure browse mode is on. Browse mode: `Down` reads line by line, `Tab` jumps between controls, `D` landmarks, `H` headings, `B` buttons, `F` form fields. Turn on the Speech Viewer (NVDA menu, Tools) and copy what it says into the notes.', watch: ['Browse mode versus focus mode: dialogs, menus, grids and the combobox should switch to focus mode on their own, and back when they close.', 'Live regions: error text, toasts and the data table sort status should be spoken without moving focus.', 'Name and role: compare each announcement with the "Expected announcement" column of this report.']},
  {name: 'JAWS with Chrome (Windows)', how: 'Open the docs site. Virtual cursor is on by default: `Down` reads on, `Tab` jumps between controls, `R` landmarks, `H` headings, `Insert+F7` lists links and controls. `Insert+Z` toggles the virtual cursor.', watch: ['JAWS reads `aria-describedby` after a pause and may skip it at its default verbosity: check the field errors and tooltip.', 'Modal dialogs: JAWS should read the dialog name and description on open and keep the virtual cursor inside.', 'Grid and tree widgets: JAWS enters forms mode on Enter; check that arrow keys then move by cell or node.']},
  {name: 'VoiceOver with Safari (macOS)', how: 'Turn VoiceOver on with `Cmd+F5`. `VO` is `Ctrl+Option`. `VO+Right` reads on, `VO+Space` activates, `VO+U` opens the rotor (landmarks, headings, form controls), `VO+Shift+Down` enters a group and `VO+Shift+Up` leaves it. Turn on the caption panel in VoiceOver Utility to log speech.', watch: ['Safari does not support CSS alternative text before version 17.4: check that the accordion and select still do not read their glyphs on older versions.', 'Menus and the combobox: VoiceOver sometimes needs `VO+Space` where other readers use Enter.', 'Tab order: by default Safari skips buttons unless the "Press Tab to highlight each item" option is on.']},
  {name: 'VoiceOver with Safari (iOS)', how: 'Settings, Accessibility, VoiceOver. Swipe right and left to move, double tap to activate, rotor with a two finger twist.', watch: ['Touch targets: every control should be reachable with a swipe and big enough to hit.', 'Sliders adjust with a one finger swipe up and down: check Slider and Rating.', 'Overlays: the page behind must not be reachable while a dialog or drawer is open.']},
  {name: 'TalkBack with Chrome (Android)', how: 'Settings, Accessibility, TalkBack. Swipe right and left to move, double tap to activate, swipe up then right for the menu of reading controls.', watch: ['Live regions and toasts: TalkBack speaks them but can be slow to start.', 'Menus and selects open as native pickers on some controls: check that the choice is announced after closing.', 'Same touch target and overlay checks as VoiceOver on iOS.']},
];

const FLOWS = [
  ['Skip link, landmarks and headings', 'Reach the main content with the skip link, then list landmarks and headings. Expect one main, a named navigation, headings that do not skip a level.'],
  ['Button, icon button and a disabled button', 'Tab to each and listen to name, role and state. A loading button should say it is busy.'],
  ['A text field with a hint and an error (Field)', 'Tab into the field, then submit it invalid. Expect label, then hint, then the error read with the field, and the error announced when it appears.'],
  ['Checkbox, radio group and switch', 'Toggle each with Space; arrow through the radio group. Expect checked, not checked, and the group name.'],
  ['Select and combobox', 'Open each with the keyboard, move through options, choose one. Expect the options, the selected state, and the chosen value read back.'],
  ['Tabs', 'Arrow between tabs. Expect "selected", the tab count, and the panel name when you leave the tablist.'],
  ['Accordion', 'Open and close an item with Enter. Expect expanded or collapsed, and no stray "plus" or "minus".'],
  ['Dialog and alert dialog', 'Open from the trigger. Expect the title and description read once, focus inside, the page behind unreachable, and focus back on the trigger after Escape.'],
  ['Dropdown menu, menubar and context menu', 'Open with Enter, Space and the context key. Expect menu name, item names, arrow navigation, Escape returning focus.'],
  ['Popover, tooltip and drawer', 'Open each. The tooltip text should be read as a description of the control; the drawer behaves like a dialog.'],
  ['Toast and status messages', 'Trigger a toast and a data table sort without moving focus. Expect the text to be spoken once, politely (assertive only for errors).'],
  ['Form with an error summary', 'Submit empty. Expect the summary announced, each link jumping to its field, each invalid field reading its reason.'],
  ['Data table and data grid', 'Sort a column, move through a grid with the arrow keys, select a row. Expect column and row headers read with each cell, sort order announced, selected state.'],
  ['Calendar and date picker', 'Move by day, week and month, pick a date. Expect the full date read for each day, the month change announced, the chosen date read back in the field.'],
  ['Slider, rating, OTP input and file upload', 'Adjust the slider with arrows (value read each step), rate, type a code (focus moves, each digit named), choose a file (file name announced).'],
];

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const stateText = (n) => {
  const p = n.props; const out = [];
  for (const k of ['expanded', 'checked', 'selected', 'pressed', 'invalid', 'required', 'disabled', 'busy', 'modal', 'readonly']) if (k in p && (p[k] !== false || ['expanded', 'checked', 'selected', 'pressed'].includes(k))) out.push(`${k}=${p[k]}`);
  if (p.hasPopup) out.push(`hasPopup=${p.hasPopup}`);
  if (p.live) out.push(`live=${p.live}`);
  if (p.level) out.push(`level=${p.level}`);
  return out.join(', ') || 'none';
};

export function renderReport(results) {
  const L = [];
  const comps = results.filter((r) => !r.comp.id.startsWith('docs-'));
  const all = results.flatMap((r) => r.phases.flatMap((p) => p.findings.map((f) => ({...f, id: r.comp.id, phase: p.phase.name}))));
  const open = all.filter((f) => f.known);
  const failing = all.filter((f) => !f.known);
  L.push('# Accessibility tree report', '');
  L.push('> Generated by `npm run ax` (scripts/ax). Do not edit by hand: change `scripts/ax/expectations.mjs` and run it again.', '');
  L.push('## What this is, and what it is not', '');
  L.push('**This is an accessibility-tree check. It is not a screen reader test.** No NVDA, JAWS, VoiceOver or TalkBack testing has been done on Monoline, by anyone, yet. Nobody has listened to these components.', '');
  L.push('What the check does: it opens the built docs site in real Chrome, performs real key presses and clicks, reads the full accessibility tree that Chrome builds from the page (the same tree screen readers on Windows, macOS and Android read, through `Accessibility.getFullAXTree`), and asserts roles, names, states, relationships, focus and live regions against the expectations in `scripts/ax/expectations.mjs`.', '');
  L.push('What it cannot tell you: how a given screen reader words those things, whether the order and amount of speech is pleasant, whether a flow makes sense without sight, how virtual cursor and focus modes behave, how Safari or Firefox build their own trees, or anything about touch screen readers. The "expected announcement" below is built from the tree with a fixed template (name, role, state, then description). NVDA, JAWS and VoiceOver each word it differently. Treat it as what the tree says, not what you will hear.', '');
  L.push('## Summary', '');
  L.push(`- Components and examples checked: **${comps.length}**, plus the docs page landmarks and heading order.`);
  L.push(`- Checks that fail: **${failing.length}**. Open findings that are understood and not fixed: **${open.length}**.`);
  L.push(`- Problems found and fixed in components while building this check: **${FIXED.length} groups** (listed below).`);
  L.push('- Generic checks on every example: every control has a role and a non-empty name; no focusable element with no role ("generic"); `aria-labelledby` and `aria-describedby` resolve to text; an invalid field says why; every dialog has a name, a description (unless noted) and reports modal, and nothing outside it stays in the tree.');
  L.push('- Chrome does not surface `aria-current` or `aria-sort` in the tree through this protocol; those are read from the DOM and marked as such.', '');
  L.push('## Fixed because of this check', '');
  for (const [where, what] of FIXED) L.push(`- **${where}.** ${what}`);
  L.push('');
  L.push('## Open findings', '');
  if (!open.length && !failing.length) L.push('None.', '');
  const seen = new Set();
  for (const f of [...failing, ...open]) { const k = `${f.id}|${f.kind}|${f.msg}`; if (seen.has(k)) continue; seen.add(k); L.push(`- **${f.id}** (${f.phase}, ${f.kind})${f.known ? '' : ' **FAILING**'}: ${f.msg}${f.known ? ` Reason it stays open: ${f.known}` : ''}`); }
  L.push('');
  L.push('## What the owner should test by hand', '');
  L.push('Run these on real hardware or a real machine, with each assistive technology below, against the docs site or a page built from the components. Record what was said, not whether it "worked". Fifteen flows, in order of how much damage a failure would do:', '');
  FLOWS.forEach(([name, how], i) => L.push(`${i + 1}. **${name}.** ${how}`));
  L.push('');
  for (const at of ATS) {
    L.push(`### ${at.name}`, '', at.how, '', 'Run flows 1 to 15. Pay extra attention to:', '');
    for (const w of at.watch) L.push(`- ${w}`);
    L.push('', '- [ ] Flows 1 to 15 done, notes and failures filed as issues with the assistive technology, browser and version.', '');
  }
  L.push('## Per component', '', 'Each table lists the nodes the expectations name, in the state they were in after the steps shown. "Expected announcement" is the template described above.', '');
  for (const r of results) {
    L.push(`### ${r.comp.id}`, '', `Page \`${r.comp.route}\`${r.comp.example ? `, example "${r.comp.example}"` : ''}.`, '');
    if (r.error) { L.push(`**The check could not run:** ${r.error}`, ''); continue; }
    for (const p of r.phases) {
      L.push(`**${p.phase.name}**${(p.phase.steps ?? []).length ? ` (steps: ${p.phase.steps.map((s) => s.slice(0, 2).join(' ')).join(', then ')})` : ''}`, '');
      if (p.rows.some((x) => x.node)) {
        L.push('| Role | Name | States | Expected announcement |', '|---|---|---|---|');
        for (const x of p.rows.filter((y) => y.node)) L.push(`| ${esc(x.node.role)}${x.focus ? ' (focused)' : ''} | ${esc(x.node.name) || '(none)'} | ${esc(stateText(x.node))} | ${esc(announce(x.node))}${x.note ? ` *${esc(x.note)}*` : ''} |`);
        L.push('');
      }
      if (p.focused && p.phase.focus) L.push(`Focus after the steps: ${p.focused.role} "${p.focused.name}".`, '');
      const doms = p.rows.filter((x) => x.dom);
      if (doms.length) L.push(`Read from the DOM (not in the tree): ${doms.map((x) => `\`${x.dom.sel}\` has \`${x.dom.attr}\``).join('; ')}.`, '');
      for (const f of p.findings) L.push(`- ${f.known ? 'Open finding' : '**FAILING**'} (${f.kind}): ${f.msg}`);
      if (p.findings.length) L.push('');
    }
  }
  return L.join('\n') + '\n';
}
