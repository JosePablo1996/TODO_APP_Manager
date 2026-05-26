// src/components/backup/BackupTabs.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, HardDrive, Cloud } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface BackupTabsProps {
  activeTab: 'general' | 'locals' | 'cloud';
  onTabChange: (tab: 'general' | 'locals' | 'cloud') => void;
}

export const BackupTabs: React.FC<BackupTabsProps> = ({ activeTab, onTabChange }) => {
  const classes = useThemeClasses();

  const tabs = [
    { id: 'general' as const, label: 'General', icon: LayoutGrid },
    { id: 'locals' as const, label: 'Backups Locales', icon: HardDrive },
    { id: 'cloud' as const, label: 'Backup en la Nube', icon: Cloud },
  ];

  return (
    <div className={`flex gap-1 p-1 rounded-xl border ${classes.bg.card} ${classes.border.primary}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                : `${classes.text.secondary} hover:${classes.bg.hover}`
            }`}
            aria-label={`Ver ${tab.label}`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default BackupTabs;