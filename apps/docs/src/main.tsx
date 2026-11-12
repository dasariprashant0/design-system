// Docs site entry. Real paths (`/components/button`), base-aware (DOCS_BASE), with old `#button` links upgraded.
// Everything about layout, routing and search lives in ./shell; page bodies in ./page and ./guides.
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@css/monoline.css';
import './docs.css';
import {App} from './shell/App';
import {installAnchorCopy} from './shell/headings';
import {installLinks} from './shell/router';

installLinks();
installAnchorCopy();
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
