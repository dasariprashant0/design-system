// One source of truth per selector. Fails when the same selector (same media/supports/container context) is
// defined in more than one stylesheet with a different value for the same property: in the bundle the later file
// silently wins, which is how Grid lost its columns and Heading its size (docs/dogfood-log.md A1, A2).
//
//   node scripts/check-duplicates.mjs            report and exit 1 on a conflict
//   node scripts/check-duplicates.mjs --all      also list repeats that agree (same value) or sit in one file
//
// Parsing: a small brace walker over comment-stripped CSS (the files are plain CSS, no nesting). Each rule is
// reduced to context + one selector + property -> value; selector lists are split so `.a, .b {}` counts for both.
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {read} from './lib.mjs';

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const norm = (s) => s.replace(/\s+/g, ' ').replace(/\s*([>+~,])\s*/g, '$1').trim();

/** Split on a top-level separator, ignoring any inside (), [] or quotes. */
function splitTop(s, sep) {
  const out = []; let d = 0, q = '', from = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '(' || c === '[') d++;
    else if (c === ')' || c === ']') d--;
    else if (c === sep && d === 0) { out.push(s.slice(from, i)); from = i + 1; }
  }
  out.push(s.slice(from));
  return out.map((x) => x.trim()).filter(Boolean);
}

/** Returns [{ctx, sel, props: {prop: value}}] for every style rule, with the at-rule context it sits in. */
export function parseRules(css) {
  const rules = [];
  const walk = (text, ctx) => {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i);
      const semi = text.indexOf(';', i);
      if (open < 0) break;
      if (semi >= 0 && semi < open) { i = semi + 1; continue; } // @import / @layer statement
      let d = 1, j = open + 1;
      while (j < text.length && d > 0) { if (text[j] === '{') d++; else if (text[j] === '}') d--; j++; }
      const head = text.slice(i, open).trim();
      const body = text.slice(open + 1, j - 1);
      i = j;
      if (head.startsWith('@')) {
        if (/^@(keyframes|font-face|property)/.test(head)) continue; // names, not selectors
        walk(body, ctx ? `${ctx} ${norm(head)}` : norm(head));
      } else {
        const props = {};
        for (const decl of splitTop(body, ';')) {
          const k = decl.indexOf(':');
          if (k > 0) props[decl.slice(0, k).trim().toLowerCase()] = norm(decl.slice(k + 1).replace(/\s*!important/, ' !important'));
        }
        for (const sel of splitTop(head, ',')) rules.push({ctx, sel: norm(sel), props});
      }
    }
  };
  walk(strip(css), '');
  return rules;
}

export function findDuplicates() {
  const dir = new URL('../src/components/', import.meta.url);
  const files = ['utilities.css', 'base.css', ...readdirSync(dir).filter((f) => f.endsWith('.css')).sort().map((f) => `components/${f}`)];
  // key -> prop -> [{file, value}]
  const seen = new Map();
  for (const f of files) {
    for (const {ctx, sel, props} of parseRules(read(`src/${f}`))) {
      const key = `${ctx}\u0000${sel}`;
      const byProp = seen.get(key) ?? seen.set(key, new Map()).get(key);
      for (const [p, v] of Object.entries(props)) (byProp.get(p) ?? byProp.set(p, []).get(p)).push({file: f, value: v});
    }
  }
  const conflicts = [], agreeing = [];
  for (const [key, byProp] of seen) {
    const [ctx, sel] = key.split('\u0000');
    const fileSet = new Set([...byProp.values()].flat().map((e) => e.file));
    if (fileSet.size < 2) continue;
    const props = [];
    for (const [p, list] of byProp) {
      const vals = new Set(list.map((e) => e.value));
      if (new Set(list.map((e) => e.file)).size > 1 && vals.size > 1) props.push({prop: p, defs: list});
    }
    const row = {ctx, sel, files: [...fileSet]};
    if (props.length) conflicts.push({...row, props}); else agreeing.push(row);
  }
  return {conflicts, agreeing};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const {conflicts, agreeing} = findDuplicates();
  const label = (c) => (c.ctx ? `${c.ctx} { ${c.sel} }` : c.sel);
  if (process.argv.includes('--all')) for (const a of agreeing) console.log(`same   ${label(a)}  (${a.files.join(', ')})`);
  if (conflicts.length) {
    for (const c of conflicts) {
      console.error(`FAIL duplicate selector ${label(c)} defined in ${c.files.join(', ')}`);
      for (const p of c.props) console.error(`       ${p.prop}: ${p.defs.map((d) => `${d.value} (${d.file})`).join('  vs  ')}`);
    }
    console.error(`${conflicts.length} selector(s) defined in more than one stylesheet with different declarations. Keep one definition (in the component's own file) and delete the other.`);
    process.exit(1);
  }
  console.log(`ok: no selector is defined in more than one stylesheet with conflicting declarations (${agreeing.length} harmless repeats).`);
}
