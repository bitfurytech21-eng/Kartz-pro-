import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/kretz-tour': {
          target: 'https://kretzrealestate.com',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/kretz-tour/, ''),
          headers: {
            Referer: 'https://kretzrealestate.com/',
            Origin: 'https://kretzrealestate.com',
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];
              delete proxyRes.headers['frame-options'];
            });
          },
        },
        '/kretz-proxy': {
          target: 'https://kretzrealestate.com',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/kretz-proxy/, ''),
          headers: {
            Referer: 'https://kretzrealestate.com/',
            Origin: 'https://kretzrealestate.com',
          },
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];
            });
          },
        },
        '/files': {
          target: 'https://files.kretzrealestate.com',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/files/, ''),
          headers: {
            Referer: 'https://kretzrealestate.com/',
            Origin: 'https://kretzrealestate.com',
          },
        },
        // Gatsby chunks & page-data for proxied property pages
        '^/(tarteaucitron|page-data|webpack-runtime|react-core|vendor|framework|app-|component-|styles\\.)': {
          target: 'https://kretzrealestate.com',
          changeOrigin: true,
          secure: false,
          headers: {
            Referer: 'https://kretzrealestate.com/',
            Origin: 'https://kretzrealestate.com',
          },
        },
      },
    },
  };
});
