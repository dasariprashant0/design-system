// Home page footer: a closing call to action, link columns with a live accent picker, a giant wordmark and the bottom bar.
import {Button} from '@monoline/react';
import {ArrowIcon, Logo} from './Logo';
import {InstallBox} from './home-board';
import {ACCENTS, SWATCH, usePrefsContext} from './prefs';
import {components, entryAt} from './registry';
import {href} from './router';
import {GITHUB} from './Topbar';

/** Footer link groups. Labels where the page title alone is ambiguous (several pages are called Overview or Setup). */
const LABEL: Record<string, string> = {'docs/icons': 'Icons', 'docs/editor': 'Editor', 'docs/frameworks/nextjs': 'Frameworks', 'docs/tools': 'Extensions'};
const FOOT: Array<{title: string; links: string[]}> = [
  {title: 'Start', links: ['docs/getting-started', 'docs/theming', 'docs/frameworks/nextjs', 'docs/icons', 'docs/guides/accessibility']},
  {title: 'Components', links: ['docs/components', 'docs/components/button', 'docs/components/dialog', 'docs/components/data-table', 'docs/components/select']},
  {title: 'Tools', links: ['docs/tools', 'docs/tools/themes', 'docs/tools/blocks', 'docs/tools/cli', 'docs/tools/upgrade', 'docs/tools/changelog']},
];

/** Footer: a closing call to action, links, a live accent picker, a giant wordmark and the bottom bar. */
export function Footer() {
  const [prefs, set] = usePrefsContext();
  return (
    <footer className="foot">
      <div className="foot-cta">
        <p className="hc-eyebrow">Ready when you are</p>
        <h2 className="foot-h" data-no-toc>Start with one component. <em>Keep the rest calm.</em></h2>
        <div className="home-cta">
          <Button asChild><a href={href('docs/getting-started')}>Get started</a></Button>
          <Button variant="line" asChild><a href={href('docs/components')}>Browse {components.length} components</a></Button>
          <InstallBox />
        </div>
      </div>
      <div className="foot-grid">
        <div className="foot-brand">
          <a className="brand" href={href()} aria-label="Monoline home"><Logo /></a>
          <p className="foot-tag">Accessible, themeable, plain CSS and React components for products that need to stay readable at scale.</p>
          <div className="foot-accents" role="radiogroup" aria-label="Try an accent colour">
            <p className="hc-eyebrow">Try an accent</p>
            <div className="foot-swatches">
              {ACCENTS.map((a) => <button key={a} type="button" role="radio" aria-checked={prefs.accent === a} aria-label={a} title={a} className="foot-swatch" style={{background: SWATCH[a]}} onClick={() => set('accent', a)} />)}
            </div>
          </div>
        </div>
        {FOOT.map((g) => (
          <nav key={g.title} className="foot-col" aria-label={g.title}>
            <h3 data-no-toc>{g.title}</h3>
            <ul>{g.links.map((l) => { const e = entryAt(l); return e ? <li key={l}><a href={href(l)}>{LABEL[l] ?? e.title}</a></li> : null; })}</ul>
          </nav>
        ))}
      </div>
      <div className="foot-mark" aria-hidden="true"><span>monoline</span></div>
      <div className="foot-bottom">
        <p>Built with <span aria-label="love">❤️</span> in the open. <a href={GITHUB}>Source on GitHub</a></p>
        <p>Copyright © 2026 Monoline contributors. MIT licence.</p>
        <a className="foot-top" href="#main" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>Back to top <ArrowIcon /></a>
      </div>
    </footer>
  );
}

