// Shared by scripts/audit.mjs and scripts/e2e: a static server for apps/docs/dist, a Chrome launcher and a
// minimal DevTools-protocol client (Node's built-in WebSocket). No dependencies.
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {existsSync, mkdtempSync, readFileSync, rmSync, statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {extname, join, normalize} from 'node:path';

const mime = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain', '.xml': 'application/xml', '.md': 'text/markdown'};

/**
 * Serves `dist` on a random local port the way GitHub Pages does: a file as is, a folder through its index.html,
 * and anything else with status 404 and the body of 404.html (which redirects into the app).
 */
export async function serveDist(dist) {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const file = join(dist, path);
    const found = [file, join(file, 'index.html')].find((f) => f.startsWith(dist) && existsSync(f) && statSync(f).isFile());
    const target = found ?? join(dist, '404.html');
    res.writeHead(found ? 200 : 404, {'content-type': mime[extname(target)] ?? 'application/octet-stream'});
    res.end(existsSync(target) ? readFileSync(target) : 'not found');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return {server, base: `http://127.0.0.1:${server.address().port}/`};
}

/**
 * Launches headless Chrome and attaches one page. Returns {cdp, evaluate, listeners, close}.
 * `listeners` is an array of functions called with every protocol event of this page (msg.sessionId matches).
 * Chrome path: CHROME=/path/to/chrome, otherwise common macOS/Linux locations are tried.
 */
async function launchOnce({extraArgs = [], label = 'monoline'} = {}) {
  const candidates = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
  const chromePath = candidates.find((p) => existsSync(p));
  if (!chromePath) throw new Error('Chrome not found. Set CHROME=/path/to/chrome.');
  const profile = mkdtempSync(join(tmpdir(), `${label}-`));
  const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--force-device-scale-factor=1', '--font-render-hinting=none', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-features=CalculateNativeWinOcclusion', ...extraArgs, 'about:blank'], {stdio: ['ignore', 'ignore', 'pipe']});
  let chromeLog = '';
  chrome.stderr.on('data', (d) => { chromeLog += d; });
  let closing = false;
  chrome.on('exit', (code) => { if (!closing && !existsSync(join(profile, 'DevToolsActivePort'))) console.error(`Chrome exited early (code ${code}).\n${chromeLog.slice(-1500)}`); });
  const close = () => { closing = true; try { chrome.kill(); } catch {} try { rmSync(profile, {recursive: true, force: true}); } catch {} };
  const portFile = join(profile, 'DevToolsActivePort');
  // Chrome writes the port, then the websocket path, so wait for both lines.
  for (let i = 0; i < 300 && !(existsSync(portFile) && readFileSync(portFile, 'utf8').trim().split('\n').length >= 2); i++) await new Promise((r) => setTimeout(r, 100));
  if (!existsSync(portFile)) { close(); throw new Error(`Chrome did not start.\n${chromeLog.slice(-1500)}`); }
  const [port, wsPath] = readFileSync(portFile, 'utf8').trim().split('\n');

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
  await cdp('Page.bringToFront').catch(() => {});
  const evaluate = async (expression) => {
    const r = await cdp('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  return {cdp, evaluate, listeners, sessionId, close};
}

/** Starts Chrome and connects. Chrome on a busy CI runner sometimes never writes its debugging port: retry up to three times before giving up. */
export async function launchChrome(opts = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { return await launchOnce(opts); }
    catch (e) {
      lastError = e;
      if (!/Chrome did not start|ECONNREFUSED|WebSocket/i.test(String(e && e.message))) throw e;
      console.error(`Chrome start attempt ${attempt} failed: ${String(e.message).split('\n')[0]}`);
    }
  }
  throw lastError;
}
