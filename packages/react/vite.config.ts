import {defineConfig} from 'vitest/config';
import dts from 'vite-plugin-dts';
import type {Plugin} from 'vite';

/** Rollup drops module-level directives; put 'use client' back on each output file whose source module has it.
 *  With preserveModules every output chunk is one module, so a Server Component importing Button stays a
 *  server import while Combobox and other hook users get the client boundary. */
function keepUseClient(): Plugin {
  const clientModules = new Set<string>();
  return {
    name: 'monoline-keep-use-client',
    transform(code, id) { if (/^\s*(['"])use client\1/.test(code)) clientModules.add(id.split('?')[0]!); return null; },
    renderChunk(code, chunk) {
      const id = chunk.facadeModuleId?.split('?')[0] ?? chunk.moduleIds[chunk.moduleIds.length - 1];
      if (id && clientModules.has(id) && !/^\s*['"]use client['"]/.test(code)) return {code: `"use client";\n${code}`, map: null};
      return null;
    },
  };
}

export default defineConfig({
  plugins: [keepUseClient(), dts({include: ['src'], exclude: ['src/**/*.test.tsx', 'src/**/*.demo.tsx', 'src/test/**'], rollupTypes: false})],
  build: {
    // One output file per source module (preserveModules) so a bundler can drop every component and every
    // Radix primitive the app does not import ("sideEffects": false in package.json). A single bundled file
    // cannot be pruned, because top-level forwardRef() calls look side-effectful: one Button cost ~100 KB gzip.
    lib: {entry: 'src/index.ts', formats: ['es']},
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', /^radix-ui/, /^@radix-ui/],
      output: [
        {format: 'es', dir: 'dist', preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js', exports: 'named'},
        {format: 'cjs', dir: 'dist/cjs', preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].cjs', exports: 'named'},
      ],
      onwarn(w, warn) {
        if (w.code === 'SOURCEMAP_ERROR' || w.code === 'MODULE_LEVEL_DIRECTIVE') return; // directive is restored by keepUseClient
        warn(w);
      },
    },
    sourcemap: true,
  },
  test: {environment: 'jsdom', globals: true, setupFiles: ['src/test/setup.ts'], include: ['src/**/*.test.{ts,tsx}'], testTimeout: 15000},
});
