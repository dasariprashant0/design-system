// Generates the machine-readable registry from component folders:
//   registry/index.json        every component: meta + file list
//   registry/<name>.json       one component with full source (tsx + css), for CLIs and AI tools
//   llms.txt, llms-full.txt    what a language model should read first (https://llmstxt.org)
// Run: npm run registry (repo root). CI fails if the output is stale.
import {mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync} from 'node:fs';
import {join, relative} from 'node:path';
import {pkgRoot, repoRoot, units, readMeta, CATEGORIES} from './lib.mjs';

const cssDir = join(repoRoot, 'packages', 'css', 'src', 'components');
const regDir = join(repoRoot, 'registry');
mkdirSync(regDir, {recursive: true});
for (const f of readdirSync(regDir)) if (f.endsWith('.json')) rmSync(join(regDir, f));

const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'));
const index = [];
for (const u of units()) {
  const meta = readMeta(u);
  const files = readdirSync(u.dir).filter((f) => /\.(tsx?|json)$/.test(f) && !/\.(test|demo)\./.test(f)).sort();
  const all = readdirSync(u.dir).filter((f) => !f.startsWith('.')).sort(); // dotfiles (.claude, .DS_Store) are local tool state, never part of a component
  const entry = {
    ...meta,
    kind: u.kind,
    import: `import {${meta.name.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('')}} from '@monoline/react'`,
    path: relative(repoRoot, u.dir),
    files: all.map((f) => `${relative(repoRoot, u.dir)}/${f}`),
  };
  index.push(entry);
  const css = meta.css.map((f) => {
    const p = join(cssDir, f);
    if (!existsSync(p)) throw new Error(`${u.name}: css file ${f} not found in packages/css/src/components`);
    return {path: `packages/css/src/components/${f}`, content: readFileSync(p, 'utf8')};
  });
  const source = files.map((f) => ({path: `${relative(repoRoot, u.dir)}/${f}`, content: readFileSync(join(u.dir, f), 'utf8')}));
  writeFileSync(join(regDir, `${u.name}.json`), JSON.stringify({...entry, dependencies: {'radix-ui': '^1.4.2'}, source, css}, null, 2) + '\n');
}
writeFileSync(join(regDir, 'index.json'), JSON.stringify({name: '@monoline/react', version: pkg.version, components: index}, null, 2) + '\n');

// llms.txt: short map. llms-full.txt: everything an agent needs in one file.
const byCat = (c) => index.filter((e) => e.category === c);
const section = (c) => byCat(c).length ? `\n### ${c}\n${byCat(c).map((e) => `- ${e.title} (${e.name}, ${e.status}): ${e.description} Source: ${e.path}/`).join('\n')}\n` : '';
const head = `# Monoline\n\n> Open-source UI kit: a plain CSS core (@monoline/css) with accessible React components (@monoline/react). Three themes, nine accents, font, corner and density options, no Tailwind, no runtime CSS-in-JS.\n\nStart with AGENTS.md (how to work in this repo) and DESIGN.md (the look and rules). Every component is a folder with source, test, demo and meta.json. Install the packages, or copy one component with npx monoline add <name> (source in registry/<name>.json).\n`;
writeFileSync(join(repoRoot, 'llms.txt'), `${head}\n## Docs\n- [AGENTS.md](AGENTS.md): rules for AI agents and contributors\n- [DESIGN.md](DESIGN.md): design rules, tokens, copy\n- [registry/index.json](registry/index.json): machine-readable component list\n\n## Components${CATEGORIES.map(section).join('')}`);
const full = index.map((e) => `## ${e.title} (${e.name})\n${e.description}\nImport: ${e.import}\nPrimitive: ${e.primitive ?? 'none'} | Status: ${e.status}\nA11y:\n${e.a11y.map((a) => `- ${a}`).join('\n')}\nFiles: ${e.files.join(', ')}\n`).join('\n');
writeFileSync(join(repoRoot, 'llms-full.txt'), `${head}\n${full}`);
console.log(`registry: ${index.length} entries`);
