import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

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

export default defineConfig({
  base: './',
  plugins: [react(), monolineCss()],
  resolve: {alias: {'@monoline/react': root('../../packages/react/src/index.ts'), '@css': root('../../packages/css/dist')}},
  server: {port: 5180, fs: {allow: ['../..']}},
  build: {outDir: 'dist'},
});
