#!/usr/bin/env node
// Real-browser audit of the built docs site. No dependencies: it drives Chrome over the DevTools protocol
// (Node's built-in WebSocket) and runs axe-core (from node_modules) inside the page.
//
//   npm run build -w apps/docs
//   node scripts/audit.mjs                       a11y + layout audit, all pages, 3 themes, desktop and 375px
//   node scripts/audit.mjs --accents all         also every accent (contrast in each)
//   node scripts/audit.mjs --pages button,card   a subset
//   node scripts/audit.mjs --visual --update     write screenshot baselines to audit/baseline
//   node scripts/audit.mjs --visual              compare screenshots with the baseline (byte-exact PNGs)
//
// Checks per page, theme, accent and viewport: axe-core violations (WCAG 2 A/AA and 2.1/2.2 AA tags, colour
// contrast included), horizontal overflow, console errors, uncaught exceptions and failed requests.
// Chrome: set CHROME=/path/to/chrome, otherwise common macOS/Linux locations are tried.
import {existsSync, mkdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome, serveDist} from './lib/cdp.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };

const dist = join(root, 'apps/docs/dist');
if (!existsSync(join(dist, 'index.html'))) { console.error('Build the docs first: npm run build -w apps/docs'); process.exit(2); }
const THEMES = opt('themes', 'warm,dark,midnight').split(',');
const ALL_ACCENTS = ['orange', 'green', 'blue', 'violet', 'rose', 'teal', 'amber', 'slate'];
const ACCENTS = opt('accents', 'orange') === 'all' ? ALL_ACCENTS : opt('accents', 'orange').split(',');
const VIEWPORTS = {desktop: {width: 1280, height: 800, mobile: false}, mobile: {width: 375, height: 812, mobile: true}};
const VPS = opt('viewports', 'desktop,mobile').split(',');
const VISUAL = flag('visual');
const baselineDir = join(root, 'audit', 'baseline');
const actualDir = join(root, 'audit', 'actual');

// --- static server for apps/docs/dist, Chrome and a CDP client (shared with scripts/e2e)
const {server, base} = await serveDist(dist);
let browser;
try { browser = await launchChrome({label: 'monoline-audit'}); } catch (e) { console.error(e.message); server.close(); process.exit(2); }
const {cdp, evaluate, listeners, sessionId} = browser;
const cleanup = () => { browser.close(); try { server.close(); } catch {} };
process.on('exit', cleanup);

const problems = []; // {page, state, kind, detail}
let currentState = '', currentPage = '';
const note = (kind, detail) => problems.push({page: currentPage, state: currentState, kind, detail});
listeners.push((m) => {
  if (m.sessionId !== sessionId) return;
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') note('console-error', m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
  if (m.method === 'Runtime.exceptionThrown') note('exception', (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 200));
  if (m.method === 'Network.loadingFailed' && !m.params.canceled) note('request-failed', m.params.errorText);
});
await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Page.enable');
const axeSource = readFileSync(join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');
await cdp('Page.addScriptToEvaluateOnNewDocument', {source: axeSource});

// --- pages: read the sidebar after load
await cdp('Emulation.setDeviceMetricsOverride', {width: 1280, height: 800, deviceScaleFactor: 1, mobile: false});
await cdp('Page.navigate', {url: base});
await new Promise((r) => setTimeout(r, 1500));
let pages = await evaluate(`[...document.querySelectorAll('.nav-item')].map(a => a.getAttribute('href'))`);
if (!pages.length) { console.error('No pages found in the docs sidebar.'); cleanup(); process.exit(2); }
const only = opt('pages', '');
const slug = (p) => p.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
if (only) pages = pages.filter((p) => only.split(',').includes(p.split('/').filter(Boolean).pop()));
console.log(`Auditing ${pages.length} pages x ${THEMES.length} themes x ${ACCENTS.length} accents x ${VPS.length} viewports${VISUAL ? ' (visual)' : ''}`);

const waitForPage = (page) => evaluate(`(async () => { const a = document.querySelector('.nav-item[href=' + JSON.stringify(${JSON.stringify(page)}) + ']'); if (!a) return false; a.click(); for (let i = 0; i < 80; i++) { await new Promise(r => setTimeout(r, 50)); const m = document.querySelector('.docs-main'); if (m && m.querySelector('h1') && location.pathname === a.pathname) { await new Promise(r => setTimeout(r, 150)); return true; } } return false; })()`);
const setLook = (theme, accent) => evaluate(`(() => { const r = document.documentElement; r.dataset.theme = ${JSON.stringify(theme)}; r.dataset.accent = ${JSON.stringify(accent)}; return true; })()`);
const AXE = `axe.run(document.body, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']}, resultTypes: ['violations']}).then(r => r.violations.map(v => ({id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0] && v.nodes[0].target.join(' ').slice(0, 120), msg: v.nodes[0] && (v.nodes[0].any[0] || v.nodes[0].all[0] || v.nodes[0].none[0] || {}).message})))`;

let states = 0, shots = 0, changed = 0, created = 0;
if (VISUAL) { mkdirSync(baselineDir, {recursive: true}); rmSync(actualDir, {recursive: true, force: true}); mkdirSync(actualDir, {recursive: true}); }
const started = Date.now();
for (const vp of VPS) {
  const v = VIEWPORTS[vp];
  await cdp('Emulation.setDeviceMetricsOverride', {width: v.width, height: v.height, deviceScaleFactor: 1, mobile: v.mobile});
  await cdp('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'reduce'}]});
  await cdp('Page.navigate', {url: base}); await new Promise((r) => setTimeout(r, 1200));
  for (const theme of THEMES) for (const accent of VISUAL ? ['orange'] : ACCENTS) {
    await setLook(theme, accent);
    for (const page of pages) {
      currentPage = page; currentState = `${vp}/${theme}/${accent}`;
      if (!(await waitForPage(page))) { note('page-did-not-render', ''); continue; }
      states++;
      if (VISUAL) {
        const {data} = await cdp('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false});
        const buf = Buffer.from(data, 'base64'); const name = `${vp}-${theme}-${slug(page)}.png`; shots++;
        const basePath = join(baselineDir, name);
        if (flag('update') || !existsSync(basePath)) { writeFileSync(basePath, buf); created++; }
        else if (!readFileSync(basePath).equals(buf)) { writeFileSync(join(actualDir, name), buf); changed++; note('visual-diff', name); }
        continue;
      }
      const over = await evaluate(`document.documentElement.scrollWidth > innerWidth + 1`);
      if (over) note('horizontal-overflow', `${await evaluate('document.documentElement.scrollWidth')}px wide`);
      const violations = await evaluate(AXE);
      for (const x of violations) note(`axe:${x.id}`, `${x.impact}, ${x.nodes} node(s), e.g. ${x.sample}${x.msg ? ' (' + x.msg.slice(0, 110) + ')' : ''}`);
    }
  }
}

const seconds = ((Date.now() - started) / 1000).toFixed(0);
cleanup();
// group identical problems across states
const groups = new Map();
for (const p of problems) { const k = `${p.kind} | ${p.page} | ${p.detail}`; (groups.get(k) ?? groups.set(k, []).get(k)).push(p.state); }
if (VISUAL) console.log(`${shots} screenshots in ${seconds}s: ${created} written, ${changed} changed${changed ? ` (see audit/actual vs audit/baseline)` : ''}`);
else console.log(`${states} page states audited in ${seconds}s`);
if (groups.size) {
  for (const [k, st] of groups) console.log(`FAIL ${k}  [${[...new Set(st)].slice(0, 4).join(', ')}${new Set(st).size > 4 ? ` +${new Set(st).size - 4}` : ''}]`);
  console.log(`${groups.size} distinct problem(s)`);
  process.exit(1);
}
console.log('OK: no problems found');
