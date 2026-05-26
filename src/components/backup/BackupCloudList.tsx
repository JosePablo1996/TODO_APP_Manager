// src/components/backup/BackupCloudList.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Trash2, Download, Calendar, HardDrive, RefreshCw } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { CloudBackupMetadata } from '../../types/backup';

interface BackupCloudListProps {
  backups: CloudBackupMetadata[];
  onDelete: (id: string) => void;
  onRestore: (backup: CloudBackupMetadata) => void;
  isDeleting: string | null;
  isRestoring: string | null;
}

export const BackupCloudList: React.FC<BackupCloudListProps> = ({
  backups,
  onDelete,
  onRestore,
  isDeleting,
  isRestoring,
}) => {
  const classes = useThemeClasses();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  if (backups.length === 0) {
    return (
      <div className={`text-center py-8 ${classes.bg.card} rounded-xl border ${classes.border.primary}`}>
        <Cloud size={40} className={`mx-auto mb-3 ${classes.icon.secondary} opacity-50`} />
        <p className={`text-sm ${classes.text.secondary}`}>No hay backups en la nube</p>
        <p className={`text-xs ${classes.text.muted} mt-1`}>
          Guarda tu primer backup en la nube para tener tus tareas seguras
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border overflow-hidden ${classes.bg.card} ${classes.border.primary}`}>
      {/* Header */}
      <div className={`p-3 border-b ${classes.border.primary}`}>
        <div className="flex items-center gap-2">
          <Cloud size={14} className="text-cyan-500" />
          <span className={`text-xs font-medium ${classes.text.muted}`}>
            BACKUPS EN LA NUBE ({backups.length})
          </span>
        </div>
      </div>

      {/* Lista de backups */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {backups.map((backup, index) => {
          const isExpanded = expandedId === backup.id;

          return (
            <motion.div
              key={backup.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Icono */}
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Cloud size={16} className="text-cyan-500" />
                </div>

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${classes.text.primary}`}>
                    {backup.file_name}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className={`flex items-center gap-1 ${classes.text.muted}`}>
                      <Calendar size={10} />
                      {formatDate(backup.created_at)}
                    </span>
                    <span className={`flex items-center gap-1 ${classes.text.muted}`}>
                      <HardDrive size={10} />
                      {backup.note_count} tareas
                    </span>
                    <span className={`flex items-center gap-1 ${classes.text.muted}`}>
                      <HardDrive size={10} />
                      {formatFileSize(backup.file_size)}
                    </span>
                  </div>
                  {backup.device_name && (
                    <p className={`text-[10px] ${classes.text.muted} mt-0.5`}>
                      📱 {backup.device_name} · v{backup.app_version}
                    </p>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-1">
                  <button
                    onClick={() => onRestore(backup)}
                    disabled={isRestoring === backup.id}
                    className="p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                    title="Restaurar desde este backup"
                    aria-label="Restaurar backup"
                  >
                    {isRestoring === backup.id ? (
                      <RefreshCw size={14} className="animate-spin text-emerald-500" />
                    ) : (
                      <Download size={14} className="text-emerald-500" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(backup.id)}
                    disabled={isDeleting === backup.id}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    title="Eliminar backup"
                    aria-label="Eliminar backup"
                  >
                    {isDeleting === backup.id ? (
                      <RefreshCw size={14} className="animate-spin text-red-500" />
                    ) : (
                      <Trash2 size={14} className="text-red-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : backup.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label={isExpanded ? 'Mostrar menos' : 'Mostrar más'}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Detalles expandidos */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pl-11"
                  >
                    <div className={`p-3 rounded-lg ${classes.bg.secondary} text-xs space-y-1`}>
                      <p className={classes.text.primary}>
                        <span className="font-medium">ID:</span> {backup.id}
                      </p>
                      <p className={classes.text.primary}>
                        <span className="font-medium">Tipo:</span>{' '}
                        {backup.backup_type === 'automatic' ? 'Automático' : 'Manual'}
                      </p>
                      <p className={classes.text.primary}>
                        <span className="font-medium">Tamaño:</span> {formatFileSize(backup.file_size)}
                      </p>
                      <p className={classes.text.primary}>
                        <span className="font-medium">Tareas:</span> {backup.note_count}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer informativo */}
      <div className={`p-3 border-t ${classes.border.primary} bg-cyan-500/5`}>
        <p className={`text-[10px] ${classes.text.muted} flex items-center gap-1`}>
          <span>🔒</span>
          Tus backups están seguros con Row Level Security. Solo tú puedes acceder a ellos.
          Se preservan todos los estilos: forma, icono, tamaño e intensidad de color.
        </p>
      </div>
    </div>
  );
};

export default BackupCloudList;