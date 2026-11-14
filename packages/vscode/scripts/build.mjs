// Writes snippets/monoline.code-snippets from the registry: one snippet per component or hook,
// prefix ml-<name>, body = the import line(s) and one usage line. No dependencies.
// Run: node packages/vscode/scripts/build.mjs   (defaults: ../../registry -> ../snippets/monoline.code-snippets)
import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const SCOPE = 'typescriptreact,javascriptreact';

// VS Code snippet bodies are text with $ and \ as special characters; escape them.
const escape = (s) => s.replace(/\\/g, '\\\\').replace(/\$/g, '\\$');

// The main export named by the registry's import line: "import {Button} from ..." -> "Button".
const mainName = (entry) => entry.import?.match(/\{\s*(\w+)/)?.[1];

// The usage code without its import lines and blank ends. Then the one element (or call) that shows the
// main export, whole if it spans lines. With no such element, the whole usage code.
export function usageLines(entry) {
  const code = (entry.usage ?? '').split('\n').filter((l) => !/^\s*import\s/.test(l));
  while (code.length && !code[0].trim()) code.shift();
  while (code.length && !code.at(-1).trim()) code.pop();
  const name = mainName(entry);
  const i = name ? code.findIndex((l) => new RegExp(`<${name}[\\s>/]|\\b${name}\\(`).test(l)) : -1;
  if (i < 0) return code.length ? code : [`<${name ?? entry.title} />`];
  const indent = code[i].match(/^\s*/)[0];
  const end = code[i].includes(`</${name}>`) || /\/>\s*$/.test(code[i]) ? i
    : code.findIndex((l, j) => j > i && l.startsWith(indent) && l.slice(indent.length).startsWith(`</${name}>`));
  return code.slice(i, Math.max(end, i) + 1).map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l));
}

export function snippetFor(entry) {
  const imports = (entry.usage ?? '').split('\n').filter((l) => /^\s*import\s/.test(l)).map((l) => l.trim());
  const body = [...(imports.length ? imports : [entry.import].filter(Boolean)), '', ...usageLines(entry)];
  return {
    prefix: `ml-${entry.name}`,
    scope: SCOPE,
    description: `${entry.title}: ${entry.description}`.trim(),
    body: body.map(escape),
  };
}

export function buildSnippets(entries) {
  const out = {};
  for (const e of entries) {
    const key = `Monoline ${e.title}`;
    if (out[key]) throw new Error(`duplicate snippet "${key}"`);
    out[key] = snippetFor(e);
  }
  return out;
}

export function build({registryDir, outFile}) {
  const entries = readdirSync(registryDir).filter((f) => f.endsWith('.json') && f !== 'index.json').sort()
    .map((f) => JSON.parse(readFileSync(join(registryDir, f), 'utf8')));
  const text = JSON.stringify(buildSnippets(entries), null, '\t') + '\n';
  writeFileSync(outFile, text);
  return {count: entries.length, text};
}

const here = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const {count} = build({registryDir: join(here, '../../../registry'), outFile: join(here, '../snippets/monoline.code-snippets')});
  console.log(`vscode: wrote ${count} snippets to packages/vscode/snippets/monoline.code-snippets`);
}
