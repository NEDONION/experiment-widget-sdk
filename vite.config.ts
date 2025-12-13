import { defineConfig } from 'vite';
import path from 'path';
import { readFileSync } from 'fs';

// 读取 package.json 获取版本号
const packageJson = JSON.parse(
  readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')
);
const version = packageJson.version;

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ExperimentWidget',
      formats: ['iife'],
      // 使用版本号 + 内容哈希，确保每次变更都有新 URL
      fileName: () => `experiment-widget.v${version}.[hash:8].js`,
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        // 同时生成一个固定名称的文件作为"最新版本"别名
        entryFileNames: `experiment-widget.v${version}.[hash:8].js`,
      },
    },
  },
});
