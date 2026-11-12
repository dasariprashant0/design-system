// Writes public/docs/<name>.md for every component and hook, public/docs/index.md, and public/llms.txt (a copy of
// the repo's root llms.txt when it exists). Runs after gen-props, gen-demos and gen-styling and reads their JSON.
import {readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, copyFileSync} from 'node:fs';
import {join} from 'node:path';
import {discover, docsRoot, repo} from './lib/load.mjs';
import {componentMarkdown} from './lib/markdown.mjs';

const readJson = (rel) => { const f = join(docsRoot, rel); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {}; };
const props = readJson('src/props.generated.json'), demos = readJson('src/page/demos.generated.json'), styling = readJson('src/page/styling.generated.json');
const outDir = join(docsRoot, 'public/docs');
rmSync(outDir, {recursive: true, force: true});
mkdirSync(outDir, {recursive: true});

const items = discover();
for (const {meta, kind} of items) {
  writeFileSync(join(outDir, `${meta.name}.md`), componentMarkdown({meta, extra: demos[meta.name], props: props[meta.name], styling: styling[meta.name], hook: kind === 'hooks'}));
}
const byCat = {};
for (const {meta} of items) (byCat[meta.category] ??= []).push(meta);
const index = ['# Monoline documentation', '', 'One Markdown page per component and hook. Install with `npx monoline add <name>`.', ''];
for (const [cat, list] of Object.entries(byCat)) {
  index.push(`## ${cat}`, '', ...list.map((m) => `- [${m.title}](${m.name}.md): ${m.description}`), '');
}
writeFileSync(join(outDir, 'index.md'), index.join('\n'));
const llms = join(repo, 'llms.txt');
if (existsSync(llms)) copyFileSync(llms, join(docsRoot, 'public/llms.txt'));
console.log(`markdown: ${items.length} pages in public/docs${existsSync(llms) ? ', llms.txt copied' : ''}`);
