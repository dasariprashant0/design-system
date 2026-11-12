// Registry access: a local folder or an https base URL, cached in memory. Fetching is injectable.
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';

export const DEFAULT_URL = 'https://raw.githubusercontent.com/dasariprashant0/design-system/master/registry';
const NAME = /^[a-z0-9][a-z0-9-]*$/;

export const isUrl = (s) => /^https?:\/\//.test(s);

/** Pick the registry location: flag, env, ./registry, the repo this package lives in, else GitHub. */
export function resolveRegistry({flag, env = process.env, cwd = process.cwd(), pkgDir} = {}) {
  if (flag) return flag;
  if (env.MONOLINE_REGISTRY) return env.MONOLINE_REGISTRY;
  for (const dir of [join(cwd, 'registry'), pkgDir && join(pkgDir, '..', '..', '..', 'registry')]) {
    if (dir && existsSync(join(dir, 'index.json'))) return dir;
  }
  return DEFAULT_URL;
}

export function createRegistry({location, fetch: doFetch = globalThis.fetch} = {}) {
  const remote = isUrl(location);
  const base = remote ? location.replace(/\/$/, '') : resolve(location);
  const cache = new Map();

  async function getText(key, rel) {
    if (cache.has(key)) return cache.get(key);
    let text;
    if (remote) {
      const url = new URL(rel, `${base}/`).href; // normalises "../llms.txt"
      const res = await doFetch(url);
      if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText ?? ''}`.trim());
      text = await res.text();
    } else {
      text = await readFile(join(base, rel), 'utf8');
    }
    cache.set(key, text);
    return text;
  }

  return {
    location: base,
    async index() {
      const idx = JSON.parse(await getText('index', 'index.json'));
      if (!Array.isArray(idx.components)) throw new Error('index.json has no components list');
      return idx;
    },
    async component(name) {
      if (typeof name !== 'string' || !NAME.test(name)) throw new Error(`invalid component name "${name}"`);
      try {
        return JSON.parse(await getText(`c:${name}`, `${name}.json`));
      } catch (e) {
        throw new Error(`unknown component "${name}" (${e.message})`);
      }
    },
    async llms() {
      // llms.txt sits next to the registry folder in the repo.
      return getText('llms', '../llms.txt');
    },
  };
}
