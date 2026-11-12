# Monoline: working rules

- DESIGN.md is the source of truth; keep it in step with `css/` and `react/` in the same commit.
- After any change to `css/`, run `npm run build` and commit the regenerated `css/monoline.css`; the docs site and CDN link serve it.
- Every change shows up in the docs page (`index.html`) and the gallery (`gallery/main.tsx`), and is checked in warm, dark and midnight with each accent.
- A new accent goes in `css/accents.css` for all three themes and must pass the contrast rules in DESIGN.md §1.
- No dependencies in the package root: React is an optional peer dependency. Only `gallery/` has node_modules.
- Keep it generic: no names of private apps, employers or customers in code, docs or examples.
