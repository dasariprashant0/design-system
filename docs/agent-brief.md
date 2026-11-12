# Brief for parallel build sessions

You are one of several sessions building Monoline in parallel, each in its own git worktree with its own branch. Read `AGENTS.md` (conventions, component recipe, definition of done) first, then this file.

## Hard rules

1. **Own only your files.** Your task lists the folders you own. Do not edit anything else. Never edit or commit generated files: `packages/react/src/index.ts` (gitignored), `registry/`, `llms.txt`, `llms-full.txt`, `docs/research/coverage-matrix.md`, any `dist/`. Do not edit `docs/ROADMAP.md`, `DESIGN.md`, `AGENTS.md`, `package.json` (root), `apps/docs/**`, `packages/css/src/{tokens,base,accents,options,utilities}.css`, or `.claude/**`. If you need a change there, say so in your report.
2. **New CSS goes in its own file** `packages/css/src/components/<name>.css`, tokens only (no raw hex). Effects may use gradients and motion but must respect `prefers-reduced-motion`.
3. **Commit locally on your branch** in small commits. Do not push. Do not publish. Do not open PRs. Message style: `combobox: add loading state`.
4. Do not run a dev server (the sandbox blocks binding local ports). Verify with tests, typecheck and `npm run build`.

## How to build a component (follow an existing one)

Copy the shape of `packages/react/src/components/combobox/` (custom ARIA widget), `.../calendar/` (grid), `.../alert-dialog/` (Radix wrapper) or `.../stack/` (simple). Each component folder has: `<name>.tsx`, `<name>.test.tsx`, `<name>.demo.tsx` (exports `demos: Demo[]`), `meta.json` (`name`, `title`, `category`, `description`, `status`, `primitive?`, `uses?`, `css[]`, `a11y[]`, `keywords[]`), `index.ts` (named exports and `*Props` types). Radix is available as `radix-ui` (e.g. `import {Dialog} from 'radix-ui'`).

## Test and check commands (run from the repo root of your worktree)

```bash
npm install --cache "$TMPDIR/npm-cache"   # once (may print network warnings; node_modules is shared via workspaces)
npm run typecheck
npm test
npm run check          # css contrast and raw-colour lint + typecheck + tests
npm run build
```

Every component needs: behaviour tests with `@testing-library/user-event`, keyboard tests, and one axe test (`expect(await axe(container)).toHaveNoViolations()` via `../../test/axe`).

## Gotchas learned so far

- TypeScript fails the build on unused imports in tests: only import `userEvent` where you use it.
- `fn.mock.calls[0]![0]` needs the `!` under `noUncheckedIndexedAccess`.
- Radix single `ToggleGroup` has role `radiogroup`; Radix Menubar triggers are `menuitem`s; Radix NavigationMenu needs a `ResizeObserver` stub in jsdom (see `navigation-menu.test.tsx`).
- `scrollBy`, `scrollIntoView`, `matchMedia`, `ResizeObserver`, `IntersectionObserver` are missing in jsdom: guard with `?.` or stub in the test.
- A harmless "HTMLCanvasElement.getContext not implemented" message from axe-core appears in test output; ignore it.
- `getByText` can match both visible text and `sr-only` spans: scope with `{selector: ...}`.
- Add `'use client'` at the top of any file with hooks or handlers.
- Accessibility is part of "done": name every control, keyboard operable, focus visible, no colour-only signals, `meta.json` `a11y` lists what the tests prove.
- Copy follows `DESIGN.md` §7: plain verbs, no exclamation marks. No private app, employer or customer names anywhere.

## Report format

Finish with: branch name and commit hash, components built (with counts), what you could not finish, anything another task must change. Do not claim anything works that you did not run.
