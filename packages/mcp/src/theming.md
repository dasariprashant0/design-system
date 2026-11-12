# Theming Monoline

Monoline is themed with data attributes on `<html>` and CSS custom properties. Never write raw colours, font sizes or spacing numbers: use tokens.

## Data attributes (set on `<html>`)

| Attribute | Values | Default |
|---|---|---|
| `data-theme` | `warm`, `dark`, `midnight` | `warm` |
| `data-accent` | `orange`, `green`, `blue`, `violet`, `rose`, `teal`, `amber`, `slate` | `orange` (leave the attribute off) |
| `data-font` | `mono`, `sans`, `serif` | `mono` |
| `data-radius` | `square`, `soft`, `round` | `square` |
| `data-density` | `compact`, `comfortable`, `spacious` | `comfortable` |

```html
<html data-theme="dark" data-accent="green" data-font="mono" data-radius="square" data-density="comfortable">
```

In React, `useTheme()` from `@monoline/react` sets `data-theme` for you. Every accent passes the contrast rules in all three themes.

## Setup

```ts
import '@monoline/css';            // tokens, base, accents, options and all components
// or, with `npx monoline add`, import tokens.css, base.css, accents.css once and each component's own CSS.
```

## Tokens

| Group | Tokens | Use |
|---|---|---|
| Surface | `--background`, `--foreground`, `--muted`, `--surface`, `--surface-text` | Page, text, secondary text, the always-dark toast and code panel |
| Lines | `--rule`, `--wash`, `--wash-2` | Dividers; hover and selected fills; code blocks |
| Accent | `--accent`, `--accent-text`, `--accent-2`, `--on-accent` | Fills and marks; accent as text; a second mark; text on an accent fill |
| Status | `--danger`, `--warning`, `--ok` | Failure or loss; needs attention; done |
| Ink | `--ink-1` to `--ink-5`, `--hatch` | Kinds in charts and legends |
| Type | `--font-display`, `--font-body`, `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--display-sm`, `--display-md`, `--display-xl` | Type scale |
| Space | `--s1` 4px, `--s2` 8, `--s3` 12, `--s4` 16, `--s5` 24, `--s6` 32, `--s7` 48, `--s8` 64, `--s9` 96 | Every margin, gap and padding |
| Layout | `--side`, `--measure`, `--content`, `--window-pad` | Sidebar width, line length, widest column, window inset |
| Motion | `--ease`, `--fast`, `--base`, `--slow` | Transitions |
| Shape | `--radius` | 0 by default |

Use `--rule` for visible lines, never `--border`.

## Rules

- Tokens only. No raw hex, px font size or spacing number.
- Thin 1px `--rule` lines instead of boxes. Square edges. No shadows (except toast and popover), no gradients (except `--hatch`).
- One accent per project, used sparingly. Use ink density (`--ink-1` to `--ink-5`) to tell kinds apart, not new hues.
- Plain words: buttons are verbs ("Save"), errors say what happened and what to do, no exclamation marks, no emoji.
- One solid `Button` per view; the rest are `variant="line"`.
- Respect `prefers-reduced-motion`. Keep the focus ring.
