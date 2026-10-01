import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor';
          if (/\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion-vendor';
          if (id.includes('/node_modules/react-router')) return 'router-vendor';
          if (id.includes('/node_modules/lucide-react')) return 'icons-vendor';
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    watch: {
      ignored: [
        '**/Selected works/**',
        '**/New folder/**',
        '**/.git/**',
        '**/dist/**',
        '**/server/data/**',
      ],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/selected-works': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
});
