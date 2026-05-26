// src/components/backup/BackupStats.tsx
import React from 'react';
import { Database, HardDrive, Cloud, Clock } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { BackupStatsProps } from '../../types/backup';

export const BackupStats: React.FC<BackupStatsProps> = ({
  taskCount,
  pendingCount,
  completedCount,
  totalBackups = 0,
  maxBackups = 20,
  totalSizeMB = 0,
}) => {
  const classes = useThemeClasses();
  const remainingSlots = maxBackups - totalBackups;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* Tarjeta: Total Tareas */}
      <div className={`p-3 sm:p-4 rounded-xl ${classes.bg.card} border ${classes.border.primary}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Database size={16} className="text-emerald-500" />
          </div>
          <span className={`text-xs font-medium ${classes.text.muted}`}>Total Tareas</span>
        </div>
        <p className={`text-2xl font-bold ${classes.text.primary}`}>{taskCount}</p>
        <p className={`text-xs ${classes.text.muted} mt-1`}>para respaldar</p>
      </div>

      {/* Tarjeta: Pendientes / Completadas */}
      <div className={`p-3 sm:p-4 rounded-xl ${classes.bg.card} border ${classes.border.primary}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Clock size={16} className="text-amber-500" />
          </div>
          <span className={`text-xs font-medium ${classes.text.muted}`}>Estado</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xl font-bold ${classes.text.primary}`}>{pendingCount}</p>
            <p className={`text-[10px] ${classes.text.muted}`}>Pendientes</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-bold text-emerald-500`}>{completedCount}</p>
            <p className={`text-[10px] ${classes.text.muted}`}>Completadas</p>
          </div>
        </div>
      </div>

      {/* Tarjeta: Backups en Nube */}
      <div className={`p-3 sm:p-4 rounded-xl ${classes.bg.card} border ${classes.border.primary}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Cloud size={16} className="text-cyan-500" />
          </div>
          <span className={`text-xs font-medium ${classes.text.muted}`}>Backups Nube</span>
        </div>
        <div className="flex items-baseline gap-1">
          <p className={`text-2xl font-bold ${classes.text.primary}`}>{totalBackups}</p>
          <p className={`text-sm ${classes.text.muted}`}>/ {maxBackups}</p>
        </div>
        <p className={`text-xs ${classes.text.muted} mt-1`}>
          {remainingSlots > 0 ? `${remainingSlots} disponibles` : 'Límite alcanzado'}
        </p>
      </div>

      {/* Tarjeta: Espacio usado */}
      <div className={`p-3 sm:p-4 rounded-xl ${classes.bg.card} border ${classes.border.primary}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <HardDrive size={16} className="text-purple-500" />
          </div>
          <span className={`text-xs font-medium ${classes.text.muted}`}>Espacio usado</span>
        </div>
        <p className={`text-2xl font-bold ${classes.text.primary}`}>{totalSizeMB.toFixed(1)}</p>
        <p className={`text-xs ${classes.text.muted} mt-1`}>KB / MB</p>
      </div>
    </div>
  );
};

export default BackupStats;