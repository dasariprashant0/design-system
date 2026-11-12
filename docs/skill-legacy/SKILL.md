---
name: monoline
description: Use whenever building, styling or reviewing UI in a project that uses the Monoline UI kit (monoline-ui, css/monoline.css, data-theme and data-accent attributes) - a screen, component, page, form, colour, spacing or layout change. Applies the kit's tokens, components and rules instead of designing from scratch.
---

# Monoline UI kit

Compose the kit and follow its rules; do not design from scratch.

## Before writing any UI

1. Read `DESIGN.md` from the kit in full (in `node_modules/monoline-ui/DESIGN.md`, or the repo). It is the source of truth; this skill only points to it.
2. Check the project loads the kit (DESIGN.md §1): `monoline.css` (or the four files in order) and `data-theme` / `data-accent` on `<html>`. If missing, wire it first.
3. If the project uses React, look at `react/index.tsx` for existing pieces before writing new markup.

## While building

- Use only tokens (`var(--…)`) and kit classes. Never write a raw hex, px font size or spacing value in a screen.
- Pick components with DESIGN.md §6 ("which one when"). If none fits, build it from tokens in the project's own CSS.
- Write copy by §7: verbs on buttons, errors that say what to do, no exclamation marks.
- Use no UI libraries, icon libraries, rounded corners, shadows or gradients (§10).

## Before saying done

- Run the §12 checklist. Check the screen in warm, dark and midnight, at 900px wide, and with the keyboard only.
