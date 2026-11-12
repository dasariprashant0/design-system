import {defineConfig} from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({include: ['src'], exclude: ['src/**/*.test.tsx', 'src/**/*.demo.tsx', 'src/test/**'], rollupTypes: false})],
  build: {
    lib: {entry: 'src/index.ts', formats: ['es', 'cjs'], fileName: (f) => (f === 'es' ? 'index.js' : 'index.cjs')},
    rollupOptions: {external: ['react', 'react-dom', 'react/jsx-runtime', /^radix-ui/, /^@radix-ui/]},
    sourcemap: true,
  },
  test: {environment: 'jsdom', globals: true, setupFiles: ['src/test/setup.ts'], include: ['src/**/*.test.{ts,tsx}']},
});
