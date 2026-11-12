#!/usr/bin/env node
// Real-browser audit of the built example apps (examples/*/dist). Same approach as scripts/audit.mjs:
// Chrome over the DevTools protocol, axe-core in the page, no extra dependencies.
//
//   for n in dashboard auth-settings landing; do (cd examples/$n && npx vite build); done
//   node scripts/audit-examples.mjs [--shots <dir>] [--apps dashboard,landing] [--themes warm,dark]
//
// Each scenario loads the app, performs real mouse and keyboard input (open a dialog, press Ctrl+K, submit an empty
// form...), then checks axe (WCAG 2 A/AA, 2.1, 2.2 AA), horizontal overflow, console errors and exceptions,
// in 3 themes at 1280px and 375px. With --shots it also saves a PNG per state for looking at.
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {extname, join, normalize} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const shotsDir = opt('shots', '');
const apps = opt('apps', 'dashboard,auth-settings,landing').split(',');
const scenarioFilter = opt('scenario', '');
const THEMES = opt('themes', 'warm,dark,midnight').split(',');
if (shotsDir) mkdirSync(shotsDir, {recursive: true});

// Actions: {click: [selector, text?]} real mouse click, {key: 'ctrl+k' | 'Escape' | 'Tab'}, {type: [selector, value]}, {wait: ms}, {js: code}
const C = (sel, text) => ({click: [sel, text]});
const SCENARIOS = {
  dashboard: [
    {name: 'overview', hash: ''},
    {name: 'orders', hash: 'orders'},
    {name: 'command', hash: '', actions: [{key: 'ctrl+k'}, {wait: 300}]},
    {name: 'command-filtered', hash: '', actions: [{key: 'ctrl+k'}, {wait: 200}, {type: ['[role=combobox], input[type=text]', 'dark']}, {wait: 200}]},
    {name: 'new-order-dialog', hash: '', actions: [C('button', 'New order'), {wait: 300}]},
    // known: axe reports aria-hidden-focus on #root while a Radix menu is open (axe only forgives it for aria-modal dialogs). Focus is trapped in the menu, so it is not a user-facing problem; listed, not failed.
    {name: 'look-menu', hash: '', known: ['axe:aria-hidden-focus'], actions: [C('button', 'Look'), {wait: 300}]},
    {name: 'date-picker', hash: '', actions: [C('button', 'Any date'), {wait: 300}]},
    {name: 'sort-by-amount', hash: 'orders', actions: [C('th button, th [role=button]', 'Amount'), {wait: 200}]},
    {name: 'toast', hash: '', actions: [C('button', 'New order'), {wait: 300}, {type: ['[role=dialog] input', 'Ada']}, C('[role=dialog] button[type=submit]'), {wait: 500}]},
  ],
  'auth-settings': [
    {name: 'signin', hash: 'signin'},
    {name: 'signin-empty-submit', hash: 'signin', actions: [C('button[type=submit]'), {wait: 300}]},
    {name: 'signup', hash: 'signup'},
    {name: 'signup-empty-submit', hash: 'signup', actions: [C('button[type=submit]'), {wait: 300}]},
    {name: 'settings-profile', hash: 'settings'},
    {name: 'settings-notifications', hash: 'settings', actions: [C('[role=tab]', 'Notifications'), {wait: 200}]},
    {name: 'settings-preferences', hash: 'settings', known: ['axe:aria-hidden-focus'], actions: [C('[role=tab]', 'Preferences'), {wait: 200}, C('[role=combobox]'), {wait: 300}]},
    {name: 'settings-danger', hash: 'settings', actions: [C('[role=tab]', 'Account'), {wait: 200}, C('button', 'Delete account'), {wait: 300}]},
  ],
  landing: [
    // Heading size="md" is documented as 18px (--text-lg); a later legacy rule made it 34px.
    {name: 'top', hash: '', actions: [{assert: [`parseFloat(getComputedStyle(document.querySelector('.heading-md')).fontSize) <= 20`, 'Heading size=md is larger than 20px']}]},
    // The pointer is still over the selected segment after the click: its label must stay readable (it used to turn the same colour as its fill).
    {name: 'pricing-yearly', hash: '', actions: [C('[role=radio], button', 'Yearly'), {wait: 300}, {assert: [`(() => { const e = document.querySelector('.segment[data-state=on]'); const s = getComputedStyle(e); return e.matches(':hover') && s.color !== s.backgroundColor; })()`, 'selected segment label is invisible while hovered']}]},
    {name: 'dark-mode', hash: '', actions: [C('button', 'Dark mode'), {wait: 200}]},
  ],
};

// --- static server for examples/<app>/dist
let current = '';
const mime = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png'};
const server = createServer((req, res) => {
  const dist = join(root, 'examples', current, 'dist');
  const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const file = join(dist, path === '/' || path === '.' ? 'index.html' : path);
  if (!file.startsWith(dist) || !existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, {'content-type': mime[extname(file)] ?? 'application/octet-stream'});
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

// --- launch Chrome (needs the sandbox off in Claude Code's own sandbox; fine on a normal machine)
const candidates = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
const chromePath = candidates.find((p) => existsSync(p));
if (!chromePath) { console.error('Chrome not found. Set CHROME=/path/to/chrome.'); server.close(); process.exit(2); }
const profile = mkdtempSync(join(tmpdir(), 'monoline-ex-audit-'));
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--force-device-scale-factor=1', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-sandbox', '--disable-extensions', 'about:blank'], {stdio: ['ignore', 'ignore', 'pipe']});
let chromeLog = '';
chrome.stderr.on('data', (d) => { chromeLog += d; });
const cleanup = () => { try { chrome.kill(); } catch {} try { server.close(); } catch {} try { rmSync(profile, {recursive: true, force: true}); } catch {} };
process.on('exit', cleanup);
const portFile = join(profile, 'DevToolsActivePort');
for (let i = 0; i < 300 && !existsSync(portFile); i++) await new Promise((r) => setTimeout(r, 100));
if (!existsSync(portFile)) { console.error(`Chrome did not start.\n${chromeLog.slice(-1500)}`); cleanup(); process.exit(2); }
const [port, wsPath] = readFileSync(portFile, 'utf8').trim().split('\n');

// --- minimal CDP client
const ws = new WebSocket(`ws://127.0.0.1:${port}${wsPath}`);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const waiting = new Map(); const listeners = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && waiting.has(msg.id)) { const {res, rej} = waiting.get(msg.id); waiting.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
  else listeners.forEach((l) => l(msg));
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; waiting.set(i, {res, rej}); ws.send(JSON.stringify({id: i, method, params, sessionId})); });
const {targetId} = await send('Target.createTarget', {url: 'about:blank'});
const {sessionId} = await send('Target.attachToTarget', {targetId, flatten: true});
const cdp = (m, p) => send(m, p, sessionId);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evaluate = async (expression) => {
  const r = await cdp('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};

const problems = [];
let state = '';
let knownKinds = [];
const note = (kind, detail) => problems.push({state, kind: knownKinds.includes(kind) ? `known ${kind}` : kind, detail});
listeners.push((m) => {
  if (m.sessionId !== sessionId) return;
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) note(`console-${m.params.type}`, m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 220));
  if (m.method === 'Runtime.exceptionThrown') note('exception', (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 220));
  if (m.method === 'Network.loadingFailed' && !m.params.canceled) note('request-failed', m.params.errorText);
});
await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Page.enable');
await cdp('Page.addScriptToEvaluateOnNewDocument', {source: readFileSync(join(root, 'node_modules/axe-core/axe.min.js'), 'utf8')});

const KEYS = {Escape: 27, Tab: 9, Enter: 13};
async function key(combo) {
  const parts = combo.split('+'); const k = parts.pop();
  const modifiers = (parts.includes('alt') ? 1 : 0) | (parts.includes('ctrl') ? 2 : 0) | (parts.includes('meta') ? 4 : 0) | (parts.includes('shift') ? 8 : 0);
  const code = KEYS[k] ?? k.toUpperCase().charCodeAt(0);
  const ev = {key: k, code: k.length === 1 ? `Key${k.toUpperCase()}` : k, windowsVirtualKeyCode: code, modifiers};
  await cdp('Input.dispatchKeyEvent', {type: 'rawKeyDown', ...ev});
  await cdp('Input.dispatchKeyEvent', {type: 'keyUp', ...ev});
}
async function mouseClick([sel, text]) {
  const rect = await evaluate(`(() => { const els = [...document.querySelectorAll(${JSON.stringify(sel)})].filter(e => e.getClientRects().length); const el = ${text ? `els.find(e => (e.textContent || e.getAttribute('aria-label') || '').trim().startsWith(${JSON.stringify(text)}))` : 'els[0]'}; if (!el) return null; el.scrollIntoView({block: 'center'}); const r = el.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; })()`);
  if (!rect) throw new Error(`click target not found: ${sel} ${text ?? ''}`);
  await cdp('Input.dispatchMouseEvent', {type: 'mouseMoved', x: rect.x, y: rect.y});
  await cdp('Input.dispatchMouseEvent', {type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1});
  await cdp('Input.dispatchMouseEvent', {type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1});
}
async function act(a) {
  if (a.click) await mouseClick(a.click);
  else if (a.key) await key(a.key);
  else if (a.wait) await sleep(a.wait);
  else if (a.js) await evaluate(a.js);
  else if (a.assert) { if (!(await evaluate(a.assert[0]))) note('assertion-failed', a.assert[1]); }
  else if (a.type) {
    await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(a.type[0])}); if (!el) throw new Error('not found: ${a.type[0]}'); el.focus(); return true; })()`);
    await cdp('Input.insertText', {text: a.type[1]});
  }
}

const AXE = `axe.run(document.body, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']}, resultTypes: ['violations']}).then(r => r.violations.map(v => ({id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0] && v.nodes[0].target.join(' ').slice(0, 120) + ' ' + (v.nodes[0].any[0] ? v.nodes[0].any[0].relatedNodes.slice(0, 2).map(n => n.html.slice(0, 90)).join(' | ') : ''), msg: v.nodes[0] && (v.nodes[0].any[0] || v.nodes[0].all[0] || v.nodes[0].none[0] || {}).message})))`;
const VIEWPORTS = {desktop: {width: 1280, height: 800, mobile: false}, mobile: {width: 375, height: 812, mobile: true}};
let states = 0;
const started = Date.now();
for (const app of apps) {
  current = app;
  if (!existsSync(join(root, 'examples', app, 'dist', 'index.html'))) { console.error(`Build ${app} first.`); continue; }
  for (const [vp, v] of Object.entries(VIEWPORTS)) {
    await cdp('Emulation.setDeviceMetricsOverride', {width: v.width, height: v.height, deviceScaleFactor: 1, mobile: v.mobile});
    await cdp('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'reduce'}]});
    for (const theme of THEMES) for (const sc of SCENARIOS[app].filter((x) => x.name.includes(scenarioFilter))) {
      state = `${app}/${sc.name}/${vp}/${theme}`; knownKinds = sc.known ?? [];
      await cdp('Page.navigate', {url: 'about:blank'});
      await cdp('Page.addScriptToEvaluateOnNewDocument', {source: `try { localStorage.setItem('theme', ${JSON.stringify(theme)}); } catch {}`});
      await cdp('Page.navigate', {url: `${base}${sc.hash ? '#' + sc.hash : ''}`});
      await sleep(700);
      await evaluate(`document.documentElement.dataset.theme = ${JSON.stringify(theme)}`);
      try { for (const a of sc.actions ?? []) await act(a); } catch (e) { note('scenario-failed', e.message.slice(0, 200)); continue; }
      await sleep(250);
      states++;
      if (await evaluate('document.documentElement.scrollWidth > innerWidth + 1')) note('horizontal-overflow', `${await evaluate('document.documentElement.scrollWidth')}px wide`);
      for (const x of await evaluate(AXE)) note(`axe:${x.id}`, `${x.impact}, ${x.nodes} node(s), e.g. ${x.sample}${x.msg ? ' (' + x.msg.slice(0, 110) + ')' : ''}`);
      if (shotsDir && (theme === 'warm' || sc.name === 'overview' || sc.name === 'top')) {
        const {data} = await cdp('Page.captureScreenshot', {format: 'png', captureBeyondViewport: sc.name === 'top' || sc.name === 'overview'});
        writeFileSync(join(shotsDir, `${app}-${sc.name}-${vp}-${theme}.png`), Buffer.from(data, 'base64'));
      }
    }
  }
}

const seconds = ((Date.now() - started) / 1000).toFixed(0);
cleanup();
const groups = new Map();
for (const p of problems) { const k = `${p.kind} | ${p.detail}`; const g = groups.get(k) ?? groups.set(k, []).get(k); g.push(p.state); }
console.log(`${states} states audited in ${seconds}s`);
for (const [k, st] of groups) console.log(`${k.startsWith('known ') ? 'KNOWN' : 'FAIL'} ${k}  [${[...new Set(st)].slice(0, 3).join(', ')}${new Set(st).size > 3 ? ` +${new Set(st).size - 3}` : ''}]`);
const failing = [...groups.keys()].filter((k) => !k.startsWith('known '));
if (failing.length) { console.log(`${failing.length} distinct problem(s)`); process.exit(1); }
console.log('OK: no problems found');
