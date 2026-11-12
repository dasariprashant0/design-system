// Hand-written playground configs for components that cannot be rendered from their props alone
// (compound parts, required props, a trigger that needs a child). Every other component with variant, size,
// boolean or string props gets a playground derived from the generated props JSON (see playground.tsx).
//
// A config builds a small element tree (`Node`) from the current control values. The same tree is rendered
// live and printed as the JSX snippet, so the preview and the code can never disagree.

export type Val = string | number | boolean | undefined;
export type Values = Record<string, Val>;

/**
 * A component by its `@monoline/react` export name (or a lowercase HTML tag), its props, and its children.
 * A prop value written as `'{() => {}}'` renders as a no-op function and prints as that source.
 */
export type Node = string | {c: string; p?: Values; k?: Node[]};

export type Control =
  | {name: string; kind: 'select'; options: string[]; initial?: string; description?: string}
  | {name: string; kind: 'switch'; initial?: boolean; description?: string}
  | {name: string; kind: 'text'; initial?: string; description?: string}
  | {name: string; kind: 'number'; initial?: number; min?: number; max?: number; step?: number; description?: string};

export interface PlaygroundConfig {
  /** Name of the Props type to derive controls from. Defaults to `<ImportName>Props`. */
  props?: string;
  /** Replaces the derived controls when set. */
  controls?: Control[];
  /** Added after the derived controls. */
  extra?: Control[];
  /** Prop names to leave out of the derived controls. */
  skip?: string[];
  /** Builds the element tree from the control values. */
  build: (v: Values) => Node;
}

const el = (c: string, p?: Values, ...k: Node[]): Node => ({c, p, k});
/** Keep a value only when it differs from the component's default, so snippets stay short. */
const diff = (v: Val, d?: Val): Val => (v === '' || v === d ? undefined : v);
const text = (v: Val, fallback: string) => (typeof v === 'string' && v ? v : fallback);

/** Props added to an automatic playground for components that render a bare control and need an accessible name. */
export const autoProps: Record<string, Values> = {
  autocomplete: {'aria-label': 'Fruit'},
  'number-input': {'aria-label': 'Quantity'},
  'rich-text-editor': {'aria-label': 'Notes'},
  'tags-input': {'aria-label': 'Tags'},
  'time-picker': {'aria-label': 'Start time'},
};

export const playgrounds: Record<string, PlaygroundConfig> = {
  button: {
    extra: [{name: 'disabled', kind: 'switch'}, {name: 'children', kind: 'text', initial: 'Save changes'}],
    skip: ['asChild'],
    build: (v) => el('Button', {variant: diff(v.variant, 'line'), size: diff(v.size, 'md'), loading: v.loading || undefined, disabled: v.disabled || undefined}, text(v.children, 'Save changes')),
  },
  badge: {
    extra: [{name: 'children', kind: 'text', initial: 'New'}],
    build: (v) => el('Badge', {variant: diff(v.variant, 'outline')}, text(v.children, 'New')),
  },
  input: {
    controls: [
      {name: 'size', kind: 'select', options: ['md', 'sm']},
      {name: 'placeholder', kind: 'text', initial: 'you@example.com'},
      {name: 'invalid', kind: 'switch'},
      {name: 'disabled', kind: 'switch'},
    ],
    build: (v) => el('Input', {'aria-label': 'Email', size: diff(v.size, 'md'), placeholder: diff(v.placeholder), invalid: v.invalid || undefined, disabled: v.disabled || undefined}),
  },
  textarea: {
    controls: [
      {name: 'placeholder', kind: 'text', initial: 'Tell us more'},
      {name: 'rows', kind: 'number', initial: 3, min: 2, max: 8},
      {name: 'invalid', kind: 'switch'},
      {name: 'disabled', kind: 'switch'},
    ],
    build: (v) => el('Textarea', {'aria-label': 'Message', rows: diff(v.rows, 3), placeholder: diff(v.placeholder), invalid: v.invalid || undefined, disabled: v.disabled || undefined}),
  },
  select: {
    controls: [{name: 'invalid', kind: 'switch'}, {name: 'disabled', kind: 'switch'}, {name: 'placeholder', kind: 'text', initial: 'Pick a fruit'}],
    build: (v) => el('Select', {disabled: v.disabled || undefined}, el('SelectTrigger', {'aria-label': 'Fruit', invalid: v.invalid || undefined}, el('SelectValue', {placeholder: text(v.placeholder, 'Pick a fruit')})),
      el('SelectContent', {}, el('SelectItem', {value: 'apple'}, 'Apple'), el('SelectItem', {value: 'pear'}, 'Pear'), el('SelectItem', {value: 'plum'}, 'Plum'))),
  },
  'native-select': {
    controls: [{name: 'invalid', kind: 'switch'}, {name: 'disabled', kind: 'switch'}],
    build: (v) => el('NativeSelect', {'aria-label': 'Fruit', invalid: v.invalid || undefined, disabled: v.disabled || undefined}, el('option', {value: 'apple'}, 'Apple'), el('option', {value: 'pear'}, 'Pear'), el('option', {value: 'plum'}, 'Plum')),
  },
  checkbox: {
    controls: [{name: 'label', kind: 'text', initial: 'Email me updates'}, {name: 'invalid', kind: 'switch'}, {name: 'disabled', kind: 'switch'}, {name: 'defaultChecked', kind: 'switch'}],
    build: (v) => el('Checkbox', {label: text(v.label, 'Email me updates'), invalid: v.invalid || undefined, disabled: v.disabled || undefined, defaultChecked: v.defaultChecked || undefined}),
  },
  switch: {
    controls: [{name: 'label', kind: 'text', initial: 'Airplane mode'}, {name: 'disabled', kind: 'switch'}, {name: 'defaultChecked', kind: 'switch'}],
    build: (v) => el('Switch', {label: text(v.label, 'Airplane mode'), disabled: v.disabled || undefined, defaultChecked: v.defaultChecked || undefined}),
  },
  slider: {
    controls: [
      {name: 'defaultValue', kind: 'number', initial: 40, min: 0, max: 100},
      {name: 'min', kind: 'number', initial: 0, min: 0, max: 50},
      {name: 'max', kind: 'number', initial: 100, min: 60, max: 200},
      {name: 'step', kind: 'number', initial: 1, min: 1, max: 20},
      {name: 'disabled', kind: 'switch'},
    ],
    build: (v) => el('Slider', {'aria-label': 'Volume', defaultValue: v.defaultValue, min: diff(v.min, 0), max: diff(v.max, 100), step: diff(v.step, 1), disabled: v.disabled || undefined}),
  },
  tabs: {
    controls: [{name: 'orientation', kind: 'select', options: ['horizontal', 'vertical'], initial: 'horizontal'}],
    build: (v) => el('Tabs', {defaultValue: 'overview', orientation: diff(v.orientation, 'horizontal')},
      el('TabsList', {'aria-label': 'Project'}, el('TabsTrigger', {value: 'overview'}, 'Overview'), el('TabsTrigger', {value: 'activity'}, 'Activity'), el('TabsTrigger', {value: 'settings'}, 'Settings')),
      el('TabsContent', {value: 'overview'}, 'Overview content.'), el('TabsContent', {value: 'activity'}, 'Activity content.'), el('TabsContent', {value: 'settings'}, 'Settings content.')),
  },
  alert: {
    controls: [
      {name: 'tone', kind: 'select', options: ['info', 'success', 'warning', 'danger'], initial: 'info'},
      {name: 'title', kind: 'text', initial: 'Heads up'},
      {name: 'children', kind: 'text', initial: 'Your trial ends in three days.'},
    ],
    build: (v) => el('Alert', {tone: diff(v.tone, 'info'), title: text(v.title, 'Heads up')}, text(v.children, 'Your trial ends in three days.')),
  },
  avatar: {
    controls: [
      {name: 'name', kind: 'text', initial: 'Ada Lovelace'},
      {name: 'size', kind: 'select', options: ['md', 'lg'], initial: 'md'},
      {name: 'variant', kind: 'select', options: ['solid', 'line'], initial: 'solid'},
    ],
    build: (v) => el('Avatar', {name: text(v.name, 'Ada Lovelace'), size: diff(v.size, 'md'), variant: diff(v.variant, 'solid')}),
  },
  progress: {
    controls: [{name: 'value', kind: 'number', initial: 60, min: 0, max: 100}, {name: 'indeterminate', kind: 'switch'}],
    build: (v) => el('Progress', {'aria-label': 'Upload', value: v.indeterminate ? undefined : v.value}),
  },
  tag: {
    controls: [{name: 'children', kind: 'text', initial: 'design'}, {name: 'removable', kind: 'switch'}],
    build: (v) => el('Tag', {label: v.removable ? `Remove ${text(v.children, 'design')}` : undefined, onRemove: v.removable ? '{() => {}}' : undefined}, text(v.children, 'design')),
  },
  card: {
    controls: [{name: 'interactive', kind: 'switch'}, {name: 'title', kind: 'text', initial: 'Team plan'}, {name: 'footer', kind: 'switch', initial: true}],
    build: (v) => el('Card', {interactive: v.interactive || undefined},
      el('CardHeader', {}, el('CardTitle', {}, text(v.title, 'Team plan')), el('CardDescription', {}, 'Shared projects and roles.')),
      el('CardContent', {}, 'Up to 20 people. Billed monthly.'),
      ...(v.footer ? [el('CardFooter', {}, el('Button', {variant: 'solid'}, 'Choose plan'))] : [])),
  },
  dialog: {
    controls: [{name: 'showClose', kind: 'switch', initial: true}, {name: 'title', kind: 'text', initial: 'Delete project'}],
    build: (v) => el('Dialog', {},
      el('DialogTrigger', {asChild: true}, el('Button', {}, 'Open dialog')),
      el('DialogContent', {showClose: v.showClose ? undefined : false},
        el('DialogHeader', {}, el('DialogTitle', {}, text(v.title, 'Delete project')), el('DialogDescription', {}, 'This removes the project and its files. You cannot undo it.')),
        el('DialogFooter', {}, el('DialogClose', {asChild: true}, el('Button', {}, 'Cancel')), el('Button', {variant: 'danger'}, 'Delete')))),
  },
  tooltip: {
    controls: [
      {name: 'side', kind: 'select', options: ['top', 'right', 'bottom', 'left'], initial: 'top'},
      {name: 'content', kind: 'text', initial: 'Saved to ~/Notes'},
      {name: 'defaultOpen', kind: 'switch', initial: true},
    ],
    build: (v) => el('TooltipProvider', {}, el('Tooltip', {content: text(v.content, 'Saved to ~/Notes'), side: diff(v.side, 'top'), defaultOpen: v.defaultOpen || undefined}, el('Button', {}, 'Hover or focus me'))),
  },
  popover: {
    controls: [
      {name: 'side', kind: 'select', options: ['top', 'right', 'bottom', 'left'], initial: 'bottom'},
      {name: 'align', kind: 'select', options: ['start', 'center', 'end'], initial: 'start'},
    ],
    build: (v) => el('Popover', {},
      el('PopoverTrigger', {asChild: true}, el('Button', {}, 'Open popover')),
      el('PopoverContent', {side: diff(v.side, 'bottom'), align: diff(v.align, 'start')}, el('p', {}, 'Dimensions'), 'Set the width and height of the layer.')),
  },
  'code-block': {
    controls: [{name: 'title', kind: 'text', initial: 'app.tsx'}, {name: 'lineNumbers', kind: 'switch'}, {name: 'hideCopy', kind: 'switch'}],
    build: (v) => el('CodeBlock', {title: diff(v.title), language: 'tsx', code: "const total = items.reduce((sum, i) => sum + i.price, 0);\nconsole.log(total);", lineNumbers: v.lineNumbers || undefined, hideCopy: v.hideCopy || undefined}),
  },
};
