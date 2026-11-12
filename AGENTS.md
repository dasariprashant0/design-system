# AGENTS.md: how to work in Monoline

Read this first. It is written for AI agents and human contributors alike. If a rule here conflicts with a habit from another library, this file wins.

## What this repo is

Monoline is an open-source UI kit with two layers:

| Layer | Package | What |
|---|---|---|
| Core | `packages/css` → `@monoline/css` | Plain CSS: tokens, 3 themes, 9 accents, look options (font, corners, density), base, one stylesheet per component. Works with any framework or none. |
| CLI | `packages/cli` → `monoline` | `npx monoline add <component>` copies a component and its CSS from `registry/` into a project. No dependencies. |
| React | `packages/react` → `@monoline/react` | Accessible, typed React components that render the core's classes. Complex behaviour comes from Radix (`radix-ui`). |
| Docs | `apps/docs` | The documentation site. Discovers components automatically. |
| Registry | `registry/`, `llms.txt`, `llms-full.txt` | Generated, machine-readable component list and source for AI tools. |

Look and feel: monospace type, square edges, thin rules, one accent. Rules and token list: `DESIGN.md`. Comparable libraries for scope and API shape: shadcn/ui, Radix, Mantine, Chakra, Ant Design, daisyUI, Headless UI, Base UI, HeroUI, Magic UI. Take their component coverage and prop conventions; keep Monoline's look.

## Commands (run from the repo root)

```bash
npm install --cache "$TMPDIR/npm-cache"   # once
npm run dev                               # docs site on :5180, live components and CSS
npm test                                  # vitest + axe for every component
npm run typecheck                         # tsc for react + docs
npm run check                             # css contrast + raw-colour lint, typecheck, tests
npm run build                             # css dist, react dist, docs site
npm run registry                          # regenerate registry/ and llms*.txt
```

## Where things live

```
packages/css/src/tokens.css, base.css, accents.css, options.css, utilities.css
packages/css/src/components/NN-name.css   legacy numbered files (keep order) and <name>.css for new ones
packages/css/js/monoline.js               optional vanilla behaviours for CSS-only users
packages/react/src/components/<name>/     one folder per component (see recipe)
packages/react/src/hooks/<name>/          one folder per hook, same shape
packages/react/src/index.ts               GENERATED, gitignored
apps/docs/                                docs site
registry/, llms.txt, llms-full.txt        GENERATED, committed only by the maintainer
```

## The component recipe

Reference implementation: `packages/react/src/components/button/`. Copy its shape.

```
packages/react/src/components/<name>/
  <name>.tsx        the component(s)
  <name>.test.tsx   behaviour tests + one axe test
  <name>.demo.tsx   live examples:  export const demos: Demo[] = [{title, description?, render}]
  meta.json         name, title, category, description, status, primitive?, css[], a11y[], keywords[]
  index.ts          export {X} and its Props type; nothing else
packages/css/src/components/<name>.css   styles, tokens only
```

`meta.json` is validated by `npm run registry`. `name` equals the folder. `css` lists the stylesheets (in `packages/css/src/components/`) the component needs.

### API conventions (follow these so every component feels the same)

- `forwardRef` to the root DOM element. Spread remaining props onto it. Accept and merge `className` with `cx()`.
- Variants are string unions: `variant`, `size` (`sm | md | lg`), `tone`. Defaults are the most common use. Boolean props are `isX`-free: `disabled`, `loading`, `invalid`, `required`.
- Polymorphism: `asChild` using Radix `Slot` where a different element makes sense. No `as` prop.
- Controlled and uncontrolled pairs follow one pattern: `value` / `defaultValue` / `onValueChange(value)`; `open` / `defaultOpen` / `onOpenChange(open)`; `checked` / `defaultChecked` / `onCheckedChange(checked)`. Radix already does this: pass it through.
- Compound components for anything with parts: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`... exported as named exports (not `Dialog.Trigger`), so they tree-shake and read plainly.
- State is exposed as `data-state="open|closed|checked|..."` and `data-disabled`, `data-invalid`, never class toggles that consumers must guess. CSS styles `[data-state=...]`.
- Add props, never change or remove one. A new prop is optional. Name booleans positively.
- No default exports in component files. No barrel imports across components: import from `../other-component`.
- Server-safe: no `window` access during render. Add `'use client'` only where hooks or handlers are used (a file-top directive is fine in every interactive component).
- No runtime CSS-in-JS, no Tailwind, no icon libraries. Icons are inline SVG with `currentColor`, `aria-hidden`, passed as `children` or props. If a component needs a built-in glyph (chevron, check), write a 10-line inline SVG in that component's folder.
- Dependencies: only `radix-ui` and React. A new dependency needs a reason in the PR and must be a peer or optional where possible.

### CSS rules

- Tokens only: no raw hex, px font size or spacing number. `npm run check` fails on raw colours. If a value is missing, add a token to `tokens.css` first (all three themes).
- Square edges (`--radius` is 0), thin `--rule` lines, no shadows except toast/popover layers, no gradients except `--hatch` (the `effects` category is exempt but must respect `prefers-reduced-motion`).
- Style Radix and native state through attributes: `[data-state="open"]`, `[aria-current]`, `[aria-invalid="true"]`, `:disabled`. Focus uses `:focus-visible` with the shared ring.
- A component's CSS lives in its own file, named after the component. Do not append to another file.
- Class names are plain and unprefixed (`.btn`, `.card`, `.dialog`). Variants are a second class (`.btn-solid`). Parts use a dash (`.card-header`). Keep them short and unsurprising.
- Every component works with CSS alone where the element is native (details, dialog, progress). Behaviour that needs JS goes in the React component; `monoline.js` only covers what existed.

### Accessibility is part of the definition of done

WCAG 2.2 AA. For each component, `meta.json` `a11y` lists the keyboard and screen reader behaviour, and the test file proves it:

- Native element first, then Radix, then ARIA. Never `div` + `onClick`.
- Every interactive part is reachable and operable by keyboard; Escape closes overlays; focus returns to the trigger; no keyboard trap.
- Every control has an accessible name (label, `aria-label`, `aria-labelledby`). Icon-only buttons require `aria-label` (make it a required prop in the type).
- Errors use `aria-invalid` and `aria-describedby`. Status changes use `role="status"` or `role="alert"` sparingly.
- Targets at least 24×24 CSS px; focus ring never hidden; colour is never the only signal.
- Motion respects `prefers-reduced-motion` (base.css already zeroes animations).
- One `axe` test per component (`expect(await axe(container)).toHaveNoViolations()`), plus interaction tests with `@testing-library/user-event`.

### Tests

Vitest + Testing Library + `vitest-axe`. Test behaviour users see (roles, names, keyboard), not implementation. Cover: renders and default props, each variant class, controlled and uncontrolled use, keyboard operation, disabled, ref forwarding, `asChild` if supported, axe. Portal content (dialogs, menus) is found via `screen`, not `container`.

## Parallel work: ownership rules

Several agents may build at once, each in its own worktree. To avoid conflicts:

1. Work only inside the folders and CSS files your task owns (listed in `docs/ROADMAP.md`). Do not edit another category's component or CSS files; open a note in your report instead.
2. Never hand-edit or commit generated files: `packages/react/src/index.ts`, `registry/`, `llms.txt`, `llms-full.txt`, any `dist/`.
3. Shared files (`tokens.css`, `base.css`, `accents.css`, `options.css`, `utilities.css`, `package.json`, `AGENTS.md`, `DESIGN.md`) belong to the `core` task. If you need a token, add it in your own CSS file as a component-scoped custom property (`--dialog-width`) and note it in your report.
4. Commit early and small, on your own branch. Message style: `button: add loading state`.
5. Finish with the Definition of done below, and report: what you built, what you could not finish, anything another task must change.

## Definition of done (per component)

- [ ] Folder has all five files; `meta.json` valid; `index.ts` exports component and `*Props` types.
- [ ] CSS in its own file, tokens only, works in warm/dark/midnight, all nine accents and the font/corner/density options, at 360px and 1200px.
- [ ] Keyboard and screen reader behaviour implemented, listed in `meta.json`, and tested.
- [ ] `npm test`, `npm run typecheck` and `npm run check` pass.
- [ ] Your demos render in `packages/react/src/all-demos.test.tsx` (axe, no console errors; it runs automatically).
- [ ] The docs site shows every demo with no console errors (`npm run dev`, check the page).
- [ ] Copy follows `DESIGN.md` §7 (verbs, plain words, no exclamation marks).
- [ ] No new dependency, or the reason is in the report.

## Style of work

- Small, reviewable, boring code. No abstractions without a second use.
- Say what you did in plain words. Do not claim a thing works until you ran it.
- When the spec is unclear, pick the convention from shadcn/ui or Radix, note the choice in the component's doc comment, and move on.
