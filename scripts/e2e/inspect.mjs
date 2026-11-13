// Developer aid: node scripts/e2e/inspect.mjs <route> [expression]  prints the live examples' HTML or an expression's value.
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome, serveDist} from '../lib/cdp.mjs';
import {createPage} from './page.mjs';
const [route, expr] = process.argv.slice(2);
const {server, base} = await serveDist(join(fileURLToPath(new URL('../..', import.meta.url)), 'apps/docs/dist'));
const browser = await launchChrome({label: 'monoline-inspect'});
const p = await createPage(browser, base);
await p.open(route);
console.log(expr ? await p.eval(expr) : await p.eval(`[...document.querySelectorAll('.cdoc-example')].map(e => '## ' + e.querySelector('h3').textContent + '\\n' + e.querySelector('.cdoc-stage').innerHTML.replace(/ (class|style)="[^"]*"/g, '').slice(0, 1800)).join('\\n\\n')`));
browser.close(); server.close(); process.exit(0);
