// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ URL del backend de producción
const PRODUCTION_API_URL = 'https://todo-app-backend-fastapi-klh2.onrender.com'

// ✅ Configuración correcta con defineConfig
export default defineConfig(({ mode }) => {
  // ✅ Cargar variable de entorno
  const apiUrl = process.env.VITE_API_URL || ''
  const isDevelopment = mode === 'development'
  
  // ✅ En desarrollo: usar proxy a localhost:8000
  // ✅ En producción: usar la URL configurada
  const proxyTarget = isDevelopment 
    ? 'http://localhost:8000'  // ✅ Desarrollo: backend local
    : (apiUrl || PRODUCTION_API_URL)  // ✅ Producción: usar variable o fallback
  
  console.log('🔧 [VITE] Modo:', mode)
  console.log('🔧 [VITE] Proxy target:', proxyTarget)
  console.log('🔧 [VITE] API URL:', apiUrl || '(usando proxy)')
  
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
          // ✅ Asegurar que las peticiones se reenvíen correctamente
          rewrite: (path) => path,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('❌ [PROXY] Error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('🔄 [PROXY] Reenviando:', req.method, req.url);
              const targetHost = new URL(proxyTarget).host
              proxyReq.setHeader('Host', targetHost)
              proxyReq.setHeader('X-Forwarded-Proto', 'http')
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('✅ [PROXY] Respuesta:', proxyRes.statusCode, req.url);
            });
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