// monoline CLI: copy components from the registry into a project, compare them with it, update them.
// Plain Node, no dependencies.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {basename, dirname, join, resolve} from 'node:path';
import {createInterface} from 'node:readline/promises';
import {parseArgs} from 'node:util';

const DEFAULT_REGISTRY = 'https://raw.githubusercontent.com/dasariprashant0/design-system/master/registry';
const DEFAULTS = {components: 'src/components/monoline', styles: 'src/styles/monoline'};
const CX = `/** Join class names, skipping falsy values. \`cx('btn', loading && 'is-loading', className)\` */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
`;
const HELP = `monoline <command>

  add <name...>          copy components (and the components they use) into your project
  add --all              copy every component in the registry
  add --category <x>     copy every component in one category
  list                   list components   [--category <x>]
  search <words...>      find components by name, keyword or description
  info <name>            show one component
  diff <name...>         compare the project's copy with the registry (exit 1 if they differ)
  update <name...>       replace the project's copy with the registry version, after showing the diff
  init                   write monoline.json and print the CSS import line

Options
  --registry <path|url>  registry folder or URL (default: GitHub master)
  --dir <path>           component folder   (default: ${DEFAULTS.components})
  --styles <path>        CSS folder         (default: ${DEFAULTS.styles})
  --overwrite            (add) replace files that already exist
  --yes                  (update) replace without asking
  --backup               (update) keep the old file as <file>.orig first
  --dry-run              show what would be written, write nothing
  --cwd <path>           project root (default: current folder)
`;

async function load(base, name) {
  if (/^https?:\/\//.test(base)) {
    const url = `${base.replace(/\/$/, '')}/${name}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
    return res.json();
  }
  const file = join(resolve(base), `${name}.json`);
  if (!existsSync(file)) throw new Error(`not found: ${file}`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

// '../../utils/cx' and '../../hooks/x' live elsewhere in the repo; here everything is a sibling folder.
const fixImports = (src) => src.replace(/'\.\.\/\.\.\/utils\/cx'/g, `'../utils/cx'`).replace(/'\.\.\/\.\.\/hooks\/([a-z0-9-]+)'/g, `'../$1'`);
const siblingNames = (src) => [...src.matchAll(/from '\.\.\/([a-z0-9-]+)'/g)].map((m) => m[1]).concat([...src.matchAll(/from '\.\.\/\.\.\/hooks\/([a-z0-9-]+)'/g)].map((m) => m[1]));
const styleBundle = (c) => `@layer monoline.components {\n${c.css.map((s) => s.content.trim()).join('\n\n')}\n}\n`;
const usesCx = (c) => c.source.some((s) => basename(s.path) !== 'meta.json' && s.content.includes('/utils/cx'));

// Files one component writes, paths relative to the project root. The shared utils/cx.ts is added by the caller.
function componentFiles(c, compDir, styleDir) {
  const files = c.source.filter((s) => basename(s.path) !== 'meta.json')
    .map((s) => ({path: join(compDir, c.name, basename(s.path)), content: fixImports(s.content)}));
  // One file per component: the CSS it lists, in the components layer (core.css declares the layer order).
  if (c.css.length) files.push({path: join(styleDir, `${c.name}.css`), content: styleBundle(c)});
  return files;
}
const cxFile = (compDir) => ({path: join(compDir, 'utils', 'cx.ts'), content: CX});

// Unified diff of two texts with 3 lines of context. '' when they are equal.
export function unifiedDiff(oldText, newText, oldName, newName, context = 3) {
  if (oldText === newText) return '';
  // A final newline is not a line of its own: drop the empty last element before comparing.
  const lines = (t) => (t.endsWith('\n') ? t.slice(0, -1) : t).split('\n');
  const ops = editScript(lines(oldText), lines(newText));
  const changes = ops.flatMap((op, i) => (op[0] === ' ' ? [] : [i]));
  const out = [`--- ${oldName}`, `+++ ${newName}`];
  let k = 0;
  while (k < changes.length) {
    const first = Math.max(0, changes[k] - context);
    let last = changes[k];
    while (k + 1 < changes.length && changes[k + 1] - last <= 2 * context) last = changes[++k];
    const end = Math.min(ops.length - 1, last + context);
    const hunk = ops.slice(first, end + 1);
    const before = ops.slice(0, first);
    const oldCount = hunk.filter((o) => o[0] !== '+').length;
    const newCount = hunk.filter((o) => o[0] !== '-').length;
    const oldStart = oldCount ? before.filter((o) => o[0] !== '+').length + 1 : before.filter((o) => o[0] !== '+').length;
    const newStart = newCount ? before.filter((o) => o[0] !== '-').length + 1 : before.filter((o) => o[0] !== '-').length;
    out.push(`@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`, ...hunk.map(([t, line]) => t + line));
    k++;
  }
  return out.join('\n') + '\n';
}

// Line edit script from an LCS table, with the common head and tail trimmed first.
function editScript(a, b) {
  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;
  const A = a.slice(pre, a.length - suf), B = b.slice(pre, b.length - suf);
  const n = A.length, m = B.length, w = m + 1;
  const L = new Uint32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
    L[i * w + j] = A[i] === B[j] ? L[(i + 1) * w + j + 1] + 1 : Math.max(L[(i + 1) * w + j], L[i * w + j + 1]);
  }
  const ops = a.slice(0, pre).map((l) => [' ', l]);
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { ops.push([' ', A[i]]); i++; j++; }
    else if (L[(i + 1) * w + j] >= L[i * w + j + 1]) ops.push(['-', A[i++]]);
    else ops.push(['+', B[j++]]);
  }
  while (i < n) ops.push(['-', A[i++]]);
  while (j < m) ops.push(['+', B[j++]]);
  return ops.concat(a.slice(a.length - suf).map((l) => [' ', l]));
}

// The project's files for one component next to what the registry says they should be.
function compare(cwd, files) {
  return files.map((f) => {
    const abs = join(cwd, f.path);
    const current = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
    return {...f, current, changed: current !== f.content};
  });
}

const askInTerminal = async (question) => {
  if (!process.stdin.isTTY) throw new Error('not a terminal, so it cannot ask; pass --yes to update without asking');
  const rl = createInterface({input: process.stdin, output: process.stdout});
  const answer = await rl.question(`${question} [y/N] `);
  rl.close();
  return /^y(es)?$/i.test(answer.trim());
};

const row = (c) => `${c.name.padEnd(22)}${c.category.padEnd(14)}${c.status.padEnd(8)}${c.description}`;

export async function run(argv, {out = console.log, err = console.error, confirm = askInTerminal} = {}) {
  let parsed;
  try {
    parsed = parseArgs({args: argv, allowPositionals: true, options: {
      registry: {type: 'string'}, dir: {type: 'string'}, styles: {type: 'string'}, category: {type: 'string'}, cwd: {type: 'string'},
      overwrite: {type: 'boolean'}, yes: {type: 'boolean'}, backup: {type: 'boolean'}, all: {type: 'boolean'},
      'dry-run': {type: 'boolean'}, help: {type: 'boolean', short: 'h'},
    }});
  } catch (e) {
    err(e.message);
    return 1;
  }
  const {values: o, positionals: [cmd, ...names]} = parsed;
  if (!cmd || o.help || cmd === 'help') return out(HELP), 0;
  const cwd = resolve(o.cwd ?? process.cwd());
  const cfgFile = join(cwd, 'monoline.json');
  const cfg = {...DEFAULTS, registry: DEFAULT_REGISTRY, ...(existsSync(cfgFile) ? JSON.parse(readFileSync(cfgFile, 'utf8')) : {})};
  const registry = o.registry ?? cfg.registry;
  const compDir = o.dir ?? cfg.components;
  const styleDir = o.styles ?? cfg.styles;
  const loadComponent = async (name) => {
    try { return await load(registry, name); } catch (e) { throw new Error(`unknown component "${name}" (${e.message})`); }
  };
  try {
    if (cmd === 'init') {
      if (existsSync(cfgFile) && !o.overwrite) throw new Error('monoline.json already exists (use --overwrite)');
      const body = JSON.stringify({components: compDir, styles: styleDir}, null, 2) + '\n';
      if (o['dry-run']) out(`would write monoline.json\n${body}`);
      else writeFileSync(cfgFile, body), out('wrote monoline.json');
      out(`\nInstall the tokens, then import them once in your app entry:\n  npm i @monoline/css\n  import '@monoline/css/core.css';   // tokens, base, utilities, accents, options; import it before the component CSS\n(or the whole kit: import '@monoline/css';)\nEach added component prints its own CSS import.`);
      return 0;
    }
    if (cmd === 'list') {
      const {components} = await load(registry, 'index');
      for (const c of components.filter((c) => !o.category || c.category === o.category)) out(row(c));
      return 0;
    }
    if (cmd === 'search') {
      const query = names.join(' ').trim().toLowerCase();
      if (!query) throw new Error('usage: monoline search <words...>');
      const {components} = await load(registry, 'index');
      const words = query.split(/\s+/);
      const scored = components.flatMap((c) => {
        const hay = [c.name, c.title, c.category, c.description, ...(c.keywords ?? [])].join(' ').toLowerCase();
        if (!words.every((w) => hay.includes(w))) return [];
        const score = (c.name === query ? 100 : 0) + (c.name.includes(query) ? 20 : 0) + (c.title.toLowerCase().includes(query) ? 10 : 0) + ((c.keywords ?? []).some((k) => k.toLowerCase().includes(query)) ? 5 : 0);
        return [{c, score}];
      });
      if (!scored.length) {
        out(`no components match "${query}"`);
        return 1;
      }
      for (const {c} of scored.sort((x, y) => y.score - x.score || x.c.name.localeCompare(y.c.name))) out(row(c));
      return 0;
    }
    if (cmd === 'info') {
      if (!names[0]) throw new Error('usage: monoline info <name>');
      const c = await loadComponent(names[0]);
      out(`${c.title} (${c.name}) [${c.category}, ${c.status}]\n${c.description}\nimport: ${c.import}\nprimitive: ${c.primitive ?? 'none'}\ncss: ${c.css.map((f) => basename(f.path)).join(', ')} (copied as one ${c.name}.css)\na11y:\n${c.a11y.map((a) => `  - ${a}`).join('\n')}`);
      return 0;
    }
    if (cmd === 'diff' || cmd === 'update') {
      if (!names.length) throw new Error(`usage: monoline ${cmd} <name...>`);
      let code = 0;
      for (const name of names) {
        const c = await loadComponent(name);
        const files = compare(cwd, [...componentFiles(c, compDir, styleDir), ...(usesCx(c) ? [cxFile(compDir)] : [])]);
        if (files.every((f) => f.current === null)) throw new Error(`${name} is not in the project (run: monoline add ${name})`);
        const changed = files.filter((f) => f.changed);
        if (!changed.length) { out(`${name}: same as the registry`); continue; }
        for (const f of changed) out(unifiedDiff(f.current ?? '', f.content, `${f.path} (project)`, `${f.path} (registry)`).replace(/\n$/, ''));
        if (cmd === 'diff') { code = 1; continue; }
        if (o['dry-run']) { out(`would update ${changed.length} file(s) for ${name}`); continue; }
        if (!o.yes && !(await confirm(`Replace ${changed.length} file(s) for ${name} with the registry version?`))) {
          out(`${name}: not updated`);
          code = 1;
          continue;
        }
        for (const f of changed) {
          const abs = join(cwd, f.path);
          mkdirSync(dirname(abs), {recursive: true});
          if (o.backup && f.current !== null) writeFileSync(`${abs}.orig`, f.current);
          writeFileSync(abs, f.content);
          out(`updated ${f.path}${o.backup && f.current !== null ? ` (old copy: ${f.path}.orig)` : ''}`);
        }
      }
      return code;
    }
    if (cmd !== 'add') throw new Error(`unknown command "${cmd}"\n\n${HELP}`);

    // Explicit names, every component (--all) and every component in a category (--category).
    if (o.all) names.push(...(await load(registry, 'index')).components.map((c) => c.name));
    if (o.category) names.push(...(await load(registry, 'index')).components.filter((c) => c.category === o.category).map((c) => c.name));
    if (!names.length) throw new Error(o.category ? `no components in category "${o.category}"` : 'usage: monoline add <name...> (or --all, --category <x>)');

    // Resolve requested components plus the components they import.
    const items = new Map();
    const queue = [...names];
    while (queue.length) {
      const n = queue.shift();
      if (items.has(n)) continue;
      const c = await loadComponent(n);
      items.set(n, c);
      for (const s of c.source) if (/\.tsx?$/.test(s.path)) queue.push(...siblingNames(s.content));
    }

    const files = [];
    const deps = {};
    let needsCx = false;
    for (const c of items.values()) {
      Object.assign(deps, c.dependencies);
      needsCx ||= usesCx(c);
      files.push(...componentFiles(c, compDir, styleDir));
    }
    if (needsCx) files.push(cxFile(compDir));
    const seen = new Set();
    const unique = files.filter((f) => !seen.has(f.path) && seen.add(f.path));

    const clash = unique.filter((f) => existsSync(join(cwd, f.path)));
    if (clash.length && !o.overwrite) throw new Error(`refusing to overwrite:\n${clash.map((f) => `  ${f.path}`).join('\n')}\nuse --overwrite to replace them`);
    for (const f of unique) {
      out(`${o['dry-run'] ? 'would write' : 'write'} ${f.path}`);
      if (o['dry-run']) continue;
      const abs = join(cwd, f.path);
      mkdirSync(dirname(abs), {recursive: true});
      writeFileSync(abs, f.content);
    }
    const css = unique.filter((f) => f.path.endsWith('.css'));
    if (css.length) out(`\nImport the styles once (paths from the project root; adjust to your entry file):\n${css.map((f) => `  import './${f.path}';`).join('\n')}`);
    out(`\nInstall dependencies (and react >= 18):\n  npm i ${Object.entries(deps).map(([k, v]) => `${k}@"${v}"`).join(' ')}`);
    return 0;
  } catch (e) {
    err(`monoline: ${e.message}`);
    return 1;
  }
}
