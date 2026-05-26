// src/components/backup/BackupBanner.tsx
import React from 'react';
import { CheckCircle, HardDrive } from 'lucide-react';

interface BackupBannerProps {
  appVersion?: string;
}

export const BackupBanner: React.FC<BackupBannerProps> = ({ appVersion = '2.6.0' }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-5 sm:p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 shadow-inner">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            <CheckCircle size={24} className="text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">TodoAppManager</h2>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white border border-white/30 mt-1">
            Versión {appVersion}
          </span>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 rounded-full flex items-center justify-center border border-white/20">
          <HardDrive size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default BackupBanner;