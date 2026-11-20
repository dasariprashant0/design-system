// The docs frame: skip link, top bar, sidebar, main column, "On this page" rail, search palette.
// Routing, titles, scroll and focus are handled here; page bodies come from ../page and ../guides.
import {useEffect, useRef, useState, type ReactNode} from 'react';
import {Button, DirectionProvider} from '@monoline/react';
import {Astro, Editor, Extensions, IconsLibrary, IconsPage, Nextjs, Overview, PlainCss, Remix, Upgrade, Vite} from '../site/Pages';
import {PlaygroundPage} from '../page/live';
import {Tokens} from '../site/Tokens';
import {CopyMarkdown, OpenMenu, domToMarkdown} from '../page/doc-actions';
import {GITHUB} from './Topbar';
import {VERSION} from './registry';
import {Blocks} from '../site/Blocks';
import {Compare} from '../site/Compare';
import {Changelog, Roadmap} from '../site/Doc';
import {Themes} from '../site/Themes';
import {ComponentDoc} from '../page/component-doc';
import {Home} from './Home';
import {Nav} from './Nav';
import {Pager} from './Pager';
import {Search} from './Search';
import {Toc} from './Toc';
import {Topbar} from './Topbar';
import {useHeadings} from './headings';
import {PrefsContext, usePrefs} from './prefs';
import {components, guides, hooks, type Entry} from './registry';
import {href, resolve, useNavCount, usePathname, type Route} from './router';

const SITE = 'Monoline';
const HOME_DESCRIPTION = 'Monoline: an open-source UI kit with plain CSS tokens and accessible React components on Radix.';

function setMeta(title: string, description: string) {
  document.title = title;
  let m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.append(m); }
  m.content = description;
}

const SITE_BODIES: Record<string, () => ReactNode> = {blocks: Blocks, themes: Themes, compare: Compare, changelog: Changelog, roadmap: Roadmap, components: Overview, tokens: Tokens, nextjs: Nextjs, vite: Vite, astro: Astro, remix: Remix, 'plain-css': PlainCss, icons: IconsPage, 'icons-library': IconsLibrary, editor: Editor, tools: Extensions, upgrade: Upgrade};

/** Title area of every page that is not a component: 30px heading and a grey description. */
export function PageHead({title, description, actions = true}: {title: string; description: string; actions?: boolean}) {
  return (
    <header className="doc-head">
      <h1 className="doc-title">{title}</h1>
      <p className="doc-lede">{description}</p>
      {actions && (
        <div className="doc-actions">
          <CopyMarkdown source={() => domToMarkdown(document.querySelector('.docs-main')!)} />
          <OpenMenu title={title} pageUrl={() => location.href} source={`${GITHUB}/tree/master/apps/docs/src`} />
        </div>
      )}
    </header>
  );
}

function Page({entry}: {entry: Entry}) {
  if (entry.kind === 'site') {
    const Body = SITE_BODIES[entry.name]!;
    return (
      <>
        <PageHead title={entry.title} description={entry.description} />
        <Body />
      </>
    );
  }
  if (entry.kind === 'guide') {
    const guide = guides.find((g) => g.slug === entry.name)!;
    return (
      <>
        <PageHead title={guide.title} description={guide.summary} />
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
      <PageHead actions={false} title="Page not found" description={`There is no page at /${path}. Search with the / key, or start from the home page.`} />
      <div className="hero-actions"><Button variant="solid" asChild><a href={href()}>Home</a></Button></div>
    </>
  );
}

/** Title and description of a route, shared by the browser (setMeta) and the prerender script. */
export function pageMeta(route: Route) {
  if (route.kind === 'page') return {title: `${route.entry.title} · ${SITE}`, description: route.entry.description};
  if (route.kind === 'missing') return {title: `Page not found · ${SITE}`, description: HOME_DESCRIPTION};
  if (route.kind === 'playground') return {title: `Playground · ${SITE}`, description: 'Edit Monoline code and see it run: every component, no setup.'};
  return {title: `${SITE}: plain CSS and accessible React components`, description: HOME_DESCRIPTION};
}

export function App() {
  const pathname = usePathname();
  const navs = useNavCount();
  const route = resolve(pathname);
  const path = route.kind === 'page' ? route.entry.path : route.kind === 'missing' ? route.path : route.kind === 'playground' ? 'playground' : '';
  const [prefs, set] = usePrefs();
  const [search, setSearch] = useState(false);
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  const headings = useHeadings(main, path);

  useEffect(() => {
    const {title, description} = pageMeta(route);
    setMeta(title, description);
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
    // Radix reads its direction from a provider, not from <html dir>: without this the RTL preference flips the CSS but not the arrow keys.
    <DirectionProvider dir={prefs.dir === 'rtl' ? 'rtl' : 'ltr'}>
    <PrefsContext.Provider value={[prefs, set] as const}>
    {route.kind === 'playground' ? <PlaygroundPage /> : (
    <div className="docs" data-home={route.kind === 'home' || undefined} data-rail={(route.kind !== 'home' && headings.length > 1) || undefined}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); const m = main.current; if (m) { m.tabIndex = -1; m.focus(); } }}>Skip to main content</a>
      <Topbar path={path} route={route} prefs={prefs} set={set} onSearch={() => setSearch(true)} />
      <aside className="docs-side" id="docs-side">
        <button type="button" className="side-search" aria-haspopup="dialog" onClick={() => setSearch(true)}>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3.5 3.5" /></svg>
          <span>Search</span><kbd className="kbd" aria-hidden="true">/</kbd>
        </button>
        <Nav tab={route.kind === 'page' ? route.entry.tab : undefined} current={route.kind === 'page' ? route.entry.path : ''} />
      </aside>
      <main className="docs-main" id="main" ref={main}>
        {route.kind === 'home' ? <Home /> : route.kind === 'missing' ? <Missing path={route.path} /> : (
          <>
            <Page key={route.entry.path} entry={route.entry} />
            <Pager entry={route.entry} />
          </>
        )}
      </main>
      {headings.length > 1 && route.kind !== 'home' && (
        <Toc headings={headings} extra={route.kind === 'page' && (route.entry.kind === 'component' || route.entry.kind === 'hook') ? (
          <dl className="docs-facts" aria-label="Package facts">
            <dt>Version</dt><dd>{VERSION}</dd>
            <dt>Links</dt>
            <dd>
              <a href={`${GITHUB}/tree/master/packages/react/src/${route.entry.kind === 'hook' ? 'hooks' : 'components'}/${route.entry.name}`}>View source</a>
              <a href={`${GITHUB}/issues/new`}>Report an issue</a>
              <a href={`${import.meta.env.BASE_URL}docs/${route.entry.name}.md`}>View as Markdown</a>
            </dd>
          </dl>
        ) : undefined} />
      )}
      <Search open={search} onOpenChange={setSearch} />
    </div>
    )}
    </PrefsContext.Provider>
    </DirectionProvider>
  );
}
