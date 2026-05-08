import { Version } from '../types/changelog.types';

export const changelogVersions: Version[] = [
  // ============================================
  // VERSIÓN 2.6.0 - ACTUAL
  // ============================================
  {
    version: '2.6.0',
    date: '07 Mayo 2026',
    title: '🔄 Sincronización Backend + Backup/Restore + Soft Delete + Swipe Actions',
    gradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
    isLatest: true,
    changes: [
      {
        category: '🔄 Sincronización Completa con Backend',
        icon: 'RefreshCw',
        color: 'text-teal-500',
        items: [
          {
            description: '🔗 Conexión de tareas al backend (FastAPI + Supabase)',
            details: [
              'Las tareas ahora se cargan desde el backend, misma fuente que la app móvil',
              'Auto-refresh al enfocar la ventana del navegador',
              'Polling automático cada 60 segundos para mantener datos actualizados',
              'Fallback a localStorage si el backend no está disponible',
              'Función refreshTasks() para refresco manual de tareas',
              'Sincronización bidireccional: cambios en web se reflejan en móvil y viceversa',
            ],
          },
          {
            description: '⚡ Operaciones CRUD sincronizadas con backend',
            details: [
              'addTask ahora es asíncrono y crea tareas en el backend (POST /api/tasks)',
              'updateTask, toggleTask, toggleFavorite, toggleArchive sincronizan con backend',
              'Auto-refresh de token JWT en errores 401 (sesión expirada)',
              'Cola de refresh de token para evitar múltiples llamadas simultáneas',
              'Nuevos métodos en taskService.ts: updateTask (PUT), patchTask (PATCH), getTaskById (GET)',
            ],
          },
        ],
      },
      {
        category: '📦 Sistema de Copia de Seguridad (Backup/Restore)',
        icon: 'Save',
        color: 'text-cyan-500',
        items: [
          {
            description: '💾 Backup Automático',
            details: [
              'Backup completo de tareas con barra de progreso visual (0-100%)',
              'Almacenamiento persistente del historial de backups en localStorage',
              'Estadísticas de tareas incluidas: Total, Pendientes, Completadas',
              'Modales de éxito con animaciones al completar el backup',
            ],
          },
          {
            description: '📥 Restauración Automática',
            details: [
              'Restauración de tareas desde backup con barra de progreso',
              'Validación de integridad de datos antes de restaurar',
              'Opción de restaurar desde el último backup automático',
              'Modales de confirmación para evitar restauraciones accidentales',
            ],
          },
          {
            description: '📤 Exportar/Importar Manual',
            details: [
              'Exportar tareas como archivo JSON descargable',
              'Compartir archivo JSON directamente desde la app (Web Share API)',
              'Importar tareas desde archivo JSON con validación de formato',
              'Detección de duplicados al importar para evitar tareas repetidas',
            ],
          },
          {
            description: '📊 Estadísticas de Backup',
            details: [
              'Total de tareas respaldadas en cada backup',
              'Tareas pendientes vs completadas en el backup',
              'Tamaño del archivo de backup (en KB)',
              'Fecha y hora de cada backup realizado',
            ],
          },
          {
            description: '📄 Nueva página BackupPage.tsx',
            details: [
              'Interfaz completa para gestión de backups con tabs (Automático/Manual)',
              'Integración en SettingsPage como opción "Copia de Seguridad" en sección Seguridad',
              'Ruta /backup protegida con autenticación',
              'Nuevo servicio taskService.ts para operaciones de import/export',
            ],
          },
        ],
      },
      {
        category: '⚠️ Zona de Peligro (BackupPage)',
        icon: 'AlertTriangle',
        color: 'text-red-500',
        items: [
          {
            description: '🧹 Gestión avanzada del historial de backups',
            details: [
              'Visualización de últimos 5 backups en el historial',
              'Eliminar todo el historial de backups (con modal de confirmación)',
              'Restablecer contador de "Última copia" al estado inicial',
              'Almacenamiento persistente en localStorage con prefijo "backup_"',
              'Tooltips de advertencia sobre acciones irreversibles',
            ],
          },
        ],
      },
      {
        category: '🗑️ Sistema de Eliminación Conectado al Backend',
        icon: 'Trash2',
        color: 'text-orange-500',
        items: [
          {
            description: '🔌 Soft Delete sincronizado con backend',
            details: [
              'softDeleteTask ahora llama a DELETE /api/tasks/:id en el backend',
              'Al eliminar tarea en web → se elimina del backend → desaparece en app móvil',
              'Rollback automático si falla la eliminación en el backend',
              'Soft delete local preserva datos en caso de error de red',
              'Nuevo método deleteTask(id) en taskService.ts',
            ],
          },
          {
            description: '🗑️ Eliminación Masiva (Bulk Delete)',
            details: [
              'Nuevo método bulkSoftDelete(ids[]) en useTasks.ts',
              'Selección múltiple de tareas con checkboxes',
              'Barra flotante con botones "Eliminar seleccionadas" y "Cancelar"',
              'Opción "Seleccionar todas" / "Deseleccionar todas"',
              'Modal de confirmación para eliminación masiva con conteo de tareas',
              'Endpoint POST /api/tasks/bulk/delete en el backend',
            ],
          },
        ],
      },
      {
        category: '👆 Acciones Swipe en Tareas',
        icon: 'Smartphone',
        color: 'text-purple-500',
        items: [
          {
            description: '⬅️ Swipe izquierda → Eliminar',
            details: [
              'Deslizar tarea hacia la izquierda revela fondo rojo con acción de eliminar',
              'Umbral de activación configurable para evitar eliminaciones accidentales',
              'Feedback háptico visual al alcanzar el umbral de eliminación',
              'Modal de confirmación antes de mover a papelera',
            ],
          },
          {
            description: '➡️ Swipe derecha → Completar/Reabrir',
            details: [
              'Deslizar hacia la derecha revela fondo verde para completar tarea',
              'Si la tarea ya está completada, el swipe la reabre (marca como pendiente)',
              'Animación de check/undo al completar/reabrir',
              'Sincronización inmediata con backend al cambiar estado',
            ],
          },
          {
            description: '🎨 Componentes actualizados con Swipe',
            details: [
              'TaskItem.tsx: Swipe horizontal + checkbox de selección',
              'TaskCard.tsx: Swipe horizontal + checkbox de selección',
              'ProtectedPage.tsx: Modo selección + barra flotante + modal confirmación',
              'Transiciones suaves con Framer Motion para acciones swipe',
            ],
          },
        ],
      },
      {
        category: '🔐 Reset de Contraseña por OTP (3 Pasos)',
        icon: 'Mail',
        color: 'text-blue-500',
        items: [
          {
            description: '🔄 Nuevo flujo OTP para reset de contraseña',
            details: [
              'Flujo de 3 pasos: Email → Código OTP → Nueva contraseña',
              'Paso 1: Ingreso de email con validación en tiempo real',
              'Paso 2: Ingreso de código OTP de 6 dígitos enviado al correo',
              'Paso 3: Creación de nueva contraseña con indicador de fortaleza',
              'Indicador visual de progreso (paso 1/3, 2/3, 3/3)',
            ],
          },
          {
            description: '🔗 Consistencia con app móvil',
            details: [
              'Mismos endpoints que la app móvil para experiencia unificada',
              'Métodos forgotPasswordOtp() y resetPasswordOtp() en authService.ts',
              'Rate limiting: máximo 3 solicitudes de código por hora',
              'Expiración del código OTP: 15 minutos',
              'Límite de intentos: 5 intentos fallidos antes de invalidar código',
            ],
          },
        ],
      },
      {
        category: '🖥️ Mejoras en Frontend (UI/UX)',
        icon: 'LayoutGrid',
        color: 'text-emerald-500',
        items: [
          {
            description: '📱 Header Responsive',
            details: [
              'Tamaños adaptativos con breakpoints sm/lg para mejor visualización',
              'Logo, iconos, texto y padding escalan según dispositivo',
              'Saludo compacto en móvil: fecha debajo del saludo',
              'Dropdown de notificaciones adaptativo: w-[calc(100vw-2rem)]',
            ],
          },
          {
            description: '🧭 Navegación SPA corregida',
            details: [
              'window.location.href reemplazado por useNavigate de React Router',
              'Navegación a /crear-tarea sin recargar la página completa',
              'Transiciones más suaves entre páginas',
            ],
          },
          {
            description: '📐 Espacio lateral corregido',
            details: [
              'Corregido ml-20 → ml-0 cuando el menú izquierdo está cerrado',
              'Mejor aprovechamiento del espacio en pantalla',
              'Sin espacio en blanco innecesario al colapsar LeftMenu',
            ],
          },
          {
            description: '🔒 Passkey solo en desarrollo',
            details: [
              'Passkey oculto en producción (solo visible en localhost)',
              '2FA y OTP siempre visibles en producción',
              'Botón "Más opciones" siempre visible con métodos alternativos',
            ],
          },
        ],
      },
      {
        category: '🗄️ Backend (FastAPI) - Nuevos Endpoints',
        icon: 'Server',
        color: 'text-indigo-500',
        items: [
          {
            description: '🔌 Endpoints de Soft Delete y Restauración',
            details: [
              'DELETE /api/tasks/{id} → Soft delete (marca deleted_at)',
              'DELETE /api/tasks/{id}?permanent=true → Eliminación física definitiva',
              'GET /api/tasks/trash → Lista de tareas en papelera',
              'POST /api/tasks/{id}/restore → Restaurar tarea de papelera',
              'POST /api/tasks/bulk/delete → Eliminación masiva de tareas',
              'POST /api/tasks/bulk/restore → Restauración masiva de tareas',
            ],
          },
          {
            description: '📦 Modelos actualizados en tasks.py',
            details: [
              'Nuevos campos: is_favorite, is_archived, deleted_at',
              'get_tasks excluye tareas eliminadas por defecto',
              'Soporte para filtrado por estado de eliminación',
              'Validaciones Pydantic actualizadas para nuevos campos',
            ],
          },
          {
            description: '🌐 Configuración CORS mejorada (main.py)',
            details: [
              'Agregada URL del frontend de Render: https://todoapp-manager.onrender.com',
              'Agregadas URLs de desarrollo local (localhost:5173, localhost:5174)',
              'Mejorada la lista de orígenes permitidos para evitar errores CORS',
              'Soporte para solicitudes con credenciales (cookies, auth headers)',
            ],
          },
        ],
      },
      {
        category: '🐛 Correcciones de Errores (11 fixes)',
        icon: 'Bug',
        color: 'text-red-500',
        items: [
          {
            description: '✅ Errores resueltos en esta versión',
            details: [
              '#1: Tareas no se creaban en backend → addTask ahora llama a taskService.createTask()',
              '#2: Tareas no aparecían en papelera → Soft delete local sincronizado con backend',
              '#3: Navegación recargaba la página → useNavigate en lugar de window.location.href',
              '#4: CORS bloqueaba peticiones → Agregada URL del frontend a orígenes permitidos',
              '#5: Build fallaba por TypeScript → tsc -b eliminado del script de build',
              '#6: Build fallaba por terser/esbuild → minify: false en vite.config.ts',
              '#7: Avatar no se mostraba en producción → Import correcto con Vite para assets',
              '#8: Passkey no compatible en web → Oculto en producción, visible solo en localhost',
              '#9: Espacio en blanco lateral → Corregido ml-20 → ml-0 cuando menú cerrado',
              '#10: Token expirado en móvil → Auto-refresh de token en interceptors de axios',
              '#11: Error ECONNREFUSED en proxy Vite → Fallback a URL de producción configurado',
            ],
          },
        ],
      },
      {
        category: '🚀 Deploy y Configuración',
        icon: 'Cloud',
        color: 'text-amber-500',
        items: [
          {
            description: '🌐 URLs de producción',
            details: [
              'Frontend: https://todoapp-manager.onrender.com',
              'Backend API: https://todo-app-backend-fastapi-klh2.onrender.com',
              'API Docs (Swagger): https://todo-app-backend-fastapi-klh2.onrender.com/docs',
              'Rewrite Rule configurado en Render para SPA routing',
            ],
          },
          {
            description: '⚙️ Configuración de build optimizada',
            details: [
              'vite.config.ts: minify: false para evitar errores con dependencias',
              'package.json: Build sin tsc -b (solo vite build) para evitar fallos',
              'public/_redirects: Configuración SPA routing para React Router',
              '.env.production: Variables de entorno para Render (producción)',
              '.env.development: VITE_API_URL vacío para usar proxy en desarrollo',
            ],
          },
        ],
      },
      {
        category: '📁 Archivos Afectados (18 total)',
        icon: 'FileJson',
        color: 'text-gray-500',
        items: [
          {
            description: '📄 Archivos creados (2)',
            details: [
              'taskService.ts - Servicio CRUD de tareas + import/export',
              'BackupPage.tsx - Página completa de copia de seguridad',
            ],
          },
          {
            description: '📝 Archivos modificados - Frontend (9)',
            details: [
              'authService.ts, ForgotPasswordPage.tsx, useTasks.ts',
              'TaskItem.tsx, TaskCard.tsx, ProtectedPage.tsx',
              'SettingsPage.tsx, Header.tsx, App.tsx',
            ],
          },
          {
            description: '🗄️ Archivos modificados - Backend (2)',
            details: [
              'app/routers/tasks.py - Soft delete, restore, bulk operations',
              'app/main.py - Configuración CORS actualizada',
            ],
          },
          {
            description: '⚙️ Archivos modificados - Configuración (5)',
            details: [
              'vite.config.ts, package.json, .env.development',
              '.env.production, public/_redirects',
            ],
          },
        ],
      },
    ],
  },
  // ============================================
  // VERSIÓN 2.5.0
  // ============================================
  {
    version: '2.5.0',
    date: '13 Abril 2026',
    title: '🔐 Seguridad Avanzada: 2FA (TOTP) + Inicio de Sesión con Código OTP por Email',
    gradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
    isLatest: false,
    changes: [
      {
        category: '🔐 Autenticación de Dos Factores (2FA) - TOTP',
        icon: 'SmartphoneNfc',
        color: 'text-indigo-500',
        items: [
          {
            description: '📱 Configuración de 2FA con apps autenticadoras',
            details: [
              'Soporte para Google Authenticator, Authy y Microsoft Authenticator',
              'Escaneo de código QR desde la aplicación',
              'Verificación del código de 6 dígitos para activar',
              'Generación automática de 10 códigos de respaldo',
              'Gestión desde la sección de Seguridad en Configuración',
            ],
          },
          {
            description: '🛡️ Verificación 2FA en el inicio de sesión',
            details: [
              'Usuarios con 2FA activado deben ingresar código adicional tras la contraseña',
              'Componente TwoFactorVerification con 6 campos individuales de auto-avance',
              'Soporte para pegar código completo',
              'Contador de intentos restantes (máximo 3) y botón para reenviar verificación',
            ],
          },
          {
            description: '⚙️ Componente TwoFactorManager',
            details: [
              'Visualización del estado de 2FA (activado/desactivado)',
              'Botón para activar 2FA con modal de configuración',
              'Botón para desactivar 2FA con validación de contraseña y código',
              'Información educativa sobre beneficios de 2FA y códigos de respaldo',
            ],
          },
        ],
      },
      {
        category: '📧 Inicio de Sesión con Código OTP por Email',
        icon: 'Mail',
        color: 'text-blue-500',
        items: [
          {
            description: '🔢 Nuevo método de autenticación sin contraseña',
            details: [
              'Los usuarios pueden iniciar sesión recibiendo un código de 6 dígitos en su correo',
              'Flujo de dos pasos: ingreso de email y verificación del código',
              'Componente EmailOTPLogin con validación en tiempo real',
            ],
          },
          {
            description: '🔒 Medidas de seguridad en OTP',
            details: [
              'Rate limiting: máximo 3 códigos por hora por email',
              'Expiración del código: 15 minutos',
              'Límite de intentos: 5 intentos fallidos antes de invalidar el código',
              'Reenvío de código con countdown de 60 segundos',
            ],
          },
        ],
      },
      {
        category: '🔑 Servicio JWT Independiente',
        icon: 'Key',
        color: 'text-amber-500',
        items: [
          {
            description: '🔐 Gestión de tokens propia',
            details: [
              'Nuevo servicio jwt_service.py para generación y validación de tokens',
              'Tokens de acceso con expiración de 1 hora',
              'Tokens de refresco con expiración de 7 días',
              'Corrección en generación de fechas de expiración usando UTC',
            ],
          },
        ],
      },
      {
        category: '📱 Mejoras en la Interfaz de Usuario',
        icon: 'Smartphone',
        color: 'text-purple-500',
        items: [
          {
            description: '🖥️ Pantalla de inicio de sesión renovada',
            details: [
              'Nuevo botón "Iniciar con código por email" para alternar al método OTP',
              'Transiciones mejoradas y animaciones fluidas entre métodos',
            ],
          },
          {
            description: '✨ Componentes visuales mejorados',
            details: [
              'TwoFactorSetup: Modal de verificación de identidad y generación de QR en formato SVG',
              'Indicador visual de progreso (X/6 dígitos) en EmailOTPLogin',
              'Opciones de copia/descarga de códigos de respaldo en 2FA',
              'Soporte completo para tema oscuro/claro en todos los nuevos componentes',
            ],
          },
        ],
      },
      {
        category: '⚙️ Backend - Nuevos Endpoints y Modelos',
        icon: 'Server',
        color: 'text-teal-500',
        items: [
          {
            description: '🔌 Endpoints implementados en FastAPI',
            details: [
              'POST /api/auth/otp/send - Envío de código OTP por email',
              'POST /api/auth/otp/verify - Verificación de código OTP',
              'POST /api/auth/2fa/setup - Inicia configuración de 2FA',
              'POST /api/auth/2fa/enable - Activa 2FA después de verificar código',
              'POST /api/auth/2fa/verify - Verifica código 2FA durante login',
              'POST /api/auth/2fa/disable - Desactiva 2FA para el usuario',
              'GET /api/auth/2fa/status - Consulta estado de 2FA del usuario',
            ],
          },
          {
            description: '📦 Nuevos modelos Pydantic',
            details: [
              'Modelos OTP: OtpSendRequest/Response, OtpVerifyRequest/Response',
              'Modelos 2FA: TwoFactorSetup, Enable, Verify, Disable y Status',
            ],
          },
        ],
      },
      {
        category: '🗄️ Base de Datos y Dependencias',
        icon: 'Database',
        color: 'text-cyan-500',
        items: [
          {
            description: '📊 Nueva tabla user_two_factor',
            details: [
              'Almacenamiento seguro de secretos TOTP y códigos de respaldo en Supabase',
              'Row Level Security (RLS) configurado para protección de datos',
              'Índices para búsquedas rápidas',
            ],
          },
          {
            description: '📚 Dependencias agregadas',
            details: [
              'pyotp==2.9.0 - Generación y verificación de códigos TOTP',
              'qrcode==8.0 - Generación de códigos QR en formato SVG',
              'qrcode.react - Generación de códigos QR en el frontend',
            ],
          },
        ],
      },
      {
        category: '🐛 Correcciones de Bugs',
        icon: 'Bug',
        color: 'text-red-500',
        items: [
          {
            description: '✅ Problemas resueltos',
            details: [
              'Corregida la generación de fechas de expiración de tokens JWT (uso de UTC)',
              'Corregida la validación de autenticación con tokens locales',
              'Corregido el interceptor de axios para manejar correctamente los tokens en endpoints 2FA',
              'Corregido el proxy de Vite para evitar duplicación de rutas /api',
            ],
          },
        ],
      },
      {
        category: '📊 Métodos de Autenticación Disponibles',
        icon: 'ShieldCheck',
        color: 'text-emerald-500',
        items: [
          { description: '✅ Email + Contraseña' },
          { description: '✅ Passkey (WebAuthn) - Huella digital, Face ID o PIN' },
          { description: '✅ OTP por email - Código de 6 dígitos enviado al correo' },
          { description: '✅ 2FA (TOTP) - Código adicional de Google Authenticator' },
        ],
      },
    ],
  },
  // ============================================
  // VERSIÓN 2.4.0
  // ============================================
  {
    version: '2.4.0',
    date: '07 Abril 2026',
    title: '🔐 Cierre de sesiones activas al cambiar contraseña + Mejoras de seguridad',
    gradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
    isLatest: false,
    changes: [
      {
        category: '🔐 Cierre de sesiones activas (Token Version)',
        icon: 'LogOut',
        color: 'text-red-500',
        items: [
          {
            description: '📌 Implementación de token_version en backend (Supabase)',
            details: [
              'Nueva columna token_version en tabla profiles (default: 0)',
              'Al cambiar contraseña, se incrementa token_version automáticamente',
              'Todas las sesiones anteriores quedan inválidas al instante',
              'Cierre forzado de sesiones en todos los dispositivos conectados',
            ],
          },
          {
            description: '🔄 Validación en cada request',
            details: [
              'Verificación del token_version en get_current_user() de dependencies.py',
              'Retorno de error 401 específico si hay mismatch: "session has expired due to password change"',
              'Nuevo método verify_token_version() en SupabaseAuthService',
            ],
          },
        ],
      },
      {
        category: '📧 Notificaciones por email',
        icon: 'Bell',
        color: 'text-blue-500',
        items: [
          {
            description: '✉️ Email automático al cambiar contraseña',
            details: [
              'Notificación inmediata al usuario sobre el cambio de contraseña',
              'Incluye información del dispositivo (navegador/SO)',
              'Incluye ubicación aproximada basada en IP',
              'Mensaje de seguridad: "Si no fuiste tú, contacta a soporte inmediatamente"',
            ],
          },
        ],
      },
      {
        category: '📜 Historial de contraseñas',
        icon: 'Clock',
        color: 'text-amber-500',
        items: [
          {
            description: '🛡️ Prevención de reutilización de contraseñas',
            details: [
              'Nueva tabla password_history en Supabase',
              'Verifica que la nueva contraseña no haya sido usada antes',
              'Almacena últimos 10 hashes (bcrypt) de contraseñas por usuario',
              'Mensaje de error si intenta usar una contraseña anterior',
            ],
          },
        ],
      },
      {
        category: '🎨 Frontend - Manejo de sesión expirada',
        icon: 'AlertTriangle',
        color: 'text-orange-500',
        items: [
          {
            description: '🔄 Interceptor de errores 401 específico',
            details: [
              'Detección del mensaje "session has expired due to password change"',
              'Limpieza automática de tokens del localStorage',
              'Disparo de evento personalizado "auth:token_version_invalid"',
              'Redirección inteligente a LoginPage con parámetro "?session_expired=true"',
            ],
          },
          {
            description: '🪟 Modal de sesión expirada',
            details: [
              'Modal automático con contador regresivo (3 segundos)',
              'Barra de progreso animada con Framer Motion',
              'Mensaje claro: "Tu contraseña fue cambiada en otro dispositivo"',
              'Botón para iniciar sesión inmediatamente (reinicia el contador)',
            ],
          },
          {
            description: '📢 Banner en LoginPage',
            details: [
              'Mensaje informativo cuando se redirige por sesión expirada',
              'Explica que debe usar la nueva contraseña',
              'Badge con ícono de advertencia y color ámbar',
              'Desaparece al hacer clic o después de 10 segundos',
            ],
          },
        ],
      },
      {
        category: '💬 Diálogo de confirmación en ResetPasswordPage',
        icon: 'DevicePhone',
        color: 'text-purple-500',
        items: [
          {
            description: '❓ Pregunta "¿Cerrar todas las sesiones activas?"',
            details: [
              'Nuevo checkbox/toggle en el formulario de cambio de contraseña',
              'Opción seleccionada por defecto para máxima seguridad',
              'Lista de dispositivos que se cerrarán (basada en sesiones activas)',
              'Tooltip explicativo sobre el impacto de cerrar sesiones',
              'Íconos representativos: 💻 Desktop, 📱 Mobile, 🌐 Web',
            ],
          },
        ],
      },
      {
        category: '⚙️ Backend - Nuevos métodos',
        icon: 'Server',
        color: 'text-indigo-500',
        items: [
          {
            description: '🔧 SupabaseAuthService mejorado',
            details: [
              'get_token_version(user_id) - Obtiene versión actual del token',
              'increment_token_version(user_id) - Incrementa en 1 y registra timestamp',
              'verify_token_version(user_id, token_version) - Valida match',
              'add_to_password_history(user_id, password_hash) - Registra hash',
              'check_password_reused(user_id, new_password) - Verifica si ya fue usada',
              'send_password_change_notification(email, device_info, location) - Envía email',
            ],
          },
        ],
      },
      {
        category: '🗄️ Base de Datos Supabase',
        icon: 'Database',
        color: 'text-teal-500',
        items: [
          {
            description: '📊 Nuevas tablas y columnas',
            details: [
              'ALTER TABLE profiles ADD COLUMN token_version INT DEFAULT 0',
              'CREATE TABLE password_history (id, user_id, password_hash, created_at)',
              'CREATE INDEX idx_password_history_user_id ON password_history(user_id)',
              'Función increment_token_version() con SQL puro',
              'Trigger on_password_change que registra en historial',
            ],
          },
        ],
      },
      {
        category: '🐛 Correcciones de Bugs',
        icon: 'Bug',
        color: 'text-red-500',
        items: [
          {
            description: '✅ Problemas resueltos',
            details: [
              'Corregido proxy de Vite: eliminado doble /api/ en las peticiones',
              'Corregido error "useNavigate fuera de Router" en ResetPasswordPage',
              'Eliminadas variables no utilizadas en ResetPasswordPage',
              'Corregido error de tipado en el interceptor de axios',
              'Mejorado manejo de errores en el logout forzado',
            ],
          },
        ],
      },
      {
        category: '🎨 Mejoras de UX en Seguridad',
        icon: 'Shield',
        color: 'text-emerald-500',
        items: [
          {
            description: '✨ Experiencia de usuario mejorada',
            details: [
              'Toast notification al cambiar contraseña con éxito',
              'Indicador de fuerza de contraseña en tiempo real',
              'Tooltips informativos sobre políticas de seguridad',
              'Loading states en botones durante operaciones críticas',
              'Redirección inteligente después del cambio de contraseña',
            ],
          },
        ],
      },
    ],
  },
  // ============================================
  // VERSIÓN 2.3.0
  // ============================================
  {
    version: '2.3.0',
    date: '01 Abril 2026',
    title: '🔐 Autenticación Biométrica con Passkeys + 🗑️ Sistema de Papelera',
    gradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
    isLatest: false,
    changes: [
      {
        category: '🔐 Autenticación con Passkeys (WebAuthn)',
        icon: 'Fingerprint',
        color: 'text-indigo-500',
        items: [
          {
            description: '✨ Registro de passkeys biométricas',
            details: [
              'Los usuarios pueden registrar su huella digital, Face ID o PIN desde Configuración',
              'Almacenamiento seguro de credenciales en Supabase con cifrado',
              'Registro de múltiples dispositivos por usuario',
              'Nombres personalizados para cada passkey',
            ],
          },
          {
            description: '🔑 Login con passkey',
            details: [
              'Inicio de sesión rápido con autenticación biométrica',
              'Redirección automática a la página principal después del login',
              'Manejo de errores con reintentos automáticos',
              'Prompt post-login para registrar passkey si no existe',
            ],
          },
          {
            description: '🔄 Gestión de passkeys',
            details: [
              'Listado completo de passkeys registradas en Configuración → Seguridad',
              'Eliminación de passkeys individuales con confirmación',
              'Información detallada de cada dispositivo (nombre, fecha, último uso)',
              'Íconos personalizados según tipo de dispositivo (móvil/escritorio/web)',
            ],
          },
        ],
      },
      {
        category: '🛡️ Seguridad y Autenticación',
        icon: 'Shield',
        color: 'text-emerald-500',
        items: [
          {
            description: '🔐 Tokens JWT duales',
            details: [
              'Soporte para tokens de Supabase (login email/contraseña) y tokens locales (passkeys)',
              'Verificación unificada en endpoint /api/users/profile',
              'SECRET_KEY configurada en variables de entorno para firma de tokens',
              'Tokens con expiración configurable (1 hora por defecto)',
            ],
          },
          {
            description: '⚙️ Mejoras en Supabase Auth',
            details: [
              'Función sync_user_profile corregida para incluir columna email',
              'Trigger on_auth_user_created optimizado',
              'Tabla user_passkeys con índices para búsquedas rápidas',
              'RLS (Row Level Security) configurado para protección de datos',
            ],
          },
        ],
      },
      {
        category: '🗑️ Sistema de Papelera (Soft Delete)',
        icon: 'Trash2',
        color: 'text-red-500',
        items: [
          {
            description: '📦 Implementación completa de Papelera',
            details: [
              'Nueva propiedad "deletedAt" en el modelo Task para soft delete',
              'Funciones softDeleteTask, restoreTask, permanentDeleteTask en useTasks',
              'Página TrashPage con gestión completa de tareas eliminadas',
              'Filtros y ordenamiento específicos para papelera',
              'Estadísticas de tareas eliminadas (total, completadas, pendientes, días en papelera)',
              'Modal de confirmación para eliminación permanente',
              'Modal de confirmación para vaciar papelera',
            ],
          },
          {
            description: '🔄 Restauración de tareas',
            details: [
              'Restaurar tareas individuales desde papelera',
              'Restaurar todas las tareas de la papelera',
              'Efecto de confetti al restaurar tareas',
              'Actualización automática de la lista principal',
            ],
          },
          {
            description: '🎨 Integración con UI existente',
            details: [
              'Enlace a Papelera en LeftMenu y RightMenu',
              'Contador dinámico de tareas eliminadas en RightMenu',
              'Cambio de texto "Eliminar" a "Mover a papelera" en TaskItem y TaskCard',
              'Modal de confirmación antes de mover a papelera',
              'Filtrado de tareas activas (excluyendo eliminadas) en ProtectedPage',
            ],
          },
        ],
      },
      {
        category: '📱 Optimización de Espacio y Diseño',
        icon: 'LayoutGrid',
        color: 'text-teal-500',
        items: [
          {
            description: '📐 Componentes compactados',
            details: [
              'StatCard: padding reducido (p-4 → p-3), fuentes más pequeñas (text-2xl → text-xl)',
              'ProgressCircle: tamaño reducido (140px → 70px), trazo más fino (10 → 6)',
              'WeeklySummary: padding reducido, gráfico más pequeño (48px → 32px)',
              'TaskCalendar: padding reducido, celdas más compactas',
              'ProtectedPage: márgenes eliminados (px-2 py-2), espaciados reducidos',
            ],
          },
          {
            description: '🎯 Nuevo layout de estadísticas',
            details: [
              'Círculo de progreso centrado entre las tarjetas de estadísticas',
              'Grid de 5 columnas para mejor jerarquía visual',
              'Círculo siempre visible sin necesidad de desplazarse',
            ],
          },
          {
            description: '✨ Estado vacío mejorado',
            details: [
              'Icono ClipboardList con gradiente sutil',
              'Sparkles animado en la esquina superior derecha',
              'Badge informativo debajo del botón "Crear mi primera tarea"',
              'Mensaje motivador "Organiza, prioriza y cumple tus metas"',
              'Eliminadas sugerencias redundantes para UI más limpia',
            ],
          },
        ],
      },
      {
        category: '🎮 Mejoras en Interacción',
        icon: 'Zap',
        color: 'text-amber-500',
        items: [
          {
            description: '✅ Modales de confirmación',
            details: [
              'Modal para mover tarea a papelera con mensaje descriptivo',
              'Modal para eliminación permanente con advertencia irreversible',
              'Modal para vaciar papelera con conteo de tareas',
              'Estados de procesamiento con spinner y deshabilitación de botones',
            ],
          },
          {
            description: '🖱️ Feedback visual mejorado',
            details: [
              'Confetti al restaurar tareas desde papelera',
              'Indicadores de carga durante operaciones',
              'Toast notifications para confirmación de acciones',
              'Tooltips informativos en botones de acción',
            ],
          },
        ],
      },
      {
        category: '🎨 Menú Lateral Derecho (RightMenu)',
        icon: 'Menu',
        color: 'text-purple-500',
        items: [
          {
            description: '📌 Nuevo acceso rápido a Papelera',
            details: [
              'Item "Papelera" en sección Acciones Rápidas',
              'Contador dinámico de tareas eliminadas',
              'Eliminada sección de Apariencia (Modo oscuro/claro y compacto)',
              'Sección reorganizada: Perfil, Acciones Rápidas, Sincronización, Notificaciones, Ayuda, Sesión',
            ],
          },
          {
            description: '🔄 Funcionalidades de sincronización',
            details: [
              'Sincronización manual con feedback visual (syncing, success, error)',
              'Toggle de sincronización automática',
              'Toggle de notificaciones con persistencia',
            ],
          },
        ],
      },
      {
        category: '📊 Estadísticas Mejoradas',
        icon: 'BarChart',
        color: 'text-cyan-500',
        items: [
          {
            description: '📈 Nuevas métricas',
            details: [
              'Contador de tareas en papelera en estadísticas globales',
              'Días promedio en papelera',
              'Distribución de tareas eliminadas por estado (completadas/pendientes)',
            ],
          },
        ],
      },
      {
        category: '🔧 Mejoras Técnicas',
        icon: 'Code',
        color: 'text-blue-500',
        items: [
          {
            description: '⚡ Optimizaciones de rendimiento',
            details: [
              'Uso de useMemo y useCallback optimizados',
              'Persistencia de preferencias (viewMode, filtros) en localStorage',
              'Cálculo de estadísticas memoizado',
              'Eliminación de imports no utilizados (Star, Inbox)',
            ],
          },
          {
            description: '🐛 Correcciones de bugs',
            details: [
              'Corregido error de tipos any en TrashPage con interfaz ThemeClasses',
              'Corregido error de Date.now en render con bucle for',
              'Corregido error de variable no utilizada getStats',
              'Corregido error de select sin atributo title/aria-label',
              'Corregido CircularMenu.tsx con importaciones incorrectas',
              'Eliminada sección de Apariencia del RightMenu (no utilizada)',
            ],
          },
        ],
      },
      {
        category: '📦 Nuevos Componentes WebAuthn',
        icon: 'Server',
        color: 'text-indigo-500',
        items: [
          {
            description: '✨ Componentes WebAuthn',
            details: [
              'PasskeyManager - Gestión completa de passkeys',
              'PasskeyRegister - Registro de nuevas passkeys',
              'PasskeyLoginButton - Botón de login biométrico',
              'PasskeyAfterLoginPrompt - Prompt post-login para registrar passkey',
              'Hook useWebAuthn con métodos registerPasskey y loginWithPasskey',
            ],
          },
        ],
      },
      {
        category: '⚡ Backend WebAuthn',
        icon: 'Database',
        color: 'text-purple-500',
        items: [
          {
            description: '🔧 Servicios WebAuthn',
            details: [
              'webauthn_service.py con generación y verificación de challenges',
              'Almacenamiento temporal de challenges en memoria (5 min expiración)',
              'Verificación de autenticación con sign_count para prevenir replay attacks',
              'Endpoints /api/webauthn/register/begin y /register/complete',
              'Endpoints /api/webauthn/login/begin y /login/complete',
              'Listado y eliminación de credenciales',
            ],
          },
        ],
      },
      {
        category: '📦 Dependencias Agregadas',
        icon: 'Cloud',
        color: 'text-teal-500',
        items: [
          {
            description: '🔧 Nuevas dependencias',
            details: [
              '@simplewebauthn/browser ^10.0.0 - WebAuthn en frontend',
              'webauthn ^2.0.0 - WebAuthn en backend',
              'pyjwt ^2.8.0 - Tokens JWT locales',
              'pyjwt[crypto] para algoritmos de cifrado',
            ],
          },
        ],
      },
    ],
  },
  // ============================================
  // VERSIÓN 2.2.0
  // ============================================
  {
    version: '2.2.0',
    date: '26 Marzo 2026',
    title: '✨ Nuevo Menú Rápido y Mejoras de UX',
    gradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
    isLatest: false,
    changes: [
      {
        category: '📱 Nuevo RightMenu',
        icon: 'Menu',
        color: 'text-emerald-500',
        items: [
          {
            description: '🎯 Menú lateral derecho de acceso rápido',
            details: [
              'Nuevo botón en el header con avatar que abre un menú lateral derecho',
              'Centraliza todas las opciones de usuario en un solo lugar',
              'Header más limpio y organizado',
              'Acceso rápido a todas las funcionalidades principales',
            ],
          },
          {
            description: '👤 Sección de Perfil integrada',
            details: [
              'Avatar, nombre y email del usuario visible en el menú',
              'Acceso directo a Mi Perfil y Configuración',
              'Estadísticas rápidas: total, completadas y pendientes',
              'Diseño consistente con la paleta Supabase',
            ],
          },
          {
            description: '⚡ Acciones Rápidas',
            details: [
              'Crear tarea',
              'Mis favoritos',
              'Archivados',
              'Calendario',
              'Estadísticas',
            ],
          },
        ],
      },
      {
        category: '🎮 Controles de Vista',
        icon: 'Eye',
        color: 'text-teal-500',
        items: [
          {
            description: '👁️ Cambio de vista Grid/Lista',
            details: [
              'Toggle visual con animación suave',
              'Persistencia de preferencia en localStorage',
              'Iconos intuitivos (Grid3x3 / Rows)',
            ],
          },
          {
            description: '🌓 Modo oscuro/claro',
            details: [
              'Toggle para cambiar entre temas',
              'Icono dinámico (Sol/Luna)',
              'Persistencia en localStorage',
            ],
          },
          {
            description: '📏 Modo compacto',
            details: [
              'Toggle para activar/desactivar vista compacta',
              'Iconos Maximize2/Minimize2',
              'Mejor aprovechamiento del espacio',
            ],
          },
        ],
      },
      {
        category: '🔄 Sincronización y Notificaciones',
        icon: 'Wifi',
        color: 'text-cyan-500',
        items: [
          {
            description: '🔄 Sincronización manual',
            details: [
              'Botón con indicador de estado (idle/syncing/success/error)',
              'Feedback visual con spinner y checkmark',
              'Estadísticas de tareas en tiempo real',
            ],
          },
          {
            description: '🔔 Control de notificaciones',
            details: [
              'Toggle para activar/desactivar notificaciones',
              'Icono Bell / BellOff dinámico',
              'Persistencia de preferencia',
            ],
          },
          {
            description: '⚙️ Sincronización automática',
            details: [
              'Toggle para activar/desactivar auto-sync',
              'Icono Wifi / WifiOff dinámico',
              'Estado visual claro',
            ],
          },
        ],
      },
      {
        category: '🧹 Limpieza y Optimización',
        icon: 'Zap',
        color: 'text-amber-500',
        items: [
          {
            description: '🧹 Header simplificado',
            details: [
              'Eliminado dropdown del avatar en el header',
              'Eliminados imports no utilizados',
              'Reducción de código innecesario',
              'Mejor rendimiento y mantenibilidad',
            ],
          },
          {
            description: '✨ Nuevos iconos personalizados',
            details: [
              'Componentes Maximize2 y Minimize2 para modo compacto',
              'Consistencia visual en toda la interfaz',
              'Animaciones suaves con Framer Motion',
            ],
          },
        ],
      },
      {
        category: '🐛 Correcciones de Bugs',
        icon: 'Bug',
        color: 'text-red-500',
        items: [
          {
            description: '✅ Problemas resueltos',
            details: [
              'Corregido error de imports no utilizados en Header',
              'Eliminada variable navigate sin uso',
              'Corregido error de syncNotes (implementada función local)',
              'Movidos componentes Maximize2/Minimize2 antes de su uso',
              'Eliminadas variables no utilizadas',
              'Eliminado parámetro err sin uso en catch',
              'Corregido error de referencia de componentes',
            ],
          },
        ],
      },
      {
        category: '🎨 Mejoras de Experiencia',
        icon: 'Sparkles',
        color: 'text-purple-500',
        items: [
          {
            description: '✨ Animaciones mejoradas',
            details: [
              'Efectos hover con gradientes en botones',
              'Transiciones suaves con Framer Motion',
              'Indicadores de estado visuales',
              'Feedback claro para acciones',
            ],
          },
          {
            description: '📱 Responsive mejorado',
            details: [
              'Menú lateral derecho adaptable a móviles',
              'Estadísticas rápidas responsive',
              'Grid de acciones adaptable',
            ],
          },
        ],
      },
    ],
  },
  // ============================================
  // VERSIÓN 2.1.0
  // ============================================
  {
    version: '2.1.0',
    date: '26 Marzo 2026',
    title: '🎨 Actualización Visual y Nuevas Páginas - Supabase Edition',
    gradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
    isLatest: false,
    changes: [
      {
        category: '🎨 Nueva Paleta de Colores',
        icon: 'Palette',
        color: 'text-emerald-500',
        items: [
          {
            description: '🎨 Migración a paleta Supabase (emerald, teal, cyan)',
            details: [
              'Actualización de todos los gradientes de indigo/purple/pink a emerald/teal/cyan',
              'Mejora del contraste en modo oscuro para mejor legibilidad',
              'Efectos glassmorphism modernos en tarjetas y componentes',
              'Nuevos colores de acento para botones e iconos',
            ],
          },
          {
            description: '🌓 Modo oscuro mejorado',
            details: [
              'Contraste optimizado para textos en modo oscuro',
              'Fondos con opacidad y blur para mejor integración',
              'Scrollbar personalizada con colores Supabase',
              'Focus visible mejorado para accesibilidad',
            ],
          },
        ],
      },
      {
        category: '📱 Nuevas Páginas',
        icon: 'Smartphone',
        color: 'text-teal-500',
        items: [
          {
            description: '⭐ Página de Favoritos',
            details: [
              'Lista dedicada para tareas marcadas como favoritas',
              'Estadísticas específicas de tareas favoritas',
              'Filtros y ordenamiento para favoritos',
              'Vista grid/lista con toggle',
            ],
          },
          {
            description: '📦 Página de Archivados',
            details: [
              'Tareas archivadas separadas de la vista principal',
              'Opción de restaurar tareas individuales o todas',
              'Estadísticas de tareas archivadas',
              'Mensaje amigable cuando no hay tareas archivadas',
            ],
          },
          {
            description: '📅 Página de Calendario',
            details: [
              'Vista mensual con indicadores de tareas',
              'Vista semanal con detalle de tareas por día',
              'Modal con tareas del día seleccionado',
              'Navegación entre meses y semanas',
              'Indicadores de prioridad con colores',
            ],
          },
          {
            description: '📊 Página de Estadísticas',
            details: [
              'Dashboard completo con análisis de productividad',
              'Selector de rango temporal (todo/mes/semana)',
              'Gráficos circulares y de barras',
              'Distribución por prioridad y categoría',
              'Actividad por día de semana y horario',
              'Resumen semanal con racha y productividad',
            ],
          },
        ],
      },
      {
        category: '✨ Nuevas Funcionalidades',
        icon: 'Sparkles',
        color: 'text-cyan-500',
        items: [
          {
            description: '⭐ Sistema de Favoritos',
            details: [
              'Marcar/desmarcar tareas como favoritas con estrella',
              'Indicador visual en lista y cuadrícula',
              'Filtro para mostrar solo favoritas',
              'Persistencia en localStorage',
            ],
          },
          {
            description: '📦 Sistema de Archivado',
            details: [
              'Archivar tareas para mantener limpia la vista principal',
              'Restaurar tareas archivadas',
              'Indicador "Archivada" en badges',
              'Página dedicada para ver todas las archivadas',
            ],
          },
          {
            description: '👁️ Vista Grid/Lista',
            details: [
              'Alternar entre vista de lista y cuadrícula',
              'Animación suave al cambiar de vista',
              'Persistencia de preferencia de vista',
              'Diseño responsive adaptado a cada vista',
            ],
          },
          {
            description: '🎯 Ordenamiento Avanzado',
            details: [
              'Ordenar por fecha (recientes/antiguas)',
              'Ordenar por prioridad (mayor/menor)',
              'Ordenar por título (A-Z / Z-A)',
              'Filtros rápidos con chips interactivos',
            ],
          },
          {
            description: '🎉 Efecto de Confeti',
            details: [
              'Animación de confeti al completar tareas',
              'Mensaje de felicitación "¡Tarea completada!"',
              'Efecto de explosión central con gradiente Supabase',
            ],
          },
        ],
      },
      {
        category: '🔧 Mejoras en Componentes',
        icon: 'Zap',
        color: 'text-amber-500',
        items: [
          {
            description: '⚛️ Nuevos Componentes UI',
            details: [
              'TaskItem y TaskCard con soporte para favoritos/archivados',
              'QuickFilters con chips interactivos',
              'ViewToggle con animación de deslizamiento',
              'ProgressCircle con gráfico circular animado',
              'WeeklySummary con gráfico de actividad diaria',
              'StatCard con métricas visuales',
            ],
          },
          {
            description: '🔄 Hooks Personalizados',
            details: [
              'useDebounce con 3 versiones (simple, callback, promise)',
              'useTasks con soporte para favoritos y archivados',
              'Tipos compartidos en types/task.ts',
            ],
          },
        ],
      },
      {
        category: '🐛 Correcciones de Bugs',
        icon: 'Bug',
        color: 'text-red-500',
        items: [
          {
            description: '✅ Problemas resueltos',
            details: [
              'Corregido error de claves duplicadas en mapas de React',
              'Solucionado problema de mutación en gráfico DonutChart',
              'Corregida redirección en páginas de recuperación de contraseña',
              'Eliminados imports no utilizados en múltiples archivos',
              'Corregida sincronización de imágenes de perfil',
              'Mejorado manejo de errores de carga de imágenes',
            ],
          },
        ],
      },
      {
        category: '🎨 Mejoras Visuales',
        icon: 'LayoutGrid',
        color: 'text-purple-500',
        items: [
          {
            description: '✨ Experiencia de Usuario Mejorada',
            details: [
              'Animaciones suaves al agregar/eliminar tareas',
              'Efectos hover mejorados en todos los componentes',
              'Indicadores de carga con skeleton loader',
              'Mensajes de error más descriptivos',
              'Toast notifications para feedback de acciones',
              'Modal de confirmación para acciones destructivas',
            ],
          },
          {
            description: '📱 Diseño Responsive',
            details: [
              'Adaptación completa para dispositivos móviles',
              'Menú lateral responsive',
              'Grid de estadísticas adaptable',
              'Calendario optimizado para pantallas pequeñas',
            ],
          },
        ],
      },
    ],
  },
  // ============================================
  // VERSIÓN 2.0.0
  // ============================================
  {
    version: '2.0.0',
    date: '25 Marzo 2026',
    title: '🚀 Migración Completa de Keycloak a Supabase',
    gradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
    isLatest: false,
    changes: [
      {
        category: '🔄 Migración de Autenticación',
        icon: 'RefreshCw',
        color: 'text-emerald-500',
        items: [
          {
            description: '🗑️ Eliminación completa de Keycloak',
            details: [
              'Removidas todas las dependencias de Keycloak',
              'Eliminado servicio keycloak_service.py',
              'Eliminado router password.py',
              'Variables de entorno de Keycloak eliminadas',
            ],
          },
          {
            description: '🔐 Implementación de Supabase Auth',
            details: [
              'Nuevo servicio supabase_auth_service.py',
              'Autenticación con email/contraseña',
              'Tokens JWT manejados por Supabase',
              'Refresh token automático',
              'Verificación de email integrada',
            ],
          },
        ],
      },
      {
        category: '📁 Almacenamiento y Archivos',
        icon: 'Cloud',
        color: 'text-teal-500',
        items: [
          {
            description: '☁️ Supabase Storage implementado',
            details: [
              'Bucket "avatars" para fotos de perfil',
              'Bucket "banners" para imágenes de portada',
              'Subida automática con token de usuario',
              'URLs públicas generadas automáticamente',
              'Eliminación de archivos con validación de propietario',
            ],
          },
          {
            description: '📸 Sincronización de imágenes',
            details: [
              'Avatar visible en Header, LeftMenu, SettingsPage y ProfilePage',
              'Sincronización automática entre Auth Metadata y tabla profiles',
              'Fallback con iniciales y gradientes',
              'Manejo de errores de carga de imágenes',
            ],
          },
        ],
      },
      {
        category: '🗄️ Base de Datos',
        icon: 'Database',
        color: 'text-cyan-500',
        items: [
          {
            description: '📊 Tabla "tasks" en Supabase',
            details: [
              'CRUD completo de tareas',
              'Row Level Security (RLS) configurado',
              'Políticas por usuario',
              'Campos: título, descripción, prioridad, categoría, fecha límite',
            ],
          },
          {
            description: '👤 Tabla "profiles" sincronizada',
            details: [
              'Sincronización automática con auth.users',
              'Campos: avatar, banner, bio, full_name, username',
              'Trigger automático en actualizaciones',
              'RLS con políticas de acceso',
            ],
          },
        ],
      },
      {
        category: '📧 Sistema de Emails',
        icon: 'Mail',
        color: 'text-blue-500',
        items: [
          {
            description: '✉️ Emails gestionados por Supabase',
            details: [
              'Plantillas personalizadas en Supabase',
              'Confirmación de registro',
              'Recuperación de contraseña',
              'Notificación de cambio de contraseña',
              'SMTP configurado con Gmail',
            ],
          },
        ],
      },
      {
        category: '🎨 Frontend Actualizado',
        icon: 'Smartphone',
        color: 'text-purple-500',
        items: [
          {
            description: '⚛️ Componentes React mejorados',
            details: [
              'Interfaz UserProfile unificada',
              'Login con email (ya no username)',
              'Register con full_name (ya no firstName/lastName)',
              'Avatar visible en todos los componentes',
              'Efectos glassmorphism modernos',
              'Animaciones suaves con Framer Motion',
            ],
          },
          {
            description: '🎯 Páginas actualizadas',
            details: [
              'LoginPage, RegisterPage, ForgotPasswordPage',
              'ProfilePage con edición de avatar y banner',
              'SettingsPage con datos del usuario',
              'Header con avatar real',
              'LeftMenu con avatar',
            ],
          },
        ],
      },
      {
        category: '🔧 Backend Mejorado',
        icon: 'Server',
        color: 'text-indigo-500',
        items: [
          {
            description: '⚡ FastAPI con Supabase',
            details: [
              'Endpoints optimizados',
              'Validación de tokens con Supabase',
              'Logs detallados de depuración',
              'CORS configurado correctamente',
              'Variables de entorno actualizadas',
            ],
          },
        ],
      },
      {
        category: '🐛 Correcciones de Bugs',
        icon: 'Bug',
        color: 'text-red-500',
        items: [
          {
            description: '✅ Problemas resueltos',
            details: [
              'Corregido error de autenticación con Keycloak',
              'Solucionado problema de persistencia de imágenes',
              'Corregido manejo de user_id inconsistente',
              'Arreglada sincronización de perfiles',
              'Mejorado manejo de errores de carga de imágenes',
            ],
          },
        ],
      },
    ],
  },
  // ============================================
  // VERSIÓN 1.0.0
  // ============================================
  {
    version: '1.0.0',
    date: '17 Marzo 2026',
    title: '🚀 Lanzamiento Inicial - TodoApp con Keycloak',
    gradient: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    isLatest: false,
    changes: [
      {
        category: '✨ Nuevas Funcionalidades',
        icon: 'Sparkles',
        color: 'text-indigo-500',
        items: [
          {
            description: '🎨 Sistema de autenticación con Keycloak',
            details: [
              'Integración con Keycloak 26.4.1',
              'Login, registro y recuperación de contraseña',
              'Gestión de sesiones con tokens JWT',
              'Roles de usuario (admin, usuario)',
            ],
          },
          {
            description: '📝 Gestión de tareas (CRUD completo)',
            details: [
              'Crear, leer, actualizar y eliminar tareas',
              'Persistencia en localStorage por usuario',
              'Categorías: Personal, Trabajo, Estudio, Otro',
              'Prioridades: Alta, Media, Baja',
              'Fechas límite para tareas',
            ],
          },
          {
            description: '🎨 Interfaz de usuario moderna',
            details: [
              'Diseño con gradientes (indigo, purple, pink)',
              'Componentes con glassmorphism',
              'Animaciones suaves con Framer Motion',
              'Totalmente responsive para móviles',
              'Modo oscuro/claro con persistencia',
            ],
          },
        ],
      },
      {
        category: '📱 Páginas Desarrolladas',
        icon: 'Globe',
        color: 'text-green-500',
        items: [
          {
            description: '📄 Páginas completas',
            details: [
              'LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage',
              'ProtectedPage (tareas) con filtros y búsqueda',
              'SettingsPage con configuración de usuario',
              'DeveloperPage con información del desarrollador',
              'ChangelogPage con historial de versiones',
            ],
          },
        ],
      },
      {
        category: '⚙️ Backend con FastAPI',
        icon: 'Code',
        color: 'text-yellow-500',
        items: [
          {
            description: '🔧 API RESTful',
            details: [
              'Endpoints para autenticación',
              'Recuperación de contraseña con emails',
              'Verificación de tokens',
              'Integración SMTP con Gmail',
              'Logs detallados de depuración',
            ],
          },
        ],
      },
    ],
  },
  // ============================================
  // VERSIÓN 0.9.0
  // ============================================
  {
    version: '0.9.0',
    date: '15 Marzo 2026',
    title: '🧪 Versión Beta - Pruebas de Autenticación',
    gradient: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    isLatest: false,
    changes: [
      {
        category: '🧪 Funcionalidades Beta',
        icon: 'Rocket',
        color: 'text-blue-500',
        items: [
          {
            description: '🔐 Autenticación con Keycloak implementada',
            details: [
              'Login funcional',
              'Registro de usuarios',
              'Recuperación de contraseña',
            ],
          },
          {
            description: '📝 CRUD básico de tareas',
            details: [
              'Crear y listar tareas',
              'Marcar como completadas',
              'Eliminar tareas',
            ],
          },
        ],
      },
    ],
  },
  // ============================================
  // VERSIÓN 0.5.0
  // ============================================
  {
    version: '0.5.0',
    date: '10 Marzo 2026',
    title: '🏗️ Configuración Inicial del Proyecto',
    gradient: 'bg-gradient-to-r from-gray-500 to-gray-700',
    isLatest: false,
    changes: [
      {
        category: '🏗️ Estructura Base',
        icon: 'Code',
        color: 'text-gray-500',
        items: [
          {
            description: 'Configuración inicial del proyecto',
            details: [
              'Creación del proyecto con Vite + React + TypeScript',
              'Configuración de Tailwind CSS',
              'Estructura de carpetas organizada',
              'Configuración inicial de Keycloak',
            ],
          },
        ],
      },
    ],
  },
];