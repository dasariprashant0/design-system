# Contributing to Monoline

Thanks for helping. Read [AGENTS.md](AGENTS.md) first (layout, conventions, accessibility bar) and [DESIGN.md](DESIGN.md) (the look and tokens). Everything below is the short version.

## Setup

Node 20+.

```bash
npm install
npm run dev        # docs site on :5180, live components and CSS
npm run check      # css contrast + raw-colour lint, typecheck, tests
npm run build      # css dist, react dist, docs site
```

## Using the components in your own project

```bash
npx monoline init
npx monoline list
npx monoline add button dialog
```

`add` copies the source and CSS into your project (components in `src/components/monoline/`, styles in `src/styles/monoline/`), pulls in the components they use, and prints the npm packages to install. It will not overwrite existing files without `--overwrite`; `--dry-run` shows what it would do. See [packages/cli](packages/cli/README.md).

## Adding a component

1. Copy the shape of `packages/react/src/components/button/`: `<name>.tsx`, `<name>.test.tsx`, `<name>.demo.tsx`, `meta.json`, `index.ts`.
2. Put the styles in their own file, `packages/css/src/components/<name>.css`. Tokens only: no raw hex, font sizes or spacing numbers.
3. List the keyboard and screen reader behaviour in `meta.json` (`a11y`) and prove it in the test file, including one axe test.
4. Check it in warm, dark and midnight, with each accent, at 360px and 1200px, and with the keyboard only.
5. Run `npm run check && npm run build`, then `npm run registry` if you are a maintainer. CI fails if `registry/` and `llms*.txt` are stale.

Never hand-edit generated files: `packages/react/src/index.ts`, `registry/`, `llms.txt`, `llms-full.txt`, any `dist/`.

## Adding an accent or token

Add the token to `packages/css/src/tokens.css` for all three themes, document it in DESIGN.md, then run `npm run check`.

## Pull requests

Small and focused. Message style: `button: add loading state`. The PR template has the checklist. Update CHANGELOG.md for anything users can see.

## Reporting a bug

Use the issue templates. Include the markup, the theme and accent, the browser, and what you expected. Accessibility bugs come first. For security issues see [SECURITY.md](SECURITY.md). Everyone follows the [code of conduct](CODE_OF_CONDUCT.md).
