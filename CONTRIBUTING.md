# Contributing to Monoline

Thanks for helping. The kit is small on purpose, so the bar for adding things is "a second project needs it".

## Setup

No install is needed for the kit itself. Node 20+ runs the scripts.

```bash
npm run check    # contrast rules and no raw colours
npm run build    # regenerate css/monoline.css, monoline.min.css, tokens/tokens.json
npm --prefix gallery install && npm --prefix gallery run dev   # React gallery on :5180
```

Open `index.html` straight from disk to see the docs page against your changes.

## Making a change

1. Read [DESIGN.md](DESIGN.md). Tokens only; square; thin rules; one accent.
2. Edit `css/*.css` (or `js/`, `react/`). Never edit the generated `css/monoline*.css` or `tokens/tokens.json`.
3. Show it on the docs page with an example block, and check it in warm, dark and midnight, with each accent, at 900px and 360px wide, and with the keyboard only.
4. Update DESIGN.md and CHANGELOG.md in the same commit.
5. Run `npm run check && npm run build`, and commit the generated files. CI fails if they are stale.

## Adding an accent

Add three rules to `css/accents.css` (warm, dark, midnight), add it to the table in DESIGN.md §1 and the docs sidebar, then run `npm run check`.

## Adding a component

- Start from a native element; add a class only for the look.
- Name classes by the thing (`.menu-item`), with variants as a second class (`.btn-line`). No utility sprawl.
- No dependencies, no icon fonts, no images. Needs state? Use an ARIA attribute as the hook (`[aria-current]`, `[aria-pressed]`).
- If it needs JavaScript, add it to `js/monoline.js` behind a `data-` attribute, and make the markup work without it where possible.
- Document when to use it, and when not to.

## Reporting a bug

Open an issue with the markup, the theme and accent, the browser, and what you expected. Accessibility bugs are treated as the highest priority.
