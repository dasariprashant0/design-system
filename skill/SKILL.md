---
name: personal-ui
description: Use whenever building, styling or reviewing UI in any of Prashant's personal apps under ~/Projects/personal (loadout, gloamlog, or a new app) - a screen, component, page, form, colour, spacing or layout change. Applies the shared @personal/ui design system so every app looks like one family. Not for Zuddl or Webflow work.
---

# Personal UI design system

Every personal app uses one design system: `@personal/ui` in `~/Projects/personal/design-system`. You do not design from scratch. You compose the kit and follow its rules.

## Before writing any UI

1. Read `~/Projects/personal/design-system/DESIGN.md` in full. It is the source of truth, and this skill only points to it.
2. Check that the app is wired up (DESIGN.md §1): the three CSS imports in `main.tsx`, `preserveSymlinks` in Vite and tsconfig, and a `brand.css` if the app has its own accent. If any is missing, wire it first.
3. Look at `react/index.tsx` for the existing pieces. Use them before writing new markup.

## While building

- Use only tokens (`var(--…)`) and kit classes. Never write a raw hex, px font size or spacing value in a screen or app CSS.
- Pick components with DESIGN.md §6 ("which one when"). If none fits, build it in the app's `app.css` from tokens. Move it into the kit only when a second app needs it (§11).
- Write copy by §7: verbs on buttons, errors that say what to do, no exclamation marks.
- Use no UI libraries, icon libraries, rounded corners, shadows or gradients (§10).

## Before saying done

- Run the §12 checklist. Check the screen in warm, dark and midnight, at 900px wide, and with the keyboard only.
- If you changed the kit itself, open the gallery (`npm --prefix ~/Projects/personal/design-system/gallery run dev`) and check both brands.
