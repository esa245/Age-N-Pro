'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  Upload, 
  Languages, 
  Bell, 
  BellOff, 
  Database, 
  Settings, 
  Sparkles,
  Share2
} from 'lucide-react';
import { Language, translations } from '@/lib/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onToggleLanguage: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotification: () => void;
  onBackup: () => void;
  onRestoreFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenShareModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  language,
  onToggleLanguage,
  notificationPermission,
  onRequestNotification,
  onBackup,
  onRestoreFileSelect,
  onOpenShareModal,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-y-0 right-0 max-w-sm w-full bg-[#09132b] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-neon-cyan" />
                  <h3 className="text-lg font-bold text-white">{t.menu}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Data Management Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  <Database className="w-3.5 h-3.5 text-neon-green" />
                  <span>{t.dataMgmt}</span>
                </div>

                {/* Backup JSON Button */}
                <button
                  onClick={() => {
                    onBackup();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all border border-white/5 hover:border-neon-green/40 group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-neon-green/10 text-neon-green group-hover:scale-110 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">{t.backup}</span>
                    <span className="text-[11px] text-text-muted block">
                      {language === 'bn' ? 'ফোনে JSON ফাইল সেভ করুন' : 'Save JSON to device'}
                    </span>
                  </div>
                </button>

                {/* Restore JSON Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all border border-white/5 hover:border-neon-cyan/40 group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">{t.restore}</span>
                    <span className="text-[11px] text-text-muted block">
                      {language === 'bn' ? 'ফাইল থেকে ডেটা ফিরিয়ে আনুন' : 'Load saved backup file'}
                    </span>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => {
                    onRestoreFileSelect(e);
                    onClose();
                  }}
                  className="hidden"
                />

                {/* Share Family Link Button */}
                <button
                  onClick={() => {
                    onOpenShareModal();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all border border-white/5 hover:border-neon-yellow/40 group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-neon-yellow/10 text-neon-yellow group-hover:scale-110 transition-transform">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">{t.share}</span>
                    <span className="text-[11px] text-text-muted block">
                      {language === 'bn' ? 'লিঙ্ক দিয়ে শেয়ার করুন' : 'Share family members list'}
                    </span>
                  </div>
                </button>
              </div>

              {/* App Settings Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-neon-yellow" />
                  <span>{t.appSettings}</span>
                </div>

                {/* Language Switch */}
                <button
                  onClick={onToggleLanguage}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all border border-white/5 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-neon-yellow/10 text-neon-yellow">
                      <Languages className="w-4 h-4" />
                    </div>
                    <span>{t.language}</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-neon-yellow">
                    {language === 'bn' ? 'বাংলা' : 'English'}
                  </span>
                </button>

                {/* Birthday Notification */}
                <button
                  onClick={onRequestNotification}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all border border-white/5 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-neon-green/10 text-neon-green">
                      {notificationPermission === 'granted' ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </div>
                    <span>{t.enableNotif}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      notificationPermission === 'granted'
                        ? 'bg-neon-green/20 text-neon-green'
                        : 'bg-white/10 text-text-muted'
                    }`}
                  >
                    {notificationPermission === 'granted' ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* PWA Install Button */}
                <PWAInstallButton language={language} />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 text-center">
              <p className="text-xs font-semibold text-white/80">Age N Pro • Family Edition</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                {language === 'bn' ? 'সম্পূর্ণ অফলাইন ও নিরাপদ স্টোরেজ' : '100% Offline & Private Storage'}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
