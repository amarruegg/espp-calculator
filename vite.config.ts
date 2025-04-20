import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    // Optimize chunk size and improve caching
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          vendor: ['react', 'react-dom', 'react-router-dom'],
          calculator: ['jspdf'],
        },
      },
    },
    // Enable terser minification for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Keep CSS compact
    cssMinify: true,
    // Generate source maps
    sourcemap: false,
  },
  // Enable server-side compression for better performance
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'jspdf'],
  },
});
