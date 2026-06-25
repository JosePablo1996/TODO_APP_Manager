// src/components/security/SessionManager/SessionList.tsx

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useThemeClasses } from '../../../hooks/useThemeClasses';
import { SessionItem } from './index';
import type { Session } from '../../../types/session';
import { Smartphone, Loader2 } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  onRevoke: (sessionId: string) => void;
  revokingSessionId: string | null;
  loading: boolean;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  onRevoke,
  revokingSessionId,
  loading,
}) => {
  const classes = useThemeClasses();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className={`text-sm mt-3 ${classes.text.muted}`}>Cargando sesiones...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className={`text-center py-12 ${classes.bg.secondary} rounded-xl`}>
        <Smartphone className="w-12 h-12 mx-auto text-gray-400 opacity-50" />
        <p className={`text-sm mt-3 ${classes.text.secondary}`}>
          No hay sesiones activas
        </p>
        <p className={`text-xs mt-1 ${classes.text.muted}`}>
          Todas tus sesiones aparecerán aquí cuando inicies sesión en otros dispositivos
        </p>
      </div>
    );
  }

  // Separar sesión actual del resto
  const currentSession = sessions.find(s => s.is_current);
  const otherSessions = sessions.filter(s => !s.is_current);

  return (
    <div className="space-y-3">
      {/* Sesión actual (si existe) */}
      {currentSession && (
        <div className="space-y-2">
          <p className={`text-xs font-medium uppercase tracking-wider ${classes.text.muted}`}>
            Sesión actual
          </p>
          <SessionItem
            session={currentSession}
            onRevoke={onRevoke}
            isRevoking={revokingSessionId === currentSession.id}
          />
        </div>
      )}

      {/* Otras sesiones */}
      {otherSessions.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className={`text-xs font-medium uppercase tracking-wider ${classes.text.muted}`}>
            Otras sesiones ({otherSessions.length})
          </p>
          <AnimatePresence>
            {otherSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                onRevoke={onRevoke}
                isRevoking={revokingSessionId === session.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SessionList;