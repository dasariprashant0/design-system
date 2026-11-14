# Changelog

Versions follow [semver](https://semver.org). Before 1.0, a minor version may change class names; each change is listed here.

## Unreleased

Lighter bundles, same public API and the same keyboard behaviour (114 real-browser tests, 1,394 unit tests).

- **Dialog, AlertDialog, Drawer and Command** now use the native `<dialog>` element with `showModal()`: free focus trap, inert page, Escape and top layer. The backdrop is `::backdrop`, scroll lock is `html:has(dialog[open]:modal)` in `dialog.css`. Dialog 14.1 to 1.8 KB gzip.
- **Popover, Tooltip, HoverCard, Select, DropdownMenu, ContextMenu and Menubar** use one shared floating layer (`popover/float.tsx`: side, align, offsets, flip, shift, `--available-height`, `--anchor-width`) and one dismiss stack, instead of Radix and floating-ui. Select 32.4 to 5.0 KB, Popover 24.3 to 2.3 KB, Tooltip 20.0 to 2.2 KB, DropdownMenu 31.7 to 3.3 KB. DatePicker and DateRangePicker use the new Popover.
- **Smaller `asChild`.** An own `Slot` (`utils/slot.tsx`) replaces Radix's, taking Button from 1.8 to 0.7 KB.
- Whole library 123.6 to 93.1 KB gzip. `node scripts/size.mjs --detail` writes `docs/bundle-report.md` with every component and its top contributing packages; budgets in `scripts/size.mjs` are tightened to the new sizes plus 10 percent.
- **Behaviour notes.** Content refs are now `HTMLDialogElement` (dialog family) and `HTMLDivElement`; `forceMount`, `asChild` on content and the Radix `modal` prop of menus and popovers are gone (Dialog keeps `modal`). Menus and popovers are non-modal: the page stays interactive and a press outside closes them. `--radix-select-*` and `--radix-popover-*` custom properties are replaced by `--anchor-width` and `--available-height`. The Select list keeps its items mounted (hidden) while closed so the trigger can show the chosen text.

## 0.3.0

Monoline is now a monorepo: `@monoline/css`, `@monoline/react`, the `monoline` CLI and a docs app.

- **129 components and hooks** (was 28 on the first monorepo cut): forms (combobox, autocomplete, multi-select, tags-input, calendar, date-picker, time-picker, color-picker, OTP, number and password inputs, file-upload), overlays (alert-dialog, drawer, hover-card, context-menu, menubar, toast), data display (data-table, tree, timeline, carousel, table, stat), navigation (navigation-menu, stepper, toolbar), layout (stack, flex, box, grid, container), 13 effects, 11 page blocks and 23 hooks.
- **Look options.** Nine accents (added rose, teal, amber, slate), `data-font`, `data-radius` and `data-density` in `packages/css/src/options.css`. All accents pass the contrast checks in every theme.
- **CLI.** `npx monoline add | list | info | init` copies components from `registry/`.
- **AI-readable.** `meta.json` per component, generated `registry/`, `llms.txt`, `llms-full.txt`, `AGENTS.md`.
- **Quality.** A test renders every demo with axe and a no-console-errors check; `npm run check` also tests contrast across 3 themes and 9 accents.
- **Docs site.** Search, a Customise panel (theme, accent, font, corners, density), guides and per-component pages.
- **Research.** `docs/research/` compares 12 libraries and the roadmap is in `docs/ROADMAP.md`.

## 0.2.0

The kit is now general purpose and named Monoline (was `@personal/ui`).

- **Rename.** Package `monoline-ui`; the `brand.css` override is replaced by `data-accent` presets: orange (default), green, blue, violet, in `css/accents.css`.
- **New components.** Checkbox, radio, range, progress, spinner, skeleton, table, accordion, tooltip, dropdown menu, breadcrumb, pager, steps, top bar, avatar, tag, stat, prose, link, divider, skip link, input group, field states, toast region.
- **Layout utilities.** `css/utilities.css`: container, section, flow, cluster, grid, split, gap helpers, responsive hide.
- **Behaviours.** `js/monoline.js`: tabs, dropdown dismissal, drawer, dialog, toast, copy, theme and accent switching with saved choice. Optional.
- **Distribution.** `css/monoline.css` and `.min.css` for a CDN link, `tokens/tokens.json` (W3C design tokens format), npm exports.
- **Quality.** `npm run check` tests 63 contrast pairs across 3 themes and 5 accents and bans raw colours in components; CI runs it and verifies the built files are committed.
- **Docs.** The docs site at the repo root replaces the example page and the old gallery as the main reference.
- **Print styles** and a `.skip-link`.

## 0.1.0

First version: tokens, base, components, React wrappers, three themes.
