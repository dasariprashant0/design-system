// Writes src/page/styling.generated.json: for every component, [{file, classes, attributes}] scanned from the
// stylesheets listed in its meta.css (packages/css/src/components/<file>). Hooks have none.
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {discover, cssDir, docsRoot} from './lib/load.mjs';
import {extractSelectors} from './lib/styling.mjs';

const result = {};
for (const {meta} of discover()) {
  const files = [];
  for (const file of meta.css ?? []) {
    const path = join(cssDir, file);
    if (!existsSync(path)) { console.warn(`styling: ${meta.name}: ${file} not found`); continue; }
    files.push({file, ...extractSelectors(readFileSync(path, 'utf8'))});
  }
  if (files.length) result[meta.name] = files;
}
const out = join(docsRoot, 'src/page/styling.generated.json');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, JSON.stringify(result, null, 1) + '\n');
console.log(`styling: ${Object.keys(result).length} components with stylesheets`);
