// src/hooks/useLocalBackupOperations.ts
import { useState } from 'react';
import backupService from '../services/backupService';
import type { LocalBackup, BackupData } from '../types/backup';

interface UseLocalBackupOperationsProps {
  localBackups: LocalBackup[];
  backupContents: Map<string, BackupData>;
  onRefreshData: () => Promise<void>;
  onProgress: (show: boolean, text: string, percent: number) => void;
  onUploadComplete: (count: number) => void;
}

export const useLocalBackupOperations = ({
  localBackups,
  backupContents,
  onRefreshData,
  onProgress,
  onUploadComplete,
}: UseLocalBackupOperationsProps) => {
  const [selectedLocalIds, setSelectedLocalIds] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingLocal, setIsDeletingLocal] = useState<string | null>(null);

  const uploadBackupToCloud = async (backup: LocalBackup): Promise<boolean> => {
    try {
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

      const result = await backupService.saveBackup({
        file_name: backup.fileName,
        file_size: JSON.stringify(backupContent).length,
        note_count: backup.taskCount,
        notes_data: backupContent as unknown as Record<string, unknown>,
        backup_type: 'manual',
        device_name: 'Web Browser',
        app_version: '2.6.0'
      });
      
      return !!result.id;
    } catch (error) {
      console.error(`Error subiendo backup ${backup.fileName}:`, error);
      return false;
    }
  };

  const uploadSelected = async () => {
    const selectedBackups = localBackups.filter(b => selectedLocalIds.has(b.id));
    if (selectedBackups.length === 0) return;

    setIsUploading(true);
    onProgress(true, `Subiendo backups...`, 0);
    
    let uploaded = 0;
    let failed = 0;
    
    for (let i = 0; i < selectedBackups.length; i++) {
      const backup = selectedBackups[i];
      onProgress(
        true,
        `Subiendo ${i + 1} de ${selectedBackups.length}: ${backup.fileName}`,
        Math.round(((i + 1) / selectedBackups.length) * 100)
      );
      
      const success = await uploadBackupToCloud(backup);
      if (success) {
        uploaded++;
      } else {
        failed++;
      }
    }
    
    onProgress(false, '', 0);
    setIsUploading(false);
    setSelectedLocalIds(new Set());
    await onRefreshData();
    
    if (uploaded > 0) {
      onUploadComplete(uploaded);
    }
    
    if (failed > 0) {
      console.warn(`⚠️ ${failed} backup(s) no pudieron subirse`);
      alert(`${failed} backup(s) no pudieron subirse a la nube`);
    }
  };

  const deleteLocalBackup = async (backup: LocalBackup) => {
    setIsDeletingLocal(backup.id);
    try {
      // Eliminar contenido de localStorage
      localStorage.removeItem(`todoapp_backup_${backup.fileName}`);
      
      // Eliminar del historial
      const history = backupService.getLocalBackups();
      const newHistory = history.filter(h => h.fileName !== backup.fileName);
      localStorage.setItem('todoapp_backup_history', JSON.stringify(newHistory));
      
      // Recargar datos
      await onRefreshData();
      
      console.log(`✅ Backup local eliminado: ${backup.fileName}`);
    } catch (error) {
      console.error('Error eliminando backup local:', error);
      alert('Error al eliminar el backup local');
    } finally {
      setIsDeletingLocal(null);
    }
  };

  const selectLocal = (id: string) => {
    const newSet = new Set(selectedLocalIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLocalIds(newSet);
  };

  const selectAllLocal = () => {
    if (selectedLocalIds.size === localBackups.length) {
      setSelectedLocalIds(new Set());
    } else {
      setSelectedLocalIds(new Set(localBackups.map(b => b.id)));
    }
  };

  return {
    selectedLocalIds,
    isUploading,
    isDeletingLocal,
    uploadSelected,
    deleteLocalBackup,
    selectLocal,
    selectAllLocal,
  };
};