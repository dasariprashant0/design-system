import {defineConfig} from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({include: ['src'], exclude: ['src/**/*.test.tsx', 'src/**/*.demo.tsx', 'src/test/**'], rollupTypes: false})],
  build: {
    lib: {entry: 'src/index.ts', formats: ['es', 'cjs'], fileName: (f) => (f === 'es' ? 'index.js' : 'index.cjs')},
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', /^radix-ui/, /^@radix-ui/],
      // Rollup drops per-file 'use client' when bundling to one file. Every entry is a client-safe
      // bundle (Radix, hooks), so mark the whole bundle instead of warning per file.
      // ponytail: whole bundle is client; use preserveModules if per-component server boundaries are needed.
      output: {banner: "'use client';"},
      onwarn(w, warn) {
        if (w.code === 'MODULE_LEVEL_DIRECTIVE' || w.code === 'SOURCEMAP_ERROR') return;
        warn(w);
      },
    },
    sourcemap: true,
  },
  test: {environment: 'jsdom', globals: true, setupFiles: ['src/test/setup.ts'], include: ['src/**/*.test.{ts,tsx}'], testTimeout: 15000},
});
