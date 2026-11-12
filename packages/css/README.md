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
