// Reads Chrome's accessibility tree (what screen readers consume) over the DevTools protocol and turns it into
// plain objects. Used by scripts/ax/run.mjs. No dependencies.

const INTERACTIVE = new Set(['button', 'link', 'textbox', 'searchbox', 'checkbox', 'radio', 'switch', 'combobox', 'slider', 'spinbutton', 'tab', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'treeitem', 'listbox', 'menu', 'menubar', 'tablist', 'tree', 'grid', 'gridcell', 'columnheader', 'rowheader', 'row', 'PopUpButton', 'ComboBoxSelect', 'DisclosureTriangle', 'ColorWell', 'DateTime', 'Date', 'Time', 'TextField', 'ListBoxOption']);
/** Roles a user operates (needs a name). Containers like menu or grid are named only when they have no better label, so they are left out here. */
export const NAMED = new Set(['button', 'link', 'textbox', 'searchbox', 'checkbox', 'radio', 'switch', 'combobox', 'slider', 'spinbutton', 'tab', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'treeitem', 'PopUpButton', 'ComboBoxSelect', 'DisclosureTriangle']);
export const isInteractive = (n) => INTERACTIVE.has(n.role);

const val = (x) => (x && 'value' in x ? x.value : undefined);

/** One AX node as a flat object: role, name, description, value, props (normalised) and relations (text of related nodes). */
function toNode(a) {
  const props = {}; const rel = {};
  for (const p of a.properties ?? []) {
    const v = p.value?.value;
    if (p.value?.relatedNodes) rel[p.name] = p.value.relatedNodes.map((r) => (r.text ?? r.idref ?? '').trim());
    else props[p.name] = v === 'true' ? true : v === 'false' ? false : v;
  }
  return {
    id: a.nodeId, parent: a.parentId, children: a.childIds ?? [], backend: a.backendDOMNodeId, ignored: !!a.ignored,
    role: val(a.role) ?? '', name: String(val(a.name) ?? '').trim(), description: String(val(a.description) ?? '').trim(),
    value: val(a.value), props, rel,
  };
}

/** Full tree as an array of nodes with `.depth`, in document order. Ignored nodes are kept (flag `ignored`). */
export async function fullTree(cdp) {
  await cdp('Accessibility.enable');
  const {nodes} = await cdp('Accessibility.getFullAXTree');
  const byId = new Map(nodes.map((a) => [a.nodeId, toNode(a)]));
  const out = [];
  const root = nodes[0] && byId.get(nodes[0].nodeId);
  const walk = (n, depth) => { n.depth = depth; out.push(n); for (const c of n.children) { const k = byId.get(c); if (k) walk(k, depth + 1); } };
  if (root) walk(root, 0);
  return out;
}

/** Backend node ids of every element matching any selector (or a list of selectors) and all their descendants. Null if nothing matches. */
export async function domSubtree(cdp, selectors) {
  const {root} = await cdp('DOM.getDocument', {depth: 0});
  const ids = new Set(); let any = false;
  const walk = (n) => { ids.add(n.backendNodeId); (n.children ?? []).forEach(walk); if (n.contentDocument) walk(n.contentDocument); (n.shadowRoots ?? []).forEach(walk); };
  for (const selector of [].concat(selectors)) {
    const {nodeIds} = await cdp('DOM.querySelectorAll', {nodeId: root.nodeId, selector});
    for (const nodeId of nodeIds) { if (!nodeId) continue; const {node} = await cdp('DOM.describeNode', {nodeId, depth: -1, pierce: true}); walk(node); any = true; }
  }
  return any ? {ids} : null;
}

/** The AX node for document.activeElement, or null. */
export async function focusedNode(cdp, nodes) {
  const r = await cdp('Runtime.evaluate', {expression: 'document.activeElement'});
  if (!r.result?.objectId) return null;
  const {node} = await cdp('DOM.describeNode', {objectId: r.result.objectId});
  return nodes.find((n) => n.backend === node.backendNodeId) ?? null;
}

/** Nodes of the tree whose DOM element is inside `scope` ({ids}). With no scope, everything. */
export const inScope = (nodes, scope) => (scope ? nodes.filter((n) => n.backend && scope.ids.has(n.backend)) : nodes);

// --- what a screen reader would say (approximation: JAWS, NVDA and VoiceOver word these differently)
const ROLE_WORD = {textbox: 'edit text', searchbox: 'search edit', checkbox: 'check box', radio: 'radio button', switch: 'switch', combobox: 'combo box', slider: 'slider', spinbutton: 'spin button', tab: 'tab', menuitem: 'menu item', menuitemcheckbox: 'menu item check box', menuitemradio: 'menu item radio button', option: 'option', treeitem: 'tree item', PopUpButton: 'pop up button', ComboBoxSelect: 'combo box', alertdialog: 'alert dialog', DisclosureTriangle: 'disclosure', listbox: 'list box', tablist: 'tab list', columnheader: 'column header', rowheader: 'row header', gridcell: 'cell', progressbar: 'progress bar', menubar: 'menu bar'};
/** "name, role, state, state. description" for a node. */
export function announce(n) {
  const p = n.props; const parts = [];
  if (n.name) parts.push(n.name);
  const word = ROLE_WORD[n.role] ?? n.role;
  parts.push(n.role === 'heading' && p.level ? `heading level ${p.level}` : word);
  if (p.hasPopup && p.hasPopup !== 'false') parts.push(p.hasPopup === true || p.hasPopup === 'true' ? 'has popup' : `has popup ${p.hasPopup}`);
  if ('expanded' in p) parts.push(p.expanded ? 'expanded' : 'collapsed');
  if ('checked' in p) parts.push(p.checked === 'mixed' ? 'partially checked' : p.checked ? 'checked' : 'not checked');
  if ('pressed' in p) parts.push(p.pressed === 'mixed' ? 'partially pressed' : p.pressed ? 'pressed' : 'not pressed');
  if (p.selected) parts.push('selected');
  if (p.current && p.current !== 'false') parts.push(p.current === true || p.current === 'true' ? 'current' : `current ${p.current}`);
  if (p.invalid && p.invalid !== 'false') parts.push('invalid entry');
  if (p.required) parts.push('required');
  if (p.readonly) parts.push('read only');
  if (p.disabled) parts.push('unavailable');
  if (p.busy) parts.push('busy');
  if (p.modal) parts.push('modal');
  if (n.value !== undefined && n.value !== '' && !['button', 'checkbox', 'radio', 'switch', 'tab', 'link', 'menuitem'].includes(n.role)) parts.push(`value ${n.value}${p.valuetext ? ` (${p.valuetext})` : ''}`);
  let s = parts.join(', ');
  if (n.description) s += `. ${n.description}`;
  return s;
}
