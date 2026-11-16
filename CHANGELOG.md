# Changelog

Versions follow [semver](https://semver.org). Before 1.0, a minor version may change class names; each change is listed here.

## 0.4.0 - 2026-11-16

Much lighter, with a few breaking changes. Whole library 123.6 to about 95 KB gzip; a Dialog is 1.8 KB (was 14.1), a Select 4.9 KB (was 32.4), a Button 0.7 KB (was 1.8).

### Breaking

- **`Button` now defaults to `variant="solid"`** (was `line`): the primary action, as in shadcn/ui, Mantine and Chakra. Use `variant="line"` for secondary buttons. `IconButton`, `CopyButton` and the other built-in buttons pass `variant="line"` themselves, so their look does not change. The CSS classes are unchanged: `.btn` plus `.btn-solid` or `.btn-line`.
- **Dialog, AlertDialog, Drawer and Command** use the native `<dialog>` element with `showModal()` (free focus trap, inert page, Escape, top layer). Content refs are `HTMLDialogElement`. `forceMount` and `asChild` on content are gone; Dialog keeps `modal`.
- **Popover, Tooltip, HoverCard, Select, DropdownMenu, ContextMenu and Menubar** use one shared floating layer (side, align, offsets, flip, shift) instead of Radix and floating-ui. Menus and popovers are non-modal: the page stays interactive and a press outside closes them. The Radix `modal` prop and `forceMount`/`asChild` on content are gone. `--radix-select-*` and `--radix-popover-*` custom properties are replaced by `--anchor-width` and `--available-height`. The Select list keeps its items mounted (hidden) while closed so the trigger can show the chosen text.
- The `asChild` Slot is Monoline's own (`utils/slot.tsx`), not Radix's.

### Added

- **Shell components:** `Sidebar`, `Navbar`, `AppShell`, `PageHeader` and `BreadcrumbsAuto`; `block-dashboard-shell` is rebuilt on them with the same props.
- **`@monoline/tokens`:** design tokens as W3C JSON, Figma variables, CSS and TypeScript types, generated from `@monoline/css`.
- **CLI:** `monoline diff`, `update` and `search`, plus `add --all` and `add --category`.
- **VS Code snippets** generated from the registry.
- **Per-component CSS is the recommended path:** `@monoline/css/core.css` plus `@monoline/css/components/<name>.css`. Each bundle includes the CSS of every component it renders, and `@monoline/react` exports a generated `styles` map. Measured: core 3.4 KB gzip, core plus the landing example 6.2 KB, plus the dashboard example 10.3 KB, against about 19 KB for everything.
- `Text` accepts `fullWidth`; heading scale tokens `--heading-1` and `--heading-2`; `.flow` (and `--flow`) is documented and applied by Card, Dialog and `.prose` content.
- **Docs:** every docs route is prerendered to `dist/<route>/index.html` with a sitemap and robots.txt (deep links work on static hosts); a load-only-what-you-use guide; `docs/bundle-report.md` from `node scripts/size.mjs --detail`.

### Accessibility and quality

- An accessibility-tree check for 41 components (`npm run ax`, report in `docs/a11y-report.md`) and a screen-reader testing guide. This is a proxy for screen-reader behaviour, not a replacement for testing with NVDA, JAWS or VoiceOver.
- New real-browser audits: every overlay on every docs page, and the three example apps (contrast, text overlap, hover and focus in each state).
- Fixes: native select arrow matches the custom select in every theme; horizontal tab lists scroll instead of widening the page on phones; dialog titles leave room for the Close link; a docs heading anchor no longer leaks into a dialog's accessible name; calendar outside-day hover contrast.
- 1,446 unit tests and 123 real-browser tests; CI runs the accent audits in parallel.

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
