// Generates the machine-readable registry from component folders:
//   registry/index.json        every component: meta, file list, related names, prop names
//   registry/<name>.json       one component: meta, props, usage, a11y, classes, data attributes, full source (tsx + css)
//   llms.txt                   short index (https://llmstxt.org)
//   llms-full.txt              everything an agent needs to write correct code: props, usage, a11y, classes
// Run: npm run registry (repo root). CI fails if the output is stale. Props come from props-extract.mjs, the
// same extraction the docs site uses.
import {mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';
import {pkgRoot, repoRoot, units, readMeta, CATEGORIES} from './lib.mjs';
import {COMPONENT_PROPS, HOOK_PROPS, createProgram, mainSourceFile, propGroups} from './props-extract.mjs';
import {cssFacts, usageFor, relatedFor} from './registry-fields.mjs';
import {extractDemos, exportedNames} from '../../../apps/docs/scripts/lib/demos.mjs';

export const LLMS_FULL_LIMIT = 400 * 1024; // bytes; the generator fails above this

const cssDir = join(repoRoot, 'packages', 'css', 'src', 'components');
const regDir = join(repoRoot, 'registry');
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const pascal = (name) => name.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const camel = (name) => { const p = pascal(name); return p[0].toLowerCase() + p.slice(1); };
const oneLine = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'));
const all = units();
const known = new Set(all.map((u) => u.name));
const program = createProgram(all.map((u) => mainSourceFile(u.dir, u.name)).filter(Boolean));

// Pass 1: the export each unit's index.ts gives (the name people import), so hooks get `useX`, not `UseX`.
const exportOf = new Map(all.map((u) => {
  const want = u.kind === 'hooks' ? camel(u.name) : pascal(u.name);
  const {values} = exportedNames(readFileSync(join(u.dir, 'index.ts'), 'utf8'));
  return [u.name, values.includes(want) ? want : (values[0] ?? want)];
}));
// Every name the package exports (values and types), to keep usage snippets to real imports.
const publicNames = new Set(all.flatMap((u) => { const {values, types} = exportedNames(readFileSync(join(u.dir, 'index.ts'), 'utf8')); return [...values, ...types]; }));
const categoryOf = new Map(all.map((u) => [u.name, readMeta(u).category]));

// Pass 2: every field of every component, computed in memory first so a failed size check writes nothing.
const records = []; // full entries, one per component
const perComponent = new Map();
for (const u of all) {
  const meta = readMeta(u);
  const symbol = exportOf.get(u.name);
  const importLine = `import {${symbol}} from '@monoline/react'`;
  const isHook = u.kind === 'hooks';

  const file = mainSourceFile(u.dir, u.name);
  const props = file ? propGroups(program, file, {pattern: isHook ? HOOK_PROPS : COMPONENT_PROPS}) : [];

  const cssTexts = meta.css.map((f) => {
    const p = join(cssDir, f);
    if (!existsSync(p)) throw new Error(`${u.name}: css file ${f} not found in packages/css/src/components`);
    return readFileSync(p, 'utf8');
  });
  const {classes, dataAttributes} = cssFacts(cssTexts);

  const demoFile = join(u.dir, `${u.name}.demo.tsx`);
  const demo = existsSync(demoFile) ? extractDemos(readFileSync(demoFile, 'utf8'), `${u.name}.demo.tsx`)[0] : undefined;
  const usage = usageFor({demo, importLine, symbol, isHook, publicNames});

  const siblings = all.filter((o) => categoryOf.get(o.name) === meta.category).map((o) => o.name).sort();
  const related = relatedFor({meta, known, siblings});

  const files = readdirSync(u.dir).filter((f) => !f.startsWith('.')).sort(); // dotfiles are local tool state, never part of a component
  const path = relative(repoRoot, u.dir);
  const entry = {
    ...meta,
    kind: u.kind,
    import: importLine,
    path,
    files: files.map((f) => `${path}/${f}`),
    related,
    props,
    usage,
    dataAttributes,
    classes,
  };
  records.push(entry);
  const source = readdirSync(u.dir).filter((f) => /\.(tsx?|json)$/.test(f) && !/\.(test|demo)\./.test(f)).sort()
    .map((f) => ({path: `${path}/${f}`, content: readFileSync(join(u.dir, f), 'utf8')}));
  const css = meta.css.map((f, i) => ({path: `packages/css/src/components/${f}`, content: cssTexts[i]}));
  perComponent.set(u.name, JSON.stringify({...entry, dependencies: {'radix-ui': '^1.4.2'}, source, css}, null, 2) + '\n');
}

// index.json: the light list (no props, usage or classes; the per-component file has those). Prop names are here so search can match them.
const index = records.map(({props, usage, classes, dataAttributes, ...rest}) => ({...rest, propNames: props.flatMap((g) => g.props.map((p) => p.name))}));

// llms.txt: short map. llms-full.txt: everything an agent needs in one file.
const byCat = (c) => index.filter((e) => e.category === c);
const section = (c) => byCat(c).length ? `\n### ${c}\n${byCat(c).map((e) => `- ${e.title} (${e.name}, ${e.status}): ${e.description} Source: ${e.path}/`).join('\n')}\n` : '';
const head = `# Monoline\n\n> Open-source UI kit: a plain CSS core (@monoline/css) with accessible React components (@monoline/react). Three themes, nine accents, font, corner and density options, no Tailwind, no runtime CSS-in-JS.\n\nStart with AGENTS.md (how to work in this repo) and DESIGN.md (the look and rules). Every component is a folder with source, test, demo and meta.json. Install the packages, or copy one component with npx monoline add <name> (source in registry/<name>.json).\n`;
const shortText = `${head}\n## Docs\n- [AGENTS.md](AGENTS.md): rules for AI agents and contributors\n- [DESIGN.md](DESIGN.md): design rules, tokens, copy\n- [registry/index.json](registry/index.json): machine-readable component list, with props names and related components\n\n## Components${CATEGORIES.map(section).join('')}`;

/** One component as compact text: description, import, props, usage, a11y, classes. */
function fullSection(e) {
  const out = [`## ${e.title} (${e.name})`, oneLine(e.description)];
  out.push(`Status: ${e.status} | Category: ${e.category}${e.primitive ? ` | Primitive: ${e.primitive}` : ''}${e.related.length ? ` | Related: ${e.related.join(', ')}` : ''}`);
  out.push(`Import: ${e.import}`, '');
  const props = e.props.flatMap((g) => g.props.map((p) => ({...p, group: g.name, multi: e.props.length > 1})));
  if (!props.length) out.push('Props: no exported *Props type in the source. Extra props go to the underlying element or primitive.');
  else {
    out.push('Props (name: type = default, ? means optional):');
    let last = '';
    for (const p of props) {
      if (p.multi && p.group !== last) { out.push(`${p.group}:`); last = p.group; }
      out.push(`- ${p.name}${p.optional ? '?' : ''}: ${oneLine(p.type)}${p.default ? ` = ${oneLine(p.default)}` : ''}${p.description ? ` — ${oneLine(p.description)}` : ''}`);
    }
  }
  out.push('', 'Usage:', '```tsx', e.usage, '```');
  out.push('', 'A11y:', ...e.a11y.map((a) => `- ${oneLine(a)}`));
  if (e.classes.length) out.push('', `CSS classes: ${e.classes.join(', ')}`);
  if (e.dataAttributes.length) out.push(`Data attributes: ${e.dataAttributes.map((d) => (d.values.length ? `${d.name}: ${d.values.join(' | ')}` : d.name)).join('; ')}`);
  out.push(`Source: registry/${e.name}.json`);
  return out.join('\n');
}
const fullText = `${head}\n${records.map(fullSection).join('\n\n')}\n`;

// Size guard: print sizes, refuse to write an llms-full.txt over the limit.
const fullPath = join(repoRoot, 'llms-full.txt');
const shortPath = join(repoRoot, 'llms.txt');
const before = existsSync(fullPath) ? statSync(fullPath).size : null;
const fullBytes = Buffer.byteLength(fullText);
console.log(`llms-full.txt: ${kb(fullBytes)} (before: ${before === null ? 'none' : kb(before)}, limit ${kb(LLMS_FULL_LIMIT)})`);
console.log(`llms.txt: ${kb(Buffer.byteLength(shortText))}`);
if (fullBytes > LLMS_FULL_LIMIT) throw new Error(`llms-full.txt is ${kb(fullBytes)}, over the ${kb(LLMS_FULL_LIMIT)} limit: make props or usage shorter before shipping`);

// Write.
mkdirSync(regDir, {recursive: true});
for (const f of readdirSync(regDir)) if (f.endsWith('.json')) rmSync(join(regDir, f));
for (const [name, text] of perComponent) writeFileSync(join(regDir, `${name}.json`), text);
writeFileSync(join(regDir, 'index.json'), JSON.stringify({name: '@monoline/react', version: pkg.version, components: index}, null, 2) + '\n');
writeFileSync(shortPath, shortText);
writeFileSync(fullPath, fullText);
console.log(`registry: ${index.length} entries`);
