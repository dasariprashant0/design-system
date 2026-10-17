import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// The gallery reads ../css and ../react straight from the repo, so a change
// there shows here at once. dedupe makes those files use this folder's React.
export default defineConfig({
    plugins: [react()],
    resolve: {dedupe: ['react', 'react-dom']},
    server: {port: 5180, fs: {allow: ['..']}},
});
