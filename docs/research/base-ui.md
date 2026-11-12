# Base UI

Read 2026-11-12 from base-ui.com (about, quick start, styling, composition, accessibility, switch, `llms.txt`), mui.com/blog/2026-and-beyond, and the GitHub LICENSE.

## Licence
MIT, "Copyright (c) 2019 Material-UI SAS" (`mui/base-ui` LICENSE).

## Distribution model
npm, one tree-shakable package: `pnpm add @base-ui/react` (quick start). Docs nav shows version 1.9.0 on the fetch date. The MUI blog (1 Jan 2026) says MUI Base was deprecated and replaced by Base UI, stable since v1. Search results (unverified, secondary) date v1.0.0 to Dec 2025 and note the rename from `@base-ui-components/react`. No CLI; shadcn can scaffold on it.
Portals need one line in your layout: `isolation: isolate` on the app root.

## API conventions
- From "the creators of Radix, Material UI, and Floating UI" (about page). Parts: `Switch.Root`, `Switch.Thumb`, `Menu.Trigger`.
- **`render` prop** (instead of `asChild`): `<Menu.Trigger render={<MyButton size="md" />}>`; can nest (Tooltip → Dialog → Menu triggers). Helpers `useRender` and `mergeProps` are exported.
- Uncontrolled / controlled: `defaultChecked` vs `checked` (switch props table). `onCheckedChange` is the expected callback but I did not see it on the fetched page (unverified).
- `className` accepts a string or a function of state: `className={(state) => state.checked ? "on" : "off"}`.
- Styling states via data attributes `[data-checked]`; components expose CSS variables such as `--available-height`, `--anchor-width` on popups.
- Utility providers: CSP Provider, Direction Provider.
- Component list includes Field, Fieldset, Form, Number Field, OTP Field, Meter, Preview Card, Drawer, Navigation Menu, Toolbar.

## Theming approach
None: "unstyled, don't bundle CSS", works with Tailwind, CSS Modules, CSS-in-JS (styling handbook). Quick start has a "Pre-styled components" section pointing to examples.

## Docs-site structure
Overview (quick start, accessibility, releases, about), Handbook (styling, animation, composition, forms, TypeScript), Components, Utils. Every page has **"View as Markdown"** and the site has an `llms.txt` stating examples use Tailwind v4. Good: handbook pages explain the patterns once, component pages show an API table per part with data attributes and CSS variables.

## Accessibility approach
Dedicated page: WAI-ARIA Authoring Practices keyboard behaviour, focus management, colour contrast guidance, accessible labels (form controls need a `<label>` or `Field`), and a testing section. States that accessibility "is a top priority".

## What users like / complain about
- Like: small stable API, `render` composition, Radix-like shapes so migration is easy (maintainer reply in Reddit thread, via search).
- MUI's own post: Base UI is its main foundational focus in 2026 and the team is expanding components and docs; Joy UI and Pigment CSS are on hold. Verified on the fetched MUI blog page.
- Complaint: younger than Radix, fewer components, and the Reddit question of why choose it over React Aria / Ariakit (search result, secondary).

## Monoline should copy
- `render`-style composition as the React-layer convention; CSS variables on popups for sizing; `className` as function of state only if needed.
- "View as Markdown" per page and a short `llms.txt`.
- Native-first form parts (`Field`, `Fieldset`, `Form`).
## Monoline should skip
- A third dependency if Radix is already in; its stacking-context requirement can be avoided by using `popover` / top-layer in the plain CSS core.
