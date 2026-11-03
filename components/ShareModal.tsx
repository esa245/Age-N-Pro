'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Download, 
  Link2, 
  Smartphone, 
  Globe, 
  Users,
  MessageCircle,
  Send,
  ExternalLink
} from 'lucide-react';
import { Member } from '@/types/member';
import { Language, translations } from '@/lib/translations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onBackup: () => void;
  language: Language;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  members,
  onBackup,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'site' | 'data'>('site');
  const [copiedSite, setCopiedSite] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const t = translations[language];

  if (!isOpen) return null;

  // Base Site URL
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = t.shareSiteText;

  // Generate Family Data URL
  const getFamilyDataUrl = () => {
    if (typeof window === 'undefined') return '';
    try {
      const exportable = members.map((m) => ({
        name: m.name,
        relation: m.relation,
        dob: m.dob,
        dod: m.dod,
      }));
      const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(exportable)))));
      return `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    } catch (e) {
      return window.location.href;
    }
  };

  const familyDataUrl = getFamilyDataUrl();

  // Mobile Native Share trigger
  const handleNativeShare = async (urlToShare: string, title: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: urlToShare,
        });
      } catch (err) {
        // User cancelled or share aborted
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${text} ${urlToShare}`);
      if (activeTab === 'site') {
        setCopiedSite(true);
        setTimeout(() => setCopiedSite(false), 2500);
      } else {
        setCopiedData(true);
        setTimeout(() => setCopiedData(false), 2500);
      }
    }
  };

  const handleCopySite = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopiedSite(true);
    setTimeout(() => setCopiedSite(false), 2500);
  };

  const handleCopyData = () => {
    navigator.clipboard.writeText(familyDataUrl);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2500);
  };

  // 1-Click Social Links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + siteUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent(shareText)}`;

  const isNativeShareSupported = typeof navigator !== 'undefined' && Boolean(navigator.share);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#09132b] border border-neon-cyan/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,242,254,0.2)] relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-neon-cyan/15 text-neon-cyan flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,242,254,0.3)]">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{t.shareTitle}</h3>
            <p className="text-xs text-text-muted">{t.shareDesc}</p>
          </div>
        </div>

        {/* Tabs: Site & App Share vs Family Data Share */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0d1b3e] rounded-2xl mb-5 border border-white/10">
          <button
            onClick={() => setActiveTab('site')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'site'
                ? 'bg-neon-cyan text-bg-dark shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{t.shareSiteTab}</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'data'
                ? 'bg-neon-cyan text-bg-dark shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.shareDataTab}</span>
          </button>
        </div>

        {/* Tab 1 Content: Share Site & App */}
        {activeTab === 'site' && (
          <div className="space-y-4">
            {/* Native Mobile Share Button (Highlight) */}
            <button
              onClick={() => handleNativeShare(siteUrl, 'Age N Calculator Pro', shareText)}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-neon-cyan via-accent-blue to-neon-green text-bg-dark font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(0,242,254,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Smartphone className="w-5 h-5" />
              <span>{t.shareMobileNative}</span>
            </button>

            {/* Quick 1-Tap Social App Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
                {language === 'bn' ? 'সরাসরি অ্যাপে পাঠান:' : 'Direct App Sharing:'}
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-white flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold group"
                >
                  <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform" />
                  <span>WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 text-white flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold group"
                >
                  <Globe className="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" />
                  <span>Facebook</span>
                </a>

                {/* Telegram */}
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/30 text-white flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold group"
                >
                  <Send className="w-5 h-5 text-[#229ED9] group-hover:scale-110 transition-transform" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

            {/* Copy Site Link */}
            <div className="bg-[#0d1b3e] border border-white/10 rounded-2xl p-3">
              <span className="text-[11px] text-text-muted block mb-1.5 font-semibold">
                {language === 'bn' ? 'সাইট লিঙ্ক:' : 'Website Link:'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={siteUrl}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none truncate"
                />
                <button
                  onClick={handleCopySite}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer border border-white/15"
                >
                  {copiedSite ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSite ? t.linkCopied : t.copyLink}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Share Family Members Data */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            {/* Native Mobile Share for Family Data */}
            <button
              onClick={() => handleNativeShare(familyDataUrl, 'Family Members List', 'Check out our family members age list:')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-neon-green to-neon-cyan text-bg-dark font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Smartphone className="w-5 h-5" />
              <span>{language === 'bn' ? 'পরিবারের তালিকা মোবাইল অ্যাপে শেয়ার করুন' : 'Share Family List via Mobile Apps'}</span>
            </button>

            {/* Copy Data Link */}
            <div className="bg-[#0d1b3e] border border-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1.5 text-[11px] font-semibold text-text-muted">
                <Link2 className="w-3.5 h-3.5 text-neon-cyan" />
                <span>{language === 'bn' ? 'ফ্যামিলি ডেটা লিঙ্ক:' : 'Family Data Link:'}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={familyDataUrl}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyData}
                  className="px-4 py-2 rounded-xl bg-neon-cyan text-bg-dark text-xs font-bold shrink-0 hover:bg-neon-cyan/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedData ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedData ? t.linkCopied : t.copyLink}</span>
                </button>
              </div>
            </div>

            {/* Download JSON Backup file */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <span className="text-xs text-text-muted">
                {language === 'bn' ? 'সম্পূর্ণ ডেটা ব্যাকআপ হিসেবে ডাউনলোড:' : 'Download as complete backup JSON:'}
              </span>
              <button
                onClick={() => {
                  onBackup();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-neon-green" />
                <span>{t.backup}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
