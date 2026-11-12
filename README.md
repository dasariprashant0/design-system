# Monoline

A small UI kit in monospace type, thin rules and square edges. Plain CSS with three themes (warm, dark, midnight) and four accents (orange, green, blue, violet), 40+ components, layout utilities, optional JavaScript behaviours and React wrappers, and design tokens as JSON. Contrast is tested in CI. No build step is needed to use it.

**Docs and live examples:** https://dasariprashant0.github.io/design-system/

## Use it in 30 seconds

```html
<link rel="stylesheet" href="https://dasariprashant0.github.io/design-system/css/monoline.css">

<html data-theme="warm" data-accent="green">
  <button class="btn btn-solid">Save</button>
  <button class="btn btn-line">Cancel</button>
</html>
```

`data-theme` is `warm`, `dark` or `midnight`. `data-accent` is `orange` (default), `green`, `blue` or `violet`.

With npm (from git until it is published):

```bash
npm install "monoline-ui@git+https://github.com/dasariprashant0/design-system.git#<commit>"
```

```ts
import 'monoline-ui/monoline.css';           // everything in one file
// or: tokens.css, base.css, components.css, accents.css, in that order
import {Button, Field, useTheme} from 'monoline-ui/react'; // optional
```

Pin a full commit hash so every build gets the same kit.

## Rules and files

- **Rules:** [DESIGN.md](DESIGN.md). Read it before building a screen.
- **Docs page:** [index.html](index.html), also the live site above. Open it straight from disk.
- **Live gallery:** `npm --prefix gallery install && npm --prefix gallery run dev`, then open http://localhost:5180.

| Path | What |
|---|---|
| `css/tokens.css` | Every colour, size, space and timing; three themes |
| `css/base.css` | Fonts (DM Mono, Space Mono, OFL), reset, type roles |
| `css/components.css` | Shell, buttons, fields, lists, banners, drawer, dialog, toast |
| `css/utilities.css` | Layout helpers: container, flow, cluster, grid, split |
| `css/accents.css` | The four accent presets, checked for contrast in every theme |
| `css/monoline.css`, `.min.css` | All of the above as one file, for a CDN link. Generated: `npm run build` |
| `js/monoline.js` | Optional behaviours: tabs, dropdown, drawer, dialog, toast, theme saving |
| `tokens/tokens.json` | Every token in the W3C design-tokens format. Generated |
| `scripts/` | `build` and `check` (contrast and no-raw-colour tests, run in CI) |
| `react/index.tsx` | Thin React wrappers over those classes, plus `useTheme` |
| `index.html` | The docs site |
| `gallery/` | A React page showing every component |
| `skill/` | A Claude skill that makes a coding agent follow DESIGN.md |

## Contributing

Change `css/` and `react/`, keep DESIGN.md in step, run `npm run build`, and commit the generated `css/monoline.css`. See [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md).

## License

MIT. The bundled fonts are under the SIL Open Font License; see `css/fonts/OFL.txt`.
