// Shared by gen-index and gen-registry: find every component/hook folder and read its meta.json.
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

export const pkgRoot = fileURLToPath(new URL('..', import.meta.url));
export const repoRoot = join(pkgRoot, '..', '..');
export const CATEGORIES = ['layout', 'typography', 'buttons', 'forms', 'data-display', 'feedback', 'overlays', 'navigation', 'effects', 'blocks', 'hooks'];

/** Folders that hold a unit: src/components/<name>/ and src/hooks/<name>/ */
export function units() {
  const out = [];
  for (const kind of ['components', 'hooks']) {
    const base = join(pkgRoot, 'src', kind);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base).sort()) {
      const dir = join(base, name);
      if (statSync(dir).isDirectory() && existsSync(join(dir, 'index.ts'))) out.push({kind, name, dir});
    }
  }
  return out;
}

export function readMeta(u) {
  const file = join(u.dir, 'meta.json');
  if (!existsSync(file)) throw new Error(`${relative(repoRoot, u.dir)} has no meta.json`);
  const m = JSON.parse(readFileSync(file, 'utf8'));
  const errs = [];
  if (m.name !== u.name) errs.push(`name "${m.name}" must equal folder "${u.name}"`);
  for (const k of ['title', 'category', 'description', 'status']) if (!m[k]) errs.push(`missing "${k}"`);
  if (!CATEGORIES.includes(m.category)) errs.push(`category "${m.category}" not in ${CATEGORIES.join(', ')}`);
  if (!['stable', 'beta'].includes(m.status)) errs.push(`status must be stable or beta`);
  if (!Array.isArray(m.a11y) || m.a11y.length === 0) errs.push('a11y must list at least one behaviour');
  if (!Array.isArray(m.css)) errs.push('css must be an array (may be empty)');
  if (errs.length) throw new Error(`${relative(repoRoot, file)}: ${errs.join('; ')}`);
  return m;
}
