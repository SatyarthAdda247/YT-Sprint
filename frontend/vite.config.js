import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'axios-vendor': ['axios']
        }
      }
    },
    // Asset optimization
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Faster builds
    sourcemap: false // Smaller builds
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios']
  }
})

