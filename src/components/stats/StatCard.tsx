// src/components/stats/StatCard.tsx
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    positive: boolean;
    label?: string;
  };
  suffix?: string;
  prefix?: string;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  suffix = '',
  prefix = '',
  onClick,
  isLoading = false,
  className = '',
}) => {
  const classes = useThemeClasses();

  // Color mapping para diferentes tonalidades
  const getColorClasses = (baseColor: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      emerald: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        hover: 'hover:bg-emerald-500/20',
      },
      teal: {
        bg: 'bg-teal-500/10',
        text: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-200 dark:border-teal-800',
        hover: 'hover:bg-teal-500/20',
      },
      cyan: {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-200 dark:border-cyan-800',
        hover: 'hover:bg-cyan-500/20',
      },
      amber: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        hover: 'hover:bg-amber-500/20',
      },
      red: {
        bg: 'bg-red-500/10',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        hover: 'hover:bg-red-500/20',
      },
      purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:bg-purple-500/20',
      },
      blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:bg-blue-500/20',
      },
      indigo: {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800',
        hover: 'hover:bg-indigo-500/20',
      },
      gray: {
        bg: 'bg-gray-500/10',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
        hover: 'hover:bg-gray-500/20',
      },
    };
    return colors[baseColor] || colors.emerald;
  };

  const colorStyles = getColorClasses(color);

  // Formatear valor para mostrar
  const formattedValue = () => {
    if (isLoading) return '...';
    if (typeof value === 'number') {
      if (value > 1000000) return `${prefix}${(value / 1000000).toFixed(1)}M${suffix}`;
      if (value > 1000) return `${prefix}${(value / 1000).toFixed(1)}K${suffix}`;
      return `${prefix}${value}${suffix}`;
    }
    return `${prefix}${value}${suffix}`;
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -2 } : { y: -1 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl border p-3 transition-all duration-300
        ${colorStyles.bg} ${colorStyles.border} ${classes.bg.card}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Efecto de brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />

      <div className="flex items-start justify-between">
        {/* Icono - Reducido de p-2.5 a p-2 */}
        <div className={`p-2 rounded-lg ${colorStyles.bg}`}>
          <div className={colorStyles.text}>
            {icon}
          </div>
        </div>

        {/* Tendencia (si existe) - Reducido tamaño */}
        {trend && (
          <div className={`flex items-center gap-0.5 ${trend.positive ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend.value !== 0 && (
              <>
                {trend.positive ? (
                  <ArrowUp size={12} className="animate-pulse" />
                ) : (
                  <ArrowDown size={12} className="animate-pulse" />
                )}
                <span className="text-[11px] font-medium">
                  {Math.abs(trend.value)}%
                </span>
              </>
            )}
            {trend.label && (
              <span className={`text-[10px] ${classes.text.muted}`}>{trend.label}</span>
            )}
          </div>
        )}
      </div>

      {/* Valor - Reducido de mt-4 a mt-2 */}
      <div className="mt-2">
        {isLoading ? (
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`text-xl font-bold ${classes.text.primary}`} // Cambiado de text-2xl a text-xl
          >
            {formattedValue()}
          </motion.div>
        )}
        <p className={`text-[11px] mt-0.5 ${classes.text.muted}`}>{title}</p> {/* Reducido de text-xs a text-[11px] */}
      </div>

      {/* Barra de progreso sutil (opcional) - Reducido margen */}
      {trend && trend.value !== 0 && (
        <div className="mt-2 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(trend.value), 100)}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`h-full rounded-full ${trend.positive ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}
          />
        </div>
      )}
    </motion.div>
  );
};