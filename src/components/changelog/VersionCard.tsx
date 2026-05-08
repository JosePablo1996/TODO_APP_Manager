import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Star, CheckCircle } from 'lucide-react';
import { Version, ThemeClasses } from '../../types/changelog.types';
import { IconMapper } from './IconMapper';

// ============================================
// INTERFAZ DEL COMPONENTE
// ============================================

interface VersionCardProps {
  /** Datos de la versión a mostrar */
  version: Version;
  /** Si la tarjeta está expandida mostrando los detalles */
  isExpanded: boolean;
  /** Callback para alternar expandir/colapsar */
  onToggle: () => void;
  /** Clases de tema actuales */
  classes: ThemeClasses;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * VersionCard
 * 
 * Tarjeta interactiva que muestra una versión del changelog.
 * Soporta expansión/colapso con animaciones para ver los detalles.
 * La versión más reciente tiene efectos visuales especiales.
 */
export const VersionCard: React.FC<VersionCardProps> = ({ 
  version, 
  isExpanded, 
  onToggle, 
  classes 
}) => {
  const isLatest = version.isLatest;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ${classes.bg.card} ${classes.border.primary}`}
      style={{
        boxShadow: isLatest 
          ? '0 20px 40px -15px rgba(16, 185, 129, 0.5)' 
          : '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Efecto de brillo para la versión más reciente */}
      {isLatest && <GlowEffect />}

      {/* Cabecera clickeable */}
      <div className="relative p-5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Información de la versión */}
          <div className="flex items-center gap-3 flex-wrap">
            <VersionBadge version={version.version} gradient={version.gradient} />
            <DateBadge date={version.date} classes={classes} />
            {isLatest && <LatestBadge />}
          </div>

          {/* Botón expandir/colapsar */}
          <ExpandButton isExpanded={isExpanded} classes={classes} />
        </div>

        {/* Título de la versión (visible solo expandido) */}
        <AnimatePresence>
          {isExpanded && <VersionTitle title={version.title} classes={classes} />}
        </AnimatePresence>
      </div>

      {/* Contenido expandible con categorías */}
      <AnimatePresence>
        {isExpanded && (
          <ExpandedContent version={version} classes={classes} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// SUB-COMPONENTES: EFECTOS VISUALES
// ============================================

/**
 * Efecto de brillo/glow para la versión más reciente
 */
const GlowEffect: React.FC = () => (
  <>
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
  </>
);

// ============================================
// SUB-COMPONENTES: HEADER
// ============================================

/**
 * Badge con el número de versión
 */
const VersionBadge: React.FC<{ version: string; gradient: string }> = ({ version, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`px-4 py-2 rounded-full text-white font-bold text-sm ${gradient}`}
  >
    v{version}
  </motion.div>
);

/**
 * Badge con la fecha de la versión
 */
const DateBadge: React.FC<{ date: string; classes: ThemeClasses }> = ({ date, classes }) => (
  <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border ${classes.bg.secondary} ${classes.border.primary}`}>
    <Calendar size={14} className={classes.icon.secondary} />
    <span className={`text-xs font-medium ${classes.text.secondary}`}>{date}</span>
  </div>
);

/**
 * Badge "Última versión" con animación
 */
const LatestBadge: React.FC = () => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ repeat: Infinity, duration: 2 }}
    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full text-white text-xs font-bold shadow-lg flex items-center gap-1"
  >
    <Star size={12} />
    <span>Última versión</span>
  </motion.div>
);

/**
 * Botón para expandir/colapsar con rotación animada
 */
const ExpandButton: React.FC<{ isExpanded: boolean; classes: ThemeClasses }> = ({ isExpanded, classes }) => (
  <motion.div
    animate={{ rotate: isExpanded ? 180 : 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`p-2.5 rounded-full transition-colors ${classes.bg.hover}`}
  >
    <ChevronDown size={20} className={classes.icon.secondary} />
  </motion.div>
);

/**
 * Título descriptivo de la versión (visible al expandir)
 */
const VersionTitle: React.FC<{ title: string; classes: ThemeClasses }> = ({ title, classes }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.3 }}
    className="overflow-hidden"
  >
    <motion.div
      initial={{ y: -20 }}
      animate={{ y: 0 }}
      className={`mt-4 p-4 rounded-xl border ${classes.bg.secondary} ${classes.border.primary}`}
    >
      <p className={`text-base font-medium ${classes.text.primary}`}>{title}</p>
    </motion.div>
  </motion.div>
);

// ============================================
// SUB-COMPONENTES: CONTENIDO EXPANDIDO
// ============================================

/**
 * Contenedor del contenido expandido con scroll
 */
const ExpandedContent: React.FC<{
  version: Version;
  classes: ThemeClasses;
}> = ({ version, classes }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.5 }}
    className="overflow-hidden"
  >
    <div className="px-5 pb-5 max-h-[600px] overflow-y-auto custom-scrollbar">
      <div className="space-y-6 pr-2">
        {version.changes.map((category, catIndex) => (
          <CategorySection
            key={`${version.version}-cat-${catIndex}`}
            category={category}
            catIndex={catIndex}
            classes={classes}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// ============================================
// SUB-COMPONENTES: CATEGORÍAS
// ============================================

/**
 * Sección de una categoría de cambios
 */
const CategorySection: React.FC<{
  category: Version['changes'][0];
  catIndex: number;
  classes: ThemeClasses;
}> = ({ category, catIndex, classes }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: catIndex * 0.1 }}
    className="space-y-3"
  >
    {/* Encabezado de categoría */}
    <CategoryHeader category={category} classes={classes} />

    {/* Items de la categoría */}
    <div className="space-y-3 pl-4">
      {category.items.map((item, itemIndex) => (
        <ChangeItemCard
          key={`cat-${catIndex}-item-${itemIndex}`}
          item={item}
          itemIndex={itemIndex}
          category={category}
          classes={classes}
        />
      ))}
    </div>
  </motion.div>
);

/**
 * Encabezado de categoría con icono y título
 */
const CategoryHeader: React.FC<{
  category: Version['changes'][0];
  classes: ThemeClasses;
}> = ({ category, classes }) => (
  <div className="flex items-center gap-2 sticky top-0 bg-opacity-90 backdrop-blur-sm py-2 z-10">
    {/* Icono de la categoría */}
    <div className={`p-2.5 rounded-xl ${category.color} bg-opacity-20`}>
      <IconMapper name={category.icon} size={18} className={category.color} />
    </div>
    
    {/* Título de la categoría */}
    <h3 className={`font-bold ${classes.text.primary} text-base`}>
      {category.category}
    </h3>
    
    {/* Línea decorativa */}
    <div className={`flex-1 h-px bg-gradient-to-r ${classes.border.primary} to-transparent`} />
  </div>
);

// ============================================
// SUB-COMPONENTES: ITEMS DE CAMBIO
// ============================================

/**
 * Tarjeta individual de un cambio/mejora
 */
const ChangeItemCard: React.FC<{
  item: Version['changes'][0]['items'][0];
  itemIndex: number;
  category: Version['changes'][0];
  classes: ThemeClasses;
}> = ({ item, itemIndex, category, classes }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: itemIndex * 0.05 }}
    className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${classes.bg.secondary} ${classes.border.primary}`}
  >
    {/* Descripción principal */}
    <div className="flex items-start gap-3">
      <div className={`p-1.5 rounded-lg mt-0.5 ${category.color} bg-opacity-20`}>
        <CheckCircle size={14} className={category.color} />
      </div>
      <span className={`text-sm font-semibold ${classes.text.primary}`}>
        {item.description}
      </span>
    </div>

    {/* Sub-detalles con viñetas */}
    {item.details && item.details.length > 0 && (
      <DetailsList details={item.details} categoryColor={category.color} classes={classes} />
    )}
  </motion.div>
);

/**
 * Lista de detalles con viñetas
 */
const DetailsList: React.FC<{
  details: string[];
  categoryColor: string;
  classes: ThemeClasses;
}> = ({ details, categoryColor, classes }) => (
  <div className="mt-3 ml-10 space-y-2">
    {details.map((detail, detailIndex) => (
      <div
        key={`detail-${detailIndex}`}
        className="flex items-start gap-2 text-xs"
      >
        {/* Viñeta coloreada */}
        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${categoryColor} bg-opacity-100`} />
        
        {/* Texto del detalle */}
        <span className={classes.text.muted}>{detail}</span>
      </div>
    ))}
  </div>
);

export default VersionCard;