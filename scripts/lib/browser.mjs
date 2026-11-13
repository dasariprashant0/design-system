// Shared by scripts that drive a real Chrome over the DevTools protocol (no dependencies, Node's built-in WebSocket).
// Same approach as scripts/audit.mjs: a static server for a built folder, a headless Chrome, a minimal CDP client.
//   const b = await openBrowser({dist: 'apps/docs/dist'});   b.base, b.evaluate(js), b.navigate(url), b.setViewport(w, h), b.close()
// Chrome: set CHROME=/path/to/chrome, otherwise common macOS/Linux locations are tried. Inside Claude Code's sandbox Chrome
// needs the sandbox off (dangerouslyDisableSandbox); on a normal machine it just runs.
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {extname, join, normalize} from 'node:path';

const mime = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png'};

export async function openBrowser({dist}) {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const file = join(dist, path === '/' || path === '.' ? 'index.html' : path);
    // Single-page app: any path without a file extension falls back to index.html, like the 404.html trick on Pages.
    const target = existsSync(file) && extname(file) ? file : (extname(file) ? null : join(dist, 'index.html'));
    if (!target || !target.startsWith(dist) || !existsSync(target)) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, {'content-type': mime[extname(target)] ?? 'application/octet-stream'});
    res.end(readFileSync(target));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;

  const candidates = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
  const chromePath = candidates.find((p) => existsSync(p));
  if (!chromePath) { server.close(); throw new Error('Chrome not found. Set CHROME=/path/to/chrome.'); }
  const profile = mkdtempSync(join(tmpdir(), 'monoline-css-'));
  const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--force-device-scale-factor=1', '--font-render-hinting=none', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions', 'about:blank'], {stdio: ['ignore', 'ignore', 'pipe']});
  let chromeLog = '';
  chrome.stderr.on('data', (d) => { chromeLog += d; });
  const close = () => { try { chrome.kill(); } catch {} try { server.close(); } catch {} try { rmSync(profile, {recursive: true, force: true}); } catch {} };
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 300 && !existsSync(portFile); i++) await new Promise((r) => setTimeout(r, 100));
  if (!existsSync(portFile)) { close(); throw new Error(`Chrome did not start.\n${chromeLog.slice(-1500)}`); }
  const [port, wsPath] = readFileSync(portFile, 'utf8').trim().split('\n');

  const ws = new WebSocket(`ws://127.0.0.1:${port}${wsPath}`);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const waiting = new Map(); const errors = [];
  let sessionId;
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && waiting.has(msg.id)) { const {res, rej} = waiting.get(msg.id); waiting.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
    else if (msg.method === 'Runtime.exceptionThrown') errors.push((msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text).slice(0, 200));
    else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
  };
  const send = (method, params = {}, sid) => new Promise((res, rej) => { const i = ++id; waiting.set(i, {res, rej}); ws.send(JSON.stringify({id: i, method, params, sessionId: sid})); });
  const {targetId} = await send('Target.createTarget', {url: 'about:blank'});
  ({sessionId} = await send('Target.attachToTarget', {targetId, flatten: true}));
  const cdp = (m, p) => send(m, p, sessionId);
  await cdp('Runtime.enable'); await cdp('Page.enable');
  const evaluate = async (expression) => {
    const r = await cdp('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  return {
    base, evaluate, cdp, errors, close,
    setViewport: (width, height) => cdp('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: width < 600}),
    navigate: async (url, wait = 1200) => { await cdp('Page.navigate', {url}); await new Promise((r) => setTimeout(r, wait)); },
  };
}
