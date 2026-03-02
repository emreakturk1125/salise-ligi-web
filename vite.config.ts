import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // Cloudflare Pages build'inde absolute path, Capacitor/normal build'de relative path
  base: process.env.CF_PAGES ? '/' : '',

  // ⚠️ Build çıktısını 'dist' klasörüne ver
  // capacitor.config.ts içindeki webDir ile aynı olmalı
  build: {
    outDir: 'dist',
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
}));
