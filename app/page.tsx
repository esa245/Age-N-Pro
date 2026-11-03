'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { Member } from '@/types/member';
import { Language, translations } from '@/lib/translations';
import { useFamilyStorage } from '@/hooks/useFamilyStorage';

// Modular Components matching exact UI design
import { Header } from '@/components/Header';
import { StatsSummary } from '@/components/StatsSummary';
import { SearchBar } from '@/components/SearchBar';
import { MemberCard } from '@/components/MemberCard';
import { MemberModal } from '@/components/MemberModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ShareModal } from '@/components/ShareModal';
import { Sidebar } from '@/components/Sidebar';

export default function AgeCalculatorPage() {
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    backupData,
    restoreData,
    importSharedData,
  } = useFamilyStorage();

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('APP_LANGUAGE') as Language;
      if (saved === 'bn' || saved === 'en') return saved;
    }
    return 'bn';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<Member | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Notification state initialized with lazy function
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const notifiedBirthdaysRef = useRef<Set<string>>(new Set());

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[language];

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Shared family data import via URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const shareData = params.get('share');
      if (shareData) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(shareData)))));
        if (Array.isArray(decoded) && decoded.length > 0) {
          const count = importSharedData(decoded);
          const msg =
            language === 'bn'
              ? `${count} জন সদস্যের তথ্য যোগ করা হয়েছে!`
              : `Imported ${count} members!`;
          setTimeout(() => showToast(msg), 100);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (err) {
      console.error('Failed to parse share data', err);
    }
  }, [importSharedData, language, showToast]);

  // Live timer for exact seconds counters
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Birthday notification
  useEffect(() => {
    if (notificationPermission !== 'granted' || members.length === 0) return;

    const today = new Date();
    members.forEach((m) => {
      if (m.dod) return;
      const birth = new Date(m.dob);
      if (
        birth.getDate() === today.getDate() &&
        birth.getMonth() === today.getMonth()
      ) {
        const key = `${m.id}_${today.toDateString()}`;
        if (!notifiedBirthdaysRef.current.has(key)) {
          notifiedBirthdaysRef.current.add(key);
          try {
            new Notification(t.bdayNotifTitle, {
              body: t.bdayNotifBody(m.name),
              icon: 'https://res.cloudinary.com/dlklqihg6/image/upload/v1793605832/naydn7myt42abjuizhmm.png',
            });
          } catch (e) {
            console.error('Notification error', e);
          }
        }
      }
    });
  }, [members, notificationPermission, t]);

  const handleToggleLanguage = () => {
    const next: Language = language === 'bn' ? 'en' : 'bn';
    setLanguage(next);
    localStorage.setItem('APP_LANGUAGE', next);
  };

  const handleRequestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert(t.browserNotifError);
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        showToast(
          language === 'bn'
            ? 'জন্মদিন নোটিফিকেশন চালু করা হয়েছে!'
            : 'Birthday notifications enabled!'
        );
      }
    } catch (e) {
      console.error('Notification permission error', e);
    }
  };

  const handleSaveMember = (memberData: Omit<Member, 'id'>) => {
    if (editingMember) {
      updateMember({ ...memberData, id: editingMember.id });
      showToast(
        language === 'bn'
          ? 'সদস্যের তথ্য আপডেট হয়েছে!'
          : 'Member updated successfully!'
      );
    } else {
      addMember(memberData);
      showToast(
        language === 'bn'
          ? 'নতুন সদস্য যোগ করা হয়েছে!'
          : 'New member added!'
      );
    }
    setEditingMember(null);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await restoreData(file);
    if (res.success) {
      showToast(
        language === 'bn'
          ? `${res.count} জন সদস্যের ডেটা রিস্টোর হয়েছে!`
          : `Restored ${res.count} members!`
      );
    } else {
      alert(t.restoreError);
    }
    e.target.value = '';
  };

  // Filter members by query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.relation.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  return (
    <div className="min-h-screen bg-[#040817] text-white flex flex-col font-sans selection:bg-neon-cyan selection:text-bg-dark pb-10">
      {/* 1. Top Header: [Menu] - Age N Pro - [UserPlus Add Button] */}
      <Header
        language={language}
        onOpenAddModal={() => {
          setEditingMember(null);
          setIsMemberModalOpen(true);
        }}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Main Content Area matching Screenshot */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4">
        {/* 2. Overview Summary Cards (Stacked: Total, Oldest, Youngest, Upcoming) */}
        <StatsSummary members={members} language={language} />

        {/* 3. Search Bar with Pill shape & Bell icon on right */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notificationPermission={notificationPermission}
          onRequestNotification={handleRequestNotification}
        />

        {/* 4. Member Cards (Green rounded border with circular avatar, name, relation pill, yellow age, edit/delete circles) */}
        {filteredMembers.length > 0 ? (
          <div className="space-y-3 mb-6">
            <AnimatePresence mode="popLayout">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  language={language}
                  currentTime={currentTime}
                  onEdit={(m) => {
                    setEditingMember(m);
                    setIsMemberModalOpen(true);
                  }}
                  onDeleteRequest={(m) => setDeleteConfirmMember(m)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-3xl bg-[#09132b] border border-white/10 my-4">
            <p className="text-sm font-semibold text-text-muted">
              {members.length === 0
                ? (language === 'bn' ? 'কোনো সদস্য নেই। উপরের বোতাম দিয়ে সদস্য যোগ করুন।' : 'No members yet. Tap the button above to add someone.')
                : t.noMemberFound}
            </p>
          </div>
        )}
      </main>

      {/* Add / Edit Member Modal */}
      <MemberModal
        key={editingMember ? editingMember.id : 'new-member-modal'}
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        editingMember={editingMember}
        language={language}
      />

      {/* Security Verification Delete Modal */}
      <DeleteConfirmModal
        member={deleteConfirmMember}
        onClose={() => setDeleteConfirmMember(null)}
        onConfirmDelete={(id) => {
          deleteMember(id);
          showToast(
            language === 'bn'
              ? 'সদস্য মুছে ফেলা হয়েছে'
              : 'Member deleted successfully'
          );
        }}
        language={language}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        members={members}
        onBackup={backupData}
        language={language}
      />

      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        notificationPermission={notificationPermission}
        onRequestNotification={handleRequestNotification}
        onBackup={backupData}
        onRestoreFileSelect={handleRestoreFile}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#09132b] border border-neon-green/40 text-white shadow-[0_0_25px_rgba(0,255,136,0.25)] text-xs font-semibold backdrop-blur-xl">
            <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
