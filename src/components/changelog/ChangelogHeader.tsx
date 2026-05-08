import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeClasses } from '../../types/changelog.types';

// ============================================
// INTERFAZ DEL COMPONENTE
// ============================================

interface ChangelogHeaderProps {
  /** Clases de tema actuales para estilos */
  classes: ThemeClasses;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * ChangelogHeader
 * 
 * Header sticky que aparece en la parte superior de la página de changelog.
 * Contiene un botón para volver a Configuración y el título de la página.
 * Se mantiene fijo al hacer scroll para navegación rápida.
 */
export const ChangelogHeader: React.FC<ChangelogHeaderProps> = ({ classes }) => {
  const navigate = useNavigate();

  return (
    <div className={`sticky top-0 z-10 backdrop-blur-sm border-b ${classes.border.primary} ${classes.bg.card}`}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Botón para volver a Configuración */}
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/configuracion')}
            className={`p-2 rounded-lg transition-colors ${classes.bg.hover}`}
            aria-label="Volver a configuración"
            title="Volver a Configuración"
          >
            <ArrowLeft className={`w-6 h-6 ${classes.icon.secondary}`} />
          </motion.button>

          {/* Título de la página */}
          <div className="flex items-center gap-3">
            {/* Barra decorativa con gradiente */}
            <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
            
            {/* Título con icono */}
            <h1 className={`text-xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
              <RefreshCw className={classes.icon.primary} size={20} />
              Historial de Cambios
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangelogHeader;