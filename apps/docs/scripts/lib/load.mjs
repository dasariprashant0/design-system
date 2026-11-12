// Shared discovery for the build scripts: every folder in packages/react/src/{components,hooks} with a meta.json.
import {readdirSync, readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

export const repo = fileURLToPath(new URL('../../../../', import.meta.url));
export const docsRoot = fileURLToPath(new URL('../../', import.meta.url));
export const reactSrc = join(repo, 'packages/react/src');
export const cssDir = join(repo, 'packages/css/src/components');
export const GITHUB = 'https://github.com/dasariprashant0/design-system/tree/master';

/** -> [{meta, dir, kind: 'components' | 'hooks'}] sorted by name. */
export function discover() {
  const out = [];
  for (const kind of ['components', 'hooks']) {
    const base = join(reactSrc, kind);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base)) {
      const file = join(base, name, 'meta.json');
      if (existsSync(file)) out.push({meta: JSON.parse(readFileSync(file, 'utf8')), dir: join(base, name), kind});
    }
  }
  return out.sort((a, b) => a.meta.name.localeCompare(b.meta.name));
}
