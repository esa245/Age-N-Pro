'use client';

import React, { useMemo } from 'react';
import { Users, Crown, Baby, Cake } from 'lucide-react';
import { Member } from '@/types/member';
import { Language } from '@/lib/translations';
import { getDetailedAge } from '@/lib/age-utils';

interface StatsSummaryProps {
  members: Member[];
  language: Language;
}

interface StatsState {
  total: number;
  oldest: string | null;
  youngest: string | null;
  upcomingBday: { name: string; daysLeft: number } | null;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ members, language }) => {
  const stats = useMemo<StatsState>(() => {
    if (members.length === 0) {
      return { total: 0, oldest: null, youngest: null, upcomingBday: null };
    }

    const livingMembers = members.filter((m) => !m.dod);
    const pool = livingMembers.length > 0 ? livingMembers : members;

    // Sort by DOB
    const sorted = [...pool].sort(
      (a, b) => new Date(a.dob).getTime() - new Date(b.dob).getTime()
    );
    const oldest = sorted[0];
    const youngest = sorted[sorted.length - 1];

    // Upcoming birthday calculation
    let closest: { name: string; daysLeft: number } | null = null;
    const now = new Date();

    livingMembers.forEach((m) => {
      const bday = new Date(m.dob);
      let nextBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());

      // If already occurred this year, look at next year
      if (
        nextBday.getTime() <
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      ) {
        nextBday.setFullYear(now.getFullYear() + 1);
      }

      const diff = nextBday.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (!closest || days < closest.daysLeft) {
        closest = { name: m.name, daysLeft: Math.max(0, days) };
      }
    });

    return {
      total: members.length,
      oldest: oldest ? oldest.name : null,
      youngest: youngest ? youngest.name : null,
      upcomingBday: closest,
    };
  }, [members]);

  return (
    <div className="flex flex-col gap-3 my-4 max-w-xl mx-auto w-full">
      {/* 1. TOTAL MEMBERS */}
      <div className="bg-[#09132b] border border-cyan-950/80 rounded-2xl p-4 flex items-center gap-4.5 shadow-md">
        <div className="w-10 h-10 flex items-center justify-center shrink-0 text-neon-cyan">
          <Users className="w-8 h-8 stroke-[1.8]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold text-text-muted/80 tracking-wider uppercase block">
            {language === 'bn' ? 'TOTAL MEMBERS' : 'TOTAL MEMBERS'}
          </span>
          <span className="text-base sm:text-lg font-bold text-neon-yellow block truncate mt-0.5">
            {stats.total} {stats.total === 1 ? 'Persons' : 'Persons'}
          </span>
        </div>
      </div>

      {/* 2. OLDEST MEMBER */}
      <div className="bg-[#09132b] border border-cyan-950/80 rounded-2xl p-4 flex items-center gap-4.5 shadow-md">
        <div className="w-10 h-10 flex items-center justify-center shrink-0 text-neon-yellow">
          <Crown className="w-8 h-8 stroke-[1.8]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold text-text-muted/80 tracking-wider uppercase block">
            {language === 'bn' ? 'OLDEST MEMBER' : 'OLDEST MEMBER'}
          </span>
          <span className="text-base sm:text-lg font-bold text-neon-yellow block truncate mt-0.5">
            {stats.oldest || '-'}
          </span>
        </div>
      </div>

      {/* 3. YOUNGEST MEMBER */}
      <div className="bg-[#09132b] border border-cyan-950/80 rounded-2xl p-4 flex items-center gap-4.5 shadow-md">
        <div className="w-10 h-10 flex items-center justify-center shrink-0 text-neon-pink">
          <Baby className="w-8 h-8 stroke-[1.8]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold text-text-muted/80 tracking-wider uppercase block">
            {language === 'bn' ? 'YOUNGEST MEMBER' : 'YOUNGEST MEMBER'}
          </span>
          <span className="text-base sm:text-lg font-bold text-neon-yellow block truncate mt-0.5">
            {stats.youngest || '-'}
          </span>
        </div>
      </div>

      {/* 4. UPCOMING BIRTHDAY */}
      <div className="bg-[#09132b] border border-cyan-950/80 rounded-2xl p-4 flex items-center gap-4.5 shadow-md">
        <div className="w-10 h-10 flex items-center justify-center shrink-0 text-neon-green">
          <Cake className="w-8 h-8 stroke-[1.8]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold text-text-muted/80 tracking-wider uppercase block">
            {language === 'bn' ? 'UPCOMING BIRTHDAY' : 'UPCOMING BIRTHDAY'}
          </span>
          <span className="text-base sm:text-lg font-bold text-neon-yellow block truncate mt-0.5">
            {stats.upcomingBday
              ? `${stats.upcomingBday.name} (${stats.upcomingBday.daysLeft} days)`
              : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};
