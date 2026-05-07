// src/pages/BackupPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeClasses } from '../hooks/useThemeClasses';
import taskService, { TaskData, TaskResponse } from '../services/taskService';
import {
  ArrowLeft, CloudUpload, Download, Share2,
  FileUp, CheckCircle, AlertCircle, Info,
  RefreshCw, HardDrive, Upload, FileJson, Database,
  RotateCcw, Trash2, ShieldAlert, History, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// INTERFACES
// ============================================

interface BackupData {
  version: string;
  exported_at: string;
  app: string;
  app_version: string;
  task_count: number;
  tasks: TaskData[];
}

interface BackupHistoryEntry {
  date: string;
  taskCount: number;
  fileName: string;
  timestamp: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const BackupPage: React.FC = () => {
  const navigate = useNavigate();
  const classes = useThemeClasses();

  // Estados
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [lastBackupTaskCount, setLastBackupTaskCount] = useState<number | null>(null);
  const [taskCount, setTaskCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Estados para modales
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

  // ✅ NUEVO: Historial de backups
  const [backupHistory, setBackupHistory] = useState<BackupHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('todoapp_backup_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guardar historial en localStorage
  useEffect(() => {
    localStorage.setItem('todoapp_backup_history', JSON.stringify(backupHistory));
  }, [backupHistory]);

  // Cargar conteo de tareas
  useEffect(() => {
    loadTaskCount();
  }, []);

  const loadTaskCount = async () => {
    try {
      const tasks = await taskService.getAllTasks();
      setTaskCount(tasks.length);
      setPendingCount(tasks.filter((t: TaskResponse) => !t.completed).length);
      setCompletedCount(tasks.filter((t: TaskResponse) => t.completed).length);
    } catch {
      console.error('Error cargando tareas');
    }
  };

  // ✅ Agregar entrada al historial
  const addToHistory = (taskCount: number, fileName: string) => {
    const now = new Date();
    const entry: BackupHistoryEntry = {
      date: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      taskCount,
      fileName,
      timestamp: Date.now()
    };
    setBackupHistory(prev => [entry, ...prev].slice(0, 10)); // Máximo 10 entradas
  };

  // ✅ Limpiar historial
  const handleClearHistory = () => {
    setBackupHistory([]);
    setLastBackupDate(null);
    setLastBackupTaskCount(null);
    localStorage.removeItem('todoapp_backup_history');
    setShowDangerModal(false);
  };

  // ✅ Restablecer contador
  const handleResetCounter = () => {
    setLastBackupDate(null);
    setLastBackupTaskCount(null);
    setShowResetModal(false);
  };

  // ============================================
  // EXPORTAR (DESCARGAR JSON)
  // ============================================
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const tasks = await taskService.getAllTasks();
      if (tasks.length === 0) {
        alert('No hay tareas para exportar');
        setIsExporting(false);
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
          tags: t.tags || []
        }))
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const timestamp = Date.now();
      const fileName = `todoapp_backup_${timestamp}.json`;

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const now = new Date();
      const formatter = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      setLastBackupDate(formatter);
      setLastBackupTaskCount(tasks.length);
      addToHistory(tasks.length, fileName);
      setIsExporting(false);

      if (confirm(`✅ Backup creado\n\nSe exportaron ${tasks.length} tareas.\nArchivo: ${fileName}\n\n¿Deseas compartirlo?`)) {
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Backup de Tareas - TodoAppManager',
              text: 'Aquí está mi backup de tareas de TodoAppManager',
              files: [new File([blob], fileName, { type: 'application/json' })]
            });
          } catch {
            console.log('Compartir cancelado');
          }
        }
      }
    } catch {
      console.error('Error exportando');
      alert('Error al exportar tareas');
      setIsExporting(false);
    }
  };

  // ============================================
  // IMPORTAR (SELECCIONAR JSON)
  // ============================================
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const data: BackupData = JSON.parse(text);

        if (!data.tasks || !Array.isArray(data.tasks)) {
          throw new Error('Formato de archivo inválido');
        }

        if (data.tasks.length === 0) {
          throw new Error('El archivo no contiene tareas');
        }

        const taskCountValue = data.task_count || data.tasks.length;

        if (confirm(`📥 Importar Tareas\n\nSe importarán ${taskCountValue} tareas.\n📅 Exportado: ${data.exported_at || 'Desconocida'}\n\n⚠️ Las tareas se agregarán a las existentes.`)) {
          setModalTotalCount(data.tasks.length);
          setShowProgressModal(true);
          setIsImporting(false);

          const importedCount = await taskService.createTasksBatch(
            data.tasks,
            (current, total) => {
              setProgressText(`Importando ${current} de ${total} tareas...`);
              setProgressPercent(Math.round((current / total) * 100));
            }
          );

          setShowProgressModal(false);
          setModalImportedCount(importedCount);
          setModalTotalCount(data.tasks.length);
          setShowRestoreModal(true);
          await loadTaskCount();
        } else {
          setIsImporting(false);
        }
      } catch {
        console.error('Error importando');
        alert('Error al importar: Formato inválido');
        setIsImporting(false);
      }
    };
    input.click();
  };

  // ============================================
  // BACKUP AUTOMÁTICO CON PROGRESO
  // ============================================
  const handleAutoExport = async () => {
    setIsExporting(true);
    try {
      const tasks = await taskService.getAllTasks();
      if (tasks.length === 0) {
        alert('No hay tareas para exportar');
        setIsExporting(false);
        return;
      }

      setModalTotalCount(tasks.length);
      setShowProgressModal(true);

      for (let i = 0; i <= tasks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setProgressText(`Exportando ${i} de ${tasks.length} tareas...`);
        setProgressPercent(Math.round((i / tasks.length) * 100));
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
          tags: t.tags || []
        }))
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const timestamp = Date.now();
      const fileName = `todoapp_backup_${timestamp}.json`;

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowProgressModal(false);

      const now = new Date();
      const formatter = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      setLastBackupDate(formatter);
      setLastBackupTaskCount(tasks.length);
      addToHistory(tasks.length, fileName);
      setModalTaskCount(tasks.length);
      setModalFileName(fileName);
      setShowSuccessModal(true);
      setIsExporting(false);
    } catch {
      console.error('Error en backup automático');
      setShowProgressModal(false);
      alert('Error al realizar el backup');
      setIsExporting(false);
    }
  };

  // ============================================
  // RESTAURAR AUTOMÁTICO CON PROGRESO
  // ============================================
  const handleAutoImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const data: BackupData = JSON.parse(text);

        if (!data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) {
          throw new Error('Formato inválido o sin tareas');
        }

        setModalTotalCount(data.tasks.length);
        setShowProgressModal(true);
        setIsImporting(false);

        const importedCount = await taskService.createTasksBatch(
          data.tasks,
          (current, total) => {
            setProgressText(`Importando ${current} de ${total} tareas...`);
            setProgressPercent(Math.round((current / total) * 100));
          }
        );

        setShowProgressModal(false);
        setModalImportedCount(importedCount);
        setModalTotalCount(data.tasks.length);
        setShowRestoreModal(true);
        await loadTaskCount();
      } catch {
        console.error('Error importando');
        setShowProgressModal(false);
        alert('Error al importar: Formato inválido');
        setIsImporting(false);
      }
    };
    input.click();
  };

  // ============================================
  // RENDER
  // ============================================
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
        
        {/* HEADER DECORATIVO */}
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-5 sm:p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 shadow-inner">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white">TodoAppManager</h2>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white border border-white/30 mt-1">
                Version 2.6.0
              </span>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 rounded-full flex items-center justify-center border border-white/20">
              <HardDrive size={22} className="text-white" />
            </div>
          </div>
        </div>

        {/* HEADER INFORMATIVO */}
        <SectionHeader title="Gestión de Tareas" icon={<HardDrive size={14} />} />
        <GlassCard>
          <div className="p-4 sm:p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Database size={24} className="text-emerald-500" />
            </div>
            <div>
              <h3 className={`font-semibold text-sm sm:text-base ${classes.text.primary}`}>Copia de Seguridad</h3>
              <p className={`text-xs sm:text-sm ${classes.text.secondary}`}>
                Exporta tus tareas a un archivo JSON para guardarlas o transferirlas a otro dispositivo.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* BACKUP AUTOMÁTICO */}
        <SectionHeader title="Backup Automático" icon={<RefreshCw size={14} />} />
        <GlassCard>
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                <CloudUpload size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-sm sm:text-base ${classes.text.primary}`}>Backup</h4>
                <p className={`text-xs ${classes.text.secondary}`}>Crea una copia de seguridad de todas tus tareas</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 rounded-full text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                {taskCount} tareas
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAutoExport}
              disabled={isExporting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-md disabled:opacity-50 text-sm sm:text-base"
            >
              {isExporting ? (
                <><RefreshCw size={18} className="animate-spin" /> Creando backup...</>
              ) : (
                <><CloudUpload size={18} /> Iniciar Backup Automático</>
              )}
            </motion.button>

            <hr className={`border-t ${classes.border.primary}`} />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <RotateCcw size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-sm sm:text-base ${classes.text.primary}`}>Restaurar</h4>
                <p className={`text-xs ${classes.text.secondary}`}>Recupera tus tareas desde una copia de seguridad</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAutoImport}
              disabled={isImporting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md disabled:opacity-50 text-sm sm:text-base"
            >
              {isImporting ? (
                <><RefreshCw size={18} className="animate-spin" /> Restaurando...</>
              ) : (
                <><FileUp size={18} /> Seleccionar Archivo y Restaurar</>
              )}
            </motion.button>
          </div>
        </GlassCard>

        {/* EXPORTAR / IMPORTAR MANUAL */}
        <SectionHeader title="Exportar / Importar Manual" icon={<FileJson size={14} />} />
        <GlassCard>
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <Download size={20} className="text-emerald-500" />
              </div>
              <div>
                <h4 className={`font-semibold text-sm sm:text-base ${classes.text.primary}`}>Exportar Tareas</h4>
                <p className={`text-xs ${classes.text.secondary}`}>Descarga un archivo JSON con todas tus tareas activas</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-emerald-500">{taskCount}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-amber-500">{pendingCount}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-blue-500">{completedCount}</p>
                <p className="text-xs text-gray-500">Completadas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleExport} disabled={isExporting} className="flex-1 py-2.5 border-2 border-emerald-500 text-emerald-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all disabled:opacity-50 text-sm">
                <Download size={16} /> Descargar
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleExport} disabled={isExporting} className="flex-1 py-2.5 border-2 border-emerald-500 text-emerald-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all disabled:opacity-50 text-sm">
                <Share2 size={16} /> Compartir
              </motion.button>
            </div>
            {lastBackupDate && (
              <p className="text-xs text-center mt-2 text-gray-500">Última copia: {lastBackupDate} ({lastBackupTaskCount} tareas)</p>
            )}
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-orange-500/10 rounded-lg">
                <Upload size={20} className="text-orange-500" />
              </div>
              <div>
                <h4 className={`font-semibold text-sm sm:text-base ${classes.text.primary}`}>Importar Tareas</h4>
                <p className={`text-xs ${classes.text.secondary}`}>Restaura tus tareas desde un archivo JSON previamente exportado</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg mb-3">
              <AlertCircle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-orange-600 dark:text-orange-400">Las tareas importadas se agregarán a las existentes.</p>
            </div>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleImport} disabled={isImporting} className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md disabled:opacity-50 text-sm sm:text-base">
              {isImporting ? <><RefreshCw size={18} className="animate-spin" /> Importando...</> : <><FileUp size={18} /> Seleccionar archivo JSON</>}
            </motion.button>
          </div>
        </GlassCard>

        {/* ============================================ */}
        {/* ✅ NUEVO: ZONA DE PELIGRO */}
        {/* ============================================ */}
        <SectionHeader title="⚠️ Zona de Peligro" icon={<ShieldAlert size={14} className="text-red-500" />} />
        <div className="rounded-xl sm:rounded-2xl border-2 border-red-500/30 overflow-hidden shadow-lg">
          {/* Header de advertencia */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 sm:px-6 py-3">
            <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle size={18} />
              Zona de Peligro
            </h3>
            <p className="text-red-100 text-xs mt-0.5">Estas acciones son irreversibles. Úsalas con precaución.</p>
          </div>

          <div className={`p-4 sm:p-5 space-y-4 ${classes.bg.card}`}>
            {/* Historial de backups */}
            <div>
              <h4 className={`font-semibold text-sm sm:text-base flex items-center gap-2 mb-3 ${classes.text.primary}`}>
                <History size={16} className="text-gray-500" />
                Historial de Backups
              </h4>
              {backupHistory.length === 0 ? (
                <div className={`text-center py-4 ${classes.text.muted}`}>
                  <History size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No hay backups registrados aún.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {backupHistory.slice(0, 5).map((entry, index) => (
                    <div key={index} className={`flex items-center justify-between p-2.5 rounded-lg ${classes.bg.secondary} text-xs sm:text-sm`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className={classes.text.primary}>{entry.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-medium ${classes.text.primary}`}>{entry.taskCount} tareas</span>
                        <span className={`text-[10px] ${classes.text.muted} truncate max-w-[100px]`}>{entry.fileName}</span>
                      </div>
                    </div>
                  ))}
                  {backupHistory.length > 5 && (
                    <p className={`text-center text-xs ${classes.text.muted} mt-1`}>
                      +{backupHistory.length - 5} backups más
                    </p>
                  )}
                </div>
              )}
            </div>

            <hr className={`border-t ${classes.border.primary}`} />

            {/* Botones de peligro */}
            <div className="space-y-3">
              {/* Eliminar historial */}
              <div className={`p-3 rounded-xl border border-red-500/20 bg-red-500/5`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-red-500/10 rounded-lg flex-shrink-0">
                    <Trash2 size={18} className="text-red-500" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${classes.text.primary}`}>Eliminar historial de backups</h4>
                    <p className={`text-xs ${classes.text.secondary}`}>
                      Se perderán todos los registros de copias de seguridad realizadas. Las tareas NO se eliminarán.
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDangerModal(true)}
                  className="w-full py-2.5 border-2 border-red-500 text-red-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all text-sm"
                >
                  <Trash2 size={16} />
                  Eliminar todo el historial
                </motion.button>
              </div>

              {/* Restablecer contador */}
              <div className={`p-3 rounded-xl border border-amber-500/20 bg-amber-500/5`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg flex-shrink-0">
                    <RefreshCw size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${classes.text.primary}`}>Restablecer contador</h4>
                    <p className={`text-xs ${classes.text.secondary}`}>
                      Vuelve el contador de "Última copia" a cero sin eliminar el historial.
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResetModal(true)}
                  className="w-full py-2.5 border-2 border-amber-500 text-amber-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white transition-all text-sm"
                >
                  <RefreshCw size={16} />
                  Restablecer contador
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN */}
        <SectionHeader title="Información" icon={<Info size={14} />} />
        <GlassCard>
          <div className="p-4 sm:p-5 space-y-3">
            <InfoRow icon={<CheckCircle size={14} className="text-emerald-500" />} text="Formato JSON compatible" />
            <InfoRow icon={<CheckCircle size={14} className="text-emerald-500" />} text="Incluye título, descripción, prioridad, categoría" />
            <InfoRow icon={<CheckCircle size={14} className="text-emerald-500" />} text="Las tareas importadas se agregan sin eliminar las existentes" />
            <InfoRow icon={<AlertCircle size={14} className="text-amber-500" />} text="No se incluyen tareas archivadas ni de la papelera" />
          </div>
        </GlassCard>
      </div>

      {/* ============================================ */}
      {/* MODAL DE PROGRESO */}
      {/* ============================================ */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <RefreshCw size={40} className="text-emerald-500 mx-auto animate-spin mb-4" />
                <h3 className="text-lg font-bold mb-2 dark:text-white">{progressText || 'Procesando...'}</h3>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.3 }} />
                </div>
                <p className="text-2xl font-bold text-emerald-500">{progressPercent}%</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE ÉXITO - EXPORTACIÓN */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">✅ Backup Completado</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Se exportaron {modalTaskCount} tareas.</p>
              <p className="text-xs text-gray-400 mb-4">Archivo: {modalFileName}</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold">Aceptar</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE ÉXITO - RESTAURACIÓN */}
      <AnimatePresence>
        {showRestoreModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
              {modalImportedCount < modalTotalCount ? (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={40} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">⚠️ Restauración Parcial</h3>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">✅ Restauración Completada</h3>
                </>
              )}
              <p className="text-gray-500 dark:text-gray-400 mb-1">Se importaron {modalImportedCount} de {modalTotalCount} tareas.</p>
              {modalImportedCount < modalTotalCount && (
                <p className="text-xs text-orange-500 mb-4">{modalTotalCount - modalImportedCount} tareas no pudieron ser importadas.</p>
              )}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowRestoreModal(false)} className={`w-full py-3 text-white rounded-xl font-semibold ${modalImportedCount < modalTotalCount ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'}`}>Aceptar</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* ✅ NUEVO: MODAL DE CONFIRMACIÓN - ELIMINAR HISTORIAL */}
      {/* ============================================ */}
      <AnimatePresence>
        {showDangerModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">⚠️ ¿Estás seguro?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">
                  Esta acción eliminará <strong>todo el historial de backups</strong>.
                </p>
                <p className="text-xs text-red-500 mb-4">
                  Las tareas NO se eliminarán, solo los registros de copias realizadas.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDangerModal(false)}
                    className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearHistory}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Sí, eliminar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* ✅ NUEVO: MODAL DE CONFIRMACIÓN - RESTABLECER CONTADOR */}
      {/* ============================================ */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">🔄 ¿Restablecer contador?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                  El contador de "Última copia" volverá a cero. El historial se mantendrá.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResetCounter}
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Restablecer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const SectionHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => {
  const classes = useThemeClasses();
  return (
    <div className="flex items-center gap-2 mb-1 px-1">
      <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
      <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${classes.text.secondary}`}>
        {icon}{title}
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

const InfoRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => {
  const classes = useThemeClasses();
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <span className={`text-xs sm:text-sm ${classes.text.secondary}`}>{text}</span>
    </div>
  );
};

export default BackupPage;