import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // ⚠️ Capacitor için zorunlu: tüm path'ler relative olsun
  base: '',

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
});
