// Left navigation of the current top tab: pages grouped under category headings. All tabs are rendered; the ones
// that are not current are `hidden`, so a link to any page stays in the DOM (the audit and tests click through them)
// without screen readers or keyboards reaching it. Used in the sidebar and in the mobile drawer.
import {useEffect, useRef} from 'react';
import {navGroups, type Tab} from './registry';
import {href} from './router';

const ALL: Tab[] = ['start', 'components', 'icons', 'editor', 'tools'];

export function Nav({tab, current}: {tab: Tab | undefined; current: string}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { ref.current?.querySelector('[aria-current="page"]')?.scrollIntoView({block: 'nearest'}); }, [current]);
  return (
    <nav ref={ref} aria-label="Documentation">
      {ALL.map((t) => (
        <div key={t} hidden={t !== tab}>
          {navGroups(t).map((g) => (
            <div key={g.title} className="nav-group">
              <p className="nav-head">{g.title}</p>
              {g.items.map((i) => <a key={i.path} className="nav-item" href={href(i.path)} aria-current={i.path === current ? 'page' : undefined}>{i.title}</a>)}
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}
