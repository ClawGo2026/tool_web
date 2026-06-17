import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  // github 仓库名
  base: '/tool_web/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: { input: 'index.html' }
  },
  server: {
    open: true,
    port: 3000
  }
});
