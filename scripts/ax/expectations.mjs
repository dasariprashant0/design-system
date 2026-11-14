// What a screen reader user should get from each example, written as data. To add a component, append one entry.
//
//   id        unique, shown in the report
//   route     docs route, e.g. 'components/button'
//   example   title of the live example on that page (its preview is the default scope, plus anything portalled to <body>)
//   phases[]  run in order on one page load; `reset: true` reloads first
//     name      shown in the report
//     steps     real input: ['click', spec] ['rclick', spec] ['focus', spec] ['hover', spec] ['key', 'Enter'] ['keys', 'ArrowDown', 'Enter']
//               ['type', 'ab'] ['tab', n] ['wait', ms] ['eval', js]. A spec is a CSS selector, optionally 'selector|text'. It is looked up inside the example's
//               preview; start it with ^ to look on the whole page (overlays are portalled out of the example).
//     scope     'page', or a CSS selector, to narrow the tree to (e.g. '[role=dialog]'). Default: the example preview plus <body> portals.
//     expect[]  {role, name?, value?, states?, description?, rel?, count?, nth?, note?}: a non-ignored node with this role and name (string or RegExp)
//               and these properties. states keys: expanded checked selected pressed disabled invalid required busy live atomic modal hasPopup level
//               readonly valuemin valuemax orientation multiselectable (false matches "absent"). rel: {labelledby|describedby|controls|...: text}.
//     focus     {role, name?, states?, activedescendant?, controls?}: the node that has focus after the steps
//     dom[]     {sel, attr, value}: attributes Chrome does not surface in the tree (aria-current, aria-sort)
//     modal     true: the overlay is a modal dialog and nothing outside it is reachable
//     known     {kind: 'reason'}: a finding that is understood and not fixed. It shows in the report as open and does not fail the run.
//   Every phase also gets the generic checks in run.mjs: named controls, no focusable generics, labelledby and describedby resolve, dialogs have a name
//   and a description (unless noDescription), invalid controls explain why (unless allowInvalidWithoutMessage).
const D = '[role=dialog]';
export const pageChecks = [
  {id: 'docs-page-structure', route: 'components/button', phases: [{
    name: 'landmarks and headings', scope: 'page', known: {check: 'The docs sidebar is a second unnamed complementary landmark (apps/docs shell, not a component).', generic: 'Scrollable code blocks and panels in the docs page are focusable regions without a role (apps/docs, not a component).'},
    expect: [{role: 'main', count: 1}, {role: 'navigation', name: 'Main'}, {role: 'banner', count: 1}, {role: 'heading', states: {level: 1}}],
    after: ({nodes}) => {
      const live = nodes.filter((n) => !n.ignored);
      const out = []; let last = 0;
      for (const h of live.filter((n) => n.role === 'heading')) { const l = h.props.level; if (last && l > last + 1) out.push(`heading "${h.name}" jumps from level ${last} to ${l}`); last = l; }
      for (const r of ['navigation', 'complementary']) for (const n of live.filter((x) => x.role === r)) if (!n.name && live.filter((x) => x.role === r).length > 1) out.push(`more than one ${r} landmark and this one has no name`);
      return out;
    },
  }]},
];

export const components = [
  {id: 'button', route: 'components/button', example: 'States', phases: [{name: 'rest',
    expect: [{role: 'button', name: 'Small'}, {role: 'button', name: 'Disabled', states: {disabled: true}}, {role: 'button', name: 'Saving', states: {disabled: true, busy: true}, note: 'The loading state is busy and unavailable.'}]}]},
  {id: 'icon-button', route: 'components/icon-button', example: 'Variants', phases: [{name: 'rest', expect: [{role: 'button', name: 'Add'}, {role: 'button', name: 'Add item'}, {role: 'button', name: 'Add row'}]}]},
  {id: 'input', route: 'components/input', example: 'States', phases: [{name: 'rest', allowInvalidWithoutMessage: true,
    expect: [{role: 'textbox', name: 'Invalid', states: {invalid: true}, note: 'A bare Input only sets aria-invalid; the reason comes from Field (see field-error).'}, {role: 'textbox', name: 'Disabled', states: {disabled: true}}, {role: 'textbox', name: 'Read only', states: {readonly: true}}]}]},
  {id: 'textarea', route: 'components/textarea', example: 'Basic', phases: [{name: 'rest', expect: [{role: 'textbox', name: 'Notes'}]}]},
  {id: 'field-error', route: 'components/field', example: 'With an error', phases: [{name: 'rest',
    expect: [{role: 'textbox', name: 'Days', states: {invalid: true}, description: 'Enter a number, such as 30.', rel: {describedby: /Enter a number|error/, labelledby: /days/i}}, {role: 'alert', states: {live: 'assertive'}, note: 'The error text is announced when it appears.'}]}]},
  {id: 'checkbox', route: 'components/checkbox', example: 'Indeterminate', phases: [{name: 'rest', expect: [{role: 'checkbox', name: 'Select all', states: {checked: 'mixed'}}]}]},
  {id: 'radio-group', route: 'components/radio-group', example: 'Basic', phases: [
    {name: 'rest', expect: [{role: 'radiogroup', name: 'Plan'}, {role: 'radio', name: 'Monthly', states: {checked: true}}, {role: 'radio', name: 'Yearly', states: {checked: false}}]},
    {name: 'ArrowDown moves and selects', steps: [['focus', '[role=radio]'], ['key', 'ArrowDown']], focus: {role: 'radio', name: 'Yearly', states: {checked: true}}}]},
  {id: 'switch', route: 'components/switch', example: 'Basic', phases: [{name: 'rest', expect: [{role: 'switch', name: 'Launch at login', states: {checked: true}}, {role: 'switch', name: 'Weekly digest', states: {checked: false}}, {role: 'switch', name: 'Locked', states: {disabled: true}}]}]},
  {id: 'select', route: 'components/select', example: 'In a field', phases: [
    {name: 'closed', expect: [{role: 'combobox', name: 'Sync every', states: {expanded: false, hasPopup: 'listbox'}}]},
    {name: 'open', steps: [['click', '[role=combobox]']], scope: '[role=listbox]', expect: [{role: 'option', name: '15 minutes', states: {selected: true}}, {role: 'option', name: '5 minutes', states: {selected: false}}], focus: {role: 'option', name: '15 minutes'}}]},
  {id: 'native-select', route: 'components/native-select', example: 'In a field', phases: [{name: 'rest', expect: [{role: 'combobox', name: 'Plan', value: 'Pro'}]}]},
  {id: 'combobox', route: 'components/combobox', example: 'Search and pick', phases: [
    {name: 'closed', expect: [{role: 'combobox', name: 'Person', states: {expanded: false, hasPopup: 'listbox'}}]},
    {name: 'ArrowDown opens the list', steps: [['focus', 'input'], ['key', 'ArrowDown']],
      expect: [{role: 'listbox', name: 'Person'}, {role: 'option', name: 'Ada Lovelace'}], focus: {role: 'combobox', name: 'Person', states: {expanded: true}, activedescendant: /./, controls: true}}]},
  {id: 'command', route: 'components/command', example: 'Palette', phases: [
    {name: 'closed', expect: [{role: 'button', name: 'Open palette', states: {hasPopup: 'dialog', expanded: false}}]},
    {name: 'open', steps: [['click', 'button|Open palette'], ['wait', 300], ['key', 'ArrowDown']], scope: D, modal: true, noDescription: true,
      expect: [{role: 'dialog', name: 'Command palette', states: {modal: true}}, {role: 'listbox', name: 'Command palette'}, {role: 'option', name: 'Open file'}, {role: 'status', states: {live: 'polite'}, note: 'Result counts are announced politely as the list filters.'}],
      focus: {role: 'combobox', name: 'Command palette', states: {expanded: true}, activedescendant: /./, controls: true}}]},
  {id: 'tabs', route: 'components/tabs', example: 'Horizontal', phases: [{name: 'ArrowRight selects the next tab', steps: [['focus', '[role=tab]'], ['key', 'ArrowRight']],
    expect: [{role: 'tablist', name: 'Project', states: {orientation: 'horizontal'}}, {role: 'tab', name: 'Activity', states: {selected: true}, rel: {controls: /./}}, {role: 'tab', name: 'Overview', states: {selected: false}}, {role: 'tabpanel', name: 'Activity', rel: {labelledby: 'Activity'}}], focus: {role: 'tab', name: 'Activity', states: {selected: true}}}]},
  {id: 'accordion', route: 'components/accordion', example: 'Single, collapsible', phases: [
    {name: 'rest', expect: [{role: 'button', name: 'What is Monoline?', states: {expanded: true}, rel: {controls: /./}}, {role: 'button', name: 'Do I need React?', states: {expanded: false}}, {role: 'region', name: 'What is Monoline?'}]},
    {name: 'Enter on the first trigger collapses it', steps: [['focus', 'button|What is Monoline'], ['key', 'Enter']], expect: [{role: 'button', name: 'What is Monoline?', states: {expanded: false}}], focus: {role: 'button', name: 'What is Monoline?'}}]},
  {id: 'dialog', route: 'components/dialog', example: 'Confirm', phases: [
    {name: 'closed', expect: [{role: 'button', name: 'Overwrite copy', states: {hasPopup: 'dialog', expanded: false}}]},
    {name: 'open', steps: [['click', 'button|Overwrite copy']], scope: D, modal: true,
      expect: [{role: 'dialog', name: 'Overwrite the remote copy?', states: {modal: true}, description: /newer/, rel: {labelledby: /Overwrite/, describedby: /./}}, {role: 'button', name: 'Close'}], focus: {role: 'button', name: 'Keep both'}}]},
  {id: 'alert-dialog', route: 'components/alert-dialog', example: 'Confirm a deletion', phases: [{name: 'open', steps: [['click', 'button|Delete']], scope: '[role=alertdialog]', modal: true,
    expect: [{role: 'alertdialog', name: 'Delete this project?', states: {modal: true}, description: /cannot be undone/}], focus: {role: 'button', name: 'Keep it'}}]},
  {id: 'drawer', route: 'components/drawer', example: 'Right and left', phases: [{name: 'open', steps: [['click', 'button|Open right']], scope: D, modal: true,
    expect: [{role: 'dialog', name: 'Filters', states: {modal: true}, description: /Narrow the list/}, {role: 'button', name: 'Close'}], focus: {role: 'button', name: 'Close'}}]},
  {id: 'dropdown-menu', route: 'components/dropdown-menu', example: 'Actions', phases: [{name: 'open', steps: [['click', 'button|Actions']], scope: '[role=menu]',
    expect: [{role: 'menu', name: 'Actions'}, {role: 'menuitem', name: 'Rename'}, {role: 'menuitem', name: 'Delete'}], focus: {role: 'menu', name: 'Actions'}}]},
  {id: 'menubar', route: 'components/menubar', example: 'App menu', phases: [
    {name: 'closed', expect: [{role: 'menubar', name: 'Application', states: {orientation: 'horizontal'}}, {role: 'menuitem', name: 'File', states: {hasPopup: 'menu', expanded: false}}]},
    {name: 'open', steps: [['click', '[role=menuitem]|File']], expect: [{role: 'menuitem', name: 'File', states: {expanded: true}, rel: {controls: /./}}, {role: 'menu', name: 'File'}, {role: 'menuitem', name: 'Quit'}], focus: {role: 'menu', name: 'File'}}]},
  {id: 'context-menu', route: 'components/context-menu', example: 'Right click the box', phases: [{name: 'open', steps: [['rclick', 'div']], scope: '[role=menu]',
    expect: [{role: 'menu', name: 'File actions'}, {role: 'menuitem', name: 'Rename'}], focus: {role: 'menu', name: 'File actions'}}]},
  {id: 'popover', route: 'components/popover', example: 'Basic', phases: [{name: 'open', steps: [['click', 'button']], scope: D, noDescription: true,
    expect: [{role: 'dialog', name: 'Entry details', states: {modal: false}}], focus: {role: 'dialog', name: 'Entry details'}}]},
  {id: 'tooltip', route: 'components/tooltip', example: 'Basic', phases: [{name: 'focus shows the tip', steps: [['focus', 'button|Save']],
    expect: [{role: 'tooltip', name: 'Saved to ~/Notes'}, {role: 'button', name: 'Save', description: 'Saved to ~/Notes', rel: {describedby: /./}, note: 'The tip is read as the description of the button.'}], focus: {role: 'button', name: 'Save'}}]},
  {id: 'toast', route: 'components/toast', example: 'Trigger a toast', phases: [{name: 'shown', steps: [['click', 'button|Save draft']],
    expect: [{role: 'region', name: 'Notifications'}, {role: 'button', name: 'Undo'}, {role: 'button', name: 'Dismiss'}, {role: 'status', states: {live: /assertive|polite/}, note: 'Radix announces the toast text in a live region outside the list.'}], focus: {role: 'button', name: 'Save draft'}, known: {generic: 'Radix Toast viewport: two unnamed focusable proxy elements that hand focus to the first and last toast. Upstream behaviour, reachable by Tab only while a toast is open.'}}]},
  {id: 'toaster', route: 'components/toaster', example: 'Call toast() from any handler', phases: [{name: 'shown', steps: [['click', 'button|Default']],
    expect: [{role: 'region', name: /Notifications/}, {role: 'button', name: 'Dismiss'}, {role: 'status', states: {live: 'polite'}, note: 'Toast text is announced politely.'}], focus: {role: 'button', name: 'Default'}, known: {generic: 'Radix Toast viewport: two unnamed focusable proxy elements that hand focus to the first and last toast. Upstream behaviour, reachable by Tab only while a toast is open.'}}]},
  {id: 'slider', route: 'components/slider', example: 'Single and range', phases: [{name: 'ArrowRight raises the value', steps: [['focus', '[role=slider]'], ['key', 'ArrowRight']],
    expect: [{role: 'slider', name: 'Volume', states: {valuemin: 0, valuemax: 100, orientation: 'horizontal'}}, {role: 'slider', name: 'Price minimum'}, {role: 'slider', name: 'Price maximum'}], focus: {role: 'slider', name: 'Volume'}}]},
  {id: 'progress', route: 'components/progress', example: 'Determinate and indeterminate', phases: [{name: 'rest', expect: [{role: 'progressbar', name: 'Upload', states: {valuemin: 0, valuemax: 100}}, {role: 'progressbar', name: 'Waiting', note: 'Indeterminate: no value, so the screen reader does not claim a percentage.'}]}]},
  {id: 'alert', route: 'components/alert', example: 'Tones', phases: [{name: 'rest', expect: [{role: 'status', states: {live: 'polite'}, count: 2}, {role: 'alert', states: {live: 'assertive'}, count: 2}]}]},
  {id: 'breadcrumb', route: 'components/breadcrumb', example: 'Basic', phases: [{name: 'rest', expect: [{role: 'navigation', name: 'Breadcrumb'}, {role: 'link', name: 'Home'}, {role: 'link', name: 'Projects'}], dom: [{sel: 'nav[aria-label=Breadcrumb] [aria-current]', attr: 'aria-current', value: 'page'}]}]},
  {id: 'pagination', route: 'components/pagination', example: 'With gaps', phases: [{name: 'rest', expect: [{role: 'navigation', name: 'Pagination'}, {role: 'button', name: 'Page 5'}, {role: 'button', name: 'Prev'}, {role: 'button', name: 'Next'}], dom: [{sel: 'nav[aria-label=Pagination] [aria-current]', attr: 'aria-current', value: /./}]}]},
  {id: 'table', route: 'components/table', example: 'Basic', phases: [{name: 'rest', expect: [{role: 'table', name: 'Team members'}, {role: 'columnheader', name: 'Name'}, {role: 'cell', name: 'Ada Lovelace'}]}]},
  {id: 'data-table', route: 'components/data-table', example: 'Sortable', phases: [
    {name: 'rest', expect: [{role: 'columnheader', name: 'Name'}, {role: 'button', name: 'Name'}, {role: 'status', states: {live: 'polite'}}]},
    {name: 'Enter on a header sorts', steps: [['focus', 'th button|Name'], ['key', 'Enter']], dom: [{sel: 'th[aria-sort]', attr: 'aria-sort', value: /ascending|descending/}], focus: {role: 'button', name: 'Name'}}]},
  {id: 'data-grid', route: 'components/data-grid', example: 'Row selection', phases: [
    {name: 'rest', expect: [{role: 'grid', name: 'Orders, selectable', states: {multiselectable: true}}, {role: 'columnheader', name: 'Order'}, {role: 'row', name: /^ORD-1 /, states: {selected: false}}, {role: 'status', states: {live: 'polite'}}]},
    {name: 'ArrowDown moves the active cell', steps: [['focus', '[role=gridcell]'], ['key', 'ArrowDown']], focus: {role: 'gridcell', name: 'ORD-2'}}]},
  {id: 'tree', route: 'components/tree', example: 'File tree', phases: [{name: 'ArrowRight inside the tree', steps: [['focus', '[role=treeitem]'], ['key', 'ArrowRight']],
    expect: [{role: 'tree', name: 'Project files'}, {role: 'treeitem', name: 'src', states: {expanded: true, level: 1}}, {role: 'treeitem', name: 'docs', states: {expanded: false}}, {role: 'treeitem', name: 'button.tsx', states: {level: 3}}], focus: {role: 'treeitem', name: 'components', states: {level: 2, expanded: true}}}]},
  {id: 'calendar', route: 'components/calendar', example: 'Pick a date', phases: [{name: 'ArrowRight moves one day', steps: [['focus', '[role=gridcell] button'], ['key', 'ArrowRight']],
    expect: [{role: 'grid', name: 'November 2026'}, {role: 'button', name: 'Previous month'}, {role: 'button', name: 'Next month'}, {role: 'columnheader', name: 'MO'}], focus: {role: 'button', name: /^\w+, (\d+ \w+|\w+ \d+), \d{4}$|^\w+, \d+ \w+ \d{4}$/}}]},
  {id: 'date-picker', route: 'components/date-picker', example: 'In a field', phases: [
    {name: 'closed', expect: [{role: 'button', name: 'Due date', states: {hasPopup: 'dialog', expanded: false}}]},
    {name: 'open', steps: [['click', 'button']], scope: D, noDescription: true, expect: [{role: 'dialog', name: 'Choose a date'}, {role: 'grid', name: /\d{4}/}], focus: {role: 'button', name: /\d{4}$/}}]},
  {id: 'otp-input', route: 'components/otp-input', example: 'Six digits', phases: [{name: 'typing moves to the next digit', steps: [['focus', 'input'], ['type', '12']],
    expect: [{role: 'group', name: 'Verification code'}, {role: 'textbox', name: 'Digit 1 of 6'}, {role: 'textbox', name: 'Digit 6 of 6'}, {role: 'status', states: {live: 'polite'}}], focus: {role: 'textbox', name: 'Digit 3 of 6'}}]},
  {id: 'rating', route: 'components/rating', example: 'Editable', phases: [{name: 'focus', steps: [['focus', 'input[type=radio]']],
    expect: [{role: 'radiogroup', name: 'Rate this page'}, {role: 'radio', name: '3 of 5', states: {checked: true}}], focus: {role: 'radio', name: '1 of 5'}}]},
  {id: 'carousel', route: 'components/carousel', example: 'Cards', phases: [{name: 'rest',
    expect: [{role: 'region', name: 'Featured'}, {role: 'group', name: 'Featured slides'}, {role: 'group', name: '1 of 4'}, {role: 'button', name: 'Previous slide'}, {role: 'button', name: 'Next slide'}]}]},
  {id: 'stepper', route: 'components/stepper', example: 'Checkout', phases: [{name: 'rest', expect: [{role: 'list', name: 'Checkout'}, {role: 'listitem'}], dom: [{sel: '[aria-current=step]', attr: 'aria-current', value: 'step'}]}]},
  {id: 'file-upload', route: 'components/file-upload', example: 'Multiple files', phases: [{name: 'rest', expect: [{role: 'button', name: /Drop files here/}, {role: 'status', states: {live: 'polite'}, note: 'Chosen files are announced politely.'}]}]},
  {id: 'form-error-summary', route: 'components/form', example: 'With an error summary', phases: [
    {name: 'rest', expect: [{role: 'form', name: 'Contact'}, {role: 'textbox', name: 'Name'}, {role: 'textbox', name: 'Email'}, {role: 'button', name: 'Send'}]},
    {name: 'submit with empty fields', steps: [['click', 'button|Send']],
      expect: [{role: 'alert', states: {live: 'assertive'}, note: 'The summary is announced when it appears.'}, {role: 'link', name: 'Enter your name.'}, {role: 'textbox', name: 'Name', states: {invalid: true}, description: 'Enter your name.', rel: {describedby: /error|name/i}}, {role: 'textbox', name: 'Email', states: {invalid: true}, description: 'Enter your email.'}]}]},
];
