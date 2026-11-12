# Synthesis: what Monoline copies, skips and why

Read with `coverage-matrix.md` (generated from `inventories.json`, which was fetched live from each docs site on 2026-11-12). The per-library table below was re-checked on 2026-11-12 against the per-library notes in this folder (`<slug>.md`, each read from the live docs and GitHub). Cells that changed are marked in the notes; claims a note marks "unverified" are not settled.

## Per library: model, what people like, what we take

| Library | Distribution | Theming | People like | Monoline takes | Monoline skips |
|---|---|---|---|---|---|
| shadcn/ui | copy-paste via CLI from a JSON registry (`registry.json`, namespaces, MCP server); behaviour layer is selectable: Base UI, Radix or React Aria (`--base`); Tailwind | CSS variables, semantic `x` / `x-foreground` pairs in oklch, `.dark` | you own the code; AI tools read it; consistent compound API | the `registry/` JSON + CLI that copies sources; compound named exports; semantic token pairs; "Copy page" as Markdown | Tailwind; `cva` utilities; no update path (add a diff command) |
| Radix Primitives / Themes | npm (`radix-ui` or `@radix-ui/react-*`); Themes is styled (`@radix-ui/themes`) | data attributes; Themes via `<Theme accentColor radius scaling …>` props | unmatched accessibility, `asChild`, `data-state`; data-attribute and keyboard tables per page | foundation of every complex widget; `data-state` styling; per-page data-attribute table | Themes' prop-heavy styling; single-vendor lock-in (maintenance worry is commentary, unverified) |
| Headless UI | npm unstyled, React/Vue; ~16 parts | none; `data-*` attrs (`data-focus`, `data-active`) | small, Tailwind-friendly | combobox + listbox keyboard model as reference | `as` prop; too few parts |
| Base UI | npm `@base-ui/react`, one tree-shakable package; stable v1 (docs show 1.9.0), MUI's main foundation focus in 2026 | none; `className` string or function of state, `data-*`, CSS variables | small stable API, `render` prop, "View as Markdown" pages | `render` composition idea; native-first Field/Form; Markdown per page | extra primitive dependency if Radix already in; needs `isolation: isolate` on root |
| MUI | npm, Emotion default (styled-components optional) | `createTheme` + `ThemeProvider`; `cssVariables: true` emits `--mui-*`; `sx` | enormous coverage, DataGrid, pickers (MUI X, paid tiers unverified) | breadth list; per-component API page with slots and CSS classes; date-picker scope | Emotion/`sx`; Pigment CSS (zero-runtime) and Joy UI are on hold per MUI's Jan 2026 blog |
| Ant Design | npm, CSS-in-JS runtime (zero-runtime mode documented) | `ConfigProvider` tokens: Seed → Map → Alias, `defaultAlgorithm` / `darkAlgorithm` / `compactAlgorithm` | enterprise coverage (Table, Form, Tree, Steps) | component list for admin UIs; "tokens this component reads" and "Semantic DOM" doc sections | runtime weight, look, config-object data components |
| Chakra v3 | npm (`@chakra-ui/react` + Emotion at runtime) plus snippets CLI that copies wrappers; built on Ark UI + Panda-style APIs | `defineConfig` / `createSystem`: tokens, semantic tokens, recipes, slot recipes | style props, a11y, DX; but v2 → v3 migration was painful | snippets-style CLI; `colorPalette`; recipes | style props; runtime Emotion; breaking rewrites |
| Mantine | npm, split `@mantine/*` packages, PostCSS required, own CSS modules; v9.8 | `createTheme` object → CSS variables; `variantColorResolver`, `autoContrast`; Styles API; `unstyled` mode | biggest hook set, rich inputs, controlled/uncontrolled for all inputs, great docs | hooks list; inputs (tags, number, pin); props + Styles API tables; `llms.txt` with per-page `.md` | package sprawl; PostCSS requirement; style props |
| daisyUI | npm Tailwind plugin (`@plugin "daisyui"`), class names only | `data-theme`, CSS variable themes (30+), `--default` / `--prefersdark` flags | short readable class names, themes, class-name table per page | plain class API (already ours); theme gallery; class-name table as reference | Tailwind dependency; no a11y guidance |
| HeroUI v3 | npm `@heroui/react` + framework-agnostic `@heroui/styles`; Tailwind v4 + React Aria Components; no provider, Framer Motion removed | CSS variables on Tailwind v4 theme, BEM classes (`.button--primary`), Theme Builder | polished look, a11y via React Aria, docs for agents (`llms.txt`, MCP, `AGENTS.md`, `DESIGN.md`) | BEM class list as documented API; polish bar; agent docs bundle | Tailwind; breaking changes in minors; v2 and v3 cannot coexist |
| Magic UI | copy-paste via the shadcn CLI (`add @magicui/<name>`); repo MIT; separate paid Pro ($199, licence unread) | none of its own (host shadcn variables) | delightful effects, easy to drop in | namespaced registry install; effect concepts, written fresh and reduced-motion safe | gradient/glow looks; any file |
| Aceternity UI | copy-paste via the shadcn CLI; 100+ free items, paid blocks/templates ($169 1-year, $199 lifetime) | none | dramatic hero effects, large catalogue | nothing copied; concept list only | everything visual, paid blocks; its licence bans redistributing source |

## Principles for Monoline

1. **Coverage first**: the matrix shows ~95 shared components; target all with a plain-CSS core and a Radix-backed React layer.
2. **Two ways in**: `npm i @monoline/react` and `npx monoline add <component>` (copies source, shadcn-style).
3. **Customisation without forking**: accent (many), font (mono / sans / serif), radius (square / soft / round), density (compact / comfortable) are all CSS variables on `:root` or `[data-*]`. Monospace is the default identity, not a requirement.
4. **AI-first**: per-component `meta.json`, generated `registry/`, `llms.txt`, `llms-full.txt`, `AGENTS.md`.
5. **Accessibility is the definition of done**: Radix or native first, axe test per component.

## Licences (checked 2026-11-12: LICENSE files read directly; Aceternity's page is `/licence`)

| Library | Licence |
|---|---|
| shadcn/ui, MUI (core), Ant Design, Chakra, Mantine, daisyUI, Headless UI, Radix Primitives, Base UI, Magic UI (open-source repo), HeroUI (main branch) | MIT, text read from each repo's LICENSE file |
| HeroUI v3 | npm `@heroui/react` + framework-agnostic `@heroui/styles`; Tailwind v4 + React Aria Components; no provider, Framer Motion removed | CSS variables on Tailwind v4 theme, BEM classes (`.button--primary`), Theme Builder | polished look, a11y via React Aria, docs for agents (`llms.txt`, MCP, `AGENTS.md`, `DESIGN.md`) | BEM class list as documented API; polish bar; agent docs bundle | Tailwind; breaking changes in minors; v2 and v3 cannot coexist |
| Aceternity UI | copy-paste via the shadcn CLI; 100+ free items, paid blocks/templates ($169 1-year, $199 lifetime) | none | dramatic hero effects, large catalogue | nothing copied; concept list only | everything visual, paid blocks; its licence bans redistributing source |

Monoline writes original code everywhere; names and concepts are not code.

## What the live data says

- Counts of the fetched navigations: Mantine 122 components + 83 hooks, Chakra 100, Aceternity 111 items, Magic UI 78, HeroUI 73, Ant 67, daisyUI 67, shadcn 59, MUI 56, Base UI 37, Radix 30.
- 72 components appear in three or more of the ten UI libraries. Monoline had 28 of them at the start; 44 were missing (see the matrix).
- Newer trends worth matching: shadcn's `Field`, `Input Group`, `Button Group`, `Empty`, `Spinner`, `Kbd`, `Item`; Chakra/Mantine `Marquee`, `CopyButton`/`Clipboard`, `Splitter`, `Tour`; Base UI `Field`, `Meter`, `Preview Card`, `Drawer`; Radix `OneTimePasswordField`, `PasswordToggleField`.
- AI-first is now table stakes: shadcn has a registry and Skills page, Mantine and Base UI publish `llms.txt`.

## Verified in the per-library notes (2026-11-12)

Twelve notes, `<slug>.md` in this folder, each from live docs and GitHub. Findings that change earlier assumptions:

- **shadcn/ui** is no longer Radix-only: `init --base base|radix|aria`. It also ships Skills, an MCP server and namespaced registries.
- **MUI** says (blog, 1 Jan 2026) Base UI is its main foundational focus; Pigment CSS and Joy UI are on hold. A search summary claimed the reverse for Base UI; the blog itself was read to settle it.
- **HeroUI v3** is a rewrite: Tailwind v4, React Aria Components, BEM classes, no provider, Framer Motion removed. Licence is MIT, not Apache-2.0.
- **Chakra v3** still uses Emotion at runtime (installation page); zero-runtime is a stated roadmap. Built on Ark UI.
- **Polymorphism is split**: `asChild` (Radix, Chakra), `render` (Base UI, HeroUI), `as` (Headless UI), `component` (MUI, Mantine). Monoline's React layer should pick one; the notes recommend `asChild` for Radix parity or `render` if Base UI is ever swapped in.
- **Docs patterns worth copying**: data-attribute and keyboard tables (Radix), props + Styles API tables (Mantine), class-name table (daisyUI), "tokens this component reads" (Ant), "Copy page / View as Markdown" (shadcn, Base UI), `llms.txt` with per-page Markdown (Mantine, Base UI, HeroUI).

## Still unverified

- Accessibility testing practice (beyond self-reports) for every library except Mantine (jest-axe stated) and Base UI (accessibility page read); Ant, daisyUI, Magic UI, Aceternity state nothing on pages read.
- Reduced-motion behaviour of Magic UI and Aceternity items; their GitHub licences vs per-item terms; Magic UI Pro and MUI X commercial terms.
- Radix maintenance status (only commentary found); the claim that Base UI is shadcn's new default (one secondary article).
- Real-world complaints are mostly from comparison blogs and search results; Reddit/HN threads were rarely retrievable. Each note names its source type.
- Props such as `onCheckedChange`, HeroUI `onPress`/`variant` names, Radix Themes `size`/`variant` scales and Ant `type="primary"` were not seen on fetched pages and are flagged in the notes.
