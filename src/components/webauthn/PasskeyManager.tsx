// src/components/webauthn/PasskeyManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { WebAuthnCredential } from '../../services/authService';

interface PasskeyManagerProps {
  className?: string;
}

export const PasskeyManager: React.FC<PasskeyManagerProps> = ({ className = '' }) => {
  const { 
    isAuthenticated, 
    listPasskeys, 
    deletePasskey, 
    registerPasskey, 
    passkeyLoading,
    refreshTokenIfNeeded 
  } = useAuth();
  
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // ✅ Verificar autenticación al cargar
  const verifyAuth = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('⚠️ PasskeyManager: Usuario no autenticado');
      setError('Debes iniciar sesión para gestionar tus passkeys');
      setLoading(false);
      return false;
    }
    
    setIsCheckingAuth(true);
    try {
      const isValid = await refreshTokenIfNeeded();
      if (!isValid) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return false;
      }
      return true;
    } catch (err) {
      console.error('❌ PasskeyManager: Error verificando autenticación:', err);
      setError('Error al verificar tu sesión. Por favor, recarga la página.');
      setLoading(false);
      return false;
    } finally {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, refreshTokenIfNeeded]);

  // ✅ Cargar lista de passkeys con verificación de token
  const loadCredentials = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Cargando lista de passkeys...');
      const creds = await listPasskeys();
      setCredentials(creds);
      console.log(`✅ ${creds.length} passkeys cargadas`);
    } catch (err) {
      console.error('❌ Error cargando passkeys:', err);
      const errorMessage = err instanceof Error ? err.message : 'No se pudieron cargar tus passkeys';
      setError(errorMessage);
      
      // Si el error es de autenticación, intentar refrescar
      if (errorMessage.includes('sesión') || errorMessage.includes('autenticación')) {
        const isValid = await verifyAuth();
        if (isValid) {
          // Reintentar carga después de refrescar token
          try {
            const creds = await listPasskeys();
            setCredentials(creds);
            setError(null);
          } catch (retryErr) {
            console.error('❌ Error reintentando carga:', retryErr);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, listPasskeys, verifyAuth]);

  // ✅ Escuchar cambios en passkeys y verificar autenticación periódicamente
  useEffect(() => {
    // ✅ CORREGIDO: Usar const en lugar de let
    const intervalId: NodeJS.Timeout = setInterval(async () => {
      if (isAuthenticated) {
        const isValid = await refreshTokenIfNeeded();
        if (!isValid) {
          setError('Tu sesión está por expirar. Por favor, inicia sesión nuevamente.');
        }
      }
    }, 5 * 60 * 1000); // 5 minutos
    
    const initialize = async () => {
      const isValid = await verifyAuth();
      if (isValid) {
        await loadCredentials();
      }
    };
    
    initialize();
    
    const handlePasskeysUpdated = () => {
      console.log('🔄 Passkeys actualizadas, recargando lista...');
      loadCredentials();
    };
    
    window.addEventListener('passkeys-updated', handlePasskeysUpdated);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('passkeys-updated', handlePasskeysUpdated);
    };
  }, [verifyAuth, loadCredentials, isAuthenticated, refreshTokenIfNeeded]);

  // ✅ Registrar nueva passkey
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Verificar autenticación antes de registrar
    const isValid = await verifyAuth();
    if (!isValid) return;
    
    const result = await registerPasskey(deviceName.trim() || undefined);
    
    if (result.success) {
      setSuccess(result.message || 'Passkey registrada exitosamente');
      setDeviceName('');
      setShowRegisterForm(false);
      await loadCredentials();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.message || 'Error al registrar passkey');
    }
  };

  // ✅ Eliminar passkey
  const handleDelete = async (credentialId: string, deviceName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la passkey "${deviceName || 'sin nombre'}"?`)) {
      return;
    }
    
    setDeletingId(credentialId);
    setError(null);
    setSuccess(null);
    
    // Verificar autenticación antes de eliminar
    const isValid = await verifyAuth();
    if (!isValid) {
      setDeletingId(null);
      return;
    }
    
    const result = await deletePasskey(credentialId);
    
    if (result.success) {
      setSuccess(result.message || 'Passkey eliminada exitosamente');
      await loadCredentials();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.message || 'Error al eliminar passkey');
    }
    
    setDeletingId(null);
  };

  // ✅ Reintentar carga
  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    const isValid = await verifyAuth();
    if (isValid) {
      await loadCredentials();
    } else {
      setLoading(false);
    }
  };

  // ✅ Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // ✅ Obtener icono según tipo de dispositivo
  const getDeviceIcon = (deviceType?: string) => {
    if (deviceType === 'mobile') {
      return (
        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (deviceType === 'desktop') {
      return (
        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9" />
        </svg>
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
          <svg className="w-12 h-12 mx-auto mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-10V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2h8z" />
          </svg>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
            Inicia sesión para gestionar tus passkeys
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Las passkeys te permiten iniciar sesión de forma rápida y segura usando tu huella digital, Face ID o PIN.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`passkey-manager ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Claves de acceso (Passkeys)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Usa tu huella digital, reconocimiento facial o PIN para iniciar sesión de forma segura
          </p>
        </div>
        {!showRegisterForm && !isCheckingAuth && (
          <button
            onClick={() => setShowRegisterForm(true)}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Passkey
          </button>
        )}
      </div>

      {/* Mensajes de éxito/error */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm animate-fade-in">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-700 dark:text-green-400 hover:text-green-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{error}</span>
            {error.includes('sesión') && (
              <button
                onClick={handleRetry}
                disabled={isCheckingAuth}
                className="text-red-700 dark:text-red-400 hover:text-red-900 text-xs underline ml-2"
              >
                Reintentar
              </button>
            )}
            <button
              onClick={() => setError(null)}
              className="text-red-700 dark:text-red-400 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Formulario de registro */}
      {showRegisterForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-slide-down">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Registrar nueva passkey
          </h4>
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del dispositivo <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Ej: Mi iPhone, Laptop Personal"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                disabled={passkeyLoading}
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Un nombre descriptivo para identificar esta passkey
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={passkeyLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {passkeyLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Registrar Passkey
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterForm(false);
                  setDeviceName('');
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de passkeys */}
      <div className="space-y-3">
        {isCheckingAuth && loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm text-gray-500">Verificando sesión...</p>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm text-gray-500">Cargando tus passkeys...</p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-10V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2h8z" />
            </svg>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              No tienes passkeys registradas
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Registra una passkey para iniciar sesión de forma rápida y segura
            </p>
            {!showRegisterForm && (
              <button
                onClick={() => setShowRegisterForm(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Registrar Passkey
              </button>
            )}
          </div>
        ) : (
          credentials.map((cred) => (
            <div
              key={cred.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start gap-3 flex-1">
                {/* Icono según tipo de dispositivo */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  {getDeviceIcon(cred.device_type)}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {cred.device_name || 'Dispositivo sin nombre'}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {cred.device_type && (
                      <span className="capitalize inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        {cred.device_type === 'mobile' ? 'Móvil' : cred.device_type === 'desktop' ? 'Escritorio' : 'Web'}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Creado: {formatDate(cred.created_at)}
                    </span>
                    {cred.last_used && (
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Último uso: {formatDate(cred.last_used)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(cred.credential_id, cred.device_name || '')}
                disabled={deletingId === cred.credential_id}
                className="mt-3 sm:mt-0 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                title="Eliminar passkey"
              >
                {deletingId === cred.credential_id ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            🔐 Las passkeys son más seguras que las contraseñas tradicionales. 
            Utilizan autenticación biométrica (huella digital, reconocimiento facial) 
            o un PIN para verificar tu identidad. Tus passkeys se sincronizan automáticamente 
            entre tus dispositivos Apple, Android o Windows.
          </span>
        </p>
      </div>
    </div>
  );
};

export default PasskeyManager;