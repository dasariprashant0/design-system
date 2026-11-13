# @monoline/css

Plain CSS for Monoline: design tokens, three themes, nine accents, font/corner/density options and one stylesheet per component. No framework and no build step needed.

```bash
npm install @monoline/css
```

Three ways to load it (sizes are minified + gzip; details in [docs/css-modules.md](../../docs/css-modules.md)):

```ts
// 1. Everything, one file: 16.3 KB
import '@monoline/css'; // dist/monoline.css; monoline.min.css is the minified build

// 2. Core plus only the components you use: core 3.3 KB, then 0.1 to 2.3 KB per component
import '@monoline/css/core.css';           // first: it declares the cascade-layer order
import '@monoline/css/components/button.css';
import '@monoline/css/components/dialog.css';

// 3. Copy the source into your project: `npx monoline add button dialog` writes button.css and dialog.css
```

Every stylesheet sits in a cascade layer (`monoline.base`, `monoline.tokens`, `monoline.components`, `monoline.utilities`), so any CSS you write outside a layer overrides the kit without specificity fights. `components/index.json` maps each component to the source files in its bundle.

```html
<html data-theme="dark" data-accent="teal" data-font="sans" data-radius="soft" data-density="compact">
```

- `data-theme`: `warm` (default), `dark`, `midnight`
- `data-accent`: `orange` (default), `green`, `blue`, `violet`, `rose`, `teal`, `amber`, `slate`
- `data-font`: `mono` (default), `sans`, `serif`
- `data-radius`: `square` (default), `soft`, `round`
- `data-density`: `compact`, `comfortable` (default), `spacious`

Class names are plain (`.btn`, `.card`, `.dialog-content`). The React components in [`@monoline/react`](../react) render these classes. Rules and the token list: [DESIGN.md](../../DESIGN.md).

## Class names, layers and collisions

Class names are short and unprefixed on purpose, so they can collide with your own CSS. Every Monoline rule sits in a cascade layer (`monoline.base`, `monoline.tokens`, `monoline.components`, `monoline.utilities`; core.css declares the order). **CSS you write outside any layer beats all of them whatever its specificity**, so `.card { padding: 0 }` in your app wins without `!important`. If you use your own layers, declare them after `monoline`: `@layer monoline, app;`.

Collisions go the other way too: a class you invent that the kit already styles (a wrapper called `.toolbar` gets a border). The names most likely to clash:

| Class | The kit gives it | Advice |
|---|---|---|
| `.card` | border, padding, surface | Name your wrapper `.product-card` or use the `Card` component |
| `.badge` | inline pill, border, tiny type | Use `.status-badge`, or set the look yourself in unlayered CSS |
| `.label` | small muted caps-style label | Prefer `.field-label`; keep `.label` for the kit |
| `.input` | fixed 48px height, 1px border, padding | Never put it on a wrapper; use `.input-wrap` or your own name |
| `.btn` | height, padding, hover fill | Only on buttons and links that should look like buttons |
| `.container` | centred column with side padding and max width | Use `.page-width` for your own; or reuse `Container` |
| `.text` | zero margin, base size | Use `.copy` or `.body-text` for your own |
| `.stack` | flex column with a gap | Same name means same meaning; do not give it other rules |
| `.table` | collapsed borders, header style | Use `.data-table-wrap` for wrappers |

Other short names the kit owns: `.toolbar`, `.row`, `.section`, `.tag`, `.grid`, `.empty`, `.display`, `.prose`, `.field`. Rule of thumb: if you name a class with one common English word, check this list or prefix it with your app name.

## Spacing rhythm and one casing rule

Bare `Field`, `Heading`, `Text`, `Alert` and `Button` siblings directly inside a `Card`, a `Dialog` or `.prose` are spaced by `--flow` (default `--s4`; a heading gets 1.5 steps), so blocks do not touch. Set `--flow` on the container to change it. Buttons next to each other stay on one line. Outside those three containers use `Stack` or `Form`.

Uppercase and the huge size belong to `.display` / `.display-*` (the page title) only. Every `Heading`, dialog title and prose heading is sentence case, also with `data-font="sans"` and `"serif"`. `Heading size="display"` (the default `h1`) is 28 to 44px; use `.display-md` for a landing hero.
