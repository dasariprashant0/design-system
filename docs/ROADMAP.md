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
