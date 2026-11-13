// Captures the real bundle sizes (`node scripts/size.mjs --json`) into src/site/size.generated.json for the Compare page.
// Needs the built @monoline/react and @monoline/css; without them it writes an empty report and says so.
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';

const root = new URL('../../../', import.meta.url);
const out = new URL('../src/site/size.generated.json', import.meta.url);
const r = spawnSync(process.execPath, [new URL('scripts/size.mjs', root).pathname, '--json'], {encoding: 'utf8'});
let report = {js: [], css: null};
try { report = JSON.parse(r.stdout); } catch { console.warn('size: no report (build @monoline/react first); the Compare page will say sizes are unavailable'); }
writeFileSync(out, JSON.stringify(report, null, 1) + '\n');
console.log(`size: ${report.js.length} JS cases${report.css ? ' and the CSS total' : ''} written`);
