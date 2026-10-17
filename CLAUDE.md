# design-system: working rules

- DESIGN.md is the source of truth; keep it in step with `css/` and `react/` in the same commit.
- Every change shows up in the gallery (`gallery/main.tsx`), and is checked in warm, dark and midnight with both brands.
- No dependencies in the package root: React is a peer dependency of each app. Only `gallery/` has node_modules.
- Apps consume this by a local `file:` path; after a change, rebuild loadout and gloamlog (`npm run build` in each frontend).
- Personal identity only (GitHub `dasariprashant0`); no employer names, code or data.
