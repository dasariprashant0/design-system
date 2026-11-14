// Docs site entry. Real paths (`/components/button`), base-aware (DOCS_BASE), with old `#button` links upgraded.
// Everything about layout, routing and search lives in ./shell; page bodies in ./page and ./guides.
import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import '@css/monoline.css';
import './docs.css';
import {App} from './shell/App';
import {installAnchorCopy} from './shell/headings';
import {installLinks, routeOf} from './shell/router';

installLinks();
installAnchorCopy();
const root = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;
// scripts/prerender.mjs fills #root with the page's HTML and names the route in data-path. Hydrate it when it is
// the page being shown; if the URL moved on (an old #hash was upgraded, or 404.html restored an unknown path), start clean.
if (root.hasChildNodes() && root.dataset.path === routeOf(location.pathname)) hydrateRoot(root, app);
else { root.replaceChildren(); createRoot(root).render(app); }
