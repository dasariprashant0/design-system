// Everything the shell needs to know about the site: components and hooks (from meta.json), guides, and the
// flat list the search palette uses. A new component folder shows up here with no change.
import type {ComponentMeta, Demo} from '@monoline/react';
import {guides, type Guide} from '../guides';

export {guides};
export type {Guide};

const metas = import.meta.glob<ComponentMeta>('../../../../packages/react/src/{components,hooks}/*/meta.json', {eager: true, import: 'default'});
const demoModules = import.meta.glob<{demos: Demo[]}>('../../../../packages/react/src/{components,hooks}/*/*.demo.tsx', {eager: true});

export const isHook = (m: ComponentMeta) => m.category === 'hooks';
export const nice = (c: string) => c.replaceAll('-', ' ');

const everything = Object.values(metas).sort((a, b) => a.name.localeCompare(b.name));
export const components = everything.filter((m) => !isHook(m));
export const hooks = everything.filter(isHook);

const CATEGORY_ORDER = ['layout', 'typography', 'buttons', 'forms', 'data-display', 'feedback', 'overlays', 'navigation', 'effects', 'blocks'];
export const categories = CATEGORY_ORDER.filter((c) => components.some((m) => m.category === c));
export const inCategory = (c: string) => components.filter((m) => m.category === c);

/** Live demos of a component, as exported by its `<name>.demo.tsx`. */
export const demosFor = (name: string): Demo[] => {
  const key = Object.keys(demoModules).find((k) => k.includes(`/${name}/`));
  return key ? demoModules[key]!.demos : [];
};

/** Route path (no base, no leading slash) of a component or hook. Every docs page lives under `docs/`. */
export const pathOf = (m: ComponentMeta) => `docs/${isHook(m) ? 'hooks' : 'components'}/${m.name}`;

/** Guides that have a place of their own; every other guide is `docs/guides/<slug>`. */
const GUIDE_PATH: Record<string, string> = {'getting-started': 'docs/getting-started', theming: 'docs/theming', cli: 'docs/tools/cli', 'theme-builder': 'docs/tools/theme-builder', 'for-ai-tools': 'docs/tools/for-ai-tools'};
export const guidePath = (g: Guide) => GUIDE_PATH[g.slug] ?? `docs/guides/${g.slug}`;

export type Tab = 'start' | 'components' | 'icons' | 'editor' | 'tools';

export interface Entry {
  tab: Tab;
  /** Sidebar heading this page sits under. */
  group: string;
  kind: 'component' | 'hook' | 'guide' | 'site';
  name: string;
  title: string;
  description: string;
  path: string;
  keywords: string[];
}

/** Whole-site pages that are not a component or a guide. Their bodies live in ../site and are mapped in App.tsx. `path` is relative to `docs/`. */
export const sitePages = [
  {slug: 'components', path: 'components', tab: 'components', group: 'Overview', title: 'Overview', description: 'Every component and hook, grouped by category, with a preview, a short description and a link to each page.'},
  {slug: 'nextjs', path: 'frameworks/nextjs', tab: 'start', group: 'Frameworks usage', title: 'Next.js', description: 'Load the stylesheet in the App Router layout and use Monoline from Server and Client Components.'},
  {slug: 'vite', path: 'frameworks/vite', tab: 'start', group: 'Frameworks usage', title: 'Vite', description: 'Install the packages, import the stylesheet once in main.tsx and render your first component.'},
  {slug: 'astro', path: 'frameworks/astro', tab: 'start', group: 'Frameworks usage', title: 'Astro', description: 'Add the React integration, load the CSS in a layout and hydrate interactive components with a client directive.'},
  {slug: 'remix', path: 'frameworks/remix', tab: 'start', group: 'Frameworks usage', title: 'Remix', description: 'Link the stylesheet from the root route in Remix or React Router.'},
  {slug: 'plain-css', path: 'frameworks/plain-css', tab: 'start', group: 'Frameworks usage', title: 'Plain CSS', description: 'The core is plain CSS. Link it from any page and use the classes, with no framework or build step.'},
  {slug: 'icons', path: 'icons', tab: 'icons', group: 'Icons', title: 'Overview', description: 'Monoline has no icon dependency. Icons are inline SVG that follow the text colour, passed as children.'},
  {slug: 'icons-library', path: 'icons/library', tab: 'icons', group: 'Icons', title: 'Icons Library', description: 'The 20 icons drawn for these docs on a 16 by 16 grid. Search, then copy one as SVG.'},
  {slug: 'editor', path: 'editor', tab: 'editor', group: 'Setup', title: 'Setup', description: 'Add the rich text editor to a page: import, a controlled value, a toolbar and mentions.'},
  {slug: 'tools', path: 'tools', tab: 'tools', group: 'Tools', title: 'Extensions', description: 'VS Code snippets, the MCP server, the CLI and other tools that make working with Monoline faster.'},
  {slug: 'upgrade', path: 'tools/upgrade', tab: 'tools', group: 'Tools', title: 'Upgrade Guide', description: 'Choose the version you are on and the version you want, and see exactly what changed between them.'},
  {slug: 'blocks', path: 'tools/blocks', tab: 'tools', group: 'Resources', title: 'Blocks', description: 'Full-width page sections (hero, pricing, login, dashboard shell) with a viewport switcher, copy code and install commands.'},
  {slug: 'themes', path: 'tools/themes', tab: 'tools', group: 'Resources', title: 'Themes', description: 'Named presets built from the theme, accent, font, corner and density options, with contrast checks and a Copy CSS export.'},
  {slug: 'compare', path: 'tools/compare', tab: 'tools', group: 'Resources', title: 'Compare', description: 'Monoline against shadcn/ui, Mantine, MUI, Chakra, daisyUI and HeroUI: distribution, styling, measured bundle size and accessibility proof.'},
  {slug: 'changelog', path: 'tools/changelog', tab: 'tools', group: 'Resources', title: 'Changelog', description: 'What changed in each Monoline version.'},
  {slug: 'roadmap', path: 'tools/roadmap', tab: 'tools', group: 'Resources', title: 'Roadmap', description: 'Where Monoline honestly stands today and what comes next.'},
] as const;

const GUIDE_PLACE: Record<string, [Tab, string]> = {
  'getting-started': ['start', 'Overview'], theming: ['start', 'Overview'],
  forms: ['start', 'Guides'], i18n: ['start', 'Guides'], accessibility: ['start', 'Guides'], contributing: ['start', 'Guides'],
  cli: ['tools', 'Tools'], 'theme-builder': ['tools', 'Tools'], 'for-ai-tools': ['tools', 'Tools'],
};
/** The rich text editor and its mentions live under the Editor tab, as a feature, not under Components. */
const EDITOR = ['rich-text-editor', 'mentions'];

export const entries: Entry[] = [
  ...sitePages.map((p): Entry => ({tab: p.tab, group: p.group, kind: 'site', name: p.slug, title: p.title, description: p.description, path: `docs/${p.path}`, keywords: [p.slug, p.title]})),
  ...guides.map((g): Entry => ({tab: GUIDE_PLACE[g.slug]?.[0] ?? 'start', group: GUIDE_PLACE[g.slug]?.[1] ?? 'Guides', kind: 'guide', name: g.slug, title: g.title, description: g.summary, path: guidePath(g), keywords: [g.slug]})),
  ...components.map((m): Entry => ({tab: EDITOR.includes(m.name) ? 'editor' : 'components', group: EDITOR.includes(m.name) ? 'Features' : nice(m.category), kind: 'component', name: m.name, title: m.title, description: m.description, path: pathOf(m), keywords: [m.name, nice(m.category), ...(m.keywords ?? [])]})),
  ...hooks.map((m): Entry => ({tab: 'components', group: 'Hooks', kind: 'hook', name: m.name, title: m.title, description: m.description, path: pathOf(m), keywords: [m.name, ...(m.keywords ?? [])]})),
];

/** Older URLs keep working: `components/button`, `guides/theming`, `themes`, `blocks`, `upgrade`... all resolve to the page under `docs/`. */
const aliases = new Map<string, Entry>();
for (const e of entries) {
  aliases.set(e.path, e);
  const bare = e.path.replace(/^docs\//, '');
  aliases.set(bare, e);
  if (e.kind === 'guide') aliases.set(`guides/${e.name}`, e);
  if (e.kind === 'site') { aliases.set(e.name, e); if (e.name === 'components') aliases.set('components', e); }
}
aliases.set('frameworks', aliases.get('docs/frameworks/nextjs')!);

/** The entry at a route path such as `docs/components/button` (or the older `components/button`), if there is one. */
export const entryAt = (path: string) => aliases.get(path);

/** Old hash links: `#button`, `#useClipboard`'s folder name, `#guides/forms`. Returns the new route path. */
export function legacyPath(hash: string): string | undefined {
  const h = hash.replace(/^#\/?/, '');
  return (entryAt(h) ?? entries.find((e) => (e.kind === 'component' || e.kind === 'hook') && e.name === h))?.path;
}

export interface NavGroup {title: string; items: Entry[]}

/** The sidebar of a top tab: pages grouped under headings, in reading order. */
export function navGroups(tab: Tab): NavGroup[] {
  const out: NavGroup[] = [];
  const order = tab === 'components' ? [...categories.map(nice), 'Hooks'] : [];
  for (const e of entries.filter((x) => x.tab === tab && !(tab === 'components' && x.name === 'components'))) {
    let g = out.find((x) => x.title === e.group);
    if (!g) { g = {title: e.group, items: []}; out.push(g); }
    g.items.push(e);
  }
  if (order.length) out.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
  return out;
}

/** The first page of a tab: where the top tab links to. */
export const tabHome = (tab: Tab) => (tab === 'components' ? 'docs/components' : navGroups(tab)[0]!.items[0]!.path);

/** Previous and next page in the sidebar order of the page's tab. */
export function neighbours(e: Entry) {
  const list = navGroups(e.tab).flatMap((g) => g.items);
  const i = list.indexOf(e);
  return {prev: list[i - 1], next: list[i + 1]};
}
