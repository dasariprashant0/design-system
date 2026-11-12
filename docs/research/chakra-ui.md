# Chakra UI (v3)

Read 2026-11-12 from chakra-ui.com (installation, button, theming overview, blog "Announcing v3") and the GitHub LICENSE.

## Licence
MIT, "Copyright (c) 2019 Chakra Systems Inc." (`chakra-ui/chakra-ui` LICENSE).

## Distribution model
Hybrid. npm `npm i @chakra-ui/react @emotion/react`, then **snippets** via `npx @chakra-ui/cli snippet add` copy pre-built wrappers (incl. `components/ui/provider`) into your project; update `tsconfig`. The v3 blog credits shadcn for "the CLI and … copy-paste snippets". Installation page: Chakra "uses Emotion at runtime"; long-term goal is a zero-runtime model inspired by Panda CSS, phased.

## API conventions
- Built from Ark UI (headless) + Panda CSS styling APIs + Park UI design, per the v3 announcement.
- Variants and palettes as props: Button `variant` = solid, subtle, surface, outline, ghost, plain; `colorPalette="red"`; `size` xs-xl. Docs list colour names (gray, red, green, blue, teal, pink, purple, cyan, orange).
- Polymorphism: **`asChild`** ("render a button as a link").
- Layout and style props on any component (`<HStack>`, margin, padding props), plus `ref`.
- Compound parts for complex widgets (Field, Dialog, etc. from the nav; details unverified).
- Real example: `<Button colorPalette="red" variant="outline" size="lg">Delete</Button>` built from the documented props.
- After customising a recipe, run the CLI **typegen** so props are typed.

## Theming approach
`defineConfig({ theme: { tokens: { colors: {} } } })` → `createSystem(defaultConfig, config)` → `<ChakraProvider value={system}>`. Concepts: tokens, semantic tokens, **recipes** and **slot recipes** (per-component variants), text styles, layer styles, conditions, global CSS, breakpoints. Theming overview links an "Agent Skills" page.

## Docs-site structure
Get Started (installation per framework), Concepts, Theming (concepts + customisation), Components (Preview / Code / Stackblitz tabs per example), Blog, Migration. Good: every example has live code and a StackBlitz; the theming overview gives a three-step architecture first.

## Accessibility approach
Inherited from Ark UI state machines; stated as a goal, no audit process on fetched pages (unverified).

## What users like / complain about
- Like: style props speed, consistent tokens, accessible parts (secondary comparisons: adminlte, designrevision).
- Complain: v2 → v3 migration cost: one team reports ~3 months, 259 files (zenn.dev); thin docs and no automation (kitemetric); stale `colorScheme` props still type-check (issoh.co.jp); TS needs `moduleResolution: bundler` (zenn). A Reddit thread questioned the Panda claim; the official page confirms Emotion is still the runtime.

## Monoline should copy
- Snippets-style CLI beside the npm package; `colorPalette` as a single accent switch (our accent variable); recipes as the unit of variant definition; slot parts.
## Monoline should skip
- Style props, runtime Emotion, a provider required for any styling, breaking major rewrites.
