// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // ✅ Configuración del servidor de desarrollo
  server: {
    port: 5173,
    open: true,
    host: '0.0.0.0',
    // ✅ PROXY - NO MODIFICAR (necesario para WebAuthn/Passkeys)
    proxy: {
      '/api': {
        target: 'https://todo-app-backend-fastapi-klh2.onrender.com',
        changeOrigin: true,
        secure: false,
        // ✅ Necesario para WebAuthn/Passkeys
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Asegurar que el Host header coincida con el backend
            proxyReq.setHeader('Host', 'todo-app-backend-fastapi-klh2.onrender.com');
          });
        }
      }
    }
  },

  // ✅ Configuración de BUILD para producción (Render)
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
  }
})