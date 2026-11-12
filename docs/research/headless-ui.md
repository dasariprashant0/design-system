# Headless UI

Read 2026-11-12 from headlessui.com (home, Menu, Dialog) and the GitHub LICENSE.

## Licence
MIT, "Copyright (c) 2020 Tailwind Labs" (`tailwindlabs/headlessui` LICENSE).

## Distribution model
npm only: `npm install @headlessui/react` (Menu page). A Vue build also exists (home page toggles React / Vue). Home page shows v2.1. No CLI, no registry.

## API conventions
- Compound components: `Menu`, `MenuButton`, `MenuItems`, `MenuItem`. The set on the docs sidebar: Menu, Disclosure, Dialog, Popover, Tabs, Transition, and forms: Button, Checkbox, Combobox, Fieldset, Input, Listbox, Radio Group, Select, Switch, Textarea. That is about 16 parts, the smallest of the headless libraries here.
- Polymorphism: **`as` prop**, including `as={Fragment}` so the part merges onto your own element; children can be a render function receiving state (`({ active }) => …`).
- Positioning: `anchor="bottom"` on `MenuItems` (built-in floating placement).
- Styling hooks: `data-*` attributes such as `data-focus` (item focused by mouse or keyboard) and `data-active` (menu button while open), consumed via Tailwind `data-focus:` variants.
- Real example: `<MenuItems anchor="bottom"><MenuItem><a className="block data-focus:bg-blue-100" href="/settings">Settings</a></MenuItem></MenuItems>`.
- Controlled/uncontrolled naming on Menu not shown on the fetched page (unverified).

## Theming approach
None. Designed "to integrate beautifully with Tailwind CSS" (home page); Tailwind Plus (paid) is the styled layer, not read here.

## Docs-site structure
One page per component with Preview / Code toggle and a framework switch, then: Installation, Basic example, Styling, Transitions, with-Tailwind and with-render-function variants, API tables. Good: tiny pages, one idea per section, code that pastes.

## Accessibility approach
Dialog page: component is "jam-packed with accessibility and keyboard features"; initial focus lands on the dialog, Tab cycles inside, focus is trapped while open. Menu: items receive focus and arrow keys navigate. Standard cited (WAI-ARIA) not named on fetched pages (unverified).

## What users like / complain about
- Like: small, predictable, first-class Tailwind fit.
- Complain: not enough components; teams outgrow it and move to Radix (LogRocket "Headless UI alternatives", dev.to via search, secondary). Fewer parts than Radix (28 per that LogRocket piece).

## Monoline should copy
- The combobox and listbox keyboard and selection model as a reference when writing our own.
- Render-function children exposing state for the rare case CSS cannot express.
## Monoline should skip
- The `as` prop (Radix `asChild` / Base UI `render` are the stronger convention), Tailwind-only examples, a second behaviour layer that duplicates Radix.
