# design-system: working rules

- DESIGN.md is the source of truth; keep it in step with `css/` and `react/` in the same commit.
- Every change shows up in the gallery (`gallery/main.tsx`), and is checked in warm, dark and midnight with both brands.
- No dependencies in the package root: React is a peer dependency of each app. Only `gallery/` has node_modules.
- Apps pin a commit of this repo (`git+https://github.com/dasariprashant0/design-system.git#<hash>`); after a change, push, bump the hash in loadout and gloamlog, `npm install`, and rebuild each frontend.
- Personal identity only (GitHub `dasariprashant0`); no employer names, code or data.
