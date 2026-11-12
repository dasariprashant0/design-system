# Material UI (MUI)

Read 2026-11-12 from mui.com (installation, button, theming, interoperability, blog "2026 and beyond") and the GitHub LICENSE.

## Licence
MIT, "Copyright (c) 2014 Call-Em-All" (`mui/material-ui` LICENSE). MUI X (Data Grid, pickers, charts) has paid Pro/Premium tiers: not read on a fetched page (unverified); the core Material UI package is MIT.

## Distribution model
npm: `npm install @mui/material @emotion/react @emotion/styled` (installation page). Emotion is the default engine; `@mui/styled-engine-sc` + `styled-components` is the documented alternative, with a warning that styled-components is not compatible with server-rendered MUI projects. Peer deps React 17-19; React 18 and below need `react-is@18.3.1` pinned via overrides.

## API conventions
- One component per widget with props, not parts, for simple ones: `<Button variant="contained">`; variants `text | contained | outlined`; `href` turns it into a link; `disableElevation`, `disabled`, `size`, `color`.
- Polymorphism: `component` prop. For non-button elements, `nativeButton={false}` keeps keyboard access (button page): `<Button component={CustomButton} nativeButton={false}>`.
- Internal parts are customised via `slots` / `slotProps` (interoperability page: `slotProps` to pass a class name to a nested part).
- Controlled vs uncontrolled follows React: `value` / `defaultValue`, `checked` / `defaultChecked` (from memory of the API, unverified on fetched pages).
- Styling props: `sx`, plus `styled()`.

## Theming approach
`createTheme()` + `ThemeProvider` (context). Set `cssVariables: true` and the theme also emits CSS custom properties, e.g. `--mui-palette-primary-main`. Extra theme keys need TypeScript module augmentation (theming page). The `vars` field is generated and throws if you pass it. Docs reference an agent skill for theming.

## Docs-site structure
Product switcher (Material UI, Base UI, MUI X, MUI System); per component: demo, "Edit code" / copy, Basic, Customization, Accessibility, API page with props, slots, CSS classes. Good because demos are editable and every component has an API page listing slots.

## Accessibility approach
Material Design components with ARIA and keyboard support; per-component Accessibility sections exist in the nav; I only verified the `nativeButton` guidance. Test or standard claims: unverified.

## Project status (matters for risk)
Blog 1 Jan 2026: Material UI is a core focus (v8 in planning; NumberField shipped, being rebuilt on Base UI); **Pigment CSS** (the zero-runtime plan) is alpha and **on hold**; **Joy UI** on hold; Toolpad not maintained.

## What users like / complain about
- Like: breadth, Data Grid and pickers, long track record (inventory: 56 components plus MUI X).
- Complain: bundle size (Meteor forum "Mui bundle size?", GitHub issue #42027), Emotion runtime cost (dev.to "why we're breaking up with CSS-in-JS", GitHub RFC for v5 admits a performance trade for DX). Search results, mostly blog posts and competitor comparisons.

## Monoline should copy
- Per-component API page listing slots and CSS classes; interoperability guide; CSS variable output from the theme; the breadth list for date/number/data components.
## Monoline should skip
- Emotion and `sx`; Material look; the `component` prop plus `nativeButton` workaround; reliance on a separate paid X tier for data components.
