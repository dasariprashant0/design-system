// Server entry for scripts/prerender.mjs: renders any docs route to an HTML string. Not shipped to the browser.
import {renderToString} from 'react-dom/server';
import {App, pageMeta} from './shell/App';
import {entries} from './shell/registry';
import {resolve, setServerPathname, BASE} from './shell/router';

/** Every real route: the home page and one per entry. `path` has no base and no trailing slash. */
export const routes = [{path: '', ...pageMeta({kind: 'home'}), kind: 'home'}, ...entries.map((e) => ({path: e.path, ...pageMeta({kind: 'page', entry: e}), kind: e.kind}))];

/** HTML of the whole app at a route path. */
export function render(path: string) {
  setServerPathname(BASE + path);
  return renderToString(<App />);
}

export {resolve};
