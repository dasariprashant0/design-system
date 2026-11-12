# Ant Design

Read 2026-11-12 from ant.design (button, customize-theme, form nav, spec intro) and the GitHub LICENSE.

## Licence
MIT, "Copyright (c) 2015-present Ant UED" (`ant-design/ant-design` LICENSE).

## Distribution model
npm package `antd`, `import { Button } from 'antd'`. Styles are CSS-in-JS (the theme page contrasts the 4.x Less/CSS variables with the current CSS-in-JS). Companion ecosystem: Ant Design Pro, Pro Components, Charts, Mobile, Mini, Web3, and "Ant Design X" for AI (site footer). An "LLMs.md" link and a CLI sit in the docs header. Install command itself not re-read (unverified).

## API conventions
- Single components with many props: Button `type`, `danger`, `ghost`, `disabled`, `loading`, `size` (button page: danger is "used for actions of risk, like deletion"; loading "avoids multiple submits").
- Data components are config-driven: Form uses `Form.Item` with `name` and `rules`; Table by `columns` / `dataSource` (from nav and memory, Table API unverified here).
- Each page has a "Semantic DOM" section and "Custom semantic dom styling" demo: you style inner parts via `classNames` / `styles` props.
- Polymorphism, controlled naming (`value` / `defaultValue` / `onChange`): not seen on fetched pages (unverified).
- Real example (from button page vocabulary): `<Button type="primary" danger loading>Delete</Button>`; `type` value `primary` is from memory.

## Theming approach
`ConfigProvider theme={{ token, algorithm, components }}`. Three token tiers: Seed → Map → Alias, plus per-component tokens. Preset algorithms `theme.defaultAlgorithm`, `darkAlgorithm`, `compactAlgorithm`, combinable. Dynamic switching and nested themes supported; a theme editor exists. Advanced section covers a **Zero Runtime** mode and a `cssVar` config (not tested). Runtime CSS-in-JS is the default.

## Docs-site structure
Components overview grouped by role (General, Layout, Navigation, Data Entry, Data Display, Feedback, Other), then per page: When To Use, Examples, API, Semantic DOM, Design Token (the tokens a component reads), FAQ. Good for admin work: the Design Token and Semantic DOM sections make deep restyling findable.

## Accessibility approach
Not documented on the fetched spec intro (empty match). Third-party sources disagree: one aggregator lists poor support, a shadcn comparison says it improved (search results). Treat as unverified.

## What users like / complain about
- Like: enterprise coverage (Table, Form, Tree, Steps, 67 components), theme depth (secondary comparison blogs: index.dev, fitgap, LogRocket).
- Complain: bundle size (one source quotes ~1.2 MB, unverified), opinionated look, hard to restyle deeply, tree-shaking pitfalls with barrel re-exports (devgenius article, search).

## Monoline should copy
- Component list and Form/Table/Tree/Steps scope for admin use; a "tokens this component reads" section per page; named inner parts for styling.
- Dark and compact as algorithms: Monoline's density axis is the same idea in CSS variables.
## Monoline should skip
- Runtime CSS-in-JS, the three-tier token naming, config-object-only data components that hide markup.
