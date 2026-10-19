# Design rules (@personal/ui)

> The one design source for every personal app. Read this before building or changing any screen. The code is in `css/` and `react/`; see it all running with `npm --prefix gallery run dev` (http://localhost:5180).

**The look in one line:** paper and ink, monospace type, square edges, thin rules instead of boxes, and one loud accent per app.

It comes from the portfolio site and was first built in loadout. Every app shares the base; each app picks only its accent.

| App | Accent (warm / dark / midnight) | Brand file |
|---|---|---|
| loadout | `#FF4500` / `#FF4500` / `#AAFF00` (the defaults) | none needed |
| gloamlog | `#0E7A5F` / `#45C29C` / `#5FD6B2` | `frontend/src/brand.css` |

---

## 1. Use it in an app

Stack: React + TypeScript + Vite, inside Wails for desktop apps.

```bash
npm install --save "@personal/ui@git+https://github.com/dasariprashant0/design-system.git#<commit>"
```

Pin a full commit hash, so CI and clean checkouts build the same kit. To take a newer kit into an app, change the hash in its
`package.json` and run `npm install`. While changing the kit itself, `npm install --save @personal/ui@file:<path to this repo>`
links it live; switch back to the pinned hash before you commit the app.

```ts
// main.tsx: in this order, before the app's own CSS
import '@personal/ui/tokens.css';
import '@personal/ui/base.css';
import '@personal/ui/components.css';
import './brand.css';   // only if the app has its own accent
import './app.css';     // app-only layouts; tokens only
```

```ts
// vite.config.ts: with a file: link the package is a symlink; keep it inside node_modules so it uses the app's React
export default defineConfig({plugins: [react()], resolve: {preserveSymlinks: true}});
```

```jsonc
// tsconfig.json compilerOptions
"preserveSymlinks": true
```

`brand.css` overrides only the accent group, per theme:

```css
:root, [data-theme="warm"] { --accent: #0E7A5F; --accent-text: #0B6A52; --accent-2: #E0A23A; --on-accent: #FFFFFF; }
[data-theme="dark"]        { --accent: #45C29C; --accent-text: #45C29C; --accent-2: #E0A23A; --on-accent: #06241C; }
[data-theme="midnight"]    { --accent: #5FD6B2; --accent-text: #5FD6B2; --accent-2: #FFC857; --on-accent: #06241C; }
```

A new accent must pass: `--accent-text` on `--background` at least 4.5:1, `--accent` on `--background` at least 3:1, and `--on-accent` on `--accent` at least 4.5:1, in all three themes. Add the app to the table above.

## 2. Principles

1. **Tokens only.** No raw hex, px font size, or spacing number in a screen or app CSS. If a value is missing, add a token here first.
2. **Rules, not boxes.** Separate things with 1px `--rule` lines and space. Use a card only when the box itself means something, such as a thing you can pick up or open.
3. **One accent, used sparingly.** The accent marks the current thing, the one action, or a warning about loss. If more than about 5% of a screen is accent, cut some.
4. **Ink density before colour.** Tell kinds apart with `--ink-1` to `--ink-5` and `--hatch`, never new hues.
5. **Plain words.** Say what happened and what to do next, in short sentences. No jargon, no "Oops".
6. **Square and quiet.** `--radius` is 0. No shadows except the toast. No gradients except `--hatch`.
7. **Undo over confirm.** Destructive actions run and offer Undo in a toast. Use a dialog only when undo is impossible.

## 3. Tokens

All in `css/tokens.css`. Three themes, set on `<html data-theme>` by `useTheme()`.

| Group | Tokens | Use |
|---|---|---|
| Surface | `--background`, `--foreground`, `--muted`, `--surface`, `--surface-text` | Page, text, secondary text, the always-dark toast/code panel |
| Lines | `--rule`, `--wash`, `--wash-2` | Dividers; hover and selected fills; code blocks |
| Accent (per app) | `--accent`, `--accent-text`, `--accent-2`, `--on-accent` | Fills and marks; accent as text; a second mark; text on an accent fill |
| Status | `--danger`, `--warning`, `--ok` | Loss or failure; needs attention; done. Text-safe in each theme |
| Ink | `--ink-1` … `--ink-5`, `--hatch` | Kinds in charts, legends, swatches |
| Type | `--font-display`, `--font-body`, `--text-xs/sm/base/lg`, `--display-sm/md/xl` | See §4 |
| Space | `--s1` 4 · `--s2` 8 · `--s3` 12 · `--s4` 16 · `--s5` 24 · `--s6` 32 · `--s7` 48 · `--s8` 64 · `--s9` 96 | Every margin, gap and padding |
| Motion | `--ease`, `--fast` .12s, `--base` .2s, `--slow` .45s | See §8 |
| Layout | `--side` 264px, `--measure` 64ch, `--content` 1080px | Sidebar, longest line, widest column |

Never use `--border` for a visible line: it is about 1.1:1 in dark themes. Use `--rule`.

## 4. Type

- **Body:** DM Mono 400, 15px (`--text-base`), line-height 1.55, tabular numbers everywhere.
- **Display** (`.display`): Space Mono 700, uppercase, tight. Use it only for the page title (`Display`), section titles (`SectionTitle`), dialog titles and one big number. Never for body text or buttons.
- **Label** (`.label`): 11px uppercase, spaced, muted. Use it for the kicker above a title, field labels and sidebar group names.
- **Sizes:** `--text-xs` for meta and badges, `--text-sm` for secondary lines and buttons, `--text-base` for reading, `--text-lg` for drawer intros. Nothing else.
- **Weights:** 400 for text, 500 for emphasis and row titles, 700 for display only.
- Keep lines at or under `--measure`. Use sentence case everywhere in markup; CSS uppercases the display text.

## 5. Layout

**App shell** (`Shell`): a sidebar (`--side`) and a scrolling main column (padding `--s7`, max width `--content`). It stacks below 900px.

**Sidebar, top to bottom:** `Brand`, a `.label` group name, `NavItem`s (the current one gets the accent bar), then `.side-foot` with settings and `ThemeSwitch`.

**A page, top to bottom:**
1. `.head`: a `.label` kicker, a `Display` title of 1–2 short lines, and the page's one solid button on the right.
2. `Tabs`, if the page has views.
3. `section.block`s, each with a `SectionTitle`, an optional `.lede`, then content. Blocks are `--s9` apart.

**Grids:** use `.two` for side by side and `.stack` for a vertical list of controls. Keep `.row-gap` for a row of buttons or chips. Use no other grid systems.

**Room for focus.** The focus ring is 2px drawn 3px outside a control, so it takes 5px of the space around it. Leave room for it:
- `--s2` or more between two focusable things, and between a field and the text under it (`.field-hint` already does).
- A control inside a field sits `--s3` in from its edge: `.input-wrap` around the input, `.input-end` on the control.
- Text edited in place inside a row uses `.input-bare`, which pads the text by `--s2` without moving it.
- Keyboard hints under a field are a `.key-hints` line, each key and its word in a `span`.
- Check with Tab, not only the mouse: no ring may touch text, a border or another control.

## 6. Components: which one when

| Need | Use | Not |
|---|---|---|
| The main action on a view | `Button` (solid). One per view | Two solid buttons side by side |
| Other actions | `Button variant="line"`; inline links: `variant="ghost"` | Coloured buttons |
| Delete, discard | `Button variant="danger"`, then a toast with Undo | A dialog, when undo is possible |
| Pick 2–4 options | `Segmented` | A select |
| Pick from 5 or more | `<select className="select">` in a `Field` | Custom dropdowns |
| On/off | `Switch`; in settings, inside a `Setting` row | A checkbox for a setting |
| Text input | `<input className="input">` in a `Field` (label above, hint or error below) | Placeholder as the label |
| A control inside a field | `.input-wrap` + `.input-end` (`--s3` in from the edge) | A control laid over the text |
| Edit text in place in a row | `<textarea className="input-bare">` | A bordered input that shifts the row |
| Keys you can press | `.key-hints` of `Kbd` + word pairs | Keys run together in a sentence |
| A list of things | `ul.list` of `Row`s (mark, title, meta, end) | Cards in a grid |
| Details of one thing | `Drawer` from the right | A new page, a modal |
| A question that blocks | `Dialog` (native `<dialog>`, focus trapped) | Drawer, toast |
| What just happened | `Toast`, with Undo when it can | A banner that stays |
| A state that lasts (sync, conflict, error) | `Banner` (`accent`, `warning`, `danger`) at the top of the content | A toast |
| A few numbers | `Facts` | A table |
| Counts over time | `.heat-0` … `.heat-4` cells | New colour ramps |
| Nothing to show | `Empty`: what goes here plus the one action that fills it | A blank page |
| Keyboard shortcut | `Kbd` | Plain text |
| A count or status word | `Badge` (`accent` only for "new" or "now") | Coloured text |

## 7. Copy

- Buttons are verbs: "Save", "Write today", "Open folder". Not "OK", "Submit" or "Yes".
- Errors say what happened, then what to do: "Can't save. The notes folder is read-only. Pick another folder in Settings."
- Empty states say what goes here: "No entries yet. They appear here when you write a day or Claude logs work."
- Numbers are exact and labelled: "12 days", not "a dozen". Say "estimated" when a number is estimated.
- Use no exclamation marks, no emoji in the UI, and no "please".

## 8. Motion

- There is one entrance per page: the `Display` lines rise once. Lists may fade in. Nothing loops.
- Use `--fast` for hover and colour, `--base` for overlays and toggles, and `--slow` for a list arriving. Ease with `--ease`.
- Every animation stops under `prefers-reduced-motion`; `base.css` handles that. Don't override it.

## 9. Accessibility

- Every control is a real `<button>`, `<input>`, `<select>` or `<a>`, so it works with keyboard and screen readers.
- Focus is always visible: `:focus-visible` draws a 2px accent ring. Never remove it.
- Text contrast is at least 4.5:1. Use `--muted` for secondary text, never lighter.
- Never use colour alone. Status also has a word (the `strong` in a `Banner`) or a shape (`.check`).
- Name icon-only buttons with `aria-label`. Mark current items with `aria-current` and toggles with `aria-pressed` or `aria-checked`.
- Escape closes drawers and dialogs. Dialogs return focus where it was.

## 10. Don't

- Use raw colours, font sizes or spacing in screens or app CSS.
- Use `border-radius`, drop shadows, gradients, glassmorphism or blur.
- Add icon fonts or icon libraries. Use words, `Kbd`, swatches and the `.dot`. Add an inline SVG only when a word won't do, drawn with `currentColor`.
- Add a UI library (MUI, Chakra, Tailwind, shadcn). This kit is the UI library.
- Put a second accent colour in an app, or use `--accent-2` for text.
- Center-align body text. Text is left-aligned; only the toast is centred.

## 11. Changing the system

- **App-only layout** (gloamlog's calendar grid, loadout's token bar) goes in that app's `app.css`, using tokens.
- **Second use:** when a pattern appears in a second app, move it here (CSS class first, then a React wrapper if it has behaviour) and add it to the gallery.
- **Adding a token:** add it to all three themes if it's a colour, add it to §3, and show it in the gallery.
- After any change, open the gallery in all three themes with both brands. Then rebuild each app (`npm run build` in its frontend).

## 12. Before you call a screen done

- [ ] Only tokens and kit classes; the app CSS has no raw values.
- [ ] One solid button per view; danger actions offer Undo.
- [ ] It works in warm, dark and midnight, and with the window at 900px wide.
- [ ] Keyboard only: you can reach everything, focus is visible, and Escape closes overlays.
- [ ] Tab through it: no focus ring touches text, a border or another control (§5, Room for focus).
- [ ] Empty, loading and error states exist and use plain words.
- [ ] Nothing animates except the title reveal and overlays.
