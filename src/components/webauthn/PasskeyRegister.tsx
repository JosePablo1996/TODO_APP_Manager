// src/components/webauthn/PasskeyRegister.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface PasskeyRegisterProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
  compact?: boolean;
}

export const PasskeyRegister: React.FC<PasskeyRegisterProps> = ({
  onSuccess,
  onCancel,
  className = '',
  compact = false,
}) => {
  const { registerPasskey, passkeyLoading, isAuthenticated, refreshTokenIfNeeded } = useAuth();
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // ✅ Verificar autenticación al montar el componente
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        console.log('⚠️ PasskeyRegister: Usuario no autenticado');
        setError('Debes iniciar sesión para registrar una passkey');
        return;
      }
      
      console.log('🔍 PasskeyRegister: Verificando token antes de mostrar formulario...');
      setIsCheckingAuth(true);
      
      try {
        const isValid = await refreshTokenIfNeeded();
        if (!isValid) {
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          console.log('✅ PasskeyRegister: Autenticación válida');
        }
      } catch (err) {
        console.error('❌ PasskeyRegister: Error verificando autenticación:', err);
        setError('Error al verificar tu sesión. Por favor, recarga la página.');
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    verifyAuth();
  }, [isAuthenticated, refreshTokenIfNeeded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Verificar autenticación antes de registrar
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para registrar una passkey');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsRegistering(true);
    
    console.log('🔑 Iniciando registro de passkey con deviceName:', deviceName || 'Sin nombre');
    
    try {
      const result = await registerPasskey(deviceName.trim() || undefined);
      
      if (result.success) {
        console.log('✅ Passkey registrada exitosamente:', result.message);
        setSuccess(result.message || 'Passkey registrada exitosamente');
        setDeviceName('');
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        console.error('❌ Error en registro de passkey:', result.message);
        setError(result.message || 'Error al registrar passkey');
      }
    } catch (err) {
      console.error('❌ Error inesperado en handleSubmit:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al registrar passkey';
      setError(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  // ✅ Función para reintentar si hay error de autenticación
  const handleRetry = async () => {
    setError(null);
    setIsCheckingAuth(true);
    
    try {
      const isValid = await refreshTokenIfNeeded();
      if (isValid) {
        console.log('✅ Token refrescado, puedes reintentar');
        setError(null);
      } else {
        setError('No se pudo renovar la sesión. Por favor, inicia sesión nuevamente.');
      }
    } catch (err) {
      console.error('❌ Error en retry:', err);
      setError('Error al verificar la sesión. Por favor, recarga la página.');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Versión compacta (solo botón)
  if (compact) {
    return (
      <div className={`passkey-register-compact ${className}`}>
        {/* ✅ Mostrar loading mientras se verifica autenticación */}
        {isCheckingAuth ? (
          <button
            disabled
            className="w-full px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verificando sesión...
          </button>
        ) : (
          <button
            onClick={() => {
              setError(null);
              setSuccess(null);
              handleSubmit({ preventDefault: () => {} } as React.FormEvent);
            }}
            disabled={passkeyLoading || isRegistering || !isAuthenticated}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            title={!isAuthenticated ? 'Inicia sesión primero' : 'Registrar passkey'}
          >
            {passkeyLoading || isRegistering ? (
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Passkey
              </>
            )}
          </button>
        )}
        
        {/* Mensajes para versión compacta */}
        {error && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs">
            <div className="flex items-start gap-2">
              <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        
        {success && (
          <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs">
            {success}
          </div>
        )}
        
        {!isAuthenticated && !error && (
          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Inicia sesión para registrar una passkey</span>
          </div>
        )}
      </div>
    );
  }

  // Versión completa con formulario
  return (
    <div className={`passkey-register ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-10V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Registrar nueva passkey
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Usa tu huella digital, reconocimiento facial o PIN para autenticarte
            </p>
          </div>
        </div>

        {/* ✅ Mostrar loading mientras se verifica autenticación */}
        {isCheckingAuth && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
            <svg className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verificando tu sesión...
            </p>
          </div>
        )}

        {/* ✅ Mostrar mensaje si no está autenticado */}
        {!isCheckingAuth && !isAuthenticated && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
              Necesitas iniciar sesión para registrar una passkey.
            </p>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        )}

        {/* ✅ Formulario de registro - solo si está autenticado */}
        {!isCheckingAuth && isAuthenticated && (
          <>
            {/* Mensajes de estado */}
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

            {success && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="flex-1">{success}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del dispositivo <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Ej: Mi iPhone, Laptop Personal, Tablet"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                  disabled={passkeyLoading || isRegistering}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Un nombre descriptivo para identificar fácilmente esta passkey
                </p>
              </div>

              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Al registrar una passkey, se te pedirá autenticarte con tu dispositivo 
                    (huella digital, reconocimiento facial o PIN). Esta información se almacena 
                    de forma segura y solo puede ser usada en este sitio.
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={passkeyLoading || isRegistering}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {passkeyLoading || isRegistering ? (
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
                
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={passkeyLoading || isRegistering}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* Información de compatibilidad */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Compatible con: Windows Hello, Face ID, Touch ID, Android biometrics, y más
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PasskeyRegister;