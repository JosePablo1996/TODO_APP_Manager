// src/components/layout/ViewToggle.tsx
import { motion } from 'framer-motion';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ViewToggleProps {
  viewMode: 'list' | 'grid';
  onViewChange: (mode: 'list' | 'grid') => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ 
  viewMode, 
  onViewChange, 
  className = '' 
}) => {
  const classes = useThemeClasses();

  return (
    <div className={`flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onViewChange('list')}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${viewMode === 'list' 
            ? 'text-white shadow-md' 
            : classes.icon.secondary
          }
        `}
        aria-label="Vista lista"
        title="Vista lista"
      >
        {viewMode === 'list' && (
          <motion.div
            layoutId="viewToggleBackground"
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg"
            transition={{ type: "spring", duration: 0.3 }}
          />
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onViewChange('grid')}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${viewMode === 'grid' 
            ? 'text-white shadow-md' 
            : classes.icon.secondary
          }
        `}
        aria-label="Vista cuadrícula"
        title="Vista cuadrícula"
      >
        {viewMode === 'grid' && (
          <motion.div
            layoutId="viewToggleBackground"
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg"
            transition={{ type: "spring", duration: 0.3 }}
          />
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      </motion.button>
    </div>
  );
};