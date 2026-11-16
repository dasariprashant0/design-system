# Dogfood log: building three real apps with Monoline

Date: 2026-11-13. Method: act as a skeptical first-time user. Build three apps in `examples/` the way a consumer would (`import '@monoline/css'`, `import {…} from '@monoline/react'`, resolved to the built `dist/`), using `llms.txt`, the README and the generated `.d.ts` files only. Then look at every state in a real browser (Chrome, axe-core, screenshots at 1280px and 375px, three themes) with `node scripts/audit-examples.mjs --shots examples/.shots`.

Apps: `examples/dashboard` (sidebar shell, stats, sortable table, charts, date picker, command palette, dialog, toasts, theme and accent menu), `examples/auth-settings` (sign-in and sign-up with validation, settings tabs, switches, selects, file upload, danger-zone alert dialog), `examples/landing` (hero, feature grid, pricing with billing toggle, testimonials, footer).

Severity: **High** = visibly broken or blocks a task; **Medium** = a user loses time or ships something wrong without noticing; **Low** = polish or docs.

## Why this log exists

Unit tests and the docs-site audit passed, yet the first screenshot of a real app showed a grid with the wrong number of columns, sub-headings at twice their documented size, and a selected segment whose label vanished on hover. None of these are detectable in jsdom or by an audit that never opens an overlay or moves the pointer. **Rule going forward: before announcing anything, build or open a real page, look at screenshots in all three themes at 375px and 1280px, hover and click the controls, and read the pictures.** `scripts/audit-examples.mjs` is the starting point; extend its scenarios when a new component ships.

---

## A. Bugs found and fixed in the kit

Every fix has a guard that fails if it comes back (jsdom cannot see CSS, so most guards are in `packages/css/scripts/check.mjs`, which runs in `npm run check`).

| # | Sev | What I did | What went wrong | Fix | Guard |
|---|---|---|---|---|---|
| A1 | High | `<Grid columns={4} gap={4}>` around four `Stat`s | Rendered three columns and ignored `gap`. The legacy `.grid` utility (`utilities.css`, later in the bundle) has the same specificity as `.grid-fixed` and won. `columns`, `minColumn` and `gap` were all dead whenever the full stylesheet is loaded | `grid.css` rules are now `.grid.grid-fixed` and `.grid.grid-auto` | `check.mjs` fails on a bare `.grid-fixed`/`.grid-auto` rule |
| A2 | High | `<Heading level={3} size="md">` (also every block sub-title: feature titles, tier names) | Rendered at 34px instead of the documented 18px. `typography.css` also defines `.heading-md`/`.heading-sm` with other sizes and wins. In the landing page the feature titles were as big as the section title | `.heading.heading-md`, `.heading.heading-sm` in `heading.css` | `check.mjs`; the example audit asserts the computed size of a `.heading-md` |
| A3 | High | Clicked "Yearly" in the pricing block, pointer left over the control | The selected segment's label turned the same colour as its fill and disappeared. `.segment:hover:not(:disabled)` out-ranks `.segment[data-state="on"]`. Same flaw in `Toggle` (`.toggle`), `Toolbar` items and the selected `Calendar` day | hover rules now exclude the selected state | `check.mjs` lists the four files; example audit hovers the selected segment and compares colours |
| A4 | Medium | Submitted an empty sign-up form | The links in the form error summary were 17px tall; axe `target-size` (WCAG 2.5.8) failed on every empty submit | `.form-errors a` is `inline-block` with `padding-block: var(--s1)` | `check.mjs`; the example audit submits empty forms |
| A5 | Medium | Four `Stat`s in a row, one without a `note` | The value without a note sat lower than its neighbours (the grid rows stretched) | `.stat { align-content: start }` | `check.mjs` |
| A6 | Medium | `const [dark, toggle] = useToggle(false)` then `onClick={toggle}` | Two bugs. (1) `useToggle(false)` was a type error: the argument had to be a tuple `[a, b]`, but every other library takes the initial value. (2) Passing `toggle` straight to `onClick` did nothing, because the click event was treated as "set this value", not found in the list, and ignored | `useToggle(initial?: boolean)` overload; an event argument now flips | two new tests in `use-toggle.test.tsx` |

Not fixed here but found while fixing: `check.mjs` can only see CSS text. A cascade test that loads `monoline.css` in a real browser and compares computed style with the documented value (size, columns, gap) would have caught A1 to A3 automatically. That is the best next investment in tests.

### Same root cause: resolved (css session)

`packages/css/scripts/check-duplicates.mjs` (part of `npm run check`) fails when one selector is defined in two stylesheets with different values. Removed or merged: `.stack` (3 definitions, now `stack.css`), `.empty` (legacy 14vh margin), `.code-block` (legacy padding and inset shadow doubled the component's), `.container` and `.grid` (utilities.css; with cascade layers the utilities layer beat the Container and Grid components, so `container-text` and `Grid columns` would have broken again), `.text*`, `.heading*` and `.heading-display` (the whole legacy `typography.css` is gone). `scripts/css-computed.mjs` (`npm run test:css-browser`, also in the audit workflow) loads the built docs CSS in Chrome and asserts computed values: equal Button/Input/Select heights (new `--control-h`, `--control-h-sm`), Stack gap, container widths, heading scale and casing, rhythm, date popover borders, hover labels. Cross-file overrides between *different* selectors on one element (the date popover) are only caught by that browser test.

### Same root cause is still lurking (historic note)

A scan of `dist/monoline.css` finds selectors defined twice with different declarations, from the legacy numbered files and the newer component files: `.stack` (3 definitions), `.empty`, `.code-block`, `.container`, `.text`, `.text-truncate`, `.heading`, `.heading-display`. A1 and A2 came from this. The remaining ones have not been proved harmful; they should be reviewed one by one (see open problem 1).

---

## B. Visual QA findings (from the screenshots)

Fixed in this pass are marked ✔. Everything else is open and should be fixed before a public announcement.

| # | Sev | Where | What I saw | Status |
|---|---|---|---|---|
| V1 | High | Grid | Four stats wrapped to 3 + 1 | ✔ A1 |
| V2 | High | Blocks | Feature titles and tier names as large as the section heading, hierarchy inverted | ✔ A2 |
| V3 | High | Segmented control, Toggle, Toolbar, Calendar | Selected label disappears on hover | ✔ A3 |
| V4 | Medium | Stat | Misaligned values in a row | ✔ A5 |
| V5 | Medium | Dialog, AlertDialog, Hero | ✔ Fixed (css session): uppercase only on `.display`; dialog, prose and `.heading-display` are sentence case in every font look; guarded by `scripts/css-computed.mjs` | ✔ |
| V6 | Medium | Heading level 1 | ✔ Decision: the h1 of app content is `--heading-1` (32 to 44px), h2 is `--heading-2` (26 to 34px), h3 22.5px, then 18px (cards, dialogs, `.prose h3`) and 15px. The 64px+ display sizes stay on `.display-*` and `Hero`. The scale descends at 375px and 1280px (guarded by `css-computed.mjs`; h1 and h2 used to be 28px both on a phone) | ✔ |
| V7 | Medium | Button | ✔ Decision: `Button` defaults to `variant="solid"`, the primary action, as in shadcn/ui, Mantine and Chakra; `line` stays for secondary actions. Breaking change, in `CHANGELOG.md`. Every demo, block, example and docs page was updated: secondary buttons next to a primary one say `variant="line"`; `IconButton`, `CopyButton`, the image gallery, overflow list and rich-text toolbar pass `line` themselves | ✔ |
| V8 | Medium | Field, Heading, Text, Button outside a Form | ✔ Decision: opt-in `.flow` utility (container class, `--flow`, default `--s4`; a heading after a block gets 1.5 steps) plus the same rhythm applied by default inside Card, Dialog and `.prose` (written with `:where()`, so any app rule wins). `Drawer` and `Alert` are flex and grid containers with their own gap. Documented in the Getting started guide ("Spacing between blocks"); computed values guarded by `css-computed.mjs` | ✔ |
| V9 | Low | Date picker | The popover shows a double border (outer panel plus the calendar's own) and extra padding | ✔ one border. Confirmed in a real Chrome screenshot (`dashboard-date-picker`) and by `css-computed.mjs` |
| V10 | Low | Pricing block | A text price ("Talk to us") wraps onto two lines at display size and strands "/ month" at the right edge | ✔ amount no longer wraps, the period wraps under it. Confirmed in a screenshot (`landing-top`) |
| V11 | Low | Charts | A single series fills solid accent orange with a black outline | ✔ bars are a light fill with the outline. Confirmed in a screenshot (`dashboard-overview`). The line chart axis not starting at zero is documented behaviour |
| V12 | Low | Blocks | Every block adds its own section padding (`--s8`), so putting it inside a padded wrapper doubles the gap | ✔ Decision: documented (Getting started, "Spacing between blocks": blocks bring their own section padding, do not wrap them in padded containers); no CSS change |
| V13 | Low | Dropdown menu on 375px | Opens full width flush right and covers the page title | ✔ `DropdownMenuContent` now defaults `collisionPadding={8}`, like the date picker; the covering is the normal Radix behaviour on a narrow screen |
| V14 | Low | Settings tabs | Tab row has no bottom spacing before the panel | ✔ already fixed (`.tabs-root` has a `--s4` gap); confirmed in the `settings-notifications` screenshot |

---

## C. Friction: API, docs and tooling

| # | Sev | What I tried | What felt wrong | Suggested fix |
|---|---|---|---|---|
| C1 | High | Show a toast after a save | no imperative toast | ✔ `Toaster` and `toast()` shipped |
| C2 | High | Switch theme and accent from React | no theme hook | ✔ `ThemeProvider` and `useTheme` shipped |
| C3 | High | Learn a component's props | no props in `llms-full.txt` | ✔ props table in `llms-full.txt` and `registry/*.json` |
| C4 | Medium | Sort a table by date | no date example; `DataTableInner` exported | ✔ `DataTableInner` is not exported from the package index; added a "Sort by date" demo (accessor returns the Date, cell formats it) |
| C5 | Medium | Clear a date in `DatePicker` | cannot report cleared | ✔ `clearable` prop (`onValueChange(null)`), demo and test; the dashboard example uses it |
| C6 | Medium | Use the router with `BlockDashboardShell` | nav items are plain hrefs | ✔ `renderLink` prop; the dashboard example uses it |
| C7 | Medium | Name my own CSS classes | unprefixed class names collide with app CSS | ✔ Decision: no prefix. Everything is in `@layer monoline.*`, so unlayered app CSS wins at any specificity and in any order. Proved by `css-computed.mjs`, which injects an app stylesheet (before and after the kit) with `.card`, `.badge`, `.container`, `.toolbar`, `.row`, `.section`, `.tag`, `.stack`, `.btn` rules and asserts that every one wins. Documented in Getting started |
| C8 | Medium | Handle form errors | each error passed twice | ✔ pass each error once in `Form errors`; a `Field` with the matching `name` shows it. The auth example does this |
| C9 | Low | Check `Field` + `Checkbox` | two labels | ✔ added a "lone checkbox with an error" demo explaining the pattern |
| C10 | Low | `README` says "nine accents" | the table lists eight | ✔ there are eight accents (orange is the default); text fixed everywhere |
| C11 | Low | Open any overlay and run axe | `aria-hidden-focus` on the app root while a Radix menu or select is open | ✔ documented in the Accessibility guide as a known Radix false alarm; listed as KNOWN in the audit |
| C12 | Low | Use `Text` inside a `Stack` | caps width at `--measure` | ✔ `Text fullWidth` prop |
| C13 | Low | Types in an app | With `skipLibCheck: false` (what a strict consumer uses) the build was clean: no type errors from `dist`. | none, good |
| C14 | Low | Install | In this monorepo a fresh worktree has no `node_modules`; `npm install` works from the local cache. Not a library problem, but "npm run build first" should be in the examples README | done in `examples/README.md` |

## D. What worked well (keep it)

- `Field` plus `Input` and the other controls: labels, hints, `aria-invalid` and `aria-describedby` wired with no effort; sign-up was 10 lines per field.
- `Form` error summary: focus moves to the first problem, links jump to fields, announced as an alert.
- `Dialog`, `AlertDialog`, `Command` (`mod+k`), `DropdownMenu`, `Tabs`, `Select`: focus return, Escape and keyboard all worked on the first try; `Command` filtered and ran items correctly.
- Types: `IconButton` requires `aria-label`; `Chart` requires `title`; wrong props were caught by `tsc` immediately.
- Theme and accent switching: three themes and eight accents applied everywhere (all 120 audited states were axe-clean in warm, dark and midnight, 1280px and 375px).
- Responsive: all three apps were free of horizontal overflow at 375px; `BlockDashboardShell` collapses to a drawer.

## E. Bundle weight

React 19 plus `react-dom` alone is 69.2 KB gzip. The kit adds the JavaScript below. CSS used to be the full 16.6 KB in every app; the apps now load `core.css` plus one file per component (`npm run size` guards the numbers).

| App | Components used | JS gzip | Kit's share of JS | CSS gzip, before | CSS gzip, now |
|---|---|---|---|---|---|
| dashboard | 22 | 121.8 KB | ~52.6 KB | 16.6 KB | 10.4 KB |
| auth-settings | 24 | 114.6 KB | ~45.4 KB | 16.6 KB | 8.1 KB |
| landing | 11 | 84.1 KB | ~14.9 KB | 16.6 KB | 6.5 KB |

Found on the way: component CSS bundles did not include the CSS of the components they render (`Form` lacked `Button` and `Field`, 59 gaps). `bundle.mjs` now follows `meta.json` `uses` transitively.

## F. Checked and fine

No console errors or warnings in any of the 120 audited states. No horizontal overflow. No contrast failures. No type errors with `strict`, `noUncheckedIndexedAccess` and `skipLibCheck: false`.

---

## G. Round 2: what the extended audit found

`scripts/audit-examples.mjs` and `scripts/audit.mjs --overlays` now open every overlay (dialog, alert dialog, drawer, menu, select, popover, tooltip, hover card, context menu, toast, command palette, date picker: 39 on the docs site, plus the example apps' own flows), then for each state compute the contrast of every text node over its real stacked background, look for text boxes that overlap other text, move the real mouse over every distinct control and Tab-focus it (re-checking contrast; a hover colour equal to its background is a 1:1 ratio), and check that focus changes something visible. Shared code: `scripts/lib/sweep.mjs`. Run in 3 themes at 1280px and 375px.

Real bugs it found, all fixed: calendar days outside the month fell to 4.2:1 on hover (all themes); every code block on the docs site had ink on its dark surface in the warm theme (`code { color }` in the docs CSS); the notification centre "Mark read" buttons had an accessible name that did not start with their visible text (WCAG 2.5.3); a long dialog title ran under the Close link at 375px; component CSS bundles lacked the CSS of the components they render (59 gaps). It also surfaced and I fixed in the sweep itself: false alarms from display line-heights below 1, toasts and sticky bars that legitimately cover content, and SVG focus rings drawn with `stroke`.

Not proven by it: it cannot judge taste (spacing, alignment), animation, or flows beyond the scripted ones; the hover pass is one real pointer position per distinct control; a custom accent has not been run through it (only `orange` for the docs, whatever the apps use).

## H. Verdict (updated)

**Would I ship a public product on this now? Yes for an app you control, with eyes open; not yet for "the kit is stable" claims.** What changed since round 1: the six bugs that every test passed are fixed and each has a real-browser guard; the open problems below the line are closed or decided; the three example apps pass the extended audit (129 states, axe, contrast, overlap, hover, focus, 3 themes, 2 widths, no console errors) and look right in screenshots; `npm run check`, `build`, `size`, `e2e` (114) and the computed-style test (628) are green. CSS per app dropped from 16.6 KB to 6 to 10 KB.

Still open or risky:

1. **Breaking changes will keep coming before 1.0.** `Button` just changed its default; class names may change in a minor. Pin the version.
2. **Real usage is three apps by one team.** A third party will find the next set of gaps; the audit makes them cheap to catch but does not find them.
3. **The sweep is not a screen reader or a keyboard-only user.** Focus order, announcements and RTL in real flows are covered by unit tests and e2e on the docs demos, not by the example apps.
4. **Per-component CSS relies on `meta.json` `uses` being right.** A component that renders another without listing it will miss styles when loaded alone. The browser audit loads the example apps that way, but 100+ components have only unit tests for their `uses`. A check that renders every demo with only its own bundle would close this (next step).
5. **No visual regression baseline for the example apps**, only for the docs site.
6. Accessibility of third-party behaviour (Radix menus: the `aria-hidden-focus` axe alarm) is documented, not removed.

### Top 10 problems of round 1: status

1. Duplicate legacy and component CSS: fixed (duplicate check in `npm run check`, computed-style test).
2. Imperative toast: fixed (`toast()`, `Toaster`).
3. Theme hook and provider: fixed (`ThemeProvider`, `useTheme`).
4. Props in `llms-full.txt` and the registry: fixed.
5. Default spacing: decided and fixed (`.flow`, default inside Card, Dialog, `.prose`).
6. Heading consistency: fixed (one sentence-case scale; display sizes only on `.display-*`).
7. Button default and h1 size: decided and fixed (solid default; h1 32 to 44px).
8. Whole stylesheet and class collisions: fixed (per-component bundles with `styles` map, apps use them, measured sizes in the guide; `@layer` proved by a test app).
9. DatePicker clear, shell router, form errors: fixed, with examples.
10. Audit coverage: fixed (every overlay, hover, focus, contrast, overlap, in both audits and in CI).

---

## Round 1 verdict (kept for the record)


**Would I ship a real product on this today? Not yet, and not for a customer-facing app.** The foundation is good: accessible behaviour, types, themes and a small JS footprint all held up. But the first real pages exposed six bugs that every existing test passed, three of them visible at first glance (wrong grid, oversized sub-headings, vanishing label on hover). A kit that fails in the first hour of use loses people for good. An internal tool or a prototype, yes; a public product, after the items below.

### Top 10 problems of round 1 (the original list; status is in section H)

1. **Duplicate legacy and component CSS.** `.stack`, `.empty`, `.code-block`, `.container`, `.text`, `.heading-display` are defined twice with different values; the later one silently wins. A1 and A2 came from this. Remove the legacy files or fold them in (roadmap 0.7), and add the computed-style browser test.
2. **No imperative toast** (`toast('Saved')`), the most common feedback pattern.
3. **No React theme hook or provider**, and `monoline.js` knows only 4 of the 8 accents.
4. **`llms-full.txt` and the registry have no props**, so "AI-readable" is not yet true for writing code.
5. **Default spacing is zero** outside `Form` and `Stack` (V8): bare Field, Heading, Text and Button blocks collide. Needs either default rhythm or loud docs.
6. **Inconsistent heading style**: uppercase display in dialogs and h1, sentence case elsewhere, and `data-font="sans"` does not tame it (V5, V6).
7. **Default `Button` is not the primary action** (V7); `h1` is a 64px display (V6).
8. **Whole stylesheet loads regardless of use** (16.6 KB gzip per app); unprefixed class names collide with app CSS (C7).
9. **Gaps in common pieces**: `DatePicker` cannot be cleared, `BlockDashboardShell` cannot use a client router, form errors are passed twice (C5, C6, C8).
10. **The audit never covered open overlays, hover or real flows until now.** `scripts/audit-examples.mjs` does, but only for these three apps. Every new component should add a scenario, and the docs-site audit should open each overlay and hover each control.

Also visible and unfixed: date picker double border (V9), heavy single-colour chart bars (V11), wrapping text prices (V10).
