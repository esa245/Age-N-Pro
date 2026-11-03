'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, X, Copy, Check, AlertTriangle } from 'lucide-react';
import { Member } from '@/types/member';
import { Language, translations } from '@/lib/translations';

interface DeleteConfirmModalProps {
  member: Member | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  language: Language;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  member,
  onClose,
  onConfirmDelete,
  language,
}) => {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const t = translations[language];

  if (!member) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(member.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (inputText.trim() === member.name.trim()) {
      onConfirmDelete(member.id);
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#09132b] border border-neon-pink/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_40px_rgba(255,0,127,0.2)] relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-neon-pink/15 text-neon-pink flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{t.deleteMember}</h3>
        <p className="text-xs text-text-muted mb-4 leading-relaxed">
          {t.confirmDelete}
        </p>

        {/* Verification Name Box */}
        <div className="bg-[#0d1b3e] border border-white/10 rounded-2xl p-3 mb-4 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-text-muted block">{t.copyVerify}</span>
            <span className="text-base font-bold text-neon-cyan select-all">
              {member.name}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
          </button>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError(false);
            }}
            placeholder={t.enterName}
            className={`w-full bg-[#0d1b3e] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
              error
                ? 'border-neon-pink ring-1 ring-neon-pink/50'
                : 'border-white/10 focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/50'
            }`}
          />
          {error && (
            <p className="text-xs text-neon-pink mt-1.5">{t.verifyAlert}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl bg-neon-pink hover:bg-neon-pink/90 text-white text-xs font-bold shadow-[0_0_20px_rgba(255,0,127,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.delete}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
