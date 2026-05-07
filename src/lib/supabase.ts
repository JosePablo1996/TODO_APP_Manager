// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Ahora TypeScript reconoce import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación con mensajes más descriptivos
if (!supabaseUrl) {
  throw new Error(
    '❌ VITE_SUPABASE_URL no está definida. ' +
    'Asegúrate de tener un archivo .env con VITE_SUPABASE_URL=https://jpiyxzkzxutxwzjzoszh.supabase.co'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    '❌ VITE_SUPABASE_ANON_KEY no está definida. ' +
    'Asegúrate de tener un archivo .env con la clave anónima de Supabase'
  );
}

console.log('✅ Supabase configurado correctamente');
console.log('📊 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseAnonKey.substring(0, 20) + '...'); // Solo muestra los primeros 20 caracteres

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});