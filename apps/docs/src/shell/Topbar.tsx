// Sticky top bar: logo, section links, search, GitHub, Customise. Below 880px the links move into a drawer.
import {useEffect, useState} from 'react';
import {Badge, Button, Drawer, DrawerContent, DrawerTitle, DrawerTrigger, Kbd} from '@monoline/react';
import {CustomisePanel, type Prefs} from './prefs';
import {Nav} from './Nav';
import {components, hooks, pathOf} from './registry';
import {href, type Route} from './router';

export const GITHUB = 'https://github.com/dasariprashant0/design-system';
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const sections = [
  {label: 'Docs', to: 'guides/getting-started', on: (p: string) => p.startsWith('guides/')},
  {label: 'Components', to: pathOf(components[0]!), on: (p: string) => p.startsWith('components/')},
  {label: 'Hooks', to: pathOf(hooks[0]!), on: (p: string) => p.startsWith('hooks/')},
  {label: 'Blocks', to: 'blocks', on: (p: string) => p === 'blocks'},
  {label: 'Themes', to: 'themes', on: (p: string) => p === 'themes'},
  {label: 'Compare', to: 'compare', on: (p: string) => p === 'compare'},
];

export function Topbar({path, route, prefs, set, onSearch}: {path: string; route: Route; prefs: Prefs; set: (k: keyof Prefs, v: string) => void; onSearch: () => void}) {
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);
  return (
    <header className="docs-bar">
      <Drawer open={menu} onOpenChange={setMenu}>
        <DrawerTrigger asChild><Button size="sm" className="docs-menu">Menu</Button></DrawerTrigger>
        <DrawerContent side="start" aria-describedby={undefined} className="docs-drawer">
          <DrawerTitle>Monoline</DrawerTitle>
          <Nav current={route.kind === 'page' ? route.entry.path : ''} />
        </DrawerContent>
      </Drawer>
      <a className="brand" href={href()}><span className="brand-mark" aria-hidden="true" />Monoline <Badge>{components.length + hooks.length}</Badge></a>
      <nav className="docs-links" aria-label="Main">
        {sections.map((s) => <a key={s.label} href={href(s.to)} aria-current={s.on(path) ? 'true' : undefined}>{s.label}</a>)}
      </nav>
      <Button size="sm" className="docs-searchbtn" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K /" onClick={onSearch}>
        Search <Kbd aria-hidden="true">{isMac ? '⌘ K' : 'Ctrl K'}</Kbd>
      </Button>
      <Button size="sm" asChild className="docs-github"><a href={GITHUB}>GitHub</a></Button>
      <CustomisePanel prefs={prefs} set={set} />
    </header>
  );
}
