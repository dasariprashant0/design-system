#!/usr/bin/env node
// End-to-end tests in real Chrome against the BUILT docs site (apps/docs/dist). No dependencies.
//
//   npm run build            (once; this runner builds nothing)
//   npm run e2e              all tests
//   npm run e2e -- --grep dialog          only tests whose name contains "dialog"
//   npm run e2e -- --retries 1 --bail     retry a failing test once (reported as flaky if it then passes), stop at first failure
//   npm run e2e -- --list                 list test names
// Chrome: CHROME=/path/to/chrome, otherwise common macOS/Linux locations are tried.
import {existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {launchChrome, serveDist} from '../lib/cdp.mjs';
import {createPage} from './page.mjs';
import {registry} from './test.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '../..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const grep = opt('grep', ''); const retries = Number(opt('retries', 0)); const bail = args.includes('--bail');
const dist = join(root, 'apps/docs/dist');
if (!existsSync(join(dist, 'index.html'))) { console.error('Build the docs first: npm run build'); process.exit(2); }

for (const f of readdirSync(join(here, 'tests')).filter((f) => f.endsWith('.test.mjs')).sort()) await import(pathToFileURL(join(here, 'tests', f)).href);
const tests = registry.filter((t) => !t.skip && t.name.includes(grep));
if (args.includes('--list')) { for (const t of tests) console.log(t.name); process.exit(0); }

const {server, base} = await serveDist(dist);
let browser;
try { browser = await launchChrome({label: 'monoline-e2e'}); } catch (e) { console.error(e.message); server.close(); process.exit(2); }
const cleanup = () => { browser.close(); try { server.close(); } catch {} };
process.on('exit', cleanup);
const page = await createPage(browser, base);

const withTimeout = (p, ms) => { let timer; return Promise.race([p, new Promise((_, rej) => { timer = setTimeout(() => { page.abort(); rej(new Error(`test timed out after ${ms}ms, last call ${page.lastCall()}`)); }, ms); })]).finally(() => clearTimeout(timer)); };
const failures = []; const flaky = []; let passed = 0;
const started = Date.now();
for (const t of tests) {
  let err, attempt = 0;
  for (; attempt <= retries; attempt++) {
    const t0 = Date.now(); page.begin();
    try {
      await withTimeout(t.fn(page), t.timeout ?? 20000);
      if (page.errors.length) throw new Error(`uncaught page error: ${page.errors[0]}`);
      err = undefined;
      if (attempt === 0) console.log(`  ok   ${t.name} (${Date.now() - t0}ms)`);
      break;
    } catch (e) { err = e; }
  }
  if (!err) { passed++; if (attempt > 0) { flaky.push(t.name); console.log(`  FLAKY ${t.name} (passed on attempt ${attempt + 1})`); } continue; }
  failures.push({name: t.name, message: err.message});
  console.log(`  FAIL ${t.name}\n       ${err.message.split('\n').join('\n       ')}`);
  if (bail) break;
}
console.log(`\n${passed}/${tests.length} passed, ${failures.length} failed${flaky.length ? `, ${flaky.length} flaky` : ''} in ${((Date.now() - started) / 1000).toFixed(0)}s`);
cleanup();
process.exit(failures.length ? 1 : 0);
