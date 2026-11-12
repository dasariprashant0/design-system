# Docs UX audit: how component libraries present themselves

Fetched live on 2026-11-12: the Button page of shadcn/ui, Material UI, Ant Design, Chakra UI, Mantine, daisyUI, Base UI and HeroUI; Headless UI's Menu page; Radix's Dialog page; Magic UI's Marquee page; Aceternity's Background Beams page. The section lists below are the real `h1` to `h4` headings of those pages. Layout notes for shadcn/ui, Mantine and Radix come from looking at the rendered pages. Anything not marked as observed is unverified.

## Finding 1: every component is its own page, and every page has the same shape

All twelve give each component its own URL, a left navigation grouped into sections, a right-hand "On this page" list, and the same section order on every page.

| Library | Sections on a component page (observed headings) |
|---|---|
| shadcn/ui | Title and one-line description, prev/next and "copy page", framework tabs (Base UI / React Aria / Radix UI), live preview with "View Code", **Installation** (Command / Manual tabs, pnpm / npm / yarn / bun), **Usage**, then one **example per heading** (Size, Default, Outline, Ghost, Link, Icon, With Icon, Spinner, Button Group, As Link, RTL), **API Reference** |
| Material UI | Title, then examples as headings (Basic, Handling clicks, Color, Sizes, Icons, Loading, File upload, Customization, Third-party routing, Limitations), **API**; accessibility notes inline |
| Ant Design | Title, **Resources**, **When To Use**, **Examples**, **API**, **Semantic DOM**, **Design Token**, **FAQ**, **Design Guide** |
| Chakra UI | Title, **Usage**, **Examples** (each with Preview / Code tabs), **Customization**, **Props** |
| Mantine | Title with link row (Source, LLM documentation, Docs, Package), tabs **Documentation / Props / Styles API**, **Usage** with an interactive playground (variant, colour, size, radius controls), many small example sections, Styles API, polymorphic and ref notes |
| daisyUI | Title, many small examples (sizes, colours, soft, outline, ghost, disabled, loading), an MCP server callout, then the component index |
| Headless UI | Title, **Installation**, **Basic example**, **Styling** (data attributes, render props), **Examples**, **Keyboard interaction**, **Component API** per part |
| Radix | Title, hero preview with code tabs (index.jsx, styles.css) and "Expand code", **Features** checklist, **Anatomy**, **API Reference** per part (Root, Trigger, Content...), **Examples**, **Accessibility** with a **Keyboard Interactions** table, **Custom APIs**; version and size metadata in a side column |
| Base UI | Title, **Usage guidelines**, **Anatomy**, **Examples**, **API reference** (Props, State, Data attributes) |
| HeroUI | Title, **Usage**, **Examples**, **Customization**, **Styling Reference** (CSS classes, interactive states), **API Reference**, **Related Showcases**; every heading has a copy-anchor-link control |
| Magic UI | Title, Preview / Code tabs, **Installation** (CLI / Manual, pnpm / npm / yarn / bun), **Examples**, **Usage**, **Props** |
| Aceternity | Title, Preview / Code, **Installation** (CLI / Manual), **Props** |

**Takeaway:** the better pages are Radix, Headless UI and Mantine (Features, Anatomy, API per part, Keyboard table, Styles API) for understanding, and shadcn/ui and Magic UI for getting started (Installation tabs with copy, Preview/Code on every example).

## Finding 2: how code is shown (the thing our docs got wrong)

| Detail | What the best pages do (observed on shadcn/ui, Radix, Mantine) |
|---|---|
| Copy button | A small **icon button**, vertically centred or top-aligned **inside** the code panel, 8 to 12px from the right edge, never overlapping the border. Header-style panels put it in the header row at the right |
| Panel | One bordered or tinted panel, rounded corners in those libraries, 12 to 16px padding, horizontal scroll for long lines, no wrapping of code by default |
| Header | Optional: file name or language icon on the left (`globals.css`, `index.jsx`), copy button on the right. Radix uses **file tabs** (`index.jsx`, `styles.css`) |
| Syntax colour | Always highlighted (keywords, strings, tags, comments in different colours). Ours was plain text |
| Line numbers | Used in longer file listings (shadcn), omitted in one-liners |
| Install snippets | Package-manager tabs (pnpm, npm, yarn, bun) inside one panel; the selection persists across the site (shadcn, Magic UI) |
| Long examples | Collapsed to a few lines with "View Code" or "Expand code" (shadcn, Radix) |
| Per example | The **code of that example only**, next to its preview (Preview / Code tabs on Chakra, Magic UI, Aceternity; below the preview on Radix and Mantine). Ours showed the whole demo file under all demos |

## Finding 3: chrome around the page

- **Top bar:** logo, main sections (Docs, Components, Blocks, Charts), a **search** box with a keyboard hint (`Ctrl K` / `/`), GitHub link, theme toggle (shadcn, Mantine, Radix).
- **Left nav:** grouped sections with an active-item highlight; Mantine and Radix group components by kind (Buttons, Combobox, Overlays); shadcn lists A to Z.
- **Right rail:** "On this page" with the current section highlighted (shadcn, Mantine, Radix, MUI, Chakra). Radix also shows version and bundle size and links ("View source", "Report an issue", "ARIA design pattern").
- **Page head:** title, one-line description, prev/next (shadcn), link row to source, package and AI docs (Mantine: Source, LLM documentation, Docs, Package).
- **Heading anchors:** copy-link control on each heading (HeroUI, MUI, Radix).
- **AI features:** Mantine has an LLM documentation link per component; shadcn has "Copy Page" and a Skills page; daisyUI advertises an MCP code-generator server; Mantine and Base UI publish `llms.txt`.
- **Playground:** Mantine puts live controls (variant, colour, size, radius) above the first demo. Chakra, MUI and Ant offer per-example code expand.

## Finding 4: content that makes a component page complete

Present on the strongest pages and missing from ours before this change:

1. **Installation** and **Usage** with copyable commands.
2. **Features** list and **Anatomy** (the parts and how they nest) for compound components.
3. **One example per heading** so the right rail works as a table of contents.
4. **API reference per part**, with a props table (type, default, description).
5. **Accessibility**: what ARIA pattern it follows and a **keyboard interaction table** (key, action).
6. **Styling / Styles API / data attributes / CSS classes** reference.
7. **Related** components and prev/next navigation.

## Decisions for Monoline (what we copy, what we skip)

Copy: separate page per component with the same section order; top bar with search and Cmd/Ctrl+K command palette (we ship a `command` component, so the docs use it); right-hand "On this page" with scroll-spy (we ship `use-scroll-spy`); Preview / Code tabs on each example with that example's own code; Installation tabs (CLI / Manual / npm) with a persisted package manager; per-part API tables; Accessibility section with a keyboard table; Styling reference listing the CSS classes and data attributes; prev/next; heading anchors; a "Copy page as Markdown" and per-page `.md` for AI tools.

Skip: framework tabs (we are React plus plain CSS: show those two as "React" and "CSS only" tabs), Tailwind specific content, paid or gated sections, a design-token ordering we do not have.

Code block spec: bordered panel with square corners (Monoline identity); header row with file name or language on the left and an icon Copy button on the right inside the panel (36px square hit area, 8px from the edge, aligned with the header text baseline); highlighted tokens drawn from theme variables so they work in every theme and accent; horizontal scroll with a focusable region; no copy button overlapping content.
