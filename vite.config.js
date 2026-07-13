import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  // 相对路径，兼容自定义域名(根路径)与 github.io/tool_web/ 两种访问方式
  base: './',
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
