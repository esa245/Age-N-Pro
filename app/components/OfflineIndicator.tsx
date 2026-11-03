'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudOff, Wifi } from 'lucide-react';
import { Language, translations } from '@/lib/translations';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

interface OfflineIndicatorProps {
  language: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language }) => {
  const isOnline = useOnlineStatus();
  const [showNotification, setShowNotification] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOnline) {
        setShowNotification(true);
      } else {
        const hideTimer = setTimeout(() => setShowNotification(false), 3000);
        return () => clearTimeout(hideTimer);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 left-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            isOnline 
              ? 'bg-neon-green/10 border-neon-green text-neon-green' 
              : 'bg-neon-pink/10 border-neon-pink text-neon-pink'
          }`}
        >
          <div className={`p-2 rounded-lg ${isOnline ? 'bg-neon-green/20' : 'bg-neon-pink/20'}`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
          </div>
          <div className="font-bengali">
            <p className="font-bold text-sm">
              {isOnline 
                ? (language === 'bn' ? 'অনলাইন ফিরে এসেছে' : 'Back Online') 
                : (language === 'bn' ? 'অফলাইন মোড' : 'Offline Mode')}
            </p>
            <p className="text-[10px] opacity-80">
              {isOnline 
                ? (language === 'bn' ? 'অ্যাপ এখন সিঙ্ক হচ্ছে' : 'App is now syncing') 
                : (language === 'bn' ? 'আগের সেভ করা ডেটা দেখা যাচ্ছে' : 'Using cached data')}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
