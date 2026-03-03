import path from 'path';
import fs from 'fs';
import { defineConfig, type Plugin } from 'vite';

/**
 * public/ altındaki statik HTML sayfalarını dev server'da sunmak için plugin.
 * /how-to-play/ → public/how-to-play/index.html gibi çalışır.
 */
function staticPagesPlugin(): Plugin {
  return {
    name: 'static-pages',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        // Trailing slash ile biten URL'lerde public/ altında index.html ara
        if (url.endsWith('/') && url !== '/') {
          const filePath = path.join(__dirname, 'public', url, 'index.html');
          if (fs.existsSync(filePath)) {
            req.url = url + 'index.html';
          }
        }
        next();
      });
    },
  };
}

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
  plugins: [staticPagesPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
}));
