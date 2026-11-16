// Sticky header: wordmark, centred search pill, Playground, GitHub, Customise; on docs pages a second row of section tabs.
// Below 880px the sidebar becomes a drawer opened from the menu button, and the tabs scroll sideways.
import {useEffect, useState} from 'react';
import {Button, Drawer, DrawerContent, DrawerTitle, DrawerTrigger, Kbd} from '@monoline/react';
import {CustomisePanel, type Prefs} from './prefs';
import {GithubIcon, Logo, MenuIcon, SearchIcon} from './Logo';
import {Nav} from './Nav';
import {VERSION, tabHome, type Tab} from './registry';
import {href, type Route} from './router';

export const GITHUB = 'https://github.com/dasariprashant0/monoline';
/** The separate Playground page: a code editor with a live preview. */
export const PLAYGROUND = 'playground';

export const TABS: Array<{id: Tab; label: string}> = [
  {id: 'start', label: 'Get Started'},
  {id: 'components', label: 'Components'},
  {id: 'icons', label: 'Icons'},
  {id: 'editor', label: 'Editor'},
  {id: 'tools', label: 'Tools'},
];

/** The shortcut chips, one box per key as in the Twigs search button. Mac or not is only known in the browser, so the server and the first client render both say Ctrl. */
function ShortcutHint() {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  return <span className="docs-keys" aria-hidden="true"><Kbd>{mac ? '⌘' : 'Ctrl'}</Kbd><Kbd>K</Kbd></span>;
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
        <a className="docs-version" href={href('docs/tools/changelog')} aria-label={`v${VERSION} changelog`}>v{VERSION}</a>
        </div>
        <button type="button" className="docs-search" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K /" onClick={onSearch}>
          <SearchIcon /><span className="docs-search-text">Search</span><ShortcutHint />
        </button>
        <div className="docs-bar-end">
          <a className="docs-playground" href={href(PLAYGROUND)} target="_blank" rel="noopener">Playground <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><path d="M5 11 11 5M6 5h5v5" /></svg></a>
          <button type="button" className="docs-theme" aria-label="Toggle light and dark theme" onClick={() => set('theme', document.documentElement.dataset.theme === 'warm' ? 'dark' : 'warm')}>
            <svg className="theme-moon" viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" /></svg>
            <svg className="theme-sun" viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="3" /><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" /></svg>
          </button>
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
