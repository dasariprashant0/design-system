# monoline

Copy [Monoline](../../README.md) components into your project, shadcn-style. Plain Node ESM, no dependencies, Node 20+.

```bash
npx monoline init                  # writes monoline.json, prints the tokens import
npx monoline list                  # all components   (--category forms)
npx monoline info dialog           # one component: description, css, accessibility notes
npx monoline add button dialog     # copy source + CSS into your project
```

## What `add` does

- Reads `<name>.json` from the registry and writes the component into `src/components/monoline/<name>/` and its stylesheets into `src/styles/monoline/`.
- Also adds components it imports (for example `password-input` brings `input`).
- Rewrites the repo's shared imports so files resolve in your tree (`../../utils/cx` becomes `../utils/cx`, and `utils/cx.ts` is written for you).
- Prints the CSS imports to add and the npm packages to install (`radix-ui`; React 18+ is assumed).
- Refuses to overwrite existing files unless you pass `--overwrite`.

The CSS files assume the tokens are loaded: `npm i @monoline/css` and import `tokens.css`, `base.css` and `accents.css` once (`init` prints the lines).

## Options

| Option | Meaning |
|---|---|
| `--registry <path\|url>` | Registry folder or URL. Default: `https://raw.githubusercontent.com/dasariprashant0/design-system/master/registry`. A local checkout works: `--registry ./registry`. |
| `--dir <path>` | Component folder. Default `src/components/monoline`. |
| `--styles <path>` | CSS folder. Default `src/styles/monoline`. |
| `--overwrite` | Replace existing files. |
| `--dry-run` | Print what would be written; write nothing. |
| `--cwd <path>` | Project root. Default: current folder. |

`monoline.json` (from `init`) stores `components`, `styles` and optionally `registry`; flags win over it.

Only use registries you trust: the CLI writes whatever source the registry serves.

## Develop

```bash
npm run test:cli      # from the repo root; uses a temp dir and the local registry/
```
