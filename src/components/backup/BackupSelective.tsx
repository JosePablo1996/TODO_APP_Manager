// src/components/backup/BackupSelective.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Square, CloudUpload, FileJson } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { CloudBackupMetadata } from '../../types/backup';

interface BackupSelectiveProps {
  backups: CloudBackupMetadata[];
  onUploadSelected: (ids: string[]) => void;
  isUploading: boolean;
}

export const BackupSelective: React.FC<BackupSelectiveProps> = ({
  backups,
  onUploadSelected,
  isUploading,
}) => {
  const classes = useThemeClasses();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = backups.length > 0 && selectedIds.size === backups.length;
  const hasSelected = selectedIds.size > 0;

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(backups.map(b => b.id)));
    }
  };

  const handleUpload = () => {
    onUploadSelected(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  if (backups.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-xl border overflow-hidden ${classes.bg.card} ${classes.border.primary}`}>
      <div className={`p-3 border-b ${classes.border.primary} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <FileJson size={14} className="text-amber-500" />
          <span className={`text-xs font-medium ${classes.text.muted}`}>Backup Selectivo</span>
        </div>
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-600"
        >
          {allSelected ? <CheckSquare size={12} /> : <Square size={12} />}
          {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>
      </div>

      <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
        {backups.map((backup) => (
          <div
            key={backup.id}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
              selectedIds.has(backup.id) ? 'bg-emerald-500/10' : classes.bg.hover
            }`}
            onClick={() => toggleSelect(backup.id)}
          >
            <button className="flex-shrink-0">
              {selectedIds.has(backup.id) ? (
                <CheckSquare size={14} className="text-emerald-500" />
              ) : (
                <Square size={14} className={classes.icon.secondary} />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium truncate ${classes.text.primary}`}>
                {backup.file_name}
              </p>
              <p className={`text-[10px] ${classes.text.muted}`}>
                {backup.note_count} tareas · {new Date(backup.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {hasSelected && (
        <div className={`p-3 border-t ${classes.border.primary}`}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-cyan-600 transition-all"
          >
            <CloudUpload size={14} />
            Subir {selectedIds.size} backup(s) seleccionado(s)
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default BackupSelective;