import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {FIXTURE, makeRegistry, start} from '../fixtures/helpers.mjs';
import {createRegistry, resolveRegistry} from '../src/registry.mjs';
import {createServer} from '../src/server.mjs';

const REPO_REGISTRY = new URL('../../../registry', import.meta.url).pathname;

async function withServer(fn, components) {
  const s = start(['--registry', makeRegistry(components)]);
  try { await fn(s); } finally { await s.close(); }
}
const init = (s) => s.call('initialize', {protocolVersion: '2025-06-18', capabilities: {}, clientInfo: {name: 't', version: '0'}}, 0);

test('initialize handshake, initialized notification gets no reply, ping answers', () => withServer(async (s) => {
  const r = await init(s);
  assert.equal(r.jsonrpc, '2.0');
  assert.equal(r.id, 0);
  assert.equal(r.result.protocolVersion, '2025-06-18');
  assert.equal(r.result.serverInfo.name, 'monoline');
  assert.deepEqual(Object.keys(r.result.capabilities).sort(), ['prompts', 'resources', 'tools']);
  s.msg({jsonrpc: '2.0', method: 'notifications/initialized'});
  const p = await s.call('ping', undefined, 'p1');
  assert.equal(p.id, 'p1');
  assert.deepEqual(p.result, {});
}));

test('initialize falls back to a supported version for an unknown one', () => withServer(async (s) => {
  const r = await s.call('initialize', {protocolVersion: '1999-01-01'});
  assert.equal(r.result.protocolVersion, '2025-06-18');
  const old = await s.call('initialize', {protocolVersion: '2024-11-05'}, 2);
  assert.equal(old.result.protocolVersion, '2024-11-05');
}));

test('tools/list exposes all six tools with object schemas', () => withServer(async (s) => {
  const {result} = await s.call('tools/list');
  assert.deepEqual(result.tools.map((t) => t.name).sort(),
    ['compose_page', 'get_component', 'get_install_command', 'get_theming_guide', 'list_components', 'search_components']);
  for (const t of result.tools) { assert.equal(t.inputSchema.type, 'object'); assert.ok(t.description); }
}));

test('list_components lists all, filters by category, rejects unknown category', () => withServer(async (s) => {
  const all = await s.data('list_components', {});
  assert.equal(all.count, FIXTURE.length);
  assert.ok(all.categories.includes('hooks'));
  const forms = await s.data('list_components', {category: 'forms'});
  assert.deepEqual(forms.components.map((c) => c.name).sort(), ['calendar', 'date-picker']);
  const bad = await s.tool('list_components', {category: 'nope'});
  assert.equal(bad.result.isError, true);
  assert.match(bad.result.content[0].text, /unknown category "nope"/);
}));

test('search_components ranks name > keyword > description and honours limit', () => withServer(async (s) => {
  const r = await s.data('search_components', {query: 'calendar'});
  // calendar (name) beats date-picker (keyword + description)
  assert.deepEqual(r.results.map((x) => x.name).slice(0, 2), ['calendar', 'date-picker']);
  assert.ok(r.results[0].score > r.results[1].score);
  const kw = await s.data('search_components', {query: 'cta'});
  assert.equal(kw.results[0].name, 'button');
  const one = await s.data('search_components', {query: 'block', limit: 1});
  assert.equal(one.count, 1);
  const none = await s.data('search_components', {query: 'zzzzqq'});
  assert.equal(none.count, 0);
  const empty = await s.tool('search_components', {query: '  '});
  assert.equal(empty.result.isError, true);
}));

test('search ranks an exact multi-word name first', () => withServer(async (s) => {
  const r = await s.data('search_components', {query: 'date picker'});
  assert.equal(r.results[0].name, 'date-picker');
}));

test('get_component returns meta, props summary and a11y; source only on request', () => withServer(async (s) => {
  const c = await s.data('get_component', {name: 'button'});
  assert.equal(c.import, "import {Button} from '@monoline/react'");
  assert.equal(c.install, 'npx monoline add button');
  assert.deepEqual(c.css, ['packages/css/src/components/button.css']);
  assert.deepEqual(c.a11y, ['Button is keyboard operable.']);
  assert.equal(c.props[0].name, 'ButtonProps');
  assert.deepEqual(c.props[0].props.slice(0, 2), [
    {name: 'variant', type: "'solid' | 'line'", optional: true, default: "'solid'", description: 'The look.'},
    {name: 'label', type: 'string', optional: false, default: null, description: ''},
  ]);
  assert.equal(c.usage, "import {Button} from '@monoline/react'\n\n<Button variant=\"solid\">Save</Button>");
  assert.deepEqual(c.classes, ['btn', 'btn-solid', 'btn-line', 'spinner']);
  assert.deepEqual(c.dataAttributes, [{name: 'data-state', values: ['open', 'closed']}]);
  assert.deepEqual(c.related, ['icon-button']);
  assert.equal(c.source, undefined);
  assert.equal(c.cssContent, undefined);
  const full = await s.data('get_component', {name: 'button', include_source: true});
  assert.equal(full.source.length, 1); // meta.json is dropped
  assert.match(full.source[0].content, /interface ButtonProps/);
  assert.match(full.cssContent[0].content, /var\(--foreground\)/);
}));

test('get_component reads props from the registry and falls back to source for old registries', async () => {
  const legacy = makeRegistry(FIXTURE.map((c) => ({...c, props: undefined, usage: undefined, classes: undefined})));
  const s = start(['--registry', legacy]);
  try {
    const c = await s.data('get_component', {name: 'button'});
    assert.deepEqual(c.props, [{name: 'ButtonProps', props: [
      {name: 'variant', type: "'solid' | 'line'", optional: true, default: null, description: 'The look.'},
      {name: 'label', type: 'string', optional: false, default: null, description: ''},
    ]}]);
    assert.equal(c.usage, null);
    assert.deepEqual(c.classes, []);
    assert.deepEqual(c.related, ['icon-button']); // related is not derived from source, so it still comes through
  } finally { await s.close(); }
});

test('get_component exposes a fixture with no props as an empty list, not a missing field', () => withServer(async (s) => {
  const c = await s.data('get_component', {name: 'use-toggle'});
  assert.deepEqual(c.props, []);
}));

test('search_components matches prop names and reports which props matched', () => withServer(async (s) => {
  const r = await s.data('search_components', {query: 'asChild'});
  assert.equal(r.results[0].name, 'button');
  assert.deepEqual(r.results[0].matchedProps, ['asChild']);
  const cal = await s.data('search_components', {query: 'selected'});
  assert.equal(cal.results[0].name, 'calendar');
  assert.deepEqual(cal.results[0].matchedProps, ['selected']);
  // A name match still beats a prop match.
  const named = await s.data('search_components', {query: 'button loading'});
  assert.equal(named.results[0].name, 'button');
  const none = await s.data('search_components', {query: 'nothingcalledthis'});
  assert.equal(none.count, 0);
}));

test('get_component errors: unknown, traversal, missing name', () => withServer(async (s) => {
  for (const args of [{name: 'nope'}, {name: '../index'}, {}]) {
    const r = await s.tool('get_component', args);
    assert.equal(r.result.isError, true, JSON.stringify(args));
    assert.equal(r.error, undefined);
  }
}));

test('get_install_command includes what a block pulls in, css and npm packages', () => withServer(async (s) => {
  const r = await s.data('get_install_command', {names: ['block-hero']});
  assert.equal(r.command, 'npx monoline add block-hero');
  assert.deepEqual(r.alsoCopied.sort(), ['button', 'container', 'heading']);
  assert.deepEqual(r.dependencies, {'radix-ui': '^1.4.2'});
  assert.ok(r.npmInstall.includes('npm install radix-ui@^1.4.2'));
  assert.ok(r.css.includes('container.css'));
  const two = await s.data('get_install_command', {names: ['calendar', 'button']});
  assert.equal(two.command, 'npx monoline add calendar button');
  for (const names of [[], 'button', ['nope']]) {
    assert.equal((await s.tool('get_install_command', {names})).result.isError, true);
  }
}));

test('get_theming_guide returns the data attributes and tokens', () => withServer(async (s) => {
  const r = await s.tool('get_theming_guide', {});
  const t = r.result.content[0].text;
  for (const needle of ['data-theme', 'data-accent', 'data-density', 'midnight', '--accent-text', '--s4', '--rule']) assert.ok(t.includes(needle), needle);
}));

test('compose_page maps a description to blocks and components that exist', () => withServer(async (s) => {
  const r = await s.data('compose_page', {description: 'A landing page with pricing'});
  const names = r.components.map((c) => c.name);
  assert.ok(names.includes('block-hero') && names.includes('block-pricing'));
  assert.ok(names.includes('container') && names.includes('button'));
  assert.ok(!names.includes('block-cta'), 'only registry entries are suggested');
  assert.match(r.install, /^npx monoline add container /);
  assert.ok(r.components.every((c) => c.import.startsWith('import {')));
  const fb = await s.data('compose_page', {description: 'month grid'}); // no rule: falls back to search
  assert.ok(fb.components.some((c) => c.name === 'calendar'));
  assert.equal((await s.tool('compose_page', {})).result.isError, true);
}));

test('unknown tool and bad params are protocol errors', () => withServer(async (s) => {
  const a = await s.tool('nope', {});
  assert.equal(a.error.code, -32602);
  const b = await s.call('tools/call', {});
  assert.equal(b.error.code, -32602);
  const c = await s.call('tools/call', {name: 'list_components', arguments: []});
  assert.equal(c.error.code, -32602);
}));

test('unknown method is -32601 with the request id; unknown notification is silent', () => withServer(async (s) => {
  const r = await s.call('nope/nothing', {}, 'x9');
  assert.deepEqual(r, {jsonrpc: '2.0', id: 'x9', error: {code: -32601, message: 'Method not found: nope/nothing'}});
  s.msg({jsonrpc: '2.0', method: 'notifications/whatever'});
  s.msg({jsonrpc: '2.0', method: 'tools/call', params: {name: 'nope'}}); // errors in notifications stay silent
  const p = await s.call('ping');
  assert.equal(p.id, 1);
  assert.equal(s.pending(), 0);
}));

test('inherited object keys are not methods', () => withServer(async (s) => {
  assert.equal((await s.call('constructor')).error.code, -32601);
  assert.equal((await s.call('__proto__')).error.code, -32601);
}));

test('malformed JSON is a parse error and the server keeps going', () => withServer(async (s) => {
  s.send('{"jsonrpc": "2.0", "id": 1, "method":\n');
  const e = await s.next();
  assert.deepEqual(e, {jsonrpc: '2.0', id: null, error: {code: -32700, message: 'Parse error'}});
  s.send('not json at all\n');
  assert.equal((await s.next()).error.code, -32700);
  assert.equal((await s.call('ping')).id, 1);
}));

test('invalid requests are -32600', () => withServer(async (s) => {
  s.send('42\n');
  assert.equal((await s.next()).error.code, -32600);
  s.msg({jsonrpc: '1.0', id: 7, method: 'ping'});
  const r = await s.next();
  assert.equal(r.error.code, -32600);
  assert.equal(r.id, 7);
  s.msg({jsonrpc: '2.0', id: 8});
  assert.equal((await s.next()).id, 8);
  s.send('[]\n');
  assert.equal((await s.next()).error.code, -32600);
}));

test('batch requests: answers in one array, notifications and client responses dropped', () => withServer(async (s) => {
  s.msg([
    {jsonrpc: '2.0', id: 1, method: 'ping'},
    {jsonrpc: '2.0', method: 'notifications/initialized'},
    {jsonrpc: '2.0', id: 2, method: 'nope'},
    {jsonrpc: '2.0', id: 3, result: {}},
    {jsonrpc: '2.0', id: 4, method: 'tools/list'},
  ]);
  const r = await s.next();
  assert.ok(Array.isArray(r));
  assert.deepEqual(r.map((x) => x.id), [1, 2, 4]);
  assert.equal(r[1].error.code, -32601);
  assert.ok(r[2].result.tools.length);
  s.msg([{jsonrpc: '2.0', method: 'notifications/initialized'}]);
  assert.equal((await s.call('ping')).id, 1); // the all-notification batch produced nothing
  assert.equal(s.pending(), 0);
}));

test('resources: list, read llms.txt and a component, unknown uri', () => withServer(async (s) => {
  const {result} = await s.call('resources/list');
  assert.equal(result.resources[0].uri, 'monoline://llms.txt');
  assert.equal(result.resources.length, FIXTURE.length + 1);
  assert.ok(result.resources.some((r) => r.uri === 'monoline://component/button'));
  const llms = await s.call('resources/read', {uri: 'monoline://llms.txt'});
  assert.equal(llms.result.contents[0].mimeType, 'text/plain');
  assert.match(llms.result.contents[0].text, /fake llms/);
  const c = await s.call('resources/read', {uri: 'monoline://component/button'});
  assert.equal(JSON.parse(c.result.contents[0].text).name, 'button');
  for (const uri of ['monoline://component/nope', 'monoline://other', 'monoline://component/../x']) {
    assert.equal((await s.call('resources/read', {uri})).error.code, -32002, uri);
  }
  assert.equal((await s.call('resources/read', {})).error.code, -32602);
  const t = await s.call('resources/templates/list');
  assert.equal(t.result.resourceTemplates[0].uriTemplate, 'monoline://component/{name}');
}));

test('prompts: list and get build_with_monoline', () => withServer(async (s) => {
  const l = await s.call('prompts/list');
  assert.equal(l.result.prompts[0].name, 'build_with_monoline');
  const g = await s.call('prompts/get', {name: 'build_with_monoline', arguments: {task: 'a pricing page'}});
  const t = g.result.messages[0].content.text;
  assert.equal(g.result.messages[0].role, 'user');
  assert.match(t, /a pricing page/);
  assert.match(t, /only Monoline/);
  assert.match(t, /no raw hex|raw hex/i);
  const plain = await s.call('prompts/get', {name: 'build_with_monoline'});
  assert.match(plain.result.messages[0].content.text, /requested UI/);
  assert.equal((await s.call('prompts/get', {name: 'nope'})).error.code, -32602);
}));

test('big payloads: a 3 MB component goes out whole as one line', () => {
  const big = FIXTURE.map((c) => c.name === 'button'
    ? {...c, source: [{path: 'packages/react/src/components/button/button.tsx', content: 'x'.repeat(3_000_000)}]}
    : c);
  return withServer(async (s) => {
    const c = await s.data('get_component', {name: 'button', include_source: true});
    assert.equal(c.source[0].content.length, 3_000_000);
    const r = await s.call('resources/read', {uri: 'monoline://component/button'});
    assert.ok(r.result.contents[0].text.length > 3_000_000);
  }, big);
});

test('a big request (1 MB of padding) is accepted', () => withServer(async (s) => {
  const r = await s.call('tools/call', {name: 'search_components', arguments: {query: 'button', pad: 'y'.repeat(1_000_000)}});
  assert.equal(r.id, 1);
  assert.ok(!r.error);
}));

test('partial lines split across chunks, including inside a multibyte character', () => withServer(async (s) => {
  const line = Buffer.from(JSON.stringify({jsonrpc: '2.0', id: 5, method: 'tools/call', params: {name: 'search_components', arguments: {query: 'héllo ✓'}}}) + '\n');
  const cut = line.indexOf(0xc3) + 1; // split the two bytes of "é"
  s.child.stdin.write(line.subarray(0, 10));
  await new Promise((r) => setTimeout(r, 30));
  s.child.stdin.write(line.subarray(10, cut));
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(s.pending(), 0);
  s.child.stdin.write(line.subarray(cut));
  const r = await s.next();
  assert.equal(r.id, 5);
  assert.equal(JSON.parse(r.result.content[0].text).query, 'héllo ✓');
}));

test('several messages in one chunk answer in order; CRLF and blank lines are fine', () => withServer(async (s) => {
  s.send('{"jsonrpc":"2.0","id":1,"method":"ping"}\r\n\n{"jsonrpc":"2.0","id":2,"method":"tools/list"}\n{"jsonrpc":"2.0","id":3,"method":"ping"}\n');
  assert.deepEqual([(await s.next()).id, (await s.next()).id, (await s.next()).id], [1, 2, 3]);
}));

test('a final line without a newline is processed when stdin closes', async () => {
  const s = start(['--registry', makeRegistry()]);
  s.send('{"jsonrpc":"2.0","id":9,"method":"ping"}');
  s.child.stdin.end();
  assert.equal((await s.next()).id, 9);
  await new Promise((r) => s.child.on('close', r));
});

test('a missing component file is an error result, not a crash', async () => {
  const dir = makeRegistry();
  const {unlinkSync} = await import('node:fs');
  unlinkSync(join(dir, 'calendar.json'));
  const s = start(['--registry', dir]);
  try {
    const r = await s.tool('get_component', {name: 'calendar'});
    assert.equal(r.result.isError, true);
    assert.equal((await s.call('ping')).id, 1);
  } finally { await s.close(); }
});

test('a broken registry gives an internal error for resources/list, then keeps serving', async () => {
  const s = start(['--registry', '/nonexistent-monoline-registry']);
  try {
    assert.equal((await s.call('resources/list')).error.code, -32603);
    const r = await s.tool('list_components', {});
    assert.equal(r.result.isError, true);
    assert.equal((await s.call('tools/list')).id, 1);
  } finally { await s.close(); }
});

test('MONOLINE_REGISTRY env selects the registry; the flag wins over it', async () => {
  const a = makeRegistry(FIXTURE.slice(0, 2));
  const b = makeRegistry(FIXTURE.slice(0, 5));
  const viaEnv = start([], {MONOLINE_REGISTRY: a});
  const viaFlag = start(['--registry', b], {MONOLINE_REGISTRY: a});
  try {
    assert.equal((await viaEnv.data('list_components', {})).count, 2);
    assert.equal((await viaFlag.data('list_components', {})).count, 5);
  } finally { await viaEnv.close(); await viaFlag.close(); }
});

test('--help prints usage and exits', async () => {
  const s = start(['--help']);
  assert.match(await s.nextRaw(), /monoline-mcp/);
  await new Promise((r) => s.child.on('close', r));
});

test('stdout carries only JSON-RPC; the registry notice goes to stderr', async () => {
  const s = start(['--registry', makeRegistry()]);
  try {
    await init(s);
    assert.match(s.stderr, /monoline-mcp: registry/);
  } finally { await s.close(); }
});

// ---- in-process: remote registry with an injected fetch -------------------------------------

function fakeFetch(map) {
  const calls = [];
  const f = async (url) => {
    calls.push(url);
    const body = map[url];
    return body === undefined
      ? {ok: false, status: 404, statusText: 'Not Found', text: async () => ''}
      : {ok: true, status: 200, text: async () => (typeof body === 'string' ? body : JSON.stringify(body))};
  };
  f.calls = calls;
  return f;
}

test('remote registry via injected fetch, cached in memory', async () => {
  const base = 'https://example.test/design-system/master/registry';
  const comps = FIXTURE.slice(0, 3);
  const fetch = fakeFetch({
    [`${base}/index.json`]: {components: comps.map(({source, css, ...m}) => m)},
    [`${base}/button.json`]: comps[0],
    'https://example.test/design-system/master/llms.txt': 'remote llms',
  });
  const server = createServer({location: `${base}/`, fetch});
  const ask = async (method, params) => JSON.parse(await server.handleLine(JSON.stringify({jsonrpc: '2.0', id: 1, method, params})));
  const call = async (name, args) => JSON.parse((await ask('tools/call', {name, arguments: args})).result.content[0].text);
  assert.equal((await call('list_components', {})).count, 3);
  assert.equal((await call('get_component', {name: 'button'})).name, 'button');
  await call('list_components', {});
  await call('get_component', {name: 'button'});
  assert.equal(fetch.calls.filter((u) => u.endsWith('index.json')).length, 1);
  assert.equal(fetch.calls.filter((u) => u.endsWith('button.json')).length, 1);
  assert.equal((await ask('resources/read', {uri: 'monoline://llms.txt'})).result.contents[0].text, 'remote llms');
  // a 404 surfaces as a tool error naming the URL
  const miss = await ask('tools/call', {name: 'get_component', arguments: {name: 'heading'}});
  assert.equal(miss.result.isError, true);
  assert.match(miss.result.content[0].text, /404/);
});

test('a failing fetch gives an error result, and the next call retries', async () => {
  let fail = true;
  const idx = {components: [FIXTURE[0]].map(({source, css, ...m}) => m)};
  const fetch = async () => fail ? {ok: false, status: 503, statusText: 'x', text: async () => ''} : {ok: true, status: 200, text: async () => JSON.stringify(idx)};
  const server = createServer({registry: createRegistry({location: 'https://example.test/registry', fetch})});
  const run = async () => JSON.parse(await server.handleLine(JSON.stringify({jsonrpc: '2.0', id: 1, method: 'tools/call', params: {name: 'list_components', arguments: {}}})));
  assert.equal((await run()).result.isError, true);
  fail = false;
  assert.equal((await run()).result.isError, undefined);
});

test('resolveRegistry order: flag, env, ./registry, repo registry, GitHub', () => {
  const dir = makeRegistry();
  const root = join(dir, '..');
  assert.equal(resolveRegistry({flag: 'a', env: {MONOLINE_REGISTRY: 'b'}, cwd: root}), 'a');
  assert.equal(resolveRegistry({env: {MONOLINE_REGISTRY: 'b'}, cwd: root}), 'b');
  assert.equal(resolveRegistry({env: {}, cwd: root}), dir);
  assert.equal(resolveRegistry({env: {}, cwd: '/nonexistent', pkgDir: '/nonexistent/a/b/c'}),
    'https://raw.githubusercontent.com/dasariprashant0/design-system/master/registry');
  if (existsSync(join(REPO_REGISTRY, 'index.json'))) {
    assert.equal(resolveRegistry({env: {}, cwd: '/nonexistent', pkgDir: new URL('../src', import.meta.url).pathname}), REPO_REGISTRY);
  }
});

// ---- against the real generated registry ----------------------------------------------------

test('real registry: every entry answers get_component and compose_page suggests real names', {skip: !existsSync(join(REPO_REGISTRY, 'index.json'))}, async () => {
  const server = createServer({location: REPO_REGISTRY});
  const call = async (name, args) => JSON.parse((await JSON.parse(await server.handleLine(JSON.stringify({jsonrpc: '2.0', id: 1, method: 'tools/call', params: {name, arguments: args}}))).result.content[0].text));
  const {components} = await call('list_components', {});
  assert.ok(components.length > 100);
  for (const c of components) assert.equal((await call('get_component', {name: c.name})).name, c.name);
  const btn = await call('get_component', {name: 'button'});
  assert.ok(btn.props[0].props.some((p) => p.name === 'variant'));
  const page = await call('compose_page', {description: 'a SaaS landing page with pricing and a footer'});
  const known = new Set(components.map((c) => c.name));
  assert.ok(page.components.length >= 5 && page.components.every((c) => known.has(c.name)));
});
