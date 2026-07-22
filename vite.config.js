import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api-behance': {
        target: 'https://www.behance.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-behance/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Override User-Agent and headers to make Cloudflare allow the proxy request
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.5');
          });
        }
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
