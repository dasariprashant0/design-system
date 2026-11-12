// The docs frame: skip link, top bar, sidebar, main column, "On this page" rail, search palette.
// Routing, titles, scroll and focus are handled here; page bodies come from ../page and ../guides.
import {useEffect, useRef, useState} from 'react';
import {Button} from '@monoline/react';
import {ComponentDoc} from '../page/component-doc';
import {Home} from './Home';
import {Nav} from './Nav';
import {Pager} from './Pager';
import {Search} from './Search';
import {Toc} from './Toc';
import {Topbar} from './Topbar';
import {useHeadings} from './headings';
import {usePrefs} from './prefs';
import {components, guides, hooks, type Entry} from './registry';
import {href, resolve, useNavCount, usePathname} from './router';

const SITE = 'Monoline';
const HOME_DESCRIPTION = 'Monoline: an open-source UI kit with plain CSS tokens and accessible React components on Radix.';

function setMeta(title: string, description: string) {
  document.title = title;
  let m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.append(m); }
  m.content = description;
}

function Page({entry}: {entry: Entry}) {
  if (entry.kind === 'guide') {
    const guide = guides.find((g) => g.slug === entry.name)!;
    return (
      <>
        <p className="label">guide</p>
        <h1 className="display display-md">{guide.title}</h1>
        <p className="lede">{guide.summary}</p>
        {guide.body()}
      </>
    );
  }
  const meta = [...components, ...hooks].find((m) => m.name === entry.name)!;
  return <ComponentDoc meta={meta} />;
}

function Missing({path}: {path: string}) {
  return (
    <>
      <p className="label">404</p>
      <h1 className="display display-md">Page not found</h1>
      <p className="lede">There is no page at <code>/{path}</code>. Search with <kbd className="kbd">/</kbd>, or start from the home page.</p>
      <div className="hero-actions"><Button variant="solid" asChild><a href={href()}>Home</a></Button></div>
    </>
  );
}

export function App() {
  const pathname = usePathname();
  const navs = useNavCount();
  const route = resolve(pathname);
  const path = route.kind === 'page' ? route.entry.path : route.kind === 'missing' ? route.path : '';
  const [prefs, set] = usePrefs();
  const [search, setSearch] = useState(false);
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  const headings = useHeadings(main, path);

  useEffect(() => {
    if (route.kind === 'page') setMeta(`${route.entry.title} · ${SITE}`, route.entry.description);
    else if (route.kind === 'missing') setMeta(`Page not found · ${SITE}`, HOME_DESCRIPTION);
    else setMeta(`${SITE}: plain CSS and accessible React components`, HOME_DESCRIPTION);
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  // After every navigation: scroll to the hash anchor or the top, and move focus to the page heading
  // (not on first load, so a fresh visit keeps the browser's own focus).
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
    if (first.current) { first.current = false; return; }
    const h1 = main.current?.querySelector('h1');
    if (h1) { h1.tabIndex = -1; h1.focus({preventScroll: true}); }
  }, [path, navs]);

  return (
    <div className="docs" data-home={route.kind === 'home' || undefined} data-rail={headings.length > 1 || undefined}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); const m = main.current; if (m) { m.tabIndex = -1; m.focus(); } }}>Skip to main content</a>
      <Topbar path={path} route={route} prefs={prefs} set={set} onSearch={() => setSearch(true)} />
      <aside className="docs-side" id="docs-side">
        <Nav current={route.kind === 'page' ? route.entry.path : ''} />
      </aside>
      <main className="docs-main" id="main" ref={main}>
        {route.kind === 'home' ? <Home /> : route.kind === 'missing' ? <Missing path={route.path} /> : (
          <>
            <Page key={route.entry.path} entry={route.entry} />
            <Pager entry={route.entry} />
          </>
        )}
      </main>
      {headings.length > 1 && route.kind !== 'home' && <Toc headings={headings} />}
      <Search open={search} onOpenChange={setSearch} />
    </div>
  );
}
