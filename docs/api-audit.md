# API audit

Last updated 2026-11-13. Scope: the public props of every component in `packages/react/src/components/*/<name>.tsx` (114 components), checked against `AGENTS.md` and the conventions of shadcn/ui, Mantine, Base UI, Radix and Chakra (`docs/research/*.md`). The rule while fixing: add props, never rename or remove; the consistent name becomes primary and the old one stays as a deprecated alias with a test.

Method: the props below were extracted from the `*Props` types with the TypeScript compiler (`interface`/`type` members, `extends` clauses), then each divergent family was read in source. Props that components inherit unchanged from the DOM or Radix (`disabled`, `className`, `id`, `onClick`) are not listed per component.

## 1. Every prop name, with its meaning

Common props (appear in two or more components, or are a convention in `AGENTS.md`).

| Prop | Meaning and where | Notes |
|---|---|---|
| `size` | Control size, `sm \| md \| lg`: Button, Input, NativeSelect, SelectTrigger, Combobox, Autocomplete, MultiSelect, TagsInput, NumberInput, PasswordInput, TimePicker, DatePicker, Avatar | Was `sm \| md` on Button and Input, absent on the rest. Fixed (section 3). |
| `size` | Type size: Text `xs..lg`, Heading `display..sm` | Intentional: typographic, not a control size |
| `size` | Width preset: Container `text \| page \| full`; pixel numbers on GridPattern, Spotlight | Intentional (layout) |
| `variant` | Visual style: Button `solid \| line \| ghost \| danger`, Badge `outline \| solid \| accent`, Avatar `solid \| line`, Skeleton `line \| block \| hatch` | Names are per component; `solid`/`line` are the shared vocabulary |
| `tone` | Meaning colour: Alert `info \| success \| warning \| danger`, Text `default \| muted \| success \| warning \| danger \| accent`, menu items `default \| danger` | Text used `ok`; now `success` (alias kept) |
| `invalid` | Validation failed. Sets `aria-invalid` and `data-invalid`. Input, Textarea, NativeSelect, SelectTrigger, Combobox, Autocomplete, MultiSelect, TagsInput, NumberInput, TimePicker, DatePicker, OtpInput, Checkbox | A surrounding `Field` with `error` sets it for its control |
| `disabled` | Native or Radix `disabled`. Exposed as `data-disabled` on form controls | |
| `loading` | Busy: Button (`aria-busy`, blocks clicks), the login, signup and settings blocks | |
| `required` | Field, Label (marker), and through Field onto the control | |
| `readOnly` | Rating, NumberInput (native) | |
| `asChild` | Radix `Slot` polymorphism: Button, Link, Text, Box, Card, Container, Flex | No `as` prop anywhere. Good. |
| `value` / `defaultValue` / `onValueChange(value)` | Controlled or uncontrolled value: Autocomplete, Calendar, ColorPicker, Combobox, MultiSelect (`string[]`), OtpInput, Rating, SegmentedControl, Slider, TagsInput (`string[]`), TimePicker, Tree, DatePicker | The convention. Native `onChange` stays on Input, Textarea, NativeSelect, NumberInput, as in shadcn/ui |
| `checked` / `onCheckedChange`, `pressed` / `onPressedChange` | Radix pass-through: Checkbox, Switch, Toggle | |
| `open` / `defaultOpen` / `onOpenChange(open)` | Tooltip, Command, and every Radix overlay (Dialog, Popover, Drawer, Menus, HoverCard) | DatePicker, Combobox, Autocomplete, MultiSelect manage open state internally (see section 4) |
| `page` / `defaultPage` / `onPageChange(page)` | Pagination | `defaultPage` added; `page` and `onPageChange` are now optional |
| `sort` / `defaultSort` / `onSortChange`, `selection` / `defaultSelection` / `onSelectionChange`, `expanded` / `defaultExpanded` / `onExpandedChange` | DataTable, Tree | Follow the pair pattern |
| `aria-label` | Required accessible name where there is no visible text: IconButton, ButtonGroup, AvatarGroup, Carousel, Progress, Rating, SegmentedControl, Slider, Tree, OtpInput, Breadcrumb (optional) | Required in the type. Good. |
| `label` | Visible label: Checkbox, Switch, RadioGroupItem, Field, FileUpload, Stat | |
| `label` | Accessible name, not shown: DataTable, Spinner, ScrollProgress, Tag (remove button) | Inconsistent with `aria-label` above. Left (section 4) |
| `title` | Heading text, `ReactNode`: Alert, EmptyState, Timeline item, the blocks | |
| `title` | Accessible chart name, `string`: BarChart, PieChart, Sparkline, CodeBlock header, Command dialog | Left |
| `description` | Secondary text, `ReactNode`: EmptyState and the blocks | |
| `hint`, `error` | Field help and error text | |
| `placeholder` | DatePicker, Command, native | |
| `emptyText` | Text for no results: Combobox, MultiSelect, Command | DataTable uses `emptyTitle` and `emptyDescription` (richer; left) |
| `options` | `{value, label, disabled?}[]`: Combobox, MultiSelect, SegmentedControl | |
| `items` | Data-driven children: Breadcrumb, Command, Tree, DescriptionList | Differently shaped per component; left |
| `suggestions` | `string[]`: Autocomplete | Left (free text, so no value/label) |
| `data`, `series`, `labels`, `valueFormat`, `height` | Charts and Sparkline | Consistent among charts |
| `columns` | A count in Grid, BlockFeatureGrid, BlockFooter (columns list); column definitions in DataTable | Same name, two meanings. Left; types differ |
| `gap` | Spacing step `1..9`: Stack, Flex, Grid. Pixel number in DotPattern | Left (effects) |
| `direction`, `align`, `justify`, `wrap` | Stack and Flex layout | Consistent |
| `headingLevel` | `1..6` for blocks that render a heading; Heading itself uses `level` | Left; documented |
| `duration` | Animation length: BorderBeam, Marquee, OrbitingCircles, NumberTicker (units differ; see each doc comment) | Effects; left |
| `side` | `top \| right \| bottom \| left`: Tooltip; Drawer adds `start \| end` | Consistent |
| `showClose` | Dialog and Drawer content | |
| `max`, `min` | Rating and AvatarGroup (`max` count), Calendar (`Date`) | Names follow the native meaning |
| `name` | Avatar: the person; Rating: form field name | Different meaning; left |
| `onSubmit` | Form and blocks | |
| `onSelect` | BlockPricing | Left |

Per-component props that appear once (`eyebrow`, `colSpan`, `weekStartsOn`, ...) are documented in each component's props table and are not repeated here.

## 2. State attributes

AGENTS.md: expose state as `data-state`, `data-disabled`, `data-invalid`, not classes.

| Group | `data-state` | `data-disabled` | `data-invalid` |
|---|---|---|---|
| Radix parts (Dialog, Menus, Tabs, Accordion, Checkbox, Switch, Radio, Select, Slider, Toggle, ...) | yes (Radix) | yes (Radix) | Checkbox and SelectTrigger now add it |
| Native form controls (Input, Textarea, NativeSelect, NumberInput, TimePicker) | n/a | **added** | **added** |
| Custom listboxes (Combobox, MultiSelect) | **added** (`open` \| `closed`) | **added** (Combobox; MultiSelect and TagsInput already had it) | **added** / already had it |
| DatePicker, OtpInput | n/a | DatePicker **added** | **added** |
| Button | n/a | **added** (also `data-loading`) | n/a |

## 3. What was changed

All changes are additive. Every one has a test in `packages/react/src/api-consistency.test.tsx`.

| # | Finding | Change |
|---|---|---|
| 1 | Size scale: Button and Input had `sm \| md`; NativeSelect, SelectTrigger, Combobox, Autocomplete, MultiSelect, TagsInput, NumberInput, TimePicker and DatePicker had no `size`; Avatar had `md \| lg` | All take `sm \| md \| lg` (Avatar gains `sm`). Default stays `md`, so nothing moves for existing users. |
| 2 | Heights differed by 1 to 2 px between Button, Input and Select (padding-based) | New tokens `--control-sm`, `--control-md`, `--control-lg` in `tokens.css`; `.btn`, `.input`, `.select`, `.select-trigger`, multi-select and tags-input boxes take `min-height` from them. Test `control heights come from one scale` fails if a control drifts to another value. Ghost buttons stay unboxed (`min-height: 0`) because they are inline links. |
| 3 | `invalid` set only `aria-invalid`; no `data-invalid` | New `invalidAttrs()` in `field/field.tsx` (exported). `useFieldControl()` also returns `data-invalid` when the Field has an error. |
| 4 | No `data-disabled` on native controls | Input, Textarea, NativeSelect, Combobox, Autocomplete, NumberInput, TimePicker, DatePicker, Button |
| 5 | Combobox and MultiSelect had no `data-state` | `data-state="open \| closed"` on the input |
| 6 | Text `tone="ok"` did not match Alert `tone="success"`; no warning | `success` and `warning` added; `ok` kept as `@deprecated use success`, with a test; both classes share one CSS rule. |
| 7 | Pagination was controlled only | `defaultPage` added; `page` and `onPageChange` optional |
| 8 | SelectTrigger and DatePicker `aria-invalid` merged differently from siblings | One helper, same result |

Deprecated aliases added: **1** (`Text tone="ok"`).

## 4. Found and intentionally left

| Finding | Why it stays |
|---|---|
| `label` means a visible label in some components and an accessible name in DataTable, Spinner, ScrollProgress | Renaming breaks users. Both are documented. A future major can unify on `aria-label`. |
| `title` is `ReactNode` in blocks and `string` in charts and CodeBlock | Types differ for a reason (accessible name versus heading) |
| `columns` is a count in Grid and a definition list in DataTable | Same word as Mantine and TanStack Table use. Types make the difference obvious. |
| `options` (Combobox, MultiSelect, SegmentedControl) versus `items` (Command, Tree, Breadcrumb) versus `suggestions` (Autocomplete) | Different shapes. `options` is always `{value, label}`; `items` is structural. |
| Button `variant="danger"` while menus and Alert use `tone="danger"` | Adding `tone` to Button would give two ways to say one thing. Revisit if a `tone` axis is added across variants. |
| `size` means a type size on Text and Heading and a width on Container | Typographic and layout scales, not control sizes |
| Combobox, Autocomplete, MultiSelect, DatePicker keep open state internal (no `open`, `onOpenChange`) | Adding them is a feature. Tracked as a follow-up. |
| NumberInput puts `className` on the inner input, not the wrapper | Moving it would change styling for current users |
| Textarea has no `size` | Its height comes from `rows`, not a control height |
| Command and Tooltip do not `forwardRef` | Command is a dialog plus trigger, Tooltip wraps its child; there is no single root to point a ref at |
| Slider `onValueChange` always gives `number[]` while `value` may be a number | Matches Radix; changing it breaks callers |
| Radio group items and Switch have no `invalid` | Not added in this pass. Wrap in `Field` or set `aria-invalid` yourself; a follow-up can add `invalid`. |
| Docs text for each changed prop | Generated from the doc comments, which were updated with the props |

## 5. Heights at each size (from the CSS)

| Size | Token | Computed at default density | Button | Input, NativeSelect, Select trigger, Combobox, Autocomplete, TimePicker, DatePicker, NumberInput | MultiSelect, TagsInput |
|---|---|---|---|---|---|
| `sm` | `--control-sm` = `--s6 + --s1` | 36 px | yes | yes | yes |
| `md` | `--control-md` = `--s7` | 48 px | yes | yes | yes |
| `lg` | `--control-lg` = `--s7 + --s2` | 56 px | yes | yes | yes |

Before the change the heights came from padding plus line height (not measured in a browser, calculated from the CSS): at `md` Button about 48 px, Input and Select trigger about 49 px, so they were 1 px apart and drifted with font and density options. jsdom has no layout, so the test checks the CSS rules that decide the height. The scale follows density because it is built from `--s*`.
