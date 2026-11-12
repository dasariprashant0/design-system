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

/** Route path (no base, no leading slash) of a component, hook or guide. */
export const pathOf = (m: ComponentMeta) => `${isHook(m) ? 'hooks' : 'components'}/${m.name}`;
export const guidePath = (g: Guide) => `guides/${g.slug}`;

export interface Entry {
  kind: 'component' | 'hook' | 'guide';
  name: string;
  title: string;
  description: string;
  path: string;
  keywords: string[];
}

export const entries: Entry[] = [
  ...guides.map((g): Entry => ({kind: 'guide', name: g.slug, title: g.title, description: g.summary, path: guidePath(g), keywords: [g.slug]})),
  ...components.map((m): Entry => ({kind: 'component', name: m.name, title: m.title, description: m.description, path: pathOf(m), keywords: [m.name, nice(m.category), ...(m.keywords ?? [])]})),
  ...hooks.map((m): Entry => ({kind: 'hook', name: m.name, title: m.title, description: m.description, path: pathOf(m), keywords: [m.name, ...(m.keywords ?? [])]})),
];

/** The entry at a route path such as `components/button`, if there is one. */
export const entryAt = (path: string) => entries.find((e) => e.path === path);

/** Old hash links: `#button`, `#useClipboard`'s folder name, `#guides/forms`. Returns the new route path. */
export function legacyPath(hash: string): string | undefined {
  const h = hash.replace(/^#\/?/, '');
  return entries.find((e) => e.path === h || (e.kind !== 'guide' && e.name === h) || (e.kind === 'guide' && `guides/${e.name}` === h))?.path;
}

/** Previous and next entry of the same kind, in sidebar order. */
export function neighbours(e: Entry) {
  const list = e.kind === 'component'
    ? categories.flatMap((c) => inCategory(c)).map((m) => entryAt(pathOf(m))!)
    : entries.filter((x) => x.kind === e.kind);
  const i = list.indexOf(e);
  return {prev: list[i - 1], next: list[i + 1]};
}
