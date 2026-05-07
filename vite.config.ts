// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ URL del backend de producción (único lugar donde aparece)
const PRODUCTION_API_URL = 'https://todo-app-backend-fastapi-klh2.onrender.com'

export default defineConfig(({ mode }) => {
  // ✅ Cargar variable de entorno
  const apiUrl = process.env.VITE_API_URL || ''
  const isDevelopment = mode === 'development'
  
  // ✅ En desarrollo: usar proxy a Render (VITE_API_URL vacío)
  // ✅ En producción: usar la URL configurada
  const proxyTarget = isDevelopment 
    ? PRODUCTION_API_URL  // Desarrollo: proxy -> Render
    : (apiUrl || PRODUCTION_API_URL)  // Producción: usar variable o fallback
  
  console.log('🔧 [VITE] Modo:', mode)
  console.log('🔧 [VITE] Proxy target:', proxyTarget)
  
  return {
    plugins: [react()],
    
    server: {
      port: 5173,
      open: true,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          // ✅ Headers para WebAuthn/Passkeys
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const targetHost = new URL(proxyTarget).host
              proxyReq.setHeader('Host', targetHost)
              proxyReq.setHeader('X-Forwarded-Proto', 'https')
              proxyReq.setHeader('X-Forwarded-Host', targetHost)
            })
          }
        }
      }
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: false,
    }
  }
})