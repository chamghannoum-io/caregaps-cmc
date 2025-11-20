import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true, // Auto-open browser
    hmr: {
      overlay: true // Show errors as overlay
    }
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js']
  },
  build: {
    sourcemap: false
  }
})
