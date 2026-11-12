# Monoline

An open-source UI kit with a plain CSS core and accessible React components. Thin rules, one accent, monospace by default, and every part of the look can be changed: nine accents, three themes, three font families, three corner styles and three densities.

- **118 components and hooks**: buttons, forms (combobox, calendar, date picker, OTP, file upload), overlays (dialog, drawer, menus, toast), data display (data table, tree, timeline), navigation, effects and page blocks.
- **Accessible by default**: built on Radix or native elements, with keyboard and axe tests for every component.
- **Plain CSS tokens**: no Tailwind, no runtime CSS-in-JS. Restyle by changing variables.
- **Two ways to use it**: install the packages, or copy a component into your project with the CLI.
- **AI-readable**: every component has a `meta.json`; `llms.txt`, `llms-full.txt` and `registry/` list and describe them all. See [AGENTS.md](AGENTS.md).

## Use it

```bash
npm install @monoline/react @monoline/css
```

```tsx
import '@monoline/css';
import {Button} from '@monoline/react';

export const App = () => <Button variant="solid">Save</Button>;
```

Set the look on `<html>`:

```html
<html data-theme="dark" data-accent="teal" data-font="sans" data-radius="soft" data-density="compact">
```

| Attribute | Values |
|---|---|
| `data-theme` | `warm` (default), `dark`, `midnight` |
| `data-accent` | `orange` (default), `green`, `blue`, `violet`, `rose`, `teal`, `amber`, `slate` |
| `data-font` | `mono` (default), `sans`, `serif` |
| `data-radius` | `square` (default), `soft`, `round` |
| `data-density` | `compact`, `comfortable` (default), `spacious` |

Every accent passes the contrast rules in every theme; `npm run check` enforces it.

## Copy components instead (shadcn style)

```bash
npx monoline init
npx monoline add combobox date-picker data-table
```

The CLI copies the source and CSS into your project and lists any dependencies. See [packages/cli/README.md](packages/cli/README.md).

## Repository

| Path | What |
|---|---|
| `packages/css` | `@monoline/css`: tokens, themes, accents, options, one stylesheet per component |
| `packages/react` | `@monoline/react`: one folder per component or hook (source, test, demo, `meta.json`) |
| `packages/cli` | the `monoline` CLI |
| `apps/docs` | the documentation site; discovers components automatically |
| `registry/`, `llms.txt`, `llms-full.txt` | generated machine-readable list and source |
| `docs/research` | the library comparison this kit is based on, and the roadmap in `docs/ROADMAP.md` |
| `DESIGN.md` | the look, tokens and rules |

```bash
npm install
npm run dev        # docs site on http://localhost:5180
npm run check      # contrast + raw-colour lint, typecheck, tests
npm run build      # css, react and docs
npm run registry   # regenerate registry/ and llms files
```

## Contributing

Read [AGENTS.md](AGENTS.md) (conventions and the component recipe, for people and AI tools) and [CONTRIBUTING.md](CONTRIBUTING.md). New components need a test with an axe check, a demo and a `meta.json`.

## License

MIT. Fonts (DM Mono, Space Mono) are under the SIL Open Font License; see `packages/css/src/fonts/OFL.txt`.
