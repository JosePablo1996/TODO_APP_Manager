// src/pages/BackupPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trash2, ArrowLeft } from 'lucide-react';

// Componentes
import BackupBanner from '../components/backup/BackupBanner';
import BackupStats from '../components/backup/BackupStats';
import BackupTabs from '../components/backup/BackupTabs';
import BackupLocalList from '../components/backup/BackupLocalList';
import BackupCloudList from '../components/backup/BackupCloudList';
import BackupAutoSchedule from '../components/backup/BackupAutoSchedule';
import BackupSyncManual from '../components/backup/BackupSyncManual';
import BackupSelective from '../components/backup/BackupSelective';

// Hooks
import { useBackupData } from '../hooks/useBackupData';
import { useBackupOperations } from '../hooks/useBackupOperations';
import { useCloudBackupOperations, RestoreMode } from '../hooks/useCloudBackupOperations';
import { useLocalBackupOperations } from '../hooks/useLocalBackupOperations';
import backupService from '../services/backupService';

// Tipos
import type { CloudBackupMetadata } from '../types/backup';

// Componente modal de opciones de restauración (integrado directamente)
interface RestoreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: RestoreMode) => void;
  backupName: string;
  backupDate: string;
  backupTaskCount: number;
  currentTaskCount: number;
}

const RestoreOptionsModal: React.FC<RestoreOptionsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  backupName,
  backupDate,
  backupTaskCount,
  currentTaskCount,
}) => {
  const classes = useThemeClasses();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={`max-w-md w-full rounded-2xl shadow-2xl overflow-hidden ${classes.bg.card} border ${classes.border.primary}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            Restaurar Backup
          </h3>
          <p className="text-emerald-100 text-sm mt-1">Elige cómo quieres restaurar las tareas</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Información del backup */}
          <div className={`p-3 rounded-lg ${classes.bg.hover} border ${classes.border.primary}`}>
            <div className="flex items-center justify-between text-sm">
              <span className={classes.text.secondary}>Backup:</span>
              <span className={`font-mono text-xs ${classes.text.primary} truncate ml-2`}>{backupName}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className={classes.text.secondary}>Fecha:</span>
              <span className={classes.text.primary}>{backupDate}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className={classes.text.secondary}>Tareas en backup:</span>
              <span className="font-bold text-emerald-500">{backupTaskCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className={classes.text.secondary}>Tareas actuales:</span>
              <span className="font-bold text-blue-500">{currentTaskCount}</span>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            {/* Opción 1: Reemplazar */}
            <button
              onClick={() => onConfirm('replace')}
              className="w-full p-4 rounded-xl border-2 border-red-500/30 hover:border-red-500 transition-all group text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500 transition-colors">
                  <span className="text-xl">🔄</span>
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${classes.text.primary}`}>Reemplazar</h4>
                  <p className={`text-xs ${classes.text.secondary} mt-1`}>
                    Pierdes todas las tareas actuales. Solo quedarán las {backupTaskCount} tareas del backup.
                  </p>
                  <p className="text-xs text-red-500 mt-2 font-semibold">
                    ⚠️ ¡Las tareas actuales se eliminarán permanentemente!
                  </p>
                </div>
              </div>
            </button>

            {/* Opción 2: Fusionar */}
            <button
              onClick={() => onConfirm('merge')}
              className="w-full p-4 rounded-xl border-2 border-emerald-500/30 hover:border-emerald-500 transition-all group text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500 transition-colors">
                  <span className="text-xl">🔀</span>
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${classes.text.primary}`}>Fusionar (Mantener ambas)</h4>
                  <p className={`text-xs ${classes.text.secondary} mt-1`}>
                    Conservas TUS {currentTaskCount} tareas actuales + agregas las {backupTaskCount} del backup.
                  </p>
                  <p className="text-xs text-emerald-500 mt-2">
                    ✅ Total final: {currentTaskCount + backupTaskCount} tareas
                  </p>
                </div>
              </div>
            </button>

            {/* Opción 3: Solo agregar nuevas */}
            <button
              onClick={() => onConfirm('add-new')}
              className="w-full p-4 rounded-xl border-2 border-blue-500/30 hover:border-blue-500 transition-all group text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <span className="text-xl">✨</span>
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${classes.text.primary}`}>Solo agregar nuevas</h4>
                  <p className={`text-xs ${classes.text.secondary} mt-1`}>
                    Conservas tus tareas actuales + solo agregas tareas del backup que NO existen (evita duplicados por ID).
                  </p>
                  <p className="text-xs text-blue-500 mt-2">
                    ✨ Solo se agregarán tareas nuevas, sin duplicados
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${classes.border.primary} flex gap-3`}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BackupPage: React.FC = () => {
  const navigate = useNavigate();
  const classes = useThemeClasses();
  const [activeTab, setActiveTab] = useState<'general' | 'locals' | 'cloud'>('general');
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);
  const [pendingRestoreBackup, setPendingRestoreBackup] = useState<CloudBackupMetadata | null>(null);
  
  // Estados de modales
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [modalTaskCount, setModalTaskCount] = useState(0);
  const [modalFileName, setModalFileName] = useState('');
  const [modalImportedCount, setModalImportedCount] = useState(0);
  // modalTotalCount se usa en el modal pero no es necesario como estado separado

  // Data hook
  const {
    taskCount,
    pendingCount,
    completedCount,
    cloudBackups,
    localBackups,
    cloudStats,
    backupContents,
    pendingUploads,
    loadAllData,
    loadLocalBackups,
  } = useBackupData();

  // Operaciones generales
  const {
    isExporting,
    isImporting,
    isSyncing,
    exportBackup,
    importBackup,
    syncBackups,
  } = useBackupOperations({
    onRefreshData: loadAllData,
    onProgress: (show, text, percent) => {
      setShowProgressModal(show);
      setProgressText(text);
      setProgressPercent(percent);
    },
    onExportSuccess: (count, fileName) => {
      setModalTaskCount(count);
      setModalFileName(fileName);
      setShowSuccessModal(true);
    },
    onImportSuccess: (imported) => {
      setModalImportedCount(imported);
      setShowRestoreModal(true);
    },
  });

  // Operaciones cloud
  const {
    isDeleting,
    isRestoring,
    deleteCloudBackup,
    restoreCloudBackup,
  } = useCloudBackupOperations({
    onProgress: (show, text, percent) => {
      setShowProgressModal(show);
      setProgressText(text);
      setProgressPercent(percent);
    },
    onRestoreComplete: (imported, total, mode) => {
      setModalImportedCount(imported);
      setModalFileName(mode);
      setShowRestoreModal(true);
    },
    onRefreshData: loadAllData,
  });

  // Operaciones locales
  const {
    selectedLocalIds,
    isUploading,
    isDeletingLocal,
    uploadSelected,
    deleteLocalBackup,
    selectLocal,
    selectAllLocal,
  } = useLocalBackupOperations({
    localBackups,
    backupContents,
    onRefreshData: async () => {
      await loadAllData();
      loadLocalBackups();
    },
    onProgress: (show, text, percent) => {
      setShowProgressModal(show);
      setProgressText(text);
      setProgressPercent(percent);
    },
    onUploadComplete: (count) => {
      setModalTaskCount(count);
      setModalFileName(`${count} backup(s) subidos a la nube`);
      setShowSuccessModal(true);
    },
  });

  // Handlers
  const handleRestoreClick = (backup: CloudBackupMetadata) => {
    setPendingRestoreBackup(backup);
    setShowRestoreOptions(true);
  };

  const handleRestoreConfirm = async (mode: RestoreMode) => {
    setShowRestoreOptions(false);
    if (pendingRestoreBackup) {
      await restoreCloudBackup(pendingRestoreBackup, mode);
    }
  };

  const handleClearHistory = () => {
    backupService.clearLocalBackupHistory();
    loadLocalBackups();
    setShowDangerModal(false);
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <div className={`min-h-screen ${classes.bg.primary}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${classes.border.primary} ${classes.bg.card}`}>
        <div className="max-w-6xl mx-auto px-2 sm:px-3 py-2 sm:py-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/settings')}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors ${classes.bg.hover}`}
            >
              <ArrowLeft className={`w-5 h-5 sm:w-6 sm:h-6 ${classes.icon.secondary}`} />
            </motion.button>
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
              <h1 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
                Copia de Seguridad
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-2 sm:px-3 py-2 sm:py-4 space-y-3 sm:space-y-4">
        <BackupBanner appVersion="2.6.0" />
        <BackupTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'general' && (
          <>
            <BackupStats
              taskCount={taskCount}
              pendingCount={pendingCount}
              completedCount={completedCount}
              totalBackups={cloudStats.total_backups}
              maxBackups={20}
              totalSizeMB={cloudStats.total_size_mb}
            />
            <BackupAutoSchedule />
            <BackupSyncManual
              onSync={syncBackups}
              isSyncing={isSyncing}
              pendingCount={pendingUploads}
            />
            <BackupSelective
              backups={cloudBackups}
              onUploadSelected={async () => {}}
              isUploading={isUploading}
            />
            
            {/* Zona de Peligro */}
            <div className="rounded-xl border-2 border-red-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                  <Trash2 size={18} />
                  Zona de Peligro
                </h3>
                <p className="text-red-100 text-xs mt-0.5">Estas acciones son irreversibles. Úsalas con precaución.</p>
              </div>
              <div className={`p-4 ${classes.bg.card}`}>
                <button
                  onClick={() => setShowDangerModal(true)}
                  className="w-full py-2.5 border-2 border-red-500 text-red-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all text-sm"
                >
                  <Trash2 size={16} />
                  Eliminar todo el historial
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'locals' && (
          <>
            <BackupLocalList
              backups={localBackups}
              selectedIds={Array.from(selectedLocalIds)}
              onSelect={selectLocal}
              onSelectAll={selectAllLocal}
              onUploadSelected={uploadSelected}
              onUploadAll={() => {
                selectAllLocal();
                uploadSelected();
              }}
              onDeleteLocal={deleteLocalBackup}
              isUploading={isUploading}
              isDeleting={isDeletingLocal}
            />
            <div className="flex gap-3">
              <button
                onClick={exportBackup}
                disabled={isExporting}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50"
              >
                {isExporting ? <RefreshCw size={18} className="animate-spin" /> : '📥'}
                {isExporting ? 'Exportando...' : 'Exportar Backup Manual'}
              </button>
              <button
                onClick={importBackup}
                disabled={isImporting}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
              >
                {isImporting ? <RefreshCw size={18} className="animate-spin" /> : '📤'}
                {isImporting ? 'Importando...' : 'Importar Backup Manual'}
              </button>
            </div>
          </>
        )}

        {activeTab === 'cloud' && (
          <>
            <BackupCloudList
              backups={cloudBackups}
              onDelete={deleteCloudBackup}
              onRestore={handleRestoreClick}
              isDeleting={isDeleting}
              isRestoring={isRestoring}
            />
            <button
              onClick={syncBackups}
              disabled={isSyncing}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : '☁️'}
              {isSyncing ? 'Sincronizando...' : 'Guardar Backup en la Nube'}
            </button>
          </>
        )}
      </div>

      {/* Modales */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <RefreshCw size={40} className="text-emerald-500 mx-auto animate-spin mb-4" />
                <h3 className="text-lg font-bold mb-2 dark:text-white">{progressText || 'Procesando...'}</h3>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-2xl font-bold text-emerald-500">{progressPercent}%</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-white">✅</span>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Backup Completado</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Se exportaron {modalTaskCount} tareas.</p>
              <p className="text-xs text-gray-400 mb-4">Archivo: {modalFileName}</p>
              <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold">
                Aceptar
              </button>
            </motion.div>
          </motion.div>
        )}

        {showRestoreModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-white">✅</span>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Restauración Completada</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Se importaron {modalImportedCount} tareas correctamente.</p>
              {modalFileName && <p className="text-xs text-gray-400 mb-4 break-all">Modo: {modalFileName}</p>}
              <button onClick={() => setShowRestoreModal(false)} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold">
                Aceptar
              </button>
            </motion.div>
          </motion.div>
        )}

        {showDangerModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-white">⚠️</span>
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">¿Estás seguro?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">Esta acción eliminará <strong>todo el historial de backups</strong>.</p>
                <p className="text-xs text-red-500 mb-4">Las tareas NO se eliminarán, solo los registros de copias realizadas.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDangerModal(false)} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                    Cancelar
                  </button>
                  <button onClick={handleClearHistory} className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all text-sm flex items-center justify-center gap-2">
                    <Trash2 size={16} /> Sí, eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Diálogo de opciones de restauración */}
        <RestoreOptionsModal
          isOpen={showRestoreOptions}
          onClose={() => {
            setShowRestoreOptions(false);
            setPendingRestoreBackup(null);
          }}
          onConfirm={handleRestoreConfirm}
          backupName={pendingRestoreBackup?.file_name || ''}
          backupDate={pendingRestoreBackup?.created_at ? new Date(pendingRestoreBackup.created_at).toLocaleString() : ''}
          backupTaskCount={pendingRestoreBackup?.note_count || 0}
          currentTaskCount={taskCount}
        />
      </AnimatePresence>
    </div>
  );
};

export default BackupPage;