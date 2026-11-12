# Magic UI

Read 2026-11-12 from magicui.design (introduction, installation, marquee) and `LICENSE.md` on GitHub. Only concepts are recorded here, no source or visuals.

## Licence
`magicuidesign/magicui` **`LICENSE.md`** (the `LICENSE` path returns 404): standard **MIT**, "Copyright (c) Magic UI", granting use, copy, modify, merge, publish, distribute, sublicense and sell, provided the notice is kept. It covers the open-source repo. There is also a paid **Magic UI Pro** ($199 once, "8 production-ready templates and 50+ premium components" per the docs banner); its own licence was not read (unverified), so assume Pro code is not MIT.

## Distribution model
Copy-paste via the **shadcn CLI**: "exact same installation process as shadcn/ui". `npx shadcn@latest init`, then `shadcn@latest add @magicui/globe` (namespaced registry), import from `@/components/ui/globe`. An MCP page exists. Requires a shadcn-style project (Tailwind, React, Next). Inventory: 78 items; mostly landing-page components, blocks and templates.

## API conventions
- Plain React components, one file each; props vary per effect (no shared variant/size scheme). The library says it is "heavily inspired by" shadcn/ui.
- No `asChild` / `render` convention seen (not read on component pages: unverified).
- Controlled/uncontrolled does not apply: components are mostly decorative.

## Theming approach
None of its own: inherits the host project's shadcn CSS variables and Tailwind config.

## Docs-site structure
Introduction (philosophy, contribute), Installation, Components (preview + code + install command), Blocks, Templates. Good: one-line install per item, live preview first.

## Accessibility approach
Decorative effects; no accessibility statement on pages read. Whether components honour `prefers-reduced-motion` was not verified. One third-party guide claims Magic UI and Aceternity lack reduced-motion controls by default (pkgpulse, secondary, unverified).

## What users like / complain about
- Like: delightful, easy-to-drop-in landing-page effects (library's own pitch; comparison posts via 21st.dev and dev.to).
- Complain: nothing library-specific found; generic cost of motion libraries: JS weight (a guide cites ~125 KB for the Framer Motion dependency, unverified) and motion-sensitivity. Search results only.

## Monoline should copy
- The namespaced registry install (`@namespace/item`) and live-preview-then-install-command page layout. Concepts such as marquee, shimmer, spinner may be written fresh in CSS.
## Monoline should skip
- Copying any file; JS-driven animation where CSS works; effects without a reduced-motion branch.
