import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

// Inside this monorepo the packages are not installed from npm, so point the names at the built output.
// In a real project you delete the `alias` block and `npm install @monoline/react @monoline/css`.
const p = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@monoline/react': p('../../packages/react/dist/index.js'),
      '@monoline/css': p('../../packages/css/dist/monoline.css'),
    },
  },
  build: {outDir: 'dist'},
});
