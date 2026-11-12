import {spawn} from 'node:child_process';
import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const BIN = new URL('../bin/monoline-mcp.mjs', import.meta.url).pathname;

const comp = (name, title, category, description, extra = {}) => ({
  name, title, category, description, status: 'stable', kind: category === 'hooks' ? 'hooks' : 'components',
  css: [{path: `packages/css/src/components/${name}.css`, content: `.${name} { color: var(--foreground); }\n`}],
  a11y: [`${title} is keyboard operable.`], keywords: [], uses: [],
  import: `import {${title.replace(/ /g, '')}} from '@monoline/react'`,
  dependencies: {}, source: [
    {path: `packages/react/src/components/${name}/${name}.tsx`, content: `export interface ${title.replace(/ /g, '')}Props {\n  /** The look. */\n  variant?: 'solid' | 'line';\n  label: string;\n}\n`},
    {path: `packages/react/src/components/${name}/meta.json`, content: '{}'},
  ], ...extra,
});

export const FIXTURE = [
  comp('button', 'Button', 'buttons', 'Triggers an action.', {keywords: ['action', 'cta', 'submit'], dependencies: {'radix-ui': '^1.4.2'}}),
  comp('container', 'Container', 'layout', 'Centre content in a column.'),
  comp('heading', 'Heading', 'typography', 'A page heading.'),
  comp('date-picker', 'Date picker', 'forms', 'A button that opens a calendar.', {keywords: ['date', 'calendar']}),
  comp('calendar', 'Calendar', 'forms', 'A month grid for picking one date.', {keywords: ['month']}),
  comp('block-hero', 'Block hero', 'blocks', 'A hero section.', {uses: ['container', 'heading', 'button'], keywords: ['landing']}),
  comp('block-pricing', 'Block pricing', 'blocks', 'Pricing tiers.', {uses: ['container']}),
  comp('use-toggle', 'Use toggle', 'hooks', 'Boolean state hook.'),
];

/** Write a fake registry (and llms.txt beside it); returns the registry folder. */
export function makeRegistry(components = FIXTURE) {
  const root = mkdtempSync(join(tmpdir(), 'monoline-mcp-'));
  const dir = join(root, 'registry');
  mkdirSync(dir);
  writeFileSync(join(root, 'llms.txt'), '# Monoline\nfake llms\n');
  writeFileSync(join(dir, 'index.json'), JSON.stringify({name: '@monoline/react', version: '0', components: components.map(({source, css, ...m}) => m)}));
  for (const c of components) writeFileSync(join(dir, `${c.name}.json`), JSON.stringify(c));
  return dir;
}

/** Spawn the server; `send` writes raw text, `next` resolves the next stdout line as JSON. */
export function start(args = [], env = {}) {
  const child = spawn(process.execPath, [BIN, ...args], {env: {...process.env, ...env}, stdio: ['pipe', 'pipe', 'pipe']});
  let buf = '', stderr = '';
  const lines = [], waiters = [];
  child.stdout.setEncoding('utf8').on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const l = buf.slice(0, i); buf = buf.slice(i + 1);
      const w = waiters.shift();
      w ? w(l) : lines.push(l);
    }
  });
  child.stderr.setEncoding('utf8').on('data', (d) => { stderr += d; });
  const nextRaw = () => new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error(`timeout waiting for a line; stderr: ${stderr}`)), 10000);
    const fin = (l) => { clearTimeout(t); res(l); };
    lines.length ? fin(lines.shift()) : waiters.push(fin);
  });
  const api = {
    child, nextRaw,
    get stderr() { return stderr; },
    send: (text) => child.stdin.write(text),
    msg: (m) => child.stdin.write(JSON.stringify(m) + '\n'),
    next: async () => JSON.parse(await nextRaw()),
    async call(method, params, id = 1) { api.msg({jsonrpc: '2.0', id, method, params}); return api.next(); },
    async tool(name, args) { const r = await api.call('tools/call', {name, arguments: args}); return r; },
    async data(name, args) { const r = await api.tool(name, args); return JSON.parse(r.result.content[0].text); },
    pending: () => lines.length,
    async close() { child.stdin.end(); await new Promise((r) => child.on('close', r)); },
  };
  return api;
}
