# daisyUI

Read 2026-11-12 from daisyui.com (install, intro, themes, button) and the GitHub LICENSE.

## Licence
MIT, "Copyright (c) 2020 Pouya Saadeghi" (`saadeghi/daisyui` LICENSE). Docs header shows v5.7.50, 42k stars.

## Distribution model
npm dev dependency that is a Tailwind CSS plugin: `npm i -D daisyui@latest`, then in CSS `@import "tailwindcss"; @plugin "daisyui";`. Needs Node and Tailwind. Install tutorials for Vite, SvelteKit, Astro, Next, Nuxt, Laravel, Rails, Phoenix, Django, Angular and more. A CDN / standalone route exists in the framework list (details unverified). Extras on the site: MCP, Skills, Figma library, theme generator, paid Blink templates.

## API conventions
- Pure class names, no components and no JS: `<button class="btn btn-primary btn-sm">`.
- Naming scheme per component, shown as a table of class / type: `btn` (component), colours `btn-neutral|primary|secondary|accent|info|success|warning|error`, styles `btn-outline|dash|soft|ghost|link`, behaviour `btn-active|disabled`, sizes `btn-xs|sm|md|lg|xl`, modifiers `btn-wide|block|square|circle`.
- Because there is no JS, polymorphism and controlled state are your framework's job (`btn` works on `<a>`, `<button>`, `<input>`). Interactive parts lean on native elements; per-widget mechanics not read (unverified).
- Utilities still available alongside (it is a Tailwind plugin).

## Theming approach
Themes are CSS-variable sets selected with `data-theme="cupcake"` on any element. Enable in the plugin config: `@plugin "daisyui" { themes: light --default, dark --prefersdark, cupcake; }` or `themes: all`. `--default` and `--prefersdark` flags pick the default and the `prefers-color-scheme: dark` theme. 30+ built-ins (inventory/synthesis count; list on themes page). Custom themes are defined the same way (details not read).

## Docs-site structure
Docs (install, themes, config, colours, utilities, layout), Components (one page each), Templates, Theme Generator, Playground. Each component page opens with the **class-name table** then a live example per modifier with copyable HTML. Good: the table is the whole API and fits one screen.

## Accessibility approach
Not documented on the pages read (unverified). Because it ships CSS only, ARIA, focus management and keyboard handling are left to the author.

## What users like / complain about
- Like: shorter markup than raw Tailwind, readable semantic class names, instant theming (daisyui.com intro claims this; LogRocket adoption guide, dev.to; I could not retrieve the guide's own cons list).
- Complain: still relies on Tailwind underneath; one commenter (forum thread via search) says some themes lack contrast; critiques are mostly the general Tailwind markup debate, not daisyUI-specific (search results: logrocket, hn mirror, dev.to). Weak evidence.

## Monoline should copy
- The class-name table as the API reference; `data-theme` switching with a default and a prefers-dark default; a theme gallery.
## Monoline should skip
- The Tailwind plugin dependency; ship no components without keyboard/ARIA guidance (daisyUI leaves it out), and check each theme against WCAG contrast in CI.
