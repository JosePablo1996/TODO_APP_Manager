// src/components/backup/BackupSyncManual.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CloudUpload } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface BackupSyncManualProps {
  onSync: () => void;
  isSyncing: boolean;
  pendingCount: number;
  lastSync?: string;
}

export const BackupSyncManual: React.FC<BackupSyncManualProps> = ({
  onSync,
  isSyncing,
  pendingCount,
  lastSync,
}) => {
  const classes = useThemeClasses();

  return (
    <div className={`p-4 rounded-xl border ${classes.bg.card} ${classes.border.primary}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <CloudUpload size={18} className="text-emerald-500" />
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${classes.text.primary}`}>Sincronización Manual</h4>
          <p className={`text-xs ${classes.text.muted}`}>
            Sube backups locales pendientes a la nube
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-medium">
            {pendingCount} pendiente(s)
          </span>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSync}
        disabled={isSyncing || pendingCount === 0}
        className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
          isSyncing || pendingCount === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600'
        }`}
        aria-label="Sincronizar backups pendientes"
      >
        {isSyncing ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Sincronizando...
          </>
        ) : (
          <>
            <CloudUpload size={16} />
            Sincronizar ahora
          </>
        )}
      </motion.button>

      {lastSync && (
        <p className={`text-[10px] text-center mt-2 ${classes.text.muted}`}>
          Última sincronización: {lastSync}
        </p>
      )}
    </div>
  );
};

export default BackupSyncManual;