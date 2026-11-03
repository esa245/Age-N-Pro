'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Info, Apple } from 'lucide-react';
import Image from 'next/image';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { translations, Language } from '@/lib/translations';

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);
  const t = translations[language];

  if (isInstalled) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const success = await install();
    if (!success) {
      setInstalling(false);
    }
  };

  return (
    <div className="w-full">
      {isInstallable && (
        <>
          <button
            onClick={handleInstall}
            disabled={installing}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan hover:text-bg-dark transition-all group overflow-hidden relative"
          >
            {installing ? (
              <motion.div 
                className="absolute inset-0 bg-neon-cyan/20"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <motion.div 
                className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.5 }}
              />
            )}
            <div className="p-2 rounded-lg bg-neon-cyan/20 group-hover:bg-bg-dark transition-colors relative z-10">
              <Download className={`w-5 h-5 ${installing ? 'animate-bounce' : ''}`} />
            </div>
            <span className="font-bold relative z-10">
              {installing ? (language === 'bn' ? 'ইনস্টল হচ্ছে...' : 'Installing...') : (language === 'bn' ? 'সফটওয়্যার ডাউনলোড' : 'Download Software')}
            </span>
          </button>

          <AnimatePresence>
            {installing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-24 h-24 mb-8 relative"
                >
                  <div className="absolute inset-0 bg-neon-cyan blur-2xl opacity-20" />
                  <Image 
                    src="https://res.cloudinary.com/dlklqihg6/image/upload/v1793605832/naydn7myt42abjuizhmm.png" 
                    alt="Logo" 
                    fill
                    className="object-contain relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-4">
                  {language === 'bn' ? 'সফটওয়্যার ইনস্টল হচ্ছে' : 'Installing Software'}
                </h3>
                
                <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden relative mb-4">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-green"
                  />
                </div>
                
                <p className="text-text-muted text-sm max-w-xs">
                  {language === 'bn' 
                    ? 'অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন। আপনার ডিভাইসে অ্যাপটি সেট আপ করা হচ্ছে।' 
                    : 'Please wait a moment. Setting up the app on your device.'}
                </p>

                <button 
                  onClick={() => setInstalling(false)}
                  className="mt-12 text-text-muted hover:text-white transition-colors text-sm underline underline-offset-4"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {isIOS && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white transition-all group"
          >
            <div className="p-2 rounded-lg bg-accent-blue/20 group-hover:bg-white/20 transition-colors">
              <Apple className="w-5 h-5" />
            </div>
            <span className="font-bold">
              {language === 'bn' ? 'আইফোনে সেট আপ' : 'Install on iPhone'}
            </span>
          </button>

          <AnimatePresence>
            {showIOSGuide && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowIOSGuide(false)}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-sm bg-card-bg border-2 border-accent-blue rounded-3xl p-8 shadow-2xl text-center font-bengali"
                >
                  <button onClick={() => setShowIOSGuide(false)} className="absolute top-4 right-4 text-text-muted hover:text-white">
                    <X className="w-6 h-6" />
                  </button>

                  <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mx-auto mb-6">
                    <Apple className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">
                    {language === 'bn' ? 'আইফোনে যেভাবে সেট করবেন' : 'Install on iPhone / iPad'}
                  </h3>
                  
                  <div className="text-left space-y-4 text-text-muted text-sm">
                    <div className="flex gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">1</div>
                      <p>{language === 'bn' ? 'সাফারি ব্রাউজারে নিচের "Share" আইকনে ক্লিক করুন।' : 'Tap the Share button in Safari toolbar.'}</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">2</div>
                      <p>{language === 'bn' ? 'একটু নিচে নামলে "Add to Home Screen" অপশনটি পাবেন।' : 'Scroll down and tap "Add to Home Screen".'}</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">3</div>
                      <p>{language === 'bn' ? 'উপরে "Add" ক্লিক করলেই অ্যাপটি ফোনে চলে যাবে।' : 'Tap "Add" in the top right corner.'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="mt-8 w-full bg-accent-blue py-4 rounded-xl font-bold hover:scale-105 transition-transform"
                  >
                    {language === 'bn' ? 'ঠিক আছে' : 'Got it'}
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};
