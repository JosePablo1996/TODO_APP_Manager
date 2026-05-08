import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Heart } from 'lucide-react';
import { ThemeClasses } from '../../types/changelog.types';

// ============================================
// INTERFAZ DEL COMPONENTE
// ============================================

interface ChangelogFooterProps {
  /** Número total de versiones registradas */
  versionCount: number;
  /** Fecha de la última actualización del changelog */
  lastUpdate: string;
  /** Clases de tema actuales para estilos */
  classes: ThemeClasses;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * ChangelogFooter
 * 
 * Footer de la página de changelog que muestra:
 * - Contador total de versiones registradas
 * - Fecha de la última actualización
 * - Créditos del desarrollador
 * 
 * Aparece con una animación de fade-in después de cargar las versiones.
 */
export const ChangelogFooter: React.FC<ChangelogFooterProps> = ({ 
  versionCount, 
  lastUpdate, 
  classes 
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className={`mt-8 p-4 rounded-xl border text-center ${classes.bg.card} ${classes.border.primary}`}
  >
    {/* Contador de versiones */}
    <div className="flex items-center justify-center gap-2">
      <Tag size={16} className={classes.icon.primary} />
      <span className={`text-sm ${classes.text.secondary}`}>
        {versionCount} versiones registradas · Última actualización: {lastUpdate}
      </span>
    </div>

    {/* Créditos del desarrollador */}
    <div className="flex items-center justify-center gap-1 mt-2">
      <Heart size={12} className="text-pink-500" />
      <span className={`text-xs ${classes.text.muted}`}>
        Desarrollado con ❤️ por José Pablo Miranda Quintanilla
      </span>
    </div>
  </motion.div>
);

export default ChangelogFooter;