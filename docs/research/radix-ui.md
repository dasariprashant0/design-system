# Radix UI (Primitives and Themes)

Read 2026-11-12 from radix-ui.com (primitives intro, composition, accessibility, dialog, themes getting started and theme pages) and the GitHub LICENSE.

## Licence
MIT, "Copyright (c) 2022 WorkOS" (`radix-ui/primitives` LICENSE). Themes licence file not read (unverified, expected MIT).

## Distribution model
- npm only. Primitives: one package `npm install radix-ui` (`import { Dialog, Tooltip } from "radix-ui"`) or per-primitive `@radix-ui/react-dialog` etc. (intro page).
- Themes: `npm install @radix-ui/themes`, import `@radix-ui/themes/styles.css`, wrap the app in `<Theme>`.
- No copy-paste CLI of its own; shadcn is the copy-paste layer on top.

## API conventions
- Parts, not one big component: `Dialog.Root / Trigger / Portal / Overlay / Content`.
- **`asChild`** on every part that renders a DOM element: the part clones its child and merges props and behaviour (composition guide). Default `false`.
- Controlled / uncontrolled: `open` + `onOpenChange` vs `defaultOpen` (dialog props table), same pattern across primitives.
- Styling hooks: `[data-state]` = `open | closed` on parts; `forceMount` and `container` props on Portal.
- Real prop example: `<Tooltip.Trigger asChild><a href="…">Radix UI</a></Tooltip.Trigger>`.
- Size / variant props exist only in Themes (e.g. `<Button size="2" variant="soft">`, scale 1-9 is from memory: unverified).

## Theming approach
- Primitives: none; style with any CSS solution via data attributes.
- Themes: `<Theme accentColor="mint" grayColor="gray" panelBackground="solid" scaling="100%" radius="full">` (theme page example). Also appearance, typography, spacing, breakpoints, shadows and cursor sections.

## Docs-site structure
Primitives site: Overview (introduction, getting started, accessibility, releases), Guides (styling, animation, composition, server-side rendering), Components, Utilities. Each component page: anatomy, API reference with one table per part (Prop / Type / Default), a **Data attributes** table, keyboard interaction table, accessibility notes, examples. Good because the data-attribute and keyboard tables answer the two questions every styler has. Themes site adds a Playground that live-edits the theme props.

## Accessibility approach
Follows WAI-ARIA Authoring Practices; handles aria/role attributes, focus management and keyboard navigation; tested in modern browsers and "commonly used assistive technologies" (accessibility page). Specific AT matrix not listed (unverified).

## What users like / complain about
- Like: the most complete headless set, `asChild`, predictable `data-state`.
- Complain: more wiring than a styled library (LogRocket and Subframe comparisons); upkeep worry: dev.to "Is your shadcn/ui project at risk" says Radix "barely moving", a commentary thread not a statement from the maintainers; Base UI is pitched by its authors as an easy migration target (infoq / Reddit reply via search). All secondary.
- Themes: prop-heavy styling that does not map to your own tokens (my read of the docs, not a cited complaint).

## Monoline should copy
- Part-based anatomy, `data-state` and `data-disabled` attributes as the only styling hook, a data-attribute table and keyboard table on every page.
- `asChild`-style polymorphism for React; plain CSS core needs no equivalent.
## Monoline should skip
- Themes' numeric prop scales; a hard dependency on one primitive vendor without a wrapper layer so Base UI/React Aria can be swapped.
