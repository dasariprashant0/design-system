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
| V5 | Medium | Dialog, AlertDialog, Hero | ✔ Fixed (css session): one rule, uppercase only on `.display`; dialog, prose and `.heading-display` are sentence case in every font look; guarded by `scripts/css-computed.mjs`. Was: titles are UPPERCASE display type ("DELETE YOUR ACCOUNT?") while Card titles, `Heading size="lg"` and the page title are sentence case. Looks inconsistent inside one app. `[data-font="sans"]` turns `.display` to normal case but not `.heading-display`, so a "sans" look still has shouting headings | open |
| V6 | Medium | Heading level 1 | The default `h1` is the 64px display style. Fine for a landing hero, absurd for an app page title (my dashboard looked broken until I passed `size="lg"`). `size` is easy to miss | ✔ Heading display (h1 default) is clamp(28px,4vw,44px); Hero keeps the big size |
| V7 | Medium | Button | The default variant is an outlined button, not the solid primary. The docs say "one solid button per view" but a plain `<Button>Save</Button>` never looks like the main action. Every example had to add `variant="solid"` | open (cannot change a default here; document it prominently) |
| V8 | Medium | Field, Heading, Text, Button outside a Form | Controls have zero vertical spacing. A `<form>` with three `Field`s, or a card with a heading, paragraph and button, is a solid block of touching elements until you wrap it in `Form` or `Stack`. A first-time user thinks the kit is broken | doc comment on `Field` now says so; open for a real fix |
| V9 | Low | Date picker | The popover shows a double border (outer panel plus the calendar's own) and extra padding | ✔ one border (popover.css used to override date-picker.css) |
| V10 | Low | Pricing block | A text price ("Talk to us") wraps onto two lines at display size and strands "/ month" at the right edge | ✔ amount no longer wraps; period wraps under it |
| V11 | Low | Charts | A single series fills solid accent orange with a black outline: very heavy next to thin rules. The line chart's value axis does not start at zero (documented, but surprising for revenue) | ✔ bars are a light fill (opacity .45) with the outline; line-chart axis note unchanged |
| V12 | Low | Blocks | Every block adds its own section padding (`--s8`), so putting it inside a padded wrapper doubles the gap (I did this; the page had 300px voids). Say so in each block's docs | open |
| V13 | Low | Dropdown menu on 375px | Opens full width flush right and covers the page title: acceptable, but no collision handling margin | open |
| V14 | Low | Settings tabs | Tab row has no bottom spacing before the panel (content touches the rule) | open |

---

## C. Friction: API, docs and tooling

| # | Sev | What I tried | What felt wrong | Suggested fix |
|---|---|---|---|---|
| C1 | High | Show a toast after a save | `Toast` is controlled only. There is no `toast('Saved')` function or `useToast` hook, so every app writes its own queue (I did, 25 lines). Everyone coming from shadcn, Sonner or Mantine expects one | Add `useToast()` returning `toast({title, description})` and a `<Toaster />`; keep the primitives |
| C2 | High | Switch theme and accent from React | There is no theme hook or provider. The README says set `data-theme` on `<html>`; I wrote `useLook` (persist plus attributes). `monoline.js` has the same job for CSS-only users but its accent list has 4 entries while the CSS has 8 | Ship `useTheme()` / `<ThemeProvider>` with system-preference default, persistence and no-flash script; fix the `monoline.js` list |
| C3 | High | Learn a component's props | `llms.txt` and `llms-full.txt` list names, a11y notes and file paths but no props, so an AI tool (the stated audience) cannot write correct code from them. I read `dist/**/*.d.ts` instead. The README says "AI-readable" | Put the props table (name, type, default, doc comment) into `llms-full.txt` and `registry/*.json` |
| C4 | Medium | Sort a table by date | `DataTable` sorts by `accessor`, but for a date column I needed `accessor` for sorting and `cell` for display; this works, but the docs example only shows strings. Also the internal `DataTableInner` is exported and appears in IntelliSense | Add a date example; do not export `DataTableInner` |
| C5 | Medium | Clear a date in `DatePicker` | `onValueChange(date: Date)` cannot report "cleared"; there is no clear button, so a filter date cannot be removed with the picker alone. I added my own "Clear date" button and passed `value={null}` | Add a `clearable` prop calling `onValueChange(null)` (additive: widen the callback type) |
| C6 | Medium | Use the router with `BlockDashboardShell` | `nav` items are plain `href` strings, so a client-side router cannot intercept navigation (full page loads with hash hrefs only). Link has `asChild`; the shell does not | Add an optional `renderLink` or accept a `ReactNode` label with `asChild` |
| C7 | Medium | Name my own CSS classes | The kit's class names are unprefixed (`.toolbar`, `.row`, `.section`, `.card`, `.tag`, `.stack`...). I named a wrapper `.toolbar` and got a bordered box; `.row` and `.section` also collided. The roadmap's CSS split with `@layer` would help | Document the list of reserved names; consider a `ml-` prefix or `@layer monoline` so app CSS always wins |
| C8 | Medium | Handle form errors | `Form errors` takes `{name, message}[]` and `Field error` takes a string: I had to pass each error twice, in the right order (the summary follows the array order, not the page order). The pattern works but is easy to get wrong | Offer a `FormField` that reads from one `errors` object, or document ordering |
| C9 | Low | Check `Field` + `Checkbox` | A `Field` around a `Checkbox` with its own `label` shows two labels (field label "Terms" plus the checkbox text). I kept both to get an error slot | Docs example for a lone checkbox with an error |
| C10 | Low | `README` says "nine accents" | The table lists eight values (`orange` through `slate`), and the CSS has nine accent names counting `default` | Fix the number or the table |
| C11 | Low | Open any overlay and run axe | axe reports `aria-hidden-focus` on the app root while a Radix **menu** or **select** is open (axe only forgives it for `aria-modal` dialogs). Focus is trapped, so it is not a user problem, but anyone running axe against an open menu will see a "serious" failure | Documented as KNOWN in `audit-examples.mjs`; mention in the a11y docs |
| C12 | Low | Use `Text` inside a `Stack` | `Text` renders a `<p>` with a max width (`--measure`), so muted descriptions stop short of the container | Document `Text size="sm"` caps width; offer `fullWidth` |
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

React 19 plus `react-dom` alone is 69.2 KB gzip (measured with an empty app). The kit adds:

| App | Components used (approx.) | JS gzip | Kit's share of JS | CSS gzip |
|---|---|---|---|---|
| dashboard | 35 | 121.8 KB | ~52.6 KB | 16.6 KB |
| auth-settings | 30 | 114.6 KB | ~45.4 KB | 16.6 KB |
| landing | 15 | 84.1 KB | ~14.9 KB | 16.6 KB |

JS is in line with the roadmap target for a small app. **CSS is not**: every app loads the whole 16.6 KB stylesheet, including the legacy files, whatever it uses (roadmap step 0.7, still open). Floating UI, `react-remove-scroll` and Radix menu and toast are the largest kit-side costs.

## F. Checked and fine

No console errors or warnings in any of the 120 audited states. No horizontal overflow. No contrast failures. No type errors with `strict`, `noUncheckedIndexedAccess` and `skipLibCheck: false`.

---

## G. Verdict

**Would I ship a real product on this today? Not yet, and not for a customer-facing app.** The foundation is good: accessible behaviour, types, themes and a small JS footprint all held up. But the first real pages exposed six bugs that every existing test passed, three of them visible at first glance (wrong grid, oversized sub-headings, vanishing label on hover). A kit that fails in the first hour of use loses people for good. An internal tool or a prototype, yes; a public product, after the items below.

### Top 10 problems still open

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
