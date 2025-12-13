import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ExperimentWidget',
      formats: ['iife'],
      fileName: () => 'experiment-widget.js',
    },
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
