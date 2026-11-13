# Roadmap: from a working kit to a library people choose

Last updated 2026-11-12. This replaces the earlier task table. The component list in `docs/research/coverage-matrix.md` is complete for the 72 components that appear in three or more of the ten libraries we surveyed; this roadmap is about everything else that decides whether people adopt a UI kit.

## Where we honestly are

| Area | State today | Evidence |
|---|---|---|
| Components | 114 components and 23 hooks | `registry/index.json`, 137 entries |
| Tests | 1182 unit tests with axe and keyboard checks; every demo renders in a test | `npm run check` |
| Real-browser checks | axe (with colour contrast), overflow and console errors on every docs page in 3 themes at desktop and 375px, orange accent | `scripts/audit.mjs` |
| Look options | 9 accents, 3 fonts, 3 corner styles, 3 densities, RTL pass | `docs/rtl.md`, `packages/css/src/options.css` |
| Docs | page per component, search, TOC rail, per-example code, props, a11y, styling | live site |
| AI-readable | `meta.json`, `registry/`, `llms.txt`, `llms-full.txt`, Markdown per page, `AGENTS.md` | generated |
| Bundle size | one Button is 1.7 KB gzip, all CSS 16.4 KB gzip (after the fix below) | `npm run size` |
| Published | **not on npm yet** | n/a |
| Used by anyone | no | n/a |

**A bug we found by measuring.** The first build shipped one file, so importing a single Button cost 103 KB gzip (every component and all of Radix). The package is now built one file per module and a bundler drops what the app does not use. `npm run size` enforces budgets so this cannot regress silently.

## What we can and cannot compete on

MUI, Ant Design, Mantine and shadcn/ui have years of community, thousands of issues fixed and large ecosystems. We will not match that breadth of trust in months. Competing means being clearly better at a few things people care about, and then earning trust:

1. **Small and fast.** Plain CSS, no runtime styling, per-component bundles. Target: a 10-component app under 25 KB gzip of JS and about 10 KB of CSS.
2. **Accessible, with proof.** Axe plus a real-browser audit in CI across every theme and accent, and published results. Others claim it; we show it.
3. **AI-first.** Registry, `llms.txt`, Markdown per page, an MCP server, and a CLI that copies source. Only shadcn/ui and Mantine do part of this today.
4. **One distinct, themeable identity.** Monospace and thin rules by default, but font, corners, density and nine accents on one switch, so people who dislike the default still can use it.
5. **Copy or install.** Both routes work from the same source.

Skip on purpose: 3D, WebGL, glow and aurora effects (Aceternity, parts of Magic UI); enterprise-only widgets such as Transfer, Cascader and Watermark until someone asks; Tailwind as a dependency.

## Phase 0: ship it safely (weeks 1 to 2)

Goal: someone can install it, trust it and see it working.

| Step | Why it matters | Done when |
|---|---|---|
| 0.1 Per-module build and size budget | one Button must not cost 100 KB | `npm run size` passes in CI; Button under 2.5 KB gzip |
| 0.2 Green CI on GitHub | ci, audit and visual jobs have never been fully green | all three jobs pass on `master` |
| 0.3 Publish `@monoline/css`, `@monoline/react`, `monoline` to npm | nothing else counts until people can install it | `npm i @monoline/react` works on a clean machine; release workflow with provenance |
| 0.4 Real install test on clean projects | proves the README | Vite, Next.js (App Router), Astro, Remix starters each render a Button and a Dialog in CI |
| 0.5 React 18 and 19 matrix | peer range says `>=18` | tests run on both |
| 0.6 Real-browser interaction tests | jsdom cannot test focus, layout or popovers properly | keyboard flows for dialog, menu, select, combobox, tabs, date picker, command in real Chrome in CI; Firefox and Safari smoke |
| 0.7 CSS split | people who use 3 components should not load 16 KB of CSS | `core.css` plus per-component CSS files; `@layer` so app styles always win |

## Phase 1: make it consistent (weeks 2 to 5)

Goal: no surprises. This is where small libraries lose to big ones.

| Step | Detail |
|---|---|
| 1.1 API audit | same prop names everywhere: `size` (`sm`/`md`/`lg`), `variant`, `disabled`, `invalid`, `loading`, `asChild`, controlled/uncontrolled pairs; compare against shadcn/ui, Mantine and Base UI conventions and fix outliers |
| 1.2 State attributes | every stateful part exposes `data-state`, `data-disabled`, `data-invalid` the same way, so styling and tests are predictable |
| 1.3 Slot and class naming | same naming for parts (`-header`, `-content`), documented in each page's Styling section |
| 1.4 Token completeness | z-index scale, motion tokens, focus ring tokens, elevation, breakpoints; no component hard-codes a size |
| 1.5 Behaviour parity | check each interactive component against its WAI-ARIA pattern: dialog, menu, select, combobox, tabs, tree, grid; fix gaps |
| 1.6 Bug sweep | every issue found by the audit, the interaction tests and a manual pass at 375px and 1440px in all themes |
| 1.7 Docs playground | live controls (variant, size, state) above the first example, like Mantine |

## Phase 2: fill the real gaps (weeks 5 to 9)

Components that Mantine, Ant Design or Chakra ship and we do not:

- Date range picker, range calendar, time field
- Tour (guided onboarding), resizable panels and splitter, mentions, tree select
- Overflow list, copy button, image gallery and lightbox, notification centre
- Sortable list with keyboard dragging, virtualised select and listbox
- Real tests against react-hook-form and TanStack Form (needs an extra test workspace)
- Full app shell: sidebar, navbar and breadcrumbs working together

## Phase 3: ecosystem (weeks 9 to 14)

| Step | Detail |
|---|---|
| 3.1 Templates | dashboard, auth, landing, settings and blog starters as real apps in `examples/` |
| 3.2 Blocks gallery | a page showing every block with copy buttons |
| 3.3 MCP server | an MCP server over the registry (list, search, get a component) so any AI tool can use Monoline |
| 3.4 Theme presets | a gallery of named presets (paper, terminal, slate, soft) and a theme builder that exports CSS and JSON |
| 3.5 Figma kit | tokens and components for designers |
| 3.6 Editor support | VS Code snippets and a props autocomplete |
| 3.7 Versioned docs, changelog, migration guides | needed the first time something breaks |

## Phase 4: earn trust (ongoing)

- Manual screen-reader testing with NVDA, JAWS and VoiceOver on the core 15 components, results published
- A benchmark page: bundle size, axe score and Lighthouse for Monoline against the other libraries on the same demo app
- Governance: RFC process, maintainers, release train, security policy, good-first-issue labels, a public roadmap
- Real users: dogfood on your own projects first; fix what they hit; then ask three outside projects to try it

## Quality gates (always on)

- `npm run check`: contrast (3 themes × 9 accents, code colours), no raw colours, no physical CSS properties, doc comments on every prop, 1182+ tests
- `npm run size`: per-component and CSS budgets
- `node scripts/audit.mjs`: real-browser axe, overflow, console errors
- `node scripts/audit.mjs --visual`: screenshot comparison on pull requests

## Measures of success

| Measure | Target |
|---|---|
| One Button, gzip | at most 2.5 KB |
| Typical 10-component app, gzip | JS under 25 KB, CSS under 10 KB |
| Axe violations across all pages, 27 theme/accent pairs, 2 viewports | 0, in CI |
| Time from `npm create` to a styled page | under 2 minutes |
| Clean install works in Vite, Next.js, Astro, Remix | all four, in CI |
| Docs: every component has installation, usage, example per variant, API, accessibility, styling | 100 percent |

## Risks

- **Solo maintenance.** 137 units is a lot to keep correct. Mitigation: the gates above, strict scope, and not adding components without tests and a demo.
- **Trust.** Nobody adopts an unproven kit. Mitigation: publish the audit results, ship templates, dogfood.
- **Radix dependency size.** Select costs about 32 KB gzip and Dialog 14 KB because of Radix. If that matters, replace the heaviest primitives with native or smaller implementations one at a time, behind the same API and tests.
- **Version drift** in Radix and React. Mitigation: React 18 and 19 matrix and dependency updates in CI.
