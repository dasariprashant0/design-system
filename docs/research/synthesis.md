# Synthesis: what Monoline copies, skips and why

Read with `coverage-matrix.md` (generated from `inventories.json`, which was fetched live from each docs site on 2026-11-12). The per-library model/theming cells below are from working knowledge plus the fetched pages (Base UI ships as `@base-ui/react`, Mantine and Base UI publish `llms.txt`, HeroUI now lists React Aria-style parts like ListBox/ComboBox/DateField, shadcn lists Field, Input Group, Item, Button Group, Spinner, Empty, Kbd, Direction); verify details before quoting.

## Per library: model, what people like, what we take

| Library | Distribution | Theming | People like | Monoline takes | Monoline skips |
|---|---|---|---|---|---|
| shadcn/ui | copy-paste via CLI from a JSON registry; Radix + Tailwind | CSS variables per theme | you own the code; AI tools read it; consistent compound API | the `registry/` JSON + CLI that copies sources; compound named exports; `asChild` | Tailwind; `cva` utilities |
| Radix Primitives / Themes | npm unstyled primitives; Themes is styled | data attributes; Themes via props | unmatched accessibility, `asChild`, `data-state` | foundation of every complex widget; `data-state` styling | Themes' prop-heavy styling |
| Headless UI | npm unstyled, React/Vue | none | small, well-behaved menus/listbox/combobox | combobox + listbox keyboard model as reference | duplicate of Radix |
| Base UI | npm unstyled (MUI/Radix/Floating UI authors) | none | new, small, stable APIs, `render` prop | `render`/asChild idea; native-first forms | still beta in places |
| MUI | npm, Emotion | theme object + `sx` | enormous coverage, DataGrid, pickers | breadth list; accessibility notes; date-picker scope | CSS-in-JS, heavy runtime |
| Ant Design | npm, CSS-in-JS | design tokens, algorithm themes | enterprise coverage (Table, Form, Tree, Steps) | component list for admin UIs; data table feature list | runtime weight, look |
| Chakra v3 | npm, Ark UI + Emotion; snippets CLI | tokens + recipes | style props, a11y, DX | field/stack/stat compositions; snippets-style CLI | style props |
| Mantine | npm, own CSS modules | CSS variables + theme object | biggest hook set, rich inputs, great docs | hooks list; inputs (tags, number, pin); docs with props tables | `@mantine/*` package sprawl |
| daisyUI | npm Tailwind plugin, class names | CSS variable themes, 30+ themes | zero JS, readable class names, themes | plain class API (already ours); theme gallery idea | Tailwind dependency |
| HeroUI | npm, Tailwind plugin, React Aria | Tailwind theme | polished look, animation, a11y via React Aria | polish bar, density of variants | Tailwind, framer-motion |
| Magic UI | copy-paste (shadcn registry), MIT | n/a | delightful effects, easy to drop in | effect concepts, written fresh and reduced-motion safe | gradient/glow looks |
| Aceternity UI | copy-paste, mix of free and paid, check licence per component | n/a | dramatic hero effects | nothing copied; only concept list | everything visual, paid blocks |

## Principles for Monoline

1. **Coverage first**: the matrix shows ~95 shared components; target all with a plain-CSS core and a Radix-backed React layer.
2. **Two ways in**: `npm i @monoline/react` and `npx monoline add <component>` (copies source, shadcn-style).
3. **Customisation without forking**: accent (many), font (mono / sans / serif), radius (square / soft / round), density (compact / comfortable) are all CSS variables on `:root` or `[data-*]`. Monospace is the default identity, not a requirement.
4. **AI-first**: per-component `meta.json`, generated `registry/`, `llms.txt`, `llms-full.txt`, `AGENTS.md`.
5. **Accessibility is the definition of done**: Radix or native first, axe test per component.

## Licences (checked 2026-11-12 via the GitHub API and the Aceternity licence page)

| Library | Licence |
|---|---|
| shadcn/ui, MUI, Ant Design, Chakra, Mantine, daisyUI, Headless UI, Radix Primitives, Base UI, Magic UI | MIT |
| HeroUI | Apache-2.0 |
| Aceternity UI | Own "Aceternity License": end products may use items and modify them, but **re-distributing the items or their source, or selling derivative templates, is prohibited**. Monoline therefore copies nothing and publishes only original effects. |

Monoline writes original code everywhere; names and concepts are not code.

## What the live data says

- Counts of the fetched navigations: Mantine 122 components + 83 hooks, Chakra 100, Aceternity 111 items, Magic UI 78, HeroUI 73, Ant 67, daisyUI 67, shadcn 59, MUI 56, Base UI 37, Radix 30.
- 72 components appear in three or more of the ten UI libraries. Monoline had 28 of them at the start; 44 were missing (see the matrix).
- Newer trends worth matching: shadcn's `Field`, `Input Group`, `Button Group`, `Empty`, `Spinner`, `Kbd`, `Item`; Chakra/Mantine `Marquee`, `CopyButton`/`Clipboard`, `Splitter`, `Tour`; Base UI `Field`, `Meter`, `Preview Card`, `Drawer`; Radix `OneTimePasswordField`, `PasswordToggleField`.
- AI-first is now table stakes: shadcn has a registry and Skills page, Mantine and Base UI publish `llms.txt`.

## Gaps in this research

- Per-library theming, API and accessibility notes were not re-read page by page; only inventories and licences were fetched and verified. Deeper per-library notes (props tables, token systems) are a follow-up.
- Delegated sub-agents and parallel build sessions were blocked (see the branch report).
