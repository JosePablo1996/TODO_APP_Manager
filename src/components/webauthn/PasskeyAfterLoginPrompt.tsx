// src/components/webauthn/PasskeyAfterLoginPrompt.tsx
import React, { useState, useEffect } from 'react';
import { Fingerprint, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PasskeyAfterLoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => Promise<{ success: boolean; message?: string }>;
  userName: string;
  userEmail?: string;
}

export const PasskeyAfterLoginPrompt: React.FC<PasskeyAfterLoginPromptProps> = ({
  isOpen,
  onClose,
  onRegister,
  userName,
  userEmail,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  // ✅ Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setIsRegistering(false);
      setShowRetry(false);
      setRetryCount(0);
    }
  }, [isOpen]);

  // ✅ Cerrar automáticamente después de éxito
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const handleRegister = async () => {
    setIsRegistering(true);
    setError(null);
    setShowRetry(false);
    
    try {
      console.log('🔑 Iniciando registro de passkey desde AfterLoginPrompt...');
      const result = await onRegister();
      
      if (result.success) {
        console.log('✅ Passkey registrada exitosamente desde AfterLoginPrompt');
        setSuccess(true);
      } else {
        console.error('❌ Error en registro desde AfterLoginPrompt:', result.message);
        setError(result.message || 'Error al registrar la passkey');
        
        // ✅ Mostrar opción de reintentar si es un error recuperable
        if (result.message?.includes('sesión') || 
            result.message?.includes('timeout') ||
            result.message?.includes('intenta nuevamente')) {
          setShowRetry(true);
        }
      }
    } catch (err: unknown) {
      console.error('❌ Error inesperado en registro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar la passkey';
      setError(errorMessage);
      
      // ✅ Mostrar opción de reintentar
      if (errorMessage.includes('sesión') || errorMessage.includes('timeout')) {
        setShowRetry(true);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await handleRegister();
  };

  const handleSkip = () => {
    console.log('👋 Usuario omitió registro de passkey');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mejorar tu seguridad
            </h3>
          </div>
          <button
            onClick={handleSkip}
            disabled={isRegistering}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-up">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-green-600 dark:text-green-400 font-medium">
                ¡Passkey registrada exitosamente!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Ahora puedes iniciar sesión con huella digital o Face ID
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Fingerprint className="w-10 h-10 text-indigo-500" />
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Hola <strong className="text-indigo-600 dark:text-indigo-400">{userName}</strong>, ¿quieres mejorar la seguridad de tu cuenta?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Regístrate con passkey para iniciar sesión de forma rápida y segura usando tu huella digital, Face ID o PIN.
                </p>
                {userEmail && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Email: {userEmail}
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm animate-shake">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="block">{error}</span>
                      {showRetry && (
                        <button
                          onClick={handleRetry}
                          disabled={isRegistering}
                          className="mt-2 text-xs text-red-700 dark:text-red-400 hover:text-red-900 underline flex items-center gap-1"
                        >
                          <Loader2 className="w-3 h-3" />
                          Reintentar
                          {retryCount > 0 && ` (${retryCount})`}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-700 dark:text-red-400 hover:text-red-900"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ Consejos de seguridad */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Las passkeys son más seguras que las contraseñas. Se almacenan en tu dispositivo
                    y nunca salen de él, protegiéndote contra phishing y filtraciones de datos.
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  disabled={isRegistering}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  Ahora no
                </button>
                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4" />
                      Registrar passkey
                    </>
                  )}
                </button>
              </div>

              {/* ✅ Información adicional */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  🔒 Tus datos están protegidos. Puedes registrar múltiples passkeys para diferentes dispositivos.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasskeyAfterLoginPrompt;