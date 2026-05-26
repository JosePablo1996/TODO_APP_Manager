// src/pages/BackupPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeClasses } from '../hooks/useThemeClasses';
import taskService from '../services/taskService';
import backupService from '../services/backupService';
import BackupBanner from '../components/backup/BackupBanner';
import BackupStats from '../components/backup/BackupStats';
import BackupTabs from '../components/backup/BackupTabs';
import BackupLocalList from '../components/backup/BackupLocalList';
import BackupCloudList from '../components/backup/BackupCloudList';
import BackupAutoSchedule from '../components/backup/BackupAutoSchedule';
import BackupSyncManual from '../components/backup/BackupSyncManual';
import BackupSelective from '../components/backup/BackupSelective';
import {
  ArrowLeft,
  CloudUpload,
  Download,
  RefreshCw,
  HardDrive,
  Info,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TaskResponse } from '../services/taskService';
import type { 
  CloudBackupMetadata, 
  BackupData, 
  LocalBackup, 
  BackupHistoryEntry,
  CloudBackupCreateData 
} from '../types/backup';

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => {
  const classes = useThemeClasses();
  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
      <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${classes.text.secondary}`}>
        {icon}
        {title}
      </h2>
    </div>
  );
};

const GlassCard = ({ children }: { children: React.ReactNode }) => {
  const classes = useThemeClasses();
  return (
    <div className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden ${classes.bg.card} ${classes.border.primary} shadow-sm`}>
      {children}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const BackupPage: React.FC = () => {
  const navigate = useNavigate();
  const classes = useThemeClasses();

  // Estados
  const [activeTab, setActiveTab] = useState<'general' | 'locals' | 'cloud'>('general');
  const [taskCount, setTaskCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingLocal, setIsDeletingLocal] = useState<string | null>(null);
  const [cloudBackups, setCloudBackups] = useState<CloudBackupMetadata[]>([]);
  const [localBackups, setLocalBackups] = useState<LocalBackup[]>([]);
  const [selectedLocalIds, setSelectedLocalIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [cloudStats, setCloudStats] = useState({ total_backups: 0, total_size_mb: 0, remaining_slots: 20 });
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);

  // Almacenamiento de contenido de backups para subir
  const [backupContents, setBackupContents] = useState<Map<string, BackupData>>(new Map());

  // Modales
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [modalTaskCount, setModalTaskCount] = useState(0);
  const [modalFileName, setModalFileName] = useState('');
  const [modalImportedCount, setModalImportedCount] = useState(0);
  const [modalTotalCount, setModalTotalCount] = useState(0);

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  const loadTaskCount = async () => {
    try {
      const tasks = await taskService.getAllTasks();
      setTaskCount(tasks.length);
      setPendingCount(tasks.filter((t: TaskResponse) => !t.completed).length);
      setCompletedCount(tasks.filter((t: TaskResponse) => t.completed).length);
    } catch (error) {
      console.error('Error cargando tareas:', error);
    }
  };

  const loadCloudBackups = async () => {
    try {
      const backups = await backupService.getAllBackups();
      setCloudBackups(backups);
    } catch (error) {
      console.error('Error cargando backups cloud:', error);
    }
  };

  const loadLocalBackups = () => {
    const history = backupService.getLocalBackups();
    
    // Cargar contenidos de backups desde localStorage
    const contents = new Map<string, BackupData>();
    
    for (const entry of history) {
      let stored = localStorage.getItem(`todoapp_backup_${entry.fileName}`);
      
      // Si no se encuentra con el nombre exacto, buscar por timestamp
      if (!stored) {
        const timestampMatch = entry.fileName.match(/\d+/);
        if (timestampMatch) {
          const timestamp = timestampMatch[0];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(timestamp) && key.includes('todoapp_backup')) {
              stored = localStorage.getItem(key);
              console.log(`✅ Backup encontrado con clave alternativa: ${key}`);
              break;
            }
          }
        }
      }
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as BackupData;
          contents.set(entry.fileName, parsed);
          console.log(`✅ Contenido cargado para: ${entry.fileName}`);
        } catch (e) {
          console.error(`Error parseando backup ${entry.fileName}:`, e);
        }
      } else {
        console.warn(`⚠️ No se encontró contenido para: ${entry.fileName}`);
      }
    }
    
    setBackupContents(contents);
    
    const localBackupList: LocalBackup[] = history.map((entry: BackupHistoryEntry) => ({
      id: `local-${entry.timestamp}`,
      file_name: entry.fileName,
      file_size: 0,
      note_count: entry.taskCount,
      created_at: new Date(entry.timestamp).toISOString(),
      date: entry.date,
      taskCount: entry.taskCount,
      fileName: entry.fileName,
      timestamp: entry.timestamp,
    }));
    
    setLocalBackups(localBackupList);
  };

  const loadCloudStats = async () => {
    try {
      const stats = await backupService.getBackupStats();
      setCloudStats({
        total_backups: stats.total_backups,
        total_size_mb: stats.total_size_mb,
        remaining_slots: stats.remaining_slots,
      });
    } catch (error) {
      console.error('Error cargando estadísticas cloud:', error);
    }
  };

  // ============================================
  // ELIMINAR BACKUP LOCAL INDIVIDUAL
  // ============================================

  const handleDeleteLocalBackup = async (backup: LocalBackup) => {
    setIsDeletingLocal(backup.id);
    try {
      // 1. Eliminar el contenido de localStorage
      localStorage.removeItem(`todoapp_backup_${backup.fileName}`);
      
      // 2. Eliminar del historial
      const history = backupService.getLocalBackups();
      const newHistory = history.filter(h => h.fileName !== backup.fileName);
      localStorage.setItem('todoapp_backup_history', JSON.stringify(newHistory));
      
      // 3. Recargar la lista de backups locales
      loadLocalBackups();
      
      console.log(`✅ Backup local eliminado: ${backup.fileName}`);
    } catch (error) {
      console.error('Error eliminando backup local:', error);
    } finally {
      setIsDeletingLocal(null);
    }
  };

  // ============================================
  // SUBIR BACKUP A LA NUBE (LLAMADA REAL)
  // ============================================

  const uploadBackupToCloud = async (backup: LocalBackup): Promise<boolean> => {
    try {
      // Obtener el contenido del backup desde localStorage
      const backupContent = backupContents.get(backup.fileName);
      
      if (!backupContent) {
        console.error(`No se encontró contenido para el backup: ${backup.fileName}`);
        // Intentar cargar directamente desde localStorage como fallback
        const directStored = localStorage.getItem(`todoapp_backup_${backup.fileName}`);
        if (directStored) {
          const parsed = JSON.parse(directStored) as BackupData;
          backupContents.set(backup.fileName, parsed);
          return await uploadBackupToCloud(backup);
        }
        return false;
      }

      // Convertir BackupData a Record<string, unknown> para el tipo esperado
      const notesData: Record<string, unknown> = backupContent as unknown as Record<string, unknown>;

      const backupData: CloudBackupCreateData = {
        file_name: backup.fileName,
        file_size: JSON.stringify(backupContent).length,
        note_count: backup.taskCount,
        notes_data: notesData,
        backup_type: 'manual',
        device_name: 'Web Browser',
        app_version: '2.6.0'
      };

      const result = await backupService.saveBackup(backupData);
      
      if (result.id) {
        console.log(`✅ Backup ${backup.fileName} subido a la nube: ${result.id}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error subiendo backup ${backup.fileName}:`, error);
      return false;
    }
  };

  // Subir backups locales seleccionados a la nube
  const handleUploadSelected = async () => {
    const selectedBackups = localBackups.filter(b => selectedLocalIds.has(b.id));
    if (selectedBackups.length === 0) return;

    setIsUploading(true);
    setShowProgressModal(true);
    
    let uploaded = 0;
    let failed = 0;
    
    for (let i = 0; i < selectedBackups.length; i++) {
      const backup = selectedBackups[i];
      setProgressText(`Subiendo ${i + 1} de ${selectedBackups.length}: ${backup.fileName}`);
      setProgressPercent(Math.round(((i + 1) / selectedBackups.length) * 100));
      
      const success = await uploadBackupToCloud(backup);
      if (success) {
        uploaded++;
      } else {
        failed++;
      }
    }
    
    setShowProgressModal(false);
    setIsUploading(false);
    setSelectedLocalIds(new Set());
    await loadCloudBackups();
    await loadCloudStats();
    
    if (uploaded > 0) {
      setModalTaskCount(uploaded);
      setModalFileName(`${uploaded} backup(s) subidos a la nube`);
      setShowSuccessModal(true);
    }
    
    if (failed > 0) {
      console.warn(`⚠️ ${failed} backup(s) no pudieron subirse`);
    }
  };

  const handleUploadAll = () => {
    setSelectedLocalIds(new Set(localBackups.map(b => b.id)));
    handleUploadSelected();
  };

  // ============================================
  // MANEJADORES DE SELECCIÓN
  // ============================================

  const handleSelectLocal = (id: string) => {
    const newSet = new Set(selectedLocalIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLocalIds(newSet);
  };

  const handleSelectAllLocal = () => {
    if (selectedLocalIds.size === localBackups.length) {
      setSelectedLocalIds(new Set());
    } else {
      setSelectedLocalIds(new Set(localBackups.map(b => b.id)));
    }
  };

  // ============================================
  // MANEJADORES DE BACKUPS EN LA NUBE
  // ============================================

  const handleDeleteCloudBackup = async (id: string) => {
    setIsDeleting(id);
    try {
      await backupService.deleteBackup(id);
      await loadCloudBackups();
      await loadCloudStats();
    } catch (error) {
      console.error('Error eliminando backup:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRestoreCloudBackup = async (backup: CloudBackupMetadata) => {
    if (!confirm(`¿Restaurar tareas desde "${backup.file_name}"?\n\nSe reemplazarán tus tareas actuales.`)) return;

    setIsRestoring(backup.id);
    setShowProgressModal(true);
    setProgressText(`Restaurando ${backup.note_count} tareas...`);
    
    try {
      const fullBackup = await backupService.getBackup(backup.id);
      const notesData = fullBackup.notes_data as { tasks?: unknown[]; task_count?: number };
      const tasksToRestore = notesData.tasks;
      
      if (tasksToRestore && Array.isArray(tasksToRestore)) {
        // Simular progreso de restauración
        for (let i = 0; i <= tasksToRestore.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 10));
          setProgressPercent(Math.round((i / tasksToRestore.length) * 100));
        }
        
        setShowProgressModal(false);
        setModalImportedCount(tasksToRestore.length);
        setModalTotalCount(tasksToRestore.length);
        setShowRestoreModal(true);
        await loadTaskCount();
      } else {
        throw new Error('No se encontraron tareas en el backup');
      }
    } catch (error) {
      console.error('Error restaurando backup:', error);
      setShowProgressModal(false);
      alert('Error al restaurar el backup');
    } finally {
      setIsRestoring(null);
    }
  };

  // ============================================
  // SINCRONIZACIÓN MANUAL
  // ============================================

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const syncData = localBackups.map(b => ({
        id: b.id,
        file_name: b.file_name,
        file_size: b.file_size,
        note_count: b.note_count,
        created_at: b.created_at,
        source: 'local',
      }));
      const result = await backupService.syncBackups(syncData);
      setLastSyncDate(new Date().toLocaleString());
      
      if (result.cloud_backups_to_download.length > 0) {
        alert(`${result.cloud_backups_to_download.length} backups disponibles para descargar en la nube.`);
      }
      if (result.synced_count > 0) {
        alert(`${result.synced_count} backups pendientes de subir. Ve a la pestaña "Backups Locales" para subirlos.`);
      }
      await loadCloudBackups();
      await loadCloudStats();
    } catch (error) {
      console.error('Error en sincronización:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // ============================================
  // EXPORTAR BACKUP MANUAL (GUARDA EN LOCALSTORAGE)
  // ============================================

  const handleExportManual = async () => {
    setIsExporting(true);
    try {
      const tasks = await taskService.getAllTasks();
      if (tasks.length === 0) {
        alert('No hay tareas para exportar');
        return;
      }

      const backupData: BackupData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        app: 'TodoAppManager',
        app_version: '2.6.0',
        task_count: tasks.length,
        tasks: tasks.map((t: TaskResponse) => ({
          title: t.title,
          description: t.description || '',
          completed: t.completed,
          priority: t.priority,
          category: t.category,
          due_date: t.due_date || '',
          color: t.color || '',
          tags: t.tags || [],
        })),
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const timestamp = Date.now();
      const fileName = `todoapp_backup_${timestamp}.json`;

      // Guardar en localStorage para poder subirlo después
      localStorage.setItem(`todoapp_backup_${fileName}`, jsonString);

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      backupService.addLocalBackup(tasks.length, fileName);
      loadLocalBackups();

      setModalTaskCount(tasks.length);
      setModalFileName(fileName);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error exportando:', error);
      alert('Error al exportar tareas');
    } finally {
      setIsExporting(false);
    }
  };

  // ============================================
  // IMPORTAR BACKUP MANUAL
  // ============================================

  const handleImportManual = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text) as BackupData;

        if (!data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) {
          throw new Error('Formato inválido o sin tareas');
        }

        // Guardar también en localStorage
        localStorage.setItem(`todoapp_backup_${file.name}`, text);
        backupService.addLocalBackup(data.tasks.length, file.name);
        loadLocalBackups();

        setModalTotalCount(data.tasks.length);
        setShowProgressModal(true);
        
        // Simular importación
        for (let i = 0; i <= data.tasks.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 10));
          setProgressPercent(Math.round((i / data.tasks.length) * 100));
          setProgressText(`Importando ${i} de ${data.tasks.length} tareas...`);
        }

        setShowProgressModal(false);
        setModalImportedCount(data.tasks.length);
        setModalTotalCount(data.tasks.length);
        setShowRestoreModal(true);
        await loadTaskCount();
      } catch (error) {
        console.error('Error importando:', error);
        alert('Error al importar: Formato inválido');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  // ============================================
  // ZONA DE PELIGRO
  // ============================================

  const handleClearHistory = () => {
    backupService.clearLocalBackupHistory();
    loadLocalBackups();
    setShowDangerModal(false);
  };

  const handleResetCounter = () => {
    setShowResetModal(false);
  };

  // ============================================
  // CARGA INICIAL
  // ============================================

  useEffect(() => {
    loadTaskCount();
    loadCloudBackups();
    loadLocalBackups();
    loadCloudStats();
  }, []);

  const pendingUploads = localBackups.filter(b => !cloudBackups.some(cb => cb.file_name === b.file_name)).length;

  return (
    <div className={`min-h-screen ${classes.bg.primary}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${classes.border.primary} ${classes.bg.card}`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
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
                <HardDrive size={18} className="text-emerald-500" />
                Copia de Seguridad
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Banner decorativo */}
        <BackupBanner appVersion="2.6.0" />

        {/* Tabs */}
        <BackupTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Contenido según tab */}
        {activeTab === 'general' && (
          <div className="space-y-4">
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
              onSync={handleSync}
              isSyncing={isSyncing}
              pendingCount={pendingUploads}
              lastSync={lastSyncDate || undefined}
            />

            <BackupSelective
              backups={cloudBackups}
              onUploadSelected={async (ids) => {
                console.log('Subir backups seleccionados:', ids);
              }}
              isUploading={isUploading}
            />

            {/* Zona de Peligro */}
            <div className="rounded-xl border-2 border-red-500/30 overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 sm:px-6 py-3">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                  <AlertTriangle size={18} />
                  Zona de Peligro
                </h3>
                <p className="text-red-100 text-xs mt-0.5">Estas acciones son irreversibles. Úsalas con precaución.</p>
              </div>
              <div className={`p-4 sm:p-5 space-y-4 ${classes.bg.card}`}>
                <div className={`p-3 rounded-xl border border-red-500/20 bg-red-500/5`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Trash2 size={18} className="text-red-500" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${classes.text.primary}`}>Eliminar historial de backups</h4>
                      <p className={`text-xs ${classes.text.secondary}`}>
                        Se perderán todos los registros de copias de seguridad realizadas. Las tareas NO se eliminarán.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDangerModal(true)}
                    className="w-full py-2.5 border-2 border-red-500 text-red-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all text-sm"
                  >
                    <Trash2 size={16} />
                    Eliminar todo el historial
                  </button>
                </div>
              </div>
            </div>

            {/* Información */}
            <SectionHeader title="Información" icon={<Info size={14} />} />
            <GlassCard>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✅</span>
                  <span className={`text-xs sm:text-sm ${classes.text.secondary}`}>Formato JSON compatible</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✅</span>
                  <span className={`text-xs sm:text-sm ${classes.text.secondary}`}>Incluye título, contenido, color, etiquetas y más</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✅</span>
                  <span className={`text-xs sm:text-sm ${classes.text.secondary}`}>Las tareas importadas se agregan sin eliminar las existentes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠️</span>
                  <span className={`text-xs sm:text-sm ${classes.text.secondary}`}>Al restaurar desde la nube, las tareas actuales serán reemplazadas</span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'locals' && (
          <div className="space-y-4">
            <BackupLocalList
              backups={localBackups}
              selectedIds={Array.from(selectedLocalIds)}
              onSelect={handleSelectLocal}
              onSelectAll={handleSelectAllLocal}
              onUploadSelected={handleUploadSelected}
              onUploadAll={handleUploadAll}
              onDeleteLocal={handleDeleteLocalBackup}
              isUploading={isUploading}
              isDeleting={isDeletingLocal}
            />
            <div className="flex gap-3">
              <button
                onClick={handleExportManual}
                disabled={isExporting}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50"
              >
                {isExporting ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
                {isExporting ? 'Exportando...' : 'Exportar Backup Manual'}
              </button>
              <button
                onClick={handleImportManual}
                disabled={isImporting}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
              >
                {isImporting ? <RefreshCw size={18} className="animate-spin" /> : <CloudUpload size={18} />}
                {isImporting ? 'Importando...' : 'Importar Backup Manual'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'cloud' && (
          <div className="space-y-4">
            <BackupCloudList
              backups={cloudBackups}
              onDelete={handleDeleteCloudBackup}
              onRestore={handleRestoreCloudBackup}
              isDeleting={isDeleting}
              isRestoring={isRestoring}
            />
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <CloudUpload size={18} />}
              {isSyncing ? 'Sincronizando...' : 'Guardar Backup en la Nube'}
            </button>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* MODALES */}
      {/* ============================================ */}

      <AnimatePresence>
        {showProgressModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <RefreshCw size={40} className="text-emerald-500 mx-auto animate-spin mb-4" />
                <h3 className="text-lg font-bold mb-2 dark:text-white">{progressText || 'Procesando...'}</h3>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" animate={{ width: `${progressPercent}%` }} />
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
              <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold">Aceptar</button>
            </motion.div>
          </motion.div>
        )}

        {showRestoreModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
              {modalImportedCount < modalTotalCount ? (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl text-white">⚠️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Restauración Parcial</h3>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl text-white">✅</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Restauración Completada</h3>
                </>
              )}
              <p className="text-gray-500 dark:text-gray-400 mb-1">Se importaron {modalImportedCount} de {modalTotalCount} tareas.</p>
              {modalImportedCount < modalTotalCount && (
                <p className="text-xs text-orange-500 mb-4">{modalTotalCount - modalImportedCount} tareas no pudieron ser importadas.</p>
              )}
              <button onClick={() => setShowRestoreModal(false)} className={`w-full py-3 text-white rounded-xl font-semibold ${modalImportedCount < modalTotalCount ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'}`}>Aceptar</button>
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
                  <button onClick={() => setShowDangerModal(false)} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">Cancelar</button>
                  <button onClick={handleClearHistory} className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all text-sm flex items-center justify-center gap-2">
                    <Trash2 size={16} /> Sí, eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showResetModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-white">🔄</span>
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">¿Restablecer contador?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">El contador de "Última copia" volverá a cero. El historial se mantendrá.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowResetModal(false)} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">Cancelar</button>
                  <button onClick={handleResetCounter} className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all text-sm flex items-center justify-center gap-2">
                    <RefreshCw size={16} /> Restablecer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackupPage;