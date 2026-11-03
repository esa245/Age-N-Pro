'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Trash2, Timer, Cake } from 'lucide-react';
import { Member } from '@/types/member';
import { Language } from '@/lib/translations';
import { getDetailedAge } from '@/lib/age-utils';

interface MemberCardProps {
  member: Member;
  language: Language;
  currentTime: Date;
  onEdit: (member: Member) => void;
  onDeleteRequest: (member: Member) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  language,
  currentTime,
  onEdit,
  onDeleteRequest,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate detailed age
  const age = getDetailedAge(member.dob, currentTime, member.dod);
  const isDeceased = Boolean(member.dod);

  // Compact age string like "20Y 6M 0D"
  const ageCompact = `${age.years}Y ${age.months}M ${age.days}D`;

  const initial = member.name.trim().charAt(0) || '?';

  return (
    <div className="max-w-xl mx-auto w-full my-3">
      {/* Main Card with rounded-3xl and emerald/neon-green border */}
      <div className="bg-[#09132b] border-2 border-emerald-500/80 rounded-[30px] p-3.5 sm:p-4 shadow-[0_4px_25px_rgba(16,185,129,0.15)] transition-all">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Avatar + Details */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer select-none"
          >
            {/* Avatar with Neon Green Ring */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-neon-green overflow-hidden shrink-0 bg-[#040817] flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.3)]">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xl sm:text-2xl font-black text-neon-green uppercase">
                  {initial}
                </span>
              )}
            </div>

            {/* Name, Relation Badge & Age in Yellow */}
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
                {member.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {/* Relation Pill */}
                <span className="px-3 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-800 text-neon-cyan text-xs font-semibold tracking-wide">
                  {member.relation}
                </span>

                {/* Age String: "20Y 6M 0D" in bright yellow */}
                <span
                  suppressHydrationWarning
                  className="text-neon-yellow font-bold text-sm sm:text-base tracking-wide"
                >
                  {ageCompact}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Icons: Edit & Delete */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Edit Button (Dark Circle) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(member);
              }}
              title="Edit"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {/* Delete Button (Dark Circle) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(member);
              }}
              title="Delete"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-neon-pink/20 hover:text-neon-pink text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Details (Live Seconds counter, etc.) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3 pt-3 border-t border-white/10"
            >
              {/* Live Seconds Counter */}
              <div className="bg-[#0d1b3e] rounded-2xl p-3 text-center mb-2.5 border border-white/5">
                <div className="flex items-center justify-center gap-1.5 text-xs text-neon-cyan font-semibold mb-1">
                  <Timer className="w-3.5 h-3.5 animate-spin" />
                  <span>{isDeceased ? 'Total Lifespan Seconds' : 'Total Seconds (Live)'}</span>
                </div>
                <span
                  suppressHydrationWarning
                  className="font-mono text-lg sm:text-xl font-extrabold text-white tracking-wider"
                >
                  {age.totalSeconds.toLocaleString()}
                </span>
              </div>

              {/* Total Detailed Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/5 rounded-xl p-2">
                  <span suppressHydrationWarning className="font-bold text-white block">
                    {(age.years * 12 + age.months).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-text-muted">Total Months</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <span suppressHydrationWarning className="font-bold text-white block">
                    {age.totalDays.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-text-muted">Total Days</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <span suppressHydrationWarning className="font-bold text-white block">
                    {age.totalHours.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-text-muted">Total Hours</span>
                </div>
              </div>

              {/* Next Birthday */}
              {!isDeceased && (
                <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5 text-neon-pink">
                    <Cake className="w-3.5 h-3.5" />
                    <span>Next Birthday:</span>
                  </div>
                  <span suppressHydrationWarning className="font-bold text-white">
                    {age.daysUntilBday === 0 ? 'Today 🎉' : `${age.daysUntilBday} days left`}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
