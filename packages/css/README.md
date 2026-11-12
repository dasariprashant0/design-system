# @monoline/css

Plain CSS for Monoline: design tokens, three themes, nine accents, font/corner/density options and one stylesheet per component. No framework and no build step needed.

```bash
npm install @monoline/css
```

```ts
import '@monoline/css'; // everything, one file (dist/monoline.css); monoline.min.css is the minified build
```

```html
<html data-theme="dark" data-accent="teal" data-font="sans" data-radius="soft" data-density="compact">
```

- `data-theme`: `warm` (default), `dark`, `midnight`
- `data-accent`: `orange` (default), `green`, `blue`, `violet`, `rose`, `teal`, `amber`, `slate`
- `data-font`: `mono` (default), `sans`, `serif`
- `data-radius`: `square` (default), `soft`, `round`
- `data-density`: `compact`, `comfortable` (default), `spacious`

Class names are plain (`.btn`, `.card`, `.dialog-content`). The React components in [`@monoline/react`](../react) render these classes. Rules and the token list: [DESIGN.md](../../DESIGN.md).
