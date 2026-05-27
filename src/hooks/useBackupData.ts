// src/hooks/useBackupData.ts
import { useState, useCallback } from 'react';
import taskService from '../services/taskService';
import backupService from '../services/backupService';
import type { TaskResponse } from '../services/taskService';
import type { CloudBackupMetadata, BackupData, LocalBackup, BackupHistoryEntry } from '../types/backup';

interface BackupDataState {
  taskCount: number;
  pendingCount: number;
  completedCount: number;
  cloudBackups: CloudBackupMetadata[];
  localBackups: LocalBackup[];
  cloudStats: { total_backups: number; total_size_mb: number; remaining_slots: number };
  backupContents: Map<string, BackupData>;
  pendingUploads: number;
}

export const useBackupData = () => {
  const [state, setState] = useState<BackupDataState>({
    taskCount: 0,
    pendingCount: 0,
    completedCount: 0,
    cloudBackups: [],
    localBackups: [],
    cloudStats: { total_backups: 0, total_size_mb: 0, remaining_slots: 20 },
    backupContents: new Map(),
    pendingUploads: 0,
  });

  const loadTaskCount = useCallback(async () => {
    try {
      const tasks = await taskService.getAllTasks();
      setState(prev => ({
        ...prev,
        taskCount: tasks.length,
        pendingCount: tasks.filter((t: TaskResponse) => !t.completed).length,
        completedCount: tasks.filter((t: TaskResponse) => t.completed).length,
      }));
    } catch (error) {
      console.error('Error cargando tareas:', error);
    }
  }, []);

  const loadCloudBackups = useCallback(async () => {
    try {
      const backups = await backupService.getAllBackups();
      setState(prev => ({ ...prev, cloudBackups: backups }));
      // Calcular pendingUploads después de actualizar cloudBackups
      setState(prev => {
        const pending = prev.localBackups.filter(
          b => !backups.some(cb => cb.file_name === b.file_name)
        ).length;
        return { ...prev, pendingUploads: pending };
      });
    } catch (error) {
      console.error('Error cargando backups cloud:', error);
    }
  }, []);

  const loadLocalBackups = useCallback(() => {
    const history = backupService.getLocalBackups();
    const contents = new Map<string, BackupData>();
    
    for (const entry of history) {
      let stored = localStorage.getItem(`todoapp_backup_${entry.fileName}`);
      
      if (!stored) {
        const timestampMatch = entry.fileName.match(/\d+/);
        if (timestampMatch) {
          const timestamp = timestampMatch[0];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(timestamp) && key.includes('todoapp_backup')) {
              stored = localStorage.getItem(key);
              break;
            }
          }
        }
      }
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as BackupData;
          contents.set(entry.fileName, parsed);
        } catch (e) {
          console.error(`Error parseando backup ${entry.fileName}:`, e);
        }
      }
    }
    
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
    
    setState(prev => ({ ...prev, localBackups: localBackupList, backupContents: contents }));
    
    // Calcular pendingUploads después de actualizar localBackups
    setState(prev => {
      const pending = localBackupList.filter(
        b => !prev.cloudBackups.some(cb => cb.file_name === b.file_name)
      ).length;
      return { ...prev, pendingUploads: pending };
    });
  }, []);

  const loadCloudStats = useCallback(async () => {
    try {
      const stats = await backupService.getBackupStats();
      setState(prev => ({
        ...prev,
        cloudStats: {
          total_backups: stats.total_backups,
          total_size_mb: stats.total_size_mb,
          remaining_slots: stats.remaining_slots,
        },
      }));
    } catch (error) {
      console.error('Error cargando estadísticas cloud:', error);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadTaskCount(),
      loadCloudBackups(),
      loadLocalBackups(),
      loadCloudStats(),
    ]);
  }, [loadTaskCount, loadCloudBackups, loadLocalBackups, loadCloudStats]);

  // Función para recalcular pendingUploads cuando sea necesario
  const refreshPendingUploads = useCallback(() => {
    setState(prev => {
      const pending = prev.localBackups.filter(
        b => !prev.cloudBackups.some(cb => cb.file_name === b.file_name)
      ).length;
      return { ...prev, pendingUploads: pending };
    });
  }, []);

  return {
    ...state,
    loadTaskCount,
    loadCloudBackups,
    loadLocalBackups,
    loadCloudStats,
    loadAllData,
    refreshPendingUploads,
  };
};