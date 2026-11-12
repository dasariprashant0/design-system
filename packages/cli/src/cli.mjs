// monoline CLI: copy components from the registry into a project. Plain Node, no dependencies.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {basename, dirname, join, resolve} from 'node:path';
import {parseArgs} from 'node:util';

const DEFAULT_REGISTRY = 'https://raw.githubusercontent.com/dasariprashant0/design-system/master/registry';
const DEFAULTS = {components: 'src/components/monoline', styles: 'src/styles/monoline'};
const CX = `/** Join class names, skipping falsy values. \`cx('btn', loading && 'is-loading', className)\` */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
`;
const HELP = `monoline <command>

  add <name...>     copy components (and the components they use) into your project
  list              list components   [--category <x>]
  info <name>       show one component
  init              write monoline.json and print the CSS import line

Options
  --registry <path|url>  registry folder or URL (default: GitHub master)
  --dir <path>           component folder   (default: ${DEFAULTS.components})
  --styles <path>        CSS folder         (default: ${DEFAULTS.styles})
  --overwrite            replace files that already exist
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

export async function run(argv, {out = console.log, err = console.error} = {}) {
  let parsed;
  try {
    parsed = parseArgs({args: argv, allowPositionals: true, options: {
      registry: {type: 'string'}, dir: {type: 'string'}, styles: {type: 'string'}, category: {type: 'string'}, cwd: {type: 'string'},
      overwrite: {type: 'boolean'}, 'dry-run': {type: 'boolean'}, help: {type: 'boolean', short: 'h'},
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
  try {
    if (cmd === 'init') {
      if (existsSync(cfgFile) && !o.overwrite) throw new Error('monoline.json already exists (use --overwrite)');
      const body = JSON.stringify({components: compDir, styles: styleDir}, null, 2) + '\n';
      if (o['dry-run']) out(`would write monoline.json\n${body}`);
      else writeFileSync(cfgFile, body), out('wrote monoline.json');
      out(`\nInstall the tokens, then import them once in your app entry:\n  npm i @monoline/css\n  import '@monoline/css/src/tokens.css';\n  import '@monoline/css/src/base.css';\n  import '@monoline/css/src/accents.css';\n(or the whole kit: import '@monoline/css';)\nEach added component prints its own CSS import.`);
      return 0;
    }
    if (cmd === 'list') {
      const {components} = await load(registry, 'index');
      for (const c of components.filter((c) => !o.category || c.category === o.category)) out(`${c.name.padEnd(22)}${c.category.padEnd(14)}${c.status.padEnd(8)}${c.description}`);
      return 0;
    }
    if (cmd === 'info') {
      if (!names[0]) throw new Error('usage: monoline info <name>');
      const c = await load(registry, names[0]);
      out(`${c.title} (${c.name}) [${c.category}, ${c.status}]\n${c.description}\nimport: ${c.import}\nprimitive: ${c.primitive ?? 'none'}\ncss: ${c.css.map((f) => basename(f.path)).join(', ')}\na11y:\n${c.a11y.map((a) => `  - ${a}`).join('\n')}`);
      return 0;
    }
    if (cmd !== 'add') throw new Error(`unknown command "${cmd}"\n\n${HELP}`);
    if (!names.length) throw new Error('usage: monoline add <name...>');

    // Resolve requested components plus the components they import.
    const items = new Map();
    const queue = [...names];
    while (queue.length) {
      const n = queue.shift();
      if (items.has(n)) continue;
      let c;
      try { c = await load(registry, n); } catch (e) { throw new Error(`unknown component "${n}" (${e.message})`); }
      items.set(n, c);
      for (const s of c.source) if (/\.tsx?$/.test(s.path)) queue.push(...siblingNames(s.content));
    }

    const files = []; // {path (relative to cwd), content}
    const deps = {};
    let needsCx = false;
    for (const c of items.values()) {
      Object.assign(deps, c.dependencies);
      for (const s of c.source) {
        if (basename(s.path) === 'meta.json') continue;
        if (s.content.includes('/utils/cx')) needsCx = true;
        files.push({path: join(compDir, c.name, basename(s.path)), content: fixImports(s.content)});
      }
      for (const s of c.css) files.push({path: join(styleDir, basename(s.path)), content: s.content});
    }
    if (needsCx) files.push({path: join(compDir, 'utils', 'cx.ts'), content: CX});
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
