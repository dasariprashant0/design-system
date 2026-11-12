# shadcn/ui

Read 2026-11-12 from ui.shadcn.com (intro, CLI, theming, registry, button pages) and the GitHub LICENSE. "unverified" = not seen on a fetched page.

## Licence
MIT, "Copyright (c) 2023 shadcn" (raw `LICENSE.md` on `shadcn-ui/ui`, main).

## Distribution model
- Not an npm component package. The intro says it is "how you build your component library": open code, a flat-file schema and a CLI for distribution.
- `npx shadcn@latest init` configures the project and writes `components.json`; `shadcn add button` copies the source into `@/components/ui/`.
- CLI options (CLI page): `--template` (next, vite, start, react-router, laravel, astro), `--base` (**base, radix, aria**), `--preset`, so the behaviour layer is now a choice: Base UI, Radix UI or React Aria. Component pages carry a tab for each.
- Registry: `registry.json` / `registry-item.json` schema, GitHub-as-registry, namespaces, authentication, a registry directory, an MCP server and "Open in v0". The registry page says it is not React-only and works for hooks, pages, config and rules, not just components.
- Docs also list Skills, `llms.txt`, "Copy Page" buttons, and an AI Elements section (chat, prompt input, reasoning, tool).

## API conventions
- Compound named exports (`Dialog`, `DialogTrigger`, `DialogContent`...) over the chosen primitive.
- Variants and sizes are string props: `<Button variant="outline">`, `size` = xs / sm / default / lg (button page).
- Polymorphism follows the base: Radix `asChild`; on the Base UI base a `render` prop. The button page warns not to use `render={<a/>}` for links (Base UI Button forces `role="button"`) and ships a `buttonVariants` helper for plain `<a>` instead. I did not see `asChild` text on the fetched page (unverified for the Radix build).
- Controlled/uncontrolled naming is inherited from the primitive (`open`/`defaultOpen`/`onOpenChange` on Radix).
- Newer composition parts: `Field`, `Input Group`, `Button Group`, `Item`, `Empty`, `Kbd`, `Spinner`, `Native Select`, `Direction`.

## Theming
CSS variables as semantic pairs (`primary` / `primary-foreground`, `background` / `foreground`), values in oklch, Tailwind maps them to `bg-background`, `border-border`. Dark mode overrides the same tokens under `.dark`. `components.json` holds `style`, `baseColor`, `cssVariables`. A visual builder (`shadcn/create`) generates a preset. (theming page)

## Docs-site structure
Sidebar: Get Started, Components, Forms, Utilities, Registry, AI Elements. Each component page: live preview with "View Code", install tabs (CLI / Manual, four package managers), Usage, one section per variant/size, API reference, a base tab. Good because the page is the copy source, every example is a runnable file, and "Copy Page" gives the page as Markdown for an agent.

## Accessibility approach
Delegated to the primitive (Radix / Base UI / React Aria); the intro claims "accessible components". No audit process described on the fetched pages (unverified).

## What users like / complain about
- Like: ownership of the code, readable source, AI tools can read it (intro page makes this a stated principle).
- Complain: no automatic updates; components drift from upstream; merging fixes is manual for heavily edited projects (Vercel Academy "updating and maintaining components"; dev.to "Copy-paste components vs npm packages"; designsystemscollective "Why shadcn/ui struggles at enterprise scale"). Secondary sources, opinion.
- Radix maintenance worry drove a Base UI option (dev.to "Is your shadcn/ui project at risk"; shadcn discussion #9562). Claim that Base UI is now the default for new projects comes from one OpenReplay article: unverified against the shadcn changelog.

## Monoline should copy
- The registry JSON + CLI that copies sources, with `--base`-style swappable behaviour only if cheap.
- Semantic token pairs with `-foreground`, a preset/theme builder, "Copy page as Markdown".
- Variants shown one per section, each runnable.
## Monoline should skip
- Tailwind classes and `cva` in source; relying on one upstream primitive vendor without a fallback; shipping with no update path (offer `monoline diff`).
