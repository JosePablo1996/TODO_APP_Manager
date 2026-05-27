// src/hooks/useCloudBackupOperations.ts
import { useState } from 'react';
import taskService from '../services/taskService';
import backupService from '../services/backupService';
import type { CloudBackupMetadata } from '../types/backup';
import type { TaskResponse } from '../services/taskService';

export type RestoreMode = 'replace' | 'merge' | 'add-new';

interface UseCloudBackupOperationsProps {
  onProgress: (show: boolean, text: string, percent: number) => void;
  onRestoreComplete: (importedCount: number, totalCount: number, mode: string) => void;
  onRefreshData: () => Promise<void>;
}

export const useCloudBackupOperations = ({
  onProgress,
  onRestoreComplete,
  onRefreshData,
}: UseCloudBackupOperationsProps) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);

  const deleteCloudBackup = async (id: string) => {
    setIsDeleting(id);
    try {
      await backupService.deleteBackup(id);
      await onRefreshData();
    } catch (error) {
      console.error('Error eliminando backup:', error);
      alert('Error al eliminar el backup');
    } finally {
      setIsDeleting(null);
    }
  };

  const restoreCloudBackup = async (backup: CloudBackupMetadata, mode: RestoreMode) => {
    setIsRestoring(backup.id);
    onProgress(true, `Preparando restauración en modo ${mode}...`, 0);
    
    try {
      // 1. Obtener backup completo
      const fullBackup = await backupService.getBackup(backup.id);
      const notesData = fullBackup.notes_data as { tasks?: unknown[] };
      const backupTasks = notesData.tasks as TaskResponse[] | undefined;
      
      if (!backupTasks || !Array.isArray(backupTasks) || backupTasks.length === 0) {
        throw new Error('No se encontraron tareas válidas en el backup');
      }

      // 2. Obtener tareas actuales
      const currentTasks = await taskService.getAllTasks();
      let tasksToImport: TaskResponse[] = [];

      // 3. Lógica según modo
      if (mode === 'replace') {
        onProgress(true, `Eliminando ${currentTasks.length} tareas actuales...`, 0);
        if (currentTasks.length > 0) {
          await taskService.deleteTasksBatch(currentTasks.map(t => t.id));
        }
        tasksToImport = backupTasks;
      } else if (mode === 'merge') {
        tasksToImport = backupTasks;
      } else if (mode === 'add-new') {
        const currentTaskIds = new Set(currentTasks.map(t => t.id));
        const newTasksOnly = backupTasks.filter(bt => !currentTaskIds.has(bt.id));
        
        if (newTasksOnly.length === 0) {
          onProgress(false, '', 0);
          alert('No hay tareas nuevas para agregar. Todas las tareas del backup ya existen.');
          setIsRestoring(null);
          return;
        }
        tasksToImport = newTasksOnly;
      }

      // 4. Importar tareas
      let importedCount = 0;
      for (let i = 0; i < tasksToImport.length; i++) {
        try {
          await taskService.createTask({
            title: tasksToImport[i].title,
            description: tasksToImport[i].description || '',
            completed: tasksToImport[i].completed,
            priority: tasksToImport[i].priority,
            category: tasksToImport[i].category,
            due_date: tasksToImport[i].due_date,
            color: tasksToImport[i].color,
            tags: tasksToImport[i].tags,
            is_favorite: tasksToImport[i].is_favorite || false,
            is_archived: tasksToImport[i].is_archived || false,
          });
          importedCount++;
          const percent = Math.round(((i + 1) / tasksToImport.length) * 100);
          onProgress(true, `Importando tarea ${i + 1} de ${tasksToImport.length}...`, percent);
        } catch (err) {
          console.error(`Error importando tarea ${i + 1}:`, err);
        }
        // Pequeña pausa para UI fluida
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // 5. Completar
      onProgress(false, '', 0);
      const modeText = mode === 'replace' ? 'Reemplazo' : mode === 'merge' ? 'Fusión' : 'Solo nuevas';
      onRestoreComplete(importedCount, tasksToImport.length, `${modeText} - ${backup.file_name}`);
      await onRefreshData();
      
    } catch (error) {
      console.error('Error restaurando backup:', error);
      onProgress(false, '', 0);
      alert(`Error al restaurar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsRestoring(null);
    }
  };

  return {
    isDeleting,
    isRestoring,
    deleteCloudBackup,
    restoreCloudBackup,
  };
};