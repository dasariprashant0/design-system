// Writes src/props.generated.json for the docs props tables: for each component (and hook), the props of its
// exported *Props interfaces/types. Extraction lives in packages/react/scripts/props-extract.mjs, shared with the
// AI registry (npm run registry). Best effort; anything it cannot read is skipped.
import {readdirSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {COMPONENT_PROPS, HOOK_PROPS, createProgram, mainSourceFile, propGroups} from '../../../packages/react/scripts/props-extract.mjs';

const roots = ['components', 'hooks'].map((k) => fileURLToPath(new URL(`../../../packages/react/src/${k}/`, import.meta.url)));
const out = fileURLToPath(new URL('../src/props.generated.json', import.meta.url));
// Components are <name>/<name>.tsx; hooks are <name>/<name>.ts(x) and also document their *Options / *Return types.
const found = roots.flatMap((root, i) => readdirSync(root).flatMap((n) => { const file = mainSourceFile(join(root, n), n); return file ? [{name: n, file, hook: i === 1}] : []; }));
const names = found.map((f) => f.name);
const files = found.map((f) => f.file);

const program = createProgram(files);
const result = {};
for (const [i, file] of files.entries()) {
  try {
    const groups = propGroups(program, file, {pattern: found[i].hook ? HOOK_PROPS : COMPONENT_PROPS});
    if (groups.length) result[names[i]] = groups;
  } catch { /* skip */ }
}
writeFileSync(out, JSON.stringify(result, null, 1) + '\n');
console.log(`props: ${Object.keys(result).length} components with documented props`);
