'use client';

import React from 'react';
import { Menu, UserPlus, Share2 } from 'lucide-react';
import { Language } from '@/lib/translations';

interface HeaderProps {
  language: Language;
  onOpenAddModal: () => void;
  onOpenSidebar: () => void;
  onOpenShareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onOpenAddModal,
  onOpenSidebar,
  onOpenShareModal,
}) => {
  return (
    <header className="pt-4 pb-2 px-4 max-w-xl mx-auto w-full">
      {/* Top Bar: Menu Button - Title - Add Member Button */}
      <div className="flex items-center justify-between gap-4">
        {/* Menu Button (Left) */}
        <button
          onClick={onOpenSidebar}
          aria-label="Menu"
          className="w-12 h-12 rounded-2xl bg-[#09132b] border border-white/15 flex items-center justify-center text-neon-cyan hover:bg-white/10 transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
        >
          <Menu className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* Brand Title (Center) */}
        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]">
            Age N Pro
          </h1>
        </div>

        {/* Add Member Button (Right, Cyan Glowing Square) */}
        <button
          onClick={onOpenAddModal}
          aria-label="Add Member"
          className="w-12 h-12 rounded-2xl bg-[#00f2fe] text-[#040817] flex items-center justify-center shadow-[0_0_22px_rgba(0,242,254,0.6)] hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Subtitle / Tagline below header */}
      <div className="text-center mt-4 mb-2">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-neon-cyan drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]">
          {language === 'bn'
            ? 'FAMILY EDITION • KNOW YOUR EXACT AGE'
            : 'FAMILY EDITION • KNOW YOUR EXACT AGE'}
        </p>
      </div>
    </header>
  );
};
