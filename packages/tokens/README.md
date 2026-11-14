# @monoline/tokens

Monoline's design tokens in the formats design tools and code read: W3C JSON, Figma variables, CSS and TypeScript types. All of it is generated from [`packages/css/src`](../css/src) (`tokens.css`, `accents.css`, `options.css`). Edit the CSS, never the output.

```bash
npm run tokens       # regenerate dist/ (CI fails if dist/ is stale)
npm run test:tokens  # round-trip and figma checks
```

## Files in `dist/`

| File | What | Use it for |
|---|---|---|
| `tokens.json` | W3C design tokens (`$value`, `$type`). `base` is the `:root` block, `theme.<warm\|dark\|midnight>`, `accent.<name>.<theme>` (8 presets, 4 colours each), `option.font`, `option.radius`, `option.density`. | Token pipelines, Tokens Studio, Style Dictionary, anything that reads DTCG |
| `tokens.css` | The same values as CSS custom properties, in the source's cascade order | Re-export or check; the kit's own `@monoline/css` is the real stylesheet |
| `figma-variables.json` | Four collections: `Colors`, `Spacing`, `Radius`, `Typography` (see below) | Importing into Figma variables |
| `tokens.d.ts` | Unions of theme, accent, density, font and token names, plus `CssVariable` | Typed token names in TypeScript |

### Figma collections

| Collection | Modes | Variables |
|---|---|---|
| `Colors` | 24: `<theme> / <accent>` (`warm / orange` … `midnight / slate`) | 28 colours: theme and accent colours, code colours, derived lines and washes (`color/ink-2`, `color/rule` …). Values are `{r, g, b, a}` in 0 to 1; alpha washes are resolved. |
| `Spacing` | 3: `comfortable`, `compact`, `spacious` | `space/s1`–`s9`, `control/sm|md|lg` (control heights), `layout/*` |
| `Radius` | 3: `square`, `soft`, `round` | `radius/radius`, `radius/round` |
| `Typography` | 9: `<font> / <density>` (`mono`, `sans`, `serif` × density) | `type/*`. Sizes are numbers; font stacks and `clamp()` display sizes are strings. |

Not exported, because Figma has no variable type for them: motion (`--ease`, `--fast`, `--base`, `--slow`), z-index (`--z-*`), and the `--hatch` gradient. They are listed in `$skipped`.

The shape is `{$format, $skipped, collections: [{name, modes, variables: [{name, resolvedType, valuesByMode}]}]}`. Modes are named, not given ids. It follows the REST variable model (`resolvedType`, `valuesByMode`), but it is **not** a request body for Figma's REST API.

## Importing into Figma (not verified)

I could not open Figma from this environment, so none of these steps has been run.

1. Figma has no built-in JSON import for variables, as far as I know. You need a plugin or script that reads `figma-variables.json` and creates the collections, modes and values. Pick one you trust; do not paste the file into a third-party service without checking the rules for the source material.
2. Check the mode limit on your Figma plan before importing. `Colors` needs 24 modes, `Typography` 9. If the plan allows fewer, import per theme, or drop the accent modes you do not need.
3. Check `$skipped` and the string variables after import. Those are the parts that will not match Figma's own types.
4. For Tokens Studio, try importing `tokens.json` as a W3C file. The top-level keys (`base`, `theme`, `accent`, `option`) become token sets. I have not tested this import; the file uses the DTCG `$value` and `$type` keys, but the theme and accent layout may need remapping in Tokens Studio.

## How it is checked

`test/tokens.test.mjs` runs with `node:test` and checks that:

- every custom property in `tokens.css`, `accents.css` and `options.css` is in `tokens.json` with the same value;
- `tokens.css` re-export parses back to the same values as the JSON, and `dist/tokens.css` is what the build writes;
- Figma colours match a hand calculation (for example `color/ink-2` on warm is the foreground at 70% alpha), and `control/sm` is 36px in comfortable density;
- `tokens.d.ts` lists the token names;
- a reference to an undefined token fails the build.

CI runs the build and then `git diff --exit-code packages/tokens/dist`, so a stale output fails the check.

## Notes

- The source has **8 accent presets** (orange, green, blue, violet, rose, teal, amber, slate). Orange is the default in `tokens.css`. The output has 8 too.
- Package is `private`; it is not published to npm.
