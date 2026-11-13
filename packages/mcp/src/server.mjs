// Monoline MCP server core: JSON-RPC 2.0 by hand. No I/O here except through the registry.
import {readFileSync} from 'node:fs';
import {createRegistry} from './registry.mjs';
import {compose, installInfo, propGroupsOf, rank} from './tools.mjs';

const THEMING = readFileSync(new URL('./theming.md', import.meta.url), 'utf8');
const SUPPORTED = ['2025-06-18', '2025-03-26', '2024-11-05'];
export const SERVER_INFO = {name: 'monoline', version: '0.3.0'};

export class RpcError extends Error {
  constructor(code, message, data) { super(message); this.code = code; this.data = data; }
}
const bad = (m) => new RpcError(-32602, m);
const text = (t) => ({content: [{type: 'text', text: t}]});
const json = (v) => text(JSON.stringify(v, null, 2));

const obj = (d) => ({type: 'object', properties: d.properties ?? {}, required: d.required ?? [], additionalProperties: false});
const TOOLS = [
  {name: 'list_components', description: 'List every Monoline component, hook and block, optionally for one category.',
    inputSchema: obj({properties: {category: {type: 'string', description: 'e.g. forms, overlays, blocks, hooks'}}})},
  {name: 'search_components', description: 'Search components by name, title, description, keywords and prop names. Results are ranked; matchedProps lists the props that matched.',
    inputSchema: obj({properties: {query: {type: 'string'}, limit: {type: 'integer', minimum: 1, maximum: 50, description: 'default 10'}}, required: ['query']})},
  {name: 'get_component', description: 'Get one component: import line, props (name, type, default, description), usage example, a11y notes, CSS classes and data attributes, related components. Set include_source for the full source and CSS.',
    inputSchema: obj({properties: {name: {type: 'string'}, include_source: {type: 'boolean', description: 'include full source files and CSS content'}}, required: ['name']})},
  {name: 'get_install_command', description: 'The `npx monoline add` command for components, plus the npm packages they need.',
    inputSchema: obj({properties: {names: {type: 'array', items: {type: 'string'}, minItems: 1}}, required: ['names']})},
  {name: 'get_theming_guide', description: 'Themes, accents, look options (data attributes) and design tokens.', inputSchema: obj({})},
  {name: 'compose_page', description: 'Suggest Monoline components and blocks, with imports, for a short description of a page or UI.',
    inputSchema: obj({properties: {description: {type: 'string'}}, required: ['description']})},
];

const PROMPT = {
  name: 'build_with_monoline',
  description: 'Instructions for building a UI using only Monoline components and tokens.',
  arguments: [{name: 'task', description: 'What to build', required: false}],
};
const promptText = (task) => `Build ${task ? `this UI: ${task}` : 'the requested UI'} using only Monoline.

Rules:
- Use Monoline components from \`@monoline/react\`. Call \`search_components\` and \`compose_page\` to find them, \`get_component\` for props and accessibility notes, and \`get_install_command\` to add them.
- Do not add another UI library, Tailwind, CSS-in-JS or an icon library. Icons are inline SVG with currentColor.
- Style with Monoline tokens only (\`get_theming_guide\`): no raw hex colours, px font sizes or spacing numbers. Use \`var(--s4)\`, \`var(--foreground)\`, \`var(--rule)\` and the like.
- Theme with data attributes on <html> (data-theme, data-accent, data-font, data-radius, data-density), not custom colours.
- One solid Button per view; the rest are variant="line". Thin rules, square edges, no shadows or gradients.
- Every control is named and keyboard operable; never use colour alone for meaning.
- Copy: plain verbs, errors say what happened and what to do next, no exclamation marks or emoji.
- Include empty, loading and error states.`;

export function createServer({registry, location, fetch} = {}) {
  const reg = registry ?? createRegistry({location, fetch});

  async function entry(name) {
    if (typeof name !== 'string' || !name) throw new Error('name is required');
    return reg.component(name);
  }

  const handlers = {
    async list_components({category} = {}) {
      const {components} = await reg.index();
      const cats = [...new Set(components.map((c) => c.category))].sort();
      if (category && !cats.includes(category)) throw new Error(`unknown category "${category}". Categories: ${cats.join(', ')}`);
      const list = components.filter((c) => !category || c.category === category)
        .map(({name, title, category, status, description}) => ({name, title, category, status, description}));
      return json({count: list.length, categories: cats, components: list});
    },
    async search_components({query, limit = 10} = {}) {
      if (typeof query !== 'string' || !query.trim()) throw new Error('query is required');
      const {components} = await reg.index();
      const hits = rank(components, query).slice(0, Math.min(Math.max(1, limit | 0), 50));
      return json({query, count: hits.length, results: hits.map(({c, score, matchedProps}) => ({name: c.name, title: c.title, category: c.category, description: c.description, score, ...(matchedProps.length && {matchedProps})}))});
    },
    async get_component({name, include_source = false} = {}) {
      const c = await entry(name);
      const out = {
        name: c.name, title: c.title, kind: c.kind, category: c.category, status: c.status, description: c.description,
        primitive: c.primitive ?? null, uses: c.uses ?? [], keywords: c.keywords ?? [],
        import: c.import, props: propGroupsOf(c), usage: c.usage ?? null, a11y: c.a11y ?? [],
        classes: c.classes ?? [], dataAttributes: c.dataAttributes ?? [], related: c.related ?? [],
        dependencies: c.dependencies ?? {}, css: (c.css ?? []).map((f) => f.path),
        install: `npx monoline add ${c.name}`,
      };
      if (include_source) {
        out.source = (c.source ?? []).filter((f) => !f.path.endsWith('meta.json'));
        out.cssContent = c.css ?? [];
      }
      return json(out);
    },
    async get_install_command({names: wanted} = {}) {
      if (!Array.isArray(wanted) || !wanted.length || wanted.some((n) => typeof n !== 'string')) throw new Error('names must be a non-empty array of strings');
      return json(await installInfo(reg, wanted));
    },
    async get_theming_guide() { return text(THEMING); },
    async compose_page({description} = {}) {
      if (typeof description !== 'string' || !description.trim()) throw new Error('description is required');
      const all = new Map((await reg.index()).components.map((c) => [c.name, c]));
      const picks = compose(description, all);
      return json({description, components: picks, install: picks.length ? `npx monoline add ${picks.map((p) => p.name).join(' ')}` : null,
        next: 'Call get_component for props before writing code; get_theming_guide for tokens.'});
    },
  };

  const methods = {
    initialize(p = {}) {
      const v = SUPPORTED.includes(p?.protocolVersion) ? p.protocolVersion : SUPPORTED[0];
      return {protocolVersion: v, capabilities: {tools: {}, resources: {}, prompts: {}}, serverInfo: SERVER_INFO,
        instructions: 'Monoline UI kit. Search with search_components, read props with get_component, install with get_install_command, theme with get_theming_guide. Use only Monoline components and tokens.'};
    },
    ping: () => ({}),
    'tools/list': () => ({tools: TOOLS}),
    async 'tools/call'(p) {
      if (!p || typeof p.name !== 'string') throw bad('params.name is required');
      const h = handlers[p.name];
      if (!h) throw bad(`unknown tool "${p.name}"`);
      const args = p.arguments ?? {};
      if (typeof args !== 'object' || Array.isArray(args)) throw bad('params.arguments must be an object');
      try { return await h(args); } catch (e) { return {...text(`Error: ${e.message}`), isError: true}; }
    },
    async 'resources/list'() {
      const resources = [{uri: 'monoline://llms.txt', name: 'llms.txt', description: 'Monoline overview and component list for AI tools', mimeType: 'text/plain'}];
      for (const c of (await reg.index()).components) resources.push({uri: `monoline://component/${c.name}`, name: c.title ?? c.name, description: c.description, mimeType: 'application/json'});
      return {resources};
    },
    'resources/templates/list': () => ({resourceTemplates: [{uriTemplate: 'monoline://component/{name}', name: 'component', description: 'One component with source and CSS', mimeType: 'application/json'}]}),
    async 'resources/read'(p) {
      const uri = p?.uri;
      if (typeof uri !== 'string') throw bad('params.uri is required');
      if (uri === 'monoline://llms.txt') {
        try { return {contents: [{uri, mimeType: 'text/plain', text: await reg.llms()}]}; } catch (e) { throw new RpcError(-32002, `llms.txt unavailable: ${e.message}`); }
      }
      const m = /^monoline:\/\/component\/([a-z0-9-]+)$/.exec(uri);
      if (!m) throw new RpcError(-32002, `unknown resource ${uri}`);
      try { return {contents: [{uri, mimeType: 'application/json', text: JSON.stringify(await reg.component(m[1]), null, 2)}]}; } catch (e) { throw new RpcError(-32002, e.message); }
    },
    'prompts/list': () => ({prompts: [PROMPT]}),
    'prompts/get'(p) {
      if (p?.name !== PROMPT.name) throw bad(`unknown prompt "${p?.name}"`);
      const task = p.arguments?.task;
      return {description: PROMPT.description, messages: [{role: 'user', content: {type: 'text', text: promptText(typeof task === 'string' ? task : '')}}]};
    },
  };

  async function one(msg) {
    if (msg === null || typeof msg !== 'object' || Array.isArray(msg) || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
      // A response from the client, or junk: only junk with an id gets an answer.
      if (msg && typeof msg === 'object' && !Array.isArray(msg) && ('result' in msg || 'error' in msg)) return null;
      return {jsonrpc: '2.0', id: msg?.id ?? null, error: {code: -32600, message: 'Invalid Request'}};
    }
    const note = !('id' in msg);
    if (note) { // notifications get no response, even on error
      try { await methods[msg.method]?.(msg.params); } catch { /* ignored by spec */ }
      return null;
    }
    const fn = Object.hasOwn(methods, msg.method) ? methods[msg.method] : null;
    if (!fn) return {jsonrpc: '2.0', id: msg.id, error: {code: -32601, message: `Method not found: ${msg.method}`}};
    try {
      return {jsonrpc: '2.0', id: msg.id, result: await fn(msg.params)};
    } catch (e) {
      if (e instanceof RpcError) return {jsonrpc: '2.0', id: msg.id, error: {code: e.code, message: e.message, ...(e.data !== undefined && {data: e.data})}};
      return {jsonrpc: '2.0', id: msg.id, error: {code: -32603, message: `Internal error: ${e.message}`}};
    }
  }

  /** Handle one raw line. Resolves to the string to write back, or null for nothing. */
  async function handleLine(line) {
    let msg;
    try { msg = JSON.parse(line); } catch { return JSON.stringify({jsonrpc: '2.0', id: null, error: {code: -32700, message: 'Parse error'}}); }
    if (Array.isArray(msg)) {
      if (!msg.length) return JSON.stringify({jsonrpc: '2.0', id: null, error: {code: -32600, message: 'Invalid Request'}});
      const out = (await Promise.all(msg.map(one))).filter(Boolean);
      return out.length ? JSON.stringify(out) : null;
    }
    const r = await one(msg);
    return r ? JSON.stringify(r) : null;
  }

  return {handleLine};
}
