import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 dark:from-indigo-600 dark:to-pink-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-lg"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm" />
      
      <motion.div
        className={`absolute top-1 w-5 h-5 rounded-full shadow-lg flex items-center justify-center ${
          isDark ? 'right-1 bg-gray-900' : 'left-1 bg-yellow-400'
        }`}
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={12} className="text-yellow-400" />
        ) : (
          <Sun size={12} className="text-white" />
        )}
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Sun size={12} className={`transition-opacity duration-300 ${isDark ? 'opacity-30' : 'opacity-100 text-yellow-300'}`} />
        <Moon size={12} className={`transition-opacity duration-300 ${isDark ? 'opacity-100 text-gray-300' : 'opacity-30'}`} />
      </div>
    </motion.button>
  );
};

export default ThemeToggle;