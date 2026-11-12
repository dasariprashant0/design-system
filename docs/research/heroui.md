# HeroUI (v3)

Read 2026-11-12 from heroui.com/docs/react (getting started, Button, theming, composition) and the GitHub LICENSE. Formerly NextUI.

## Licence
**MIT**, "Copyright (c) 2020 Next UI Inc." (`heroui-inc/heroui` LICENSE, main). This contradicts the earlier synthesis (Apache-2.0); synthesis corrected. Older branches or packages may differ: only main was read.

## Distribution model
npm: `@heroui/react` (components) and `@heroui/styles` (variant functions and CSS, usable without React; the composition page says Vue and others can use it). v3.2.7 on the fetch date, 27.7k stars. Pitched as a "living library, not copy-paste": updates arrive via npm. No provider needed in v3. Also HeroUI Native (mobile). Pro tier exists (a "Pro" banner on migration page, contents not read).

## API conventions
- v3 is built on **React Aria Components** and **Tailwind CSS v4**; React 19.
- Compound parts, React Aria-style, with `id` and `textValue` rather than `key` for collections (migration docs, via search).
- Polymorphism: **`render` prop** to swap the DOM element ("use the render prop to render a custom component in place of the default DOM element").
- Button variants and sizes are BEM classes: `.button`, `.button--sm|md|lg`, `.button--primary|secondary|tertiary|outline|ghost|danger|danger-soft`, `.button--icon-only`. React props mirror them (`variant`, `size`; inferred from the class list, prop names not read). Examples: loading state, full width, icon only, social buttons, custom variants by wrapping.
- Press handling is React Aria's (`onPress`): from memory, unverified.

## Theming approach
Semantic CSS variables on top of Tailwind v4's theme: `--accent`, `--accent-foreground` (no suffix = background, `-foreground` = text on it). Light and dark switch automatically; CSS layers and `@theme` organise it. A **Theme Builder** exports CSS. Style by BEM class, no runtime styling.

## Docs-site structure
Getting Started, Components, Releases, Migration, Handbook (colours, theming, dark mode, styling, animation, composition), and a **UI for Agents** section: `llms.txt`, MCP server, Agent Skills, `AGENTS.md`, `DESIGN.md` previews. Each component page lists Usage, examples, CSS classes with a "View source styles" link, and links to Figma / Storybook / the React Aria page. Good: styling reference is the class list itself.

## Accessibility approach
Delegated to React Aria Components: focus management, keyboard navigation, screen-reader support (getting-started page lists these under "Accessible").

## What users like / complain about
- Like: polished defaults and animation; Reddit users praised theme pages and docs (InfoQ report on the v3 rewrite, via search).
- Complain: v2 and v3 cannot coexist in one project; Framer Motion and provider removed; breaking composition changes in minor releases (v3.2.0 Radio/Checkbox/Switch); users missed label animation, units and autocomplete (InfoQ, release notes via search).

## Monoline should copy
- Plain BEM-style class list as the documented API; `-foreground` pairs; the "UI for Agents" bundle (`llms.txt`, `AGENTS.md`, `DESIGN.md`) which Monoline already has; framework-agnostic styles package (matches our CSS core).
## Monoline should skip
- Tailwind v4 dependency; versioning that breaks composition in minors.
