# Aceternity UI

Read 2026-11-12 from ui.aceternity.com (licence page, pricing, docs/install, components index). Concepts only; no source or visuals recorded.

## Licence
Own "Aceternity License", page at **`/licence`** (`/license` returns 404). Summary of what the page says:
- Grant: ongoing, non-exclusive, worldwide licence to use each purchased or downloaded "Item" (the page says it applies to every item "available for purchase or download" on the site, so free items included; team-size licences for multiple people).
- **Allowed**: unlimited end products for yourself or clients; end products may be sold, licensed, sub-licensed or given away; modify, manipulate and combine the Item (derivative works stay under this licence); reuse across projects. End products include websites, apps, games, illustrations, videos.
- **Prohibited**: re-distributing the Item "as a stock image or its source files, regardless of modifications"; selling, reselling or distributing the Item or derivatives on any marketplace (explicitly including ui.aceternity.com); creating themes, templates or derivative products to sell on a marketplace.
- Third-party components inside an Item keep their own (open source / CC) licences; the author keeps ownership; Aceternity itself is not a party; violations "pursued to the fullest extent of the law".
- Not read: the GitHub repo or any per-item licence override (unverified).
**Consequence**: Monoline cannot ship, fork, port or bundle Aceternity source. Concept-level inspiration only, written from scratch.

## Distribution model
Copy-paste with the shadcn CLI ("install them with the shadcn CLI or let your AI agent do it"); install guide starts from `create-next-app`. Stack: Next.js, React, Tailwind CSS, Motion. Free: 100+ components. Paid (pricing page): 1-year licence $169, lifetime $199, team (10 people) $1,590, adding 200+ blocks, 15+ templates, 5 landing pages, 18 interactions, MCP access. The free plan also includes MCP access.

## API conventions
Per-item React components with bespoke props; no shared variant or size system seen. `asChild` / `render` and controlled naming not applicable or not read (unverified).

## Theming approach
None; relies on the host Tailwind setup and `cn()` helper. Templates have their own looks.

## Docs-site structure
Sections: Components, Blocks, Pages, Interactions, Templates, Resources, Pricing. Component page: preview, install command, usage, props. Search with ⌘K; "Browse components" index lists 111 items in the earlier inventory. Good: huge preview wall that sells the effect; weak as an API reference.

## Accessibility approach
No statement on pages read (unverified). One third-party guide says reduced-motion handling is absent by default (pkgpulse, secondary, unverified).

## What users like / complain about
- Like: dramatic hero and background effects, large catalogue, free tier ("Trusted by 120,000+ users" is the site's own claim).
- Complain: nothing library-specific found; general motion cost and a11y worries only (search results). Licence is restrictive for anyone building a kit.

## Monoline should copy
Nothing code or visual. Concept list only (e.g. aurora/spotlight/marquee style effects as categories), implemented originally and with reduced motion.
## Monoline should skip
Everything visual, the paid tiers, and any porting of items.
