// Sticky header: wordmark, centred search pill, Playground, GitHub, Customise; on docs pages a second row of section tabs.
// Below 880px the sidebar becomes a drawer opened from the menu button, and the tabs scroll sideways.
import {useEffect, useState} from 'react';
import {Button, Drawer, DrawerContent, DrawerTitle, DrawerTrigger, Kbd} from '@monoline/react';
import {CustomisePanel, type Prefs} from './prefs';
import {GithubIcon, Logo, MenuIcon, SearchIcon} from './Logo';
import {Nav} from './Nav';
import {tabHome, type Tab} from './registry';
import {href, type Route} from './router';

export const GITHUB = 'https://github.com/dasariprashant0/design-system';
/** The separate Playground page: a code editor with a live preview. */
export const PLAYGROUND = 'playground';

export const TABS: Array<{id: Tab; label: string}> = [
  {id: 'start', label: 'Get Started'},
  {id: 'components', label: 'Components'},
  {id: 'icons', label: 'Icons'},
  {id: 'editor', label: 'Editor'},
  {id: 'tools', label: 'Tools'},
];

/** The ⌘K chip. Mac or not is only known in the browser, so the server and the first client render both say Ctrl. */
function ShortcutHint() {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  return <Kbd aria-hidden="true">{mac ? '⌘ K' : 'Ctrl K'}</Kbd>;
}

export function Topbar({path, route, prefs, set, onSearch}: {path: string; route: Route; prefs: Prefs; set: (k: keyof Prefs, v: string) => void; onSearch: () => void}) {
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);
  const tab = route.kind === 'page' ? route.entry.tab : undefined;
  const docs = route.kind !== 'home';
  return (
    <header className="docs-bar">
      <div className="docs-bar-row">
        <div className="docs-bar-start">
        {docs && (
          <Drawer open={menu} onOpenChange={setMenu}>
            <DrawerTrigger asChild><Button size="sm" variant="line" className="docs-menu" aria-label="Open navigation"><MenuIcon /></Button></DrawerTrigger>
            <DrawerContent side="start" aria-describedby={undefined} className="docs-drawer">
              <DrawerTitle>Navigation</DrawerTitle>
              <Nav tab={tab} current={route.kind === 'page' ? route.entry.path : ''} />
              <p className="docs-drawer-links"><a href={href(PLAYGROUND)}>Playground ↗</a> <a href={GITHUB}>GitHub</a></p>
            </DrawerContent>
          </Drawer>
        )}
        <a className="brand" href={href()} aria-label="Monoline home"><Logo /></a>
        </div>
        <button type="button" className="docs-search" aria-label="Search" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K /" onClick={onSearch}>
          <SearchIcon /><span className="docs-search-text">Search</span><ShortcutHint />
        </button>
        <div className="docs-bar-end">
          <a className="docs-playground" href={href(PLAYGROUND)} target="_blank" rel="noopener">Playground <span aria-hidden="true">↗</span></a>
          <a className="docs-github" href={GITHUB} aria-label="Monoline on GitHub"><GithubIcon /></a>
          <CustomisePanel prefs={prefs} set={set} />
        </div>
      </div>
      {docs && (
        <nav className="docs-tabs" aria-label="Main">
          {TABS.map((t) => <a key={t.id} href={href(tabHome(t.id))} aria-current={t.id === tab ? 'true' : undefined}>{t.label}</a>)}
        </nav>
      )}
    </header>
  );
}
