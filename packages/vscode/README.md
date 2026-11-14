# Monoline VS Code snippets

One snippet per registry entry (153 components and hooks). Type the prefix, press Tab, and you get the import and a usage example from the registry.

| Prefix | Inserts |
|---|---|
| `ml-button` | `import {Button} from '@monoline/react';` and a `<Button>` |
| `ml-dialog` | the import and the whole `<Dialog>` example |
| `ml-use-click-outside` | the import and the hook's example |

The snippet name in the list is `Monoline <Title>`. Snippets apply in TypeScript and JSX files (`typescriptreact`, `javascriptreact`).

## Install (copy the file, no marketplace)

Either one, not both.

**For one project.** Copy the file into the project's `.vscode` folder. VS Code reads `.vscode/*.code-snippets` in the workspace:

```bash
mkdir -p .vscode && cp path/to/design-system/packages/vscode/snippets/monoline.code-snippets .vscode/
```

**For every project.** Open *Snippets: Configure User Snippets* in VS Code (Cmd/Ctrl+Shift+P), choose *New Global Snippets file* or pick `typescriptreact.json`, then paste the contents of `monoline.code-snippets` into it. Keep the `Monoline` entries in one file so you can remove them together.

Reload the window if the snippets do not show up.

## Regenerate

The file is generated from `registry/`. After `npm run registry`, run:

```bash
node packages/vscode/scripts/build.mjs
```

`test/build.test.mjs` checks the generator and fails if the committed file is out of date.

## Notes

- The body is the registry's usage example, with its import lines and one element (the one that shows the export). Some examples are long, like Dialog's full example; trim them after inserting.
- Nothing is published. This folder holds the file and its generator only.
- Tab stops are not set: the snippet inserts the text as it is.
