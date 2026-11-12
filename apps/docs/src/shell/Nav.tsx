// Left navigation: guides, then components by category, then hooks. Used in the sidebar and in the mobile drawer.
import {useEffect, useRef} from 'react';
import {categories, guides, guidePath, hooks, inCategory, nice, pathOf} from './registry';
import {href} from './router';

const Group = ({title, items, current}: {title: string; items: Array<{path: string; title: string}>; current: string}) => (
  <div className="nav-group">
    <p className="label">{title} <span className="count">{items.length}</span></p>
    {items.map((i) => <a key={i.path} className="nav-item" href={href(i.path)} aria-current={i.path === current ? 'page' : undefined}>{i.title}</a>)}
  </div>
);

export function Nav({current}: {current: string}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { ref.current?.querySelector('[aria-current="page"]')?.scrollIntoView({block: 'nearest'}); }, [current]);
  return (
    <nav ref={ref} aria-label="Documentation">
      <Group title="Guides" current={current} items={guides.map((g) => ({path: guidePath(g), title: g.title}))} />
      {categories.map((c) => <Group key={c} title={nice(c)} current={current} items={inCategory(c).map((m) => ({path: pathOf(m), title: m.title}))} />)}
      <Group title="Hooks" current={current} items={hooks.map((m) => ({path: pathOf(m), title: m.title}))} />
    </nav>
  );
}
