// src/hooks/useBackupOperations.ts
import { useState } from 'react';
import taskService from '../services/taskService';
import backupService from '../services/backupService';
import type { BackupData } from '../types/backup';

interface UseBackupOperationsProps {
  onRefreshData: () => Promise<void>;
  onProgress: (show: boolean, text: string, percent: number) => void;
  onExportSuccess: (taskCount: number, fileName: string) => void;
  onImportSuccess: (importedCount: number, totalCount: number) => void;
}

export const useBackupOperations = ({
  onRefreshData,
  onProgress,
  onExportSuccess,
  onImportSuccess,
}: UseBackupOperationsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const exportBackup = async () => {
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
        tasks: tasks.map(t => ({
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

      // Guardar en localStorage
      localStorage.setItem(`todoapp_backup_${fileName}`, jsonString);

      // Descargar archivo
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Guardar en historial
      backupService.addLocalBackup(tasks.length, fileName);
      await onRefreshData();
      onExportSuccess(tasks.length, fileName);
    } catch (error) {
      console.error('Error exportando:', error);
      alert('Error al exportar tareas');
    } finally {
      setIsExporting(false);
    }
  };

  const importBackup = () => {
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

        // Guardar en localStorage
        localStorage.setItem(`todoapp_backup_${file.name}`, text);
        backupService.addLocalBackup(data.tasks.length, file.name);
        await onRefreshData();

        // Simular progreso de importación
        onProgress(true, `Importando tareas...`, 0);
        for (let i = 0; i <= data.tasks.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 10));
          onProgress(
            true,
            `Importando ${i} de ${data.tasks.length} tareas...`,
            Math.round((i / data.tasks.length) * 100)
          );
        }
        onProgress(false, '', 0);
        onImportSuccess(data.tasks.length, data.tasks.length);
      } catch (error) {
        console.error('Error importando:', error);
        alert('Error al importar: Formato inválido');
        onProgress(false, '', 0);
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const syncBackups = async () => {
    setIsSyncing(true);
    try {
      const history = backupService.getLocalBackups();
      const syncData = history.map(entry => ({
        id: `local-${entry.timestamp}`,
        file_name: entry.fileName,
        file_size: 0,
        note_count: entry.taskCount,
        created_at: new Date(entry.timestamp).toISOString(),
        source: 'local' as const,
      }));
      
      const result = await backupService.syncBackups(syncData);
      
      if (result.cloud_backups_to_download.length > 0) {
        alert(`${result.cloud_backups_to_download.length} backups disponibles para descargar.`);
      }
      if (result.synced_count > 0) {
        alert(`${result.synced_count} backups pendientes de subir. Ve a "Backups Locales" para subirlos.`);
      }
      
      await onRefreshData();
    } catch (error) {
      console.error('Error en sincronización:', error);
      alert('Error al sincronizar backups');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isExporting,
    isImporting,
    isSyncing,
    exportBackup,
    importBackup,
    syncBackups,
  };
};