import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {cpSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const root = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const cssBuild = root('../../packages/css/scripts/build.mjs');

/** Rebuild packages/css/dist when a stylesheet in packages/css/src changes, then reload. */
function monolineCss(): Plugin {
  const build = () => spawnSync('node', [cssBuild], {stdio: 'inherit'});
  return {
    name: 'monoline-css',
    buildStart: () => { build(); },
    configureServer(server) {
      const src = root('../../packages/css/src');
      server.watcher.add(src);
      server.watcher.on('change', (f) => {
        if (f.startsWith(src) && f.endsWith('.css')) { build(); server.ws.send({type: 'full-reload'}); }
      });
    },
  };
}

/** Site base. Real paths need an absolute base: DOCS_BASE=/design-system/ for GitHub Pages, default '/'. */
const base = `/${(process.env.DOCS_BASE ?? '/').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');

/** Writes the base into dist/404.html (public/404.html holds __BASE__ as a placeholder). */
function notFoundBase(): Plugin {
  let out = '';
  return {
    name: 'monoline-404-base',
    apply: 'build',
    configResolved: (c) => { out = join(c.root, c.build.outDir, '404.html'); },
    closeBundle() { if (existsSync(out)) writeFileSync(out, readFileSync(out, 'utf8').replaceAll('__BASE__', base)); },
  };
}

/** Publishes the AI files next to the site: /llms.txt, /llms-full.txt and /registry/ (served in dev, copied on build). */
const aiFiles = ['llms.txt', 'llms-full.txt', 'registry'];
function aiFilesPlugin(): Plugin {
  const repo = root('../..');
  let out = '';
  return {
    name: 'monoline-ai-files',
    configResolved: (c) => { out = join(c.root, c.build.outDir); },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rel = decodeURIComponent((req.url ?? '').split('?')[0]!.slice(base.length)).replace(/^\/+/, '');
        const hit = req.url?.startsWith(base) && !rel.includes('..') && aiFiles.includes(rel.split('/')[0]!) && join(repo, rel);
        if (!hit || !existsSync(hit) || !/\.\w+$/.test(hit)) return next();
        res.setHeader('Content-Type', hit.endsWith('.json') ? 'application/json' : 'text/plain; charset=utf-8');
        res.end(readFileSync(hit));
      });
    },
    closeBundle() { for (const f of aiFiles) if (existsSync(join(repo, f))) cpSync(join(repo, f), join(out, f), {recursive: true}); },
  };
}

export default defineConfig({
  base,
  plugins: [react(), monolineCss(), notFoundBase(), aiFilesPlugin()],
  resolve: {alias: {'@monoline/react': root('../../packages/react/src/index.ts'), '@css': root('../../packages/css/dist')}},
  server: {port: 5180, fs: {allow: ['../..']}},
  build: {outDir: 'dist'},
});
