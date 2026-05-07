// src/components/stats/ProgressCircle.tsx
import { motion } from 'framer-motion';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subtitle?: string;
  showPercentage?: boolean;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 80, // Reducido de 100 a 80
  strokeWidth = 6, // Reducido de 8 a 6
  label = 'Progreso',
  subtitle,
  showPercentage = true,
}) => {
  const classes = useThemeClasses();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Asegurar que el porcentaje esté entre 0 y 100
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG del círculo */}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Círculo de fondo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Círculo de progreso con gradiente */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference,
            }}
          />
          {/* Definir gradiente */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Texto central */}
        {showPercentage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={`text-lg font-bold ${classes.text.primary}`} // Reducido de text-2xl a text-lg
            >
              {clampedPercentage}%
            </motion.span>
          </div>
        )}
      </div>

      {/* Label y subtítulo - Márgenes más pequeños */}
      <div className="text-center mt-1.5"> {/* Reducido de mt-2 a mt-1.5 */}
        <h3 className={`text-[10px] font-medium ${classes.text.secondary}`}>{label}</h3> {/* Reducido de text-xs a text-[10px] */}
        {subtitle && (
          <p className={`text-[9px] mt-0.5 ${classes.text.muted}`}>{subtitle}</p> // Reducido de text-[10px] a text-[9px], mt-0.5 mantiene
        )}
      </div>
    </div>
  );
};