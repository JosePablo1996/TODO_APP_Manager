// src/components/backup/BackupAutoSchedule.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

export const BackupAutoSchedule: React.FC = () => {
  const classes = useThemeClasses();
  const [isEnabled, setIsEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  return (
    <div className={`p-4 rounded-xl border ${classes.bg.card} ${classes.border.primary}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Clock size={16} className="text-teal-500" />
          </div>
          <h4 className={`font-semibold text-sm ${classes.text.primary}`}>⏰ Backup Automático Programado</h4>
        </div>
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`relative w-10 h-5 rounded-full transition-all ${
            isEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          aria-label={isEnabled ? 'Desactivar backup automático' : 'Activar backup automático'}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all ${
              isEnabled ? 'right-0.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 space-y-3"
        >
          <div className="flex items-center gap-3">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className={`text-sm px-3 py-1.5 rounded-lg border ${classes.bg.input} ${classes.text.primary} ${classes.border.primary}`}
              aria-label="Frecuencia del backup automático"
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${classes.button.secondary}`}
              onClick={() => {
                // Abrir selector de hora (implementación pendiente)
                console.log('Configurar hora del backup');
              }}
            >
              Configurar hora
            </button>
          </div>
          <div className={`p-2 rounded-lg ${classes.bg.secondary}`}>
            <p className={`text-[10px] ${classes.text.muted} flex items-center gap-1`}>
              <Calendar size={10} />
              El backup se realizará automáticamente{' '}
              {frequency === 'daily'
                ? 'cada día'
                : frequency === 'weekly'
                ? 'cada semana'
                : 'cada mes'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BackupAutoSchedule;