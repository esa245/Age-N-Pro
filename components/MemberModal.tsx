'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Calendar, User, Heart, AlertCircle } from 'lucide-react';
import { Member } from '@/types/member';
import { Language, translations } from '@/lib/translations';
import { relationsData } from '@/lib/age-utils';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Omit<Member, 'id'>) => void;
  editingMember: Member | null;
  language: Language;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember,
  language,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('অন্যান্য');
  const [dobDay, setDobDay] = useState('1');
  const [dobMonth, setDobMonth] = useState('0');
  const [dobYear, setDobYear] = useState(new Date().getFullYear().toString());
  const [isDeceased, setIsDeceased] = useState(false);
  const [dodDay, setDodDay] = useState('1');
  const [dodMonth, setDodMonth] = useState('0');
  const [dodYear, setDodYear] = useState(new Date().getFullYear().toString());
  const [photo, setPhoto] = useState('');
  const [error, setError] = useState('');

  // Populate data when editingMember changes
  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setRelation(editingMember.relation);
      setPhoto(editingMember.photo || '');

      const birth = new Date(editingMember.dob);
      if (!isNaN(birth.getTime())) {
        setDobDay(birth.getDate().toString());
        setDobMonth(birth.getMonth().toString());
        setDobYear(birth.getFullYear().toString());
      }

      if (editingMember.dod) {
        setIsDeceased(true);
        const death = new Date(editingMember.dod);
        if (!isNaN(death.getTime())) {
          setDodDay(death.getDate().toString());
          setDodMonth(death.getMonth().toString());
          setDodYear(death.getFullYear().toString());
        }
      } else {
        setIsDeceased(false);
      }
    } else {
      // Default reset
      setName('');
      setRelation('অন্যান্য');
      setDobDay('1');
      setDobMonth('0');
      setDobYear((new Date().getFullYear() - 25).toString());
      setIsDeceased(false);
      setDodDay('1');
      setDodMonth('0');
      setDodYear(new Date().getFullYear().toString());
      setPhoto('');
    }
    setError('');
  }, [editingMember, isOpen]);

  if (!isOpen) return null;

  // Handle Photo File selection and convert to Base64
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      setError(language === 'bn' ? 'ছবির সাইজ ২.৫ এমবি এর কম হতে হবে' : 'Photo must be under 2.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'bn' ? 'সদস্যের নাম লিখুন' : 'Please enter member name');
      return;
    }

    // Build DOB ISO string YYYY-MM-DD
    const birthDate = new Date(Number(dobYear), Number(dobMonth), Number(dobDay));
    const dobString = `${dobYear}-${String(Number(dobMonth) + 1).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`;

    let dodString: string | undefined = undefined;
    if (isDeceased) {
      dodString = `${dodYear}-${String(Number(dodMonth) + 1).padStart(2, '0')}-${String(dodDay).padStart(2, '0')}`;
    }

    onSave({
      name: name.trim(),
      relation,
      dob: dobString,
      dod: dodString,
      photo,
    });
    onClose();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 130 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#09132b] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-6">
          {editingMember ? t.editInfo : t.addNew}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Picker */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-white/20 hover:border-neon-cyan bg-white/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group shrink-0"
            >
              {photo ? (
                <Image
                  src={photo}
                  alt="Preview"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <Camera className="w-6 h-6 text-text-muted group-hover:text-neon-cyan transition-colors" />
                  <span className="text-[10px] text-text-muted mt-1 text-center px-1">
                    {language === 'bn' ? 'ছবি দিন' : 'Photo'}
                  </span>
                </>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{t.selectPhoto}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {language === 'bn'
                  ? 'গ্যালারি থেকে ছবি আপলোড করুন (ঐচ্ছিক)'
                  : 'Upload from device (Optional)'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  className="text-xs text-neon-pink hover:underline mt-1.5 cursor-pointer block"
                >
                  {language === 'bn' ? 'ছবি মুছুন' : 'Remove photo'}
                </button>
              )}
            </div>
          </div>

          {/* Member Name */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t.nameLabel} <span className="text-neon-pink">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder={t.enterName}
                required
                className="w-full bg-[#0d1b3e] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-text-muted/60 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50"
              />
            </div>
          </div>

          {/* Relation Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t.relation}
            </label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full bg-[#0d1b3e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 cursor-pointer"
            >
              {relationsData.map((rel) => (
                <option key={rel.value} value={rel.value} className="bg-[#09132b] text-white">
                  {language === 'bn' ? rel.bn : rel.en}
                </option>
              ))}
            </select>
          </div>

          {/* Date of Birth Picker (Day, Month, Year) */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t.dob}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Day */}
              <select
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                className="bg-[#0d1b3e] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-neon-cyan"
              >
                {days.map((d) => (
                  <option key={d} value={d} className="bg-[#09132b]">
                    {d}
                  </option>
                ))}
              </select>

              {/* Month */}
              <select
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
                className="bg-[#0d1b3e] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-neon-cyan"
              >
                {t.months.map((m, idx) => (
                  <option key={idx} value={idx} className="bg-[#09132b]">
                    {m}
                  </option>
                ))}
              </select>

              {/* Year */}
              <select
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                className="bg-[#0d1b3e] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-neon-cyan"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-[#09132b]">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deceased Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDeceased}
                onChange={(e) => setIsDeceased(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-neon-pink focus:ring-neon-pink cursor-pointer"
              />
              <span className="text-sm font-medium text-text-muted hover:text-white transition-colors">
                {t.deceased}
              </span>
            </label>
          </div>

          {/* Date of Death Picker (if deceased) */}
          {isDeceased && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2"
            >
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                {t.dod}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={dodDay}
                  onChange={(e) => setDodDay(e.target.value)}
                  className="bg-[#0d1b3e] border border-white/10 rounded-xl p-2.5 text-sm text-white"
                >
                  {days.map((d) => (
                    <option key={d} value={d} className="bg-[#09132b]">
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={dodMonth}
                  onChange={(e) => setDodMonth(e.target.value)}
                  className="bg-[#0d1b3e] border border-white/10 rounded-xl p-2.5 text-sm text-white"
                >
                  {t.months.map((m, idx) => (
                    <option key={idx} value={idx} className="bg-[#09132b]">
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={dodYear}
                  onChange={(e) => setDodYear(e.target.value)}
                  className="bg-[#0d1b3e] border border-white/10 rounded-xl p-2.5 text-sm text-white"
                >
                  {years.map((y) => (
                    <option key={y} value={y} className="bg-[#09132b]">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-accent-blue text-white text-sm font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {t.save}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
