# Mantine

Read 2026-11-12 from mantine.dev (getting started, Button, theme object, polymorphic, controlled-vs-uncontrolled, `llms.txt`, accessibility FAQ) and the GitHub LICENSE.

## Licence
MIT, "Copyright (c) 2021 Vitaly Rtishchev" (`mantinedev/mantine` LICENSE). Docs header shows v9.8.0.

## Distribution model
npm, split by concern: `@mantine/core`, `@mantine/hooks`, plus dates, charts, notifications, etc. (extensions in nav). Setup needs PostCSS: `postcss-preset-mantine` and `postcss-simple-vars`, then import the stylesheet once and wrap in `MantineProvider`. Many starter templates (Vite, Next, Redux, Supabase, TanStack Start, Bun...). No copy-paste CLI.

## API conventions
- Flat components with props: `<Button variant="filled" size="md" radius="sm" leftSection={…} rightSection={…} fullWidth justify="space-between">`. Variants: default, filled, light, outline, subtle, transparent, white; sizes xs-xl.
- **Polymorphic**: `component="a" href=…`, or `renderRoot={(props) => <a {...props} />}` when `component` cannot express it.
- Controlled/uncontrolled: "All Mantine inputs support both modes" (`value` + `onChange` vs `defaultValue`), a dedicated guide.
- Style props on any component (`mt="md"`), `Styles API` for inner parts, `unstyled` / headless mode, `data-*` attributes.
- Big hook set in `@mantine/hooks` (inventory: 83 hooks).

## Theming approach
`createTheme` object passed to `MantineProvider`: `primaryColor`, `variantColorResolver`, `autoContrast` + `luminanceThreshold`, `fontFamily`, `defaultRadius`, `spacing`, `fontSizes`, colour scales and defaults per component. Everything is emitted as CSS variables; styling is **CSS Modules + CSS variables**, with documented integrations for Emotion, Sass, Vanilla Extract and StyleX. Light/dark via colour schemes; colours generator on the site.

## Docs-site structure
Top tabs: Get started, Theming & Styles, Hooks, Form, Components, Extensions. Each component: demos, Props table, Styles API table (selector names), Usage notes. FAQ is searchable and mirrored in **`/llms.txt`** (index of per-page `.md` files) and `/llms-full.txt`. Good: Styles API and props tables on every page, a guide for each cross-cutting concept (polymorphic, controlled, style props).

## Accessibility approach
FAQ: components follow WAI-ARIA, have roles/aria attributes and full keyboard support, manage focus, and interactive components are tested with axe (jest-axe). Self-reported.

## What users like / complain about
- Like: breadth out of the box (notifications, date pickers, rich inputs), Styles API, good docs; a long-time user in an r/reactjs thread (May 2024) preferred it to shadcn for those reasons (redlib mirror).
- Complain: heavier than copy-paste, wrong fit for heavily custom-branded sites (dev.to "Why I chose Mantine over shadcn/ui"); PostCSS setup is mandatory (getting-started page).

## Monoline should copy
- Props + Styles API tables per page; hooks list; controlled/uncontrolled guide; `llms.txt` with per-page Markdown; `variantColorResolver` idea (one function decides colours per variant); rich inputs (tags, number, pin).
## Monoline should skip
- Package sprawl and the PostCSS requirement (Monoline CSS should work as a plain `<link>`), style props, polymorphic types.
