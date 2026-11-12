# Loading only the CSS you use

`@monoline/css` ships one 16.3 KB (gzip) file with everything, and also a small core plus one file per component. A page with Button, Card and Dialog needs about 5 KB instead of 16.

## Sizes (minified, gzip, measured by `npm run size:css -w @monoline/css`)

| Import | Size |
|---|---|
| `@monoline/css` (everything, `monoline.min.css`) | 16.3 KB (was 16.4 KB before layers) |
| `@monoline/css/core.css` (tokens, 3 themes, 9 accents, options, base, utilities) | 3.3 KB |
| a component bundle (`button` 0.6, `dialog` 0.5, `card` 0.5, `select` 0.5, `data-grid` 0.7) | 0.1 to 2.3 KB; the largest is `block-settings-form` |
| core + button + card + dialog | about 5.0 KB |

Budgets enforced by `npm run check`: `core.css` at most 6 KB, any single component bundle at most 4 KB. All bundles are well under; none needed an exception.

## Way 1: everything

```ts
import '@monoline/css';
```

## Way 2: core plus the components you use

```ts
import '@monoline/css/core.css';              // import first
import '@monoline/css/components/dialog.css'; // dialog.css already contains what Dialog needs
import '@monoline/css/components/button.css';
```

Each `components/<name>.css` is exactly the stylesheets listed in that component's `meta.json` (`css` array), concatenated in the same order as the full build and de-duplicated inside the bundle. Some components share legacy files (for example `02-buttons.css` serves several), so importing two components can repeat a few rules; they are identical and harmless. `components/index.json` shows which source files each bundle holds. The source files are also available one by one at `@monoline/css/components/parts/<file>.css`.

Without a bundler, link the same files from `node_modules/@monoline/css/dist/`. `core.css` points at `./fonts/` next to it, so keep the `dist` layout.

## Way 3: copy through the CLI

```bash
npx monoline init
npx monoline add button dialog
```

The CLI copies the component source plus one `<name>.css` per component (the same contents as the bundle) into your project. Import `@monoline/css/core.css` once first.

## Cascade layers

`core.css` starts with the only layer-order declaration:

```css
@layer monoline.base, monoline.tokens, monoline.components, monoline.utilities;
```

`base.css` goes in `monoline.base`; tokens, accents and options in `monoline.tokens`; every component in `monoline.components`; layout utilities in `monoline.utilities` (they still win over components, as before). CSS outside any layer beats all of these whatever its specificity, so `.btn { border-radius: 0 }` in your app stylesheet wins over the kit without `!important` or a longer selector. Import `core.css` before any component file so the order is fixed before a component layer is first seen.

Two details: a declaration with `!important` inside a layer outranks a normal one in your app's unlayered CSS (the kit uses `!important` only for `prefers-reduced-motion` and print), and your own layers must be declared after `monoline` if you want them to win over it.

## How it is checked

`npm run check` builds every stylesheet in memory, parses each with esbuild's CSS parser (any warning fails), and compares the rules inside the layers with the source files to prove wrapping lost nothing. It then enforces the size budgets above.
