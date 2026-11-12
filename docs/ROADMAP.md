# Roadmap and task ownership

The target is a complete, open-source component library in the class of shadcn/ui, Mantine, Chakra and Ant Design, with Monoline's look. Each task below is owned by one agent or contributor. Components not listed are open for contributions.

Status key: `done` · `in progress` · `open`. Update this table in the PR that finishes a component.

## Tasks (parallel, non-overlapping)

| Task | Owns (folders in `packages/react/src/components/` unless noted) | CSS files it may edit |
|---|---|---|
| **core** | `packages/css/src/{tokens,base,accents,utilities}.css`, `00-app-shell`, `01-sections`, `08-narrow-windows`, `22-printing`, `23-anchors…`, `button` and ThemeProvider/`use-theme` | those, plus `02-buttons.css`, `09-links.css` |
| **forms-basic** | input, textarea, number-input, password-input, search-input, field, label, fieldset, checkbox, radio-group, switch, slider, range-slider, rating, otp-input, file-upload, toggle, toggle-group, segmented-control | `03-form-fields`, `10-choices`, `11-field-states`, `12-range` and new files |
| **forms-advanced** | select, native-select, combobox, autocomplete, multi-select, tags-input, calendar, date-picker, time-picker, color-picker, command | new files only |
| **overlays-feedback** | dialog, alert-dialog, drawer, sheet, popover, tooltip, hover-card, dropdown-menu, context-menu, toast, alert, banner, progress, spinner, skeleton, empty-state | `07-overlays`, `13-loading`, `16-tooltip`, `17-dropdown-menu`, `21-toast-region` and new files |
| **data-layout** | card, badge, tag, avatar, avatar-group, table, data-table, list, stat, timeline, tree, accordion, collapsible, carousel, image, code-block, kbd, separator, aspect-ratio, scroll-area, box, stack, grid, container, flex, center, heading, text, link, blockquote, prose | `04-lists`, `05-marks`, `06-boxes`, `14-table`, `15-accordion`, `19-avatar`, `20-prose` and new files |
| **navigation-hooks** | tabs, breadcrumb, pagination, stepper, navbar, sidebar, app-shell, menubar, navigation-menu, skip-link; hooks in `src/hooks/`: use-disclosure, use-media-query, use-clipboard, use-controllable-state, use-debounce, use-local-storage, use-hotkeys, use-click-outside, use-focus-trap | `18-navigation` and new files |
| **effects** | marquee, number-ticker, typewriter, text-reveal, dot-pattern, grid-pattern, border-beam, spotlight, shimmer-button, orbiting-circles, animated-list, bento-grid, scroll-progress, confetti | new files only (`effects` category; gradients and motion allowed, reduced-motion required) |
| **docs** | `apps/docs/**`, `.github/workflows/pages.yml` | none |
| **infra** | `.github/**` (except pages.yml), `packages/cli/**`, root `package.json` scripts, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`, issue and PR templates, changesets, eslint/prettier | none |

## Phase 2 (after phase 1 merges)

- **blocks**: hero, feature grid, pricing, testimonials, CTA, footer, login, sign-up, dashboard shell, settings page, empty states, as copy-paste sections that compose the components above.
- Charts (thin wrapper over a chart library, optional peer), rich text editor, data grid with virtualisation, form library adapters (react-hook-form), i18n and RTL pass, visual regression tests, a theme builder.

## Components by category (the full target list)

- **layout**: box, stack, flex, grid, container, center, separator, aspect-ratio, scroll-area, app-shell, sidebar, navbar
- **typography**: heading, text, link, blockquote, code, kbd, prose
- **buttons**: button, icon-button, button-group, toggle, toggle-group, segmented-control, copy-button
- **forms**: input, textarea, number-input, password-input, search-input, field, label, fieldset, checkbox, radio-group, switch, slider, range-slider, rating, otp-input, file-upload, select, native-select, combobox, autocomplete, multi-select, tags-input, calendar, date-picker, time-picker, color-picker, command
- **data-display**: card, badge, tag, avatar, avatar-group, table, data-table, list, stat, timeline, tree, accordion, collapsible, carousel, image, code-block
- **feedback**: alert, banner, toast, progress, spinner, skeleton, empty-state
- **overlays**: dialog, alert-dialog, drawer, sheet, popover, tooltip, hover-card, dropdown-menu, context-menu
- **navigation**: tabs, breadcrumb, pagination, stepper, menubar, navigation-menu, skip-link
- **effects**: see the effects task
- **hooks**: see the navigation-hooks task

## Prioritised plan (from `docs/research/coverage-matrix.md`)

Priority = how many of the ten UI libraries ship it. Status is `done` once the folder exists in `packages/react/src/components/`; the matrix regenerates from that (`node docs/research/build-matrix.mjs`).

**Phase 1: close the gap on common components (in 3+ libraries).**
- P1a, small and native-first: stack, container, aspect-ratio, icon-button, button-group, kbd, tag, avatar-group, empty-state, stat, collapsible, scroll-area, table, stepper, timeline, code-block, password-input, number-input, rating, otp-input, segmented-control, alert-dialog, drawer. (All `done`.)
- P1b, accessibility-critical, needs Radix or careful ARIA, heavy model: combobox, autocomplete, multi-select, calendar, date-picker, time-picker, command, context-menu, hover-card, menubar, navigation-menu, toast, toolbar, tree, carousel, file-upload, native-select, fieldset, form helpers, data-table.
- P1c, layout primitives: box, flex, grid, text, heading, link, description-list, image, navbar, sidebar, app-shell.

**Phase 2: depth.** tags-input, color-picker, resizable/splitter, tour, chart wrapper, rich-text, virtualised data grid, blocks (hero, pricing, login, dashboard), form adapters, i18n and RTL.

**Phase 3: effects (original code, reduced-motion safe).** marquee, number-ticker, typewriter, text-reveal, dot-pattern, grid-pattern, border-beam, shimmer, animated-list, bento-grid, scroll-progress, confetti. Not copying Magic UI or Aceternity code; Aceternity's licence forbids redistribution.

**Cross-cutting.** Docs site redesign with theme/accent/font/radius/density controls; `npx monoline add <component>` CLI that copies sources from `registry/`; per-component `meta.json`; hooks (use-disclosure, use-media-query, use-clipboard, use-debounce, use-hotkeys, use-click-outside, use-local-storage); visual regression and axe in CI.

### Status (129 components and hooks, 153 demos, 666 tests)

**Done.** Every component that appears in three or more of the ten surveyed libraries (the matrix reports 0 missing), plus the `monoline` CLI, 12 hooks, 13 effects, 11 page blocks, nine accents, font/corner/density options, the docs site with guides, the registry and `llms*` files, and a test that renders every demo with axe.

**Open (next up). Done since: generated props tables and a theme builder in the docs.**
- Pixel-diff visual regression in CI (needs a browser-automation dev dependency and a baseline).
- Verify the CLI against the real GitHub registry URL once the repo is pushed; publish `@monoline/css`, `@monoline/react` and `monoline` to npm.
- Phase 2: chart wrapper, rich text editor, virtualised data grid, react-hook-form adapters, i18n and RTL pass.
- Hooks: 23 now; Mantine still has more (use-eye-dropper, use-fullscreen, use-idle, use-network, use-queue and others).
