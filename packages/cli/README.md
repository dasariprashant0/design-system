# monoline

Copy [Monoline](../../README.md) components into your project, shadcn-style. Plain Node ESM, no dependencies, Node 20+.

```bash
npx monoline init                       # writes monoline.json, prints the tokens import
npx monoline list                       # all components   (--category forms)
npx monoline search text field          # find by name, keyword or description
npx monoline info dialog                # one component: description, css, accessibility notes
npx monoline add button dialog          # copy source + CSS into your project
npx monoline add --category forms       # every component in one category (--all for everything)
npx monoline diff button                # compare your copy with the registry
npx monoline update button              # show the diff, then replace your copy (asks first)
```

## What `add` does

- Reads `<name>.json` from the registry and writes the component into `src/components/monoline/<name>/` and its stylesheets into `src/styles/monoline/`.
- Also adds components it imports (for example `password-input` brings `input`).
- Rewrites the repo's shared imports so files resolve in your tree (`../../utils/cx` becomes `../utils/cx`, and `utils/cx.ts` is written for you).
- Prints the CSS imports to add and the npm packages to install (`radix-ui`; React 18+ is assumed).
- Refuses to overwrite existing files unless you pass `--overwrite`.

The CSS files assume the tokens are loaded: `npm i @monoline/css` and import `@monoline/css/core.css` once, before the component files (`init` prints the line). Each component's CSS is copied as one file, `<name>.css`, wrapped in `@layer monoline.components`.

## Keeping copies up to date

`diff` and `update` compare the files a component writes (its source and its CSS, plus `utils/cx.ts` when the component uses it) with the registry. They do not look at the components a component imports; diff those too if you need to.

| Command | What it does | Exit code |
|---|---|---|
| `monoline diff <name...>` | Prints a unified diff (project → registry) for each file that differs. | `0` all match, `1` something differs or the component is not in the project |
| `monoline update <name...>` | Shows the same diff, then replaces the differing files with the registry version. Asks `[y/N]` first. | `0` updated or already current; `1` declined, refused, or failed |

- `update` never overwrites without a yes: answer the question in a terminal, or pass `--yes`. Without a terminal and without `--yes` it stops and writes nothing.
- `--backup` keeps the old file next to it as `<file>.orig` before replacing it.
- `--dry-run` shows the diff and what would change; it writes nothing.
- A file that is missing from the project counts as different, so `update` adds it.

## Options

| Option | Meaning |
|---|---|
| `--registry <path\|url>` | Registry folder or URL. Default: `https://raw.githubusercontent.com/dasariprashant0/design-system/master/registry`. A local checkout works: `--registry ./registry`. |
| `--dir <path>` | Component folder. Default `src/components/monoline`. |
| `--styles <path>` | CSS folder. Default `src/styles/monoline`. |
| `--all` | (`add`) every component in the registry. |
| `--category <name>` | (`add`, `list`) one category, for example `forms` or `overlays`. |
| `--overwrite` | (`add`) replace existing files. |
| `--yes` | (`update`) replace without asking. |
| `--backup` | (`update`) keep the old file as `<file>.orig`. |
| `--dry-run` | Print what would be written or changed; write nothing. |
| `--cwd <path>` | Project root. Default: current folder. |

`monoline.json` (from `init`) stores `components`, `styles` and optionally `registry`; flags win over it.

`search` matches every word you type against the name, title, category, description and keywords. Exact and partial name matches come first, then title and keyword matches. No match exits `1`.

Only use registries you trust: the CLI writes whatever source the registry serves.

## Develop

```bash
npm run test:cli      # from the repo root; uses temp dirs and the local registry/
```
