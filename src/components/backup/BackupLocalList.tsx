// src/components/backup/BackupLocalList.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, 
  CheckCircle, 
  FileJson, 
  Calendar, 
  HardDrive, 
  Trash2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { LocalBackup } from '../../types/backup';

interface BackupLocalListProps {
  backups: LocalBackup[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onUploadSelected: () => void;
  onUploadAll: () => void;
  onDeleteLocal?: (backup: LocalBackup) => void;
  isUploading: boolean;
  isDeleting?: string | null;
}

export const BackupLocalList: React.FC<BackupLocalListProps> = ({
  backups,
  selectedIds,
  onSelect,
  onSelectAll,
  onUploadSelected,
  onUploadAll,
  onDeleteLocal,
  isUploading,
  isDeleting,
}) => {
  const classes = useThemeClasses();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const allSelected = backups.length > 0 && selectedIds.length === backups.length;
  const hasSelected = selectedIds.length > 0;

  if (backups.length === 0) {
    return (
      <div className={`text-center py-8 ${classes.bg.card} rounded-xl border ${classes.border.primary}`}>
        <FileJson size={40} className={`mx-auto mb-3 ${classes.icon.secondary} opacity-50`} />
        <p className={`text-sm ${classes.text.secondary}`}>No hay backups locales registrados</p>
        <p className={`text-xs ${classes.text.muted} mt-1`}>
          Realiza tu primer backup para verlo aquí
        </p>
      </div>
    );
  }

  // Obtener el backup que se está confirmando para eliminar
  const backupToDelete = confirmDeleteId ? backups.find(b => b.id === confirmDeleteId) : null;

  return (
    <>
      <div className={`rounded-xl border overflow-hidden ${classes.bg.card} ${classes.border.primary}`}>
        {/* Header con selección */}
        <div className={`p-3 border-b ${classes.border.primary} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onSelectAll}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                allSelected
                  ? 'bg-emerald-500 border-emerald-500'
                  : `${classes.border.primary} ${classes.bg.input}`
              }`}
              aria-label={allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
            >
              {allSelected && <CheckCircle size={10} className="text-white" />}
            </button>
            <span className={`text-xs font-medium ${classes.text.muted}`}>
              {backups.length} backups locales
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onUploadAll}
              disabled={isUploading || backups.length === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              aria-label="Subir todos los backups"
            >
              <CloudUpload size={12} />
              Subir todos
            </button>
            {hasSelected && (
              <button
                onClick={onUploadSelected}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500 text-white hover:bg-cyan-600 transition-all flex items-center gap-1.5"
                aria-label={`Subir ${selectedIds.length} backup(s) seleccionado(s)`}
              >
                <CloudUpload size={12} />
                Subir {selectedIds.length}
              </button>
            )}
          </div>
        </div>

        {/* Lista de backups */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {backups.map((backup, index) => {
            const isSelected = selectedIds.includes(backup.id);
            const isExpanded = expandedId === backup.id;
            const isLatest = index === 0;
            const isDeletingThis = isDeleting === backup.id;

            return (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors ${
                  isSelected ? 'bg-emerald-500/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => onSelect(backup.id)}
                    className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500'
                        : `${classes.border.primary} ${classes.bg.input}`
                    }`}
                    aria-label={isSelected ? 'Deseleccionar backup' : 'Seleccionar backup'}
                  >
                    {isSelected && <CheckCircle size={10} className="text-white" />}
                  </button>

                  {/* Icono */}
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <FileJson size={16} className="text-emerald-500" />
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <p className={`text-sm font-medium truncate ${classes.text.primary}`}>
                        {backup.fileName}
                      </p>
                      {isLatest && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                          ÚLTIMO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className={`flex items-center gap-1 ${classes.text.muted}`}>
                        <Calendar size={10} />
                        {backup.date}
                      </span>
                      <span className={`flex items-center gap-1 ${classes.text.muted}`}>
                        <HardDrive size={10} />
                        {backup.taskCount} tareas
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-1">
                    {/* Botón eliminar individual */}
                    {onDeleteLocal && (
                      <button
                        onClick={() => setConfirmDeleteId(backup.id)}
                        disabled={isDeletingThis}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Eliminar backup local"
                        aria-label="Eliminar backup local"
                      >
                        {isDeletingThis ? (
                          <RefreshCw size={14} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={14} className="text-red-500" />
                        )}
                      </button>
                    )}
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
                      className="mt-3 pl-8"
                    >
                      <div className={`p-3 rounded-lg ${classes.bg.secondary} text-xs space-y-1`}>
                        <p className={classes.text.primary}>
                          <span className="font-medium">Nombre:</span> {backup.fileName}
                        </p>
                        <p className={classes.text.primary}>
                          <span className="font-medium">Tareas:</span> {backup.taskCount}
                        </p>
                        <p className={classes.text.primary}>
                          <span className="font-medium">Fecha:</span> {backup.date}
                        </p>
                        <button
                          onClick={() => {
                            // Seleccionar este backup y subirlo
                            if (!selectedIds.includes(backup.id)) {
                              onSelect(backup.id);
                            }
                            onUploadSelected();
                          }}
                          disabled={isUploading}
                          className="mt-2 w-full py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50"
                          aria-label="Subir este backup"
                        >
                          <CloudUpload size={12} />
                          Subir este backup
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Footer informativo */}
        <div className={`p-3 border-t ${classes.border.primary} bg-amber-500/5`}>
          <p className={`text-[10px] ${classes.text.muted} flex items-center gap-1`}>
            <span>💾</span>
            Los backups locales se almacenan en tu navegador y se descargan como archivos JSON.
            Son independientes de los backups en la nube.
          </p>
        </div>
      </div>

      {/* Modal de confirmación para eliminar backup local */}
      <AnimatePresence>
        {confirmDeleteId && backupToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">¿Eliminar backup?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">
                  Se eliminará este backup local del historial.
                </p>
                <p className="text-xs text-red-500 mb-4">
                  Las tareas NO se eliminarán, solo el registro del backup.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                    aria-label="Cancelar eliminación"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (onDeleteLocal) {
                        onDeleteLocal(backupToDelete);
                      }
                      setConfirmDeleteId(null);
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all text-sm flex items-center justify-center gap-2"
                    aria-label="Confirmar eliminación"
                  >
                    <Trash2 size={16} />
                    Sí, eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BackupLocalList;