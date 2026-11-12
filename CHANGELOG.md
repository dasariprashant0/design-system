# Changelog

Versions follow [semver](https://semver.org). Before 1.0, a minor version may change class names; each change is listed here.

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
