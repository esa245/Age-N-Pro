'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Crown, 
  Baby, 
  Cake, 
  Search, 
  UserPlus, 
  Download, 
  Upload, 
  Trash2, 
  Pencil, 
  X, 
  Check, 
  Calendar, 
  Clock, 
  Timer,
  Camera,
  Copy,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  LogIn,
  Menu,
  Bell,
  BellOff,
  Languages,
  Share2
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  saveToDrive, 
  loadFromDrive 
} from '@/lib/firebase';
import { User } from 'firebase/auth';
import { 
  getDetailedAge, 
  AgeDetails, 
  relationsData 
} from '@/lib/age-utils';
import { translations, Language } from '@/lib/translations';
import Image from 'next/image';
import AdBanner from '@/components/AdBanner';

interface Member {
  id: string;
  name: string;
  relation: string;
  dob: string;
  dod?: string; // Date of Death
  photo: string;
}

const STORAGE_KEY = 'AGE_CALC_FAMILY_MEMBERS';

export default function AgeCalculatorPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<Member | null>(null);
  const [deleteInputText, setDeleteInputText] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relation: 'অন্যান্য',
    dobDay: '1',
    dobMonth: '0',
    dobYear: new Date().getFullYear().toString(),
    isDeceased: false,
    dodDay: '1',
    dodMonth: '0',
    dodYear: new Date().getFullYear().toString(),
    photo: '',
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('bn');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const t = translations[language];
  
  // Auth & Sync State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Refs for auto-update
  const importFileRef = useRef<HTMLInputElement>(null);
  const notifiedTodayRef = useRef<Set<string>>(new Set());

  const handleSyncFromDrive = React.useCallback(async (token: string) => {
    try {
      setIsSyncing(true);
      const data = await loadFromDrive(token);
      if (data && Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setMembers(data);
        setLastSyncTime(new Date());
      }
    } catch (e) {
      console.error('Failed to sync from Drive', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleLogin = React.useCallback(async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        await handleSyncFromDrive(result.accessToken);
      }
    } catch (e: any) {
      // Gracefully handle common auth errors
      if (e.code === 'auth/popup-closed-by-user') {
        console.log('User closed the login popup.');
      } else if (e.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled.');
      } else {
        console.error('Login failed:', e);
        alert(t.errorLogin);
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, [handleSyncFromDrive, t.errorLogin]);

  const handleLogout = React.useCallback(async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  }, []);

  const toggleLanguage = () => {
    const newLang: Language = language === 'bn' ? 'en' : 'bn';
    setLanguage(newLang);
    localStorage.setItem('APP_LANGUAGE', newLang);
  };

  const saveToStorage = React.useCallback(async (newMembers: Member[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMembers));
    setMembers(newMembers);

    // Auto-sync to Drive if logged in
    if (accessToken) {
      try {
        setIsSyncing(true);
        await saveToDrive(accessToken, newMembers);
        setLastSyncTime(new Date());
      } catch (e) {
        console.error('Failed to sync to Drive', e);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [accessToken]);

  // 1. Load Local Settings & Data (Mount Only)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let initialMembers: Member[] = [];
    if (saved) {
      try {
        initialMembers = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMembers(initialMembers);
      } catch (e) {
        console.error('Failed to parse saved members', e);
      }
    }

    const savedLang = (localStorage.getItem('APP_LANGUAGE') as Language) || 'bn';
    if (savedLang === 'bn' || savedLang === 'en') {
      setLanguage(savedLang);
    }

    // Handle shared data from URL (Once on mount)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    if (sharedData) {
      try {
        const decodedStr = decodeURIComponent(escape(window.atob(sharedData)));
        const decoded = JSON.parse(decodedStr);
        if (Array.isArray(decoded) && confirm(translations[savedLang].shareConfirmImport)) {
          setMembers(prev => {
            const merged = [...prev];
            decoded.forEach(newMember => {
              if (!merged.find(m => m.id === newMember.id)) {
                merged.push(newMember);
              }
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
          
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      } catch (e) {
        console.error('Failed to parse shared data', e);
      }
    }

    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // 2. Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setAccessToken(token);
        // Initial sync from drive if logged in
        handleSyncFromDrive(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
  }, [handleSyncFromDrive]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Birthday Notification Logic
  useEffect(() => {
    if (notificationPermission !== 'granted' || members.length === 0) return;

    const today = new Date();
    const todayStr = today.toDateString();
    
    // Clear notified set if the day changed
    const lastCheckDate = localStorage.getItem('LAST_BDAY_CHECK_DATE');
    if (lastCheckDate !== todayStr) {
      notifiedTodayRef.current.clear();
      localStorage.setItem('LAST_BDAY_CHECK_DATE', todayStr);
    }

    members.forEach(member => {
      // Skip deceased members for birthday notifications
      if (member.dod) return;

      const bday = new Date(member.dob);
      if (
        today.getMonth() === bday.getMonth() && 
        today.getDate() === bday.getDate() &&
        !notifiedTodayRef.current.has(member.id)
      ) {
        new Notification(t.bdayNotifTitle, {
          body: t.bdayNotifBody(member.name),
          icon: member.photo || "/favicon.ico"
        });
        notifiedTodayRef.current.add(member.id);
      }
    });
  }, [currentTime, members, notificationPermission, t]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert(t.browserNotifError);
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };



  const handleOpenModal = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      const dob = new Date(member.dob);
      const dod = member.dod ? new Date(member.dod) : null;
      setFormData({
        name: member.name,
        relation: member.relation,
        dobDay: dob.getDate().toString(),
        dobMonth: dob.getMonth().toString(),
        dobYear: dob.getFullYear().toString(),
        isDeceased: !!member.dod,
        dodDay: dod ? dod.getDate().toString() : '1',
        dodMonth: dod ? dod.getMonth().toString() : '0',
        dodYear: dod ? dod.getFullYear().toString() : new Date().getFullYear().toString(),
        photo: member.photo,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        relation: 'অন্যান্য',
        dobDay: '1',
        dobMonth: '0',
        dobYear: new Date().getFullYear().toString(),
        isDeceased: false,
        dodDay: '1',
        dodMonth: '0',
        dodYear: new Date().getFullYear().toString(),
        photo: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dob = new Date(
      parseInt(formData.dobYear),
      parseInt(formData.dobMonth),
      parseInt(formData.dobDay)
    ).toISOString();

    const dod = formData.isDeceased 
      ? new Date(
          parseInt(formData.dodYear),
          parseInt(formData.dodMonth),
          parseInt(formData.dodDay)
        ).toISOString()
      : undefined;

    let newMembers: Member[];
    if (editingMember) {
      newMembers = members.map(m => 
        m.id === editingMember.id 
          ? { ...m, name: formData.name, relation: formData.relation, dob, dod, photo: formData.photo }
          : m
      );
    } else {
      const newMember: Member = {
        id: 'mem_' + Date.now(),
        name: formData.name,
        relation: formData.relation,
        dob,
        dod,
        photo: formData.photo || `https://picsum.photos/seed/${Date.now()}/200`,
      };
      newMembers = [...members, newMember];
    }

    saveToStorage(newMembers);
    handleCloseModal();
  };

  const handleDelete = (member: Member) => {
    setDeleteConfirmMember(member);
    setDeleteInputText('');
  };

  const confirmDelete = () => {
    if (!deleteConfirmMember) return;
    if (deleteInputText !== deleteConfirmMember.name) {
      alert(t.verifyAlert);
      return;
    }
    const newMembers = members.filter(m => m.id !== deleteConfirmMember.id);
    saveToStorage(newMembers);
    setDeleteConfirmMember(null);
  };

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(name);
    alert(t.copyAlert);
  };

  const handleExport = () => {
    if (members.length === 0) return alert(t.backupNoData);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `family_age_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          saveToStorage(imported);
          alert("ডেটা সফলভাবে রিস্টোর করা হয়েছে!");
        } else {
          alert("ভুল ফাইল ফরম্যাট!");
        }
      } catch (err) {
        alert("ফাইল পড়তে সমস্যা হয়েছে!");
      }
    };
    reader.readAsText(file);
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.relation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics calculations
  const livingMembers = members.filter(m => !m.dod);
  const totalMembersCount = members.length;
  
  const sortedByAge = [...members].sort((a, b) => new Date(a.dob).getTime() - new Date(b.dob).getTime());
  const oldestMember = sortedByAge.length > 0 ? sortedByAge[0].name : '-';
  const youngestMember = sortedByAge.length > 0 ? sortedByAge[sortedByAge.length - 1].name : '-';
  
  let nextBdayName = '-';
  let nextBdayDays = '-';
  if (livingMembers.length > 0) {
    const bdays = livingMembers.map(m => ({ 
      name: m.name, 
      days: getDetailedAge(m.dob, currentTime).daysUntilBday 
    }));
    const closest = bdays.sort((a, b) => a.days - b.days)[0];
    nextBdayName = closest.name;
    nextBdayDays = closest.days.toString();
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 font-sans">
      {/* Sidebar Navigation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-[80] w-72 bg-card-bg border-r border-white/10 shadow-2xl p-6 font-bengali flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-accent-blue flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="font-bold text-lg text-white">{t.menu}</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-text-muted">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest px-2">{t.dataMgmt}</p>
                  <button onClick={() => { handleExport(); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white transition-colors group text-left">
                    <div className="p-2 rounded-lg bg-neon-cyan/10 text-neon-cyan group-hover:bg-neon-cyan group-hover:text-bg-dark transition-all">
                      <Download className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{t.backup}</span>
                  </button>
                  <button onClick={() => { importFileRef.current?.click(); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white transition-colors group text-left">
                    <div className="p-2 rounded-lg bg-neon-yellow/10 text-neon-yellow group-hover:bg-neon-yellow group-hover:text-bg-dark transition-all">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{t.restore}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest px-2">{t.appSettings}</p>
                  
                  <button onClick={() => { setIsShareModalOpen(true); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white transition-colors group text-left">
                    <div className="p-2 rounded-lg bg-neon-green/10 text-neon-green group-hover:bg-neon-green group-hover:text-bg-dark transition-all">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{t.share}</span>
                  </button>
                  
                  {/* Language Toggle */}
                  <button onClick={toggleLanguage} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white transition-colors group text-left">
                    <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue group-hover:bg-accent-blue group-hover:text-white transition-all">
                      <Languages className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium block">{t.language}</span>
                      <span className="text-[10px] text-text-muted uppercase font-bold">{language === 'bn' ? 'English' : 'বাংলা'}</span>
                    </div>
                  </button>

                  {notificationPermission !== 'granted' ? (
                    <button onClick={() => { requestNotificationPermission(); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white transition-colors group text-left">
                      <div className="p-2 rounded-lg bg-neon-pink/10 text-neon-pink group-hover:bg-neon-pink group-hover:text-white transition-all">
                        <Bell className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{t.enableNotif}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-green/5 text-neon-green">
                      <div className="p-2 rounded-lg bg-neon-green/10">
                        <Check className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{t.notifActive}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                {user ? (
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-neon-pink/10 text-neon-pink hover:bg-neon-pink hover:text-white transition-all font-bold">
                    <LogOut className="w-5 h-5" /> {t.logout}
                  </button>
                ) : (
                  <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-white text-black hover:bg-gray-200 transition-all font-bold">
                    <LogIn className="w-5 h-5" /> {t.login}
                  </button>
                )}
              </div>
              <AdBanner />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 rounded-2xl bg-card-bg border border-white/10 text-neon-cyan hover:scale-110 active:scale-95 transition-all shadow-lg"
            title="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-neon-cyan to-white bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]"
            >
              {t.title}
            </motion.h1>
          </div>

          <button 
            onClick={() => handleOpenModal()} 
            className="p-3 rounded-2xl bg-gradient-to-br from-accent-blue to-neon-cyan text-white hover:scale-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,198,255,0.4)]"
            title="Add Member"
          >
            <UserPlus className="w-6 h-6" />
          </button>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-neon-green font-medium tracking-[0.3em] mt-2 font-bengali text-center text-xs md:text-sm uppercase"
        >
          {t.subtitle}
        </motion.p>

        {/* Auth & Sync Bar (Compact) */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center justify-center gap-4 bg-card-bg/30 backdrop-blur-md border border-white/5 p-2 rounded-2xl max-w-fit mx-auto font-bengali"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-neon-cyan/50 relative">
                {user.photoURL && (
                  <Image src={user.photoURL} alt={user.displayName || 'User'} fill className="object-cover" referrerPolicy="no-referrer" />
                )}
              </div>
              <p className="text-[10px] font-bold text-white/80 truncate max-w-[100px]">{user.displayName || user.email}</p>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-[10px]">
              {isSyncing ? (
                <RefreshCw className="w-3 h-3 text-neon-cyan animate-spin" />
              ) : lastSyncTime ? (
                <Cloud className="w-3 h-3 text-neon-green" />
              ) : (
                <CloudOff className="w-3 h-3 text-text-muted" />
              )}
              <span className={isSyncing ? 'text-neon-cyan' : 'text-text-muted'}>
                {isSyncing ? t.syncing : lastSyncTime ? `${t.lastSync}: ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : t.noSync}
              </span>
            </div>
          </motion.div>
        )}
      </header>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-bengali">
        <StatCard icon={<Users className="w-8 h-8 text-neon-cyan" />} label={t.totalMembers} value={`${totalMembersCount} ${t.personUnit}`} />
        <StatCard icon={<Crown className="w-8 h-8 text-neon-yellow" />} label={t.oldest} value={oldestMember} />
        <StatCard icon={<Baby className="w-8 h-8 text-neon-pink" />} label={t.youngest} value={youngestMember} />
        <StatCard icon={<Cake className="w-8 h-8 text-neon-green" />} label={t.upcomingBday} value={nextBdayName !== '-' ? `${nextBdayName} (${nextBdayDays} ${t.daysLeft.split(' ')[0]})` : '-'} />
      </div>

      {/* Sticky Controls & Search */}
      <div className="sticky top-4 z-40 mb-8 flex flex-col gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-neon-cyan/10 blur-xl group-focus-within:bg-neon-cyan/20 transition-all rounded-full" />
          <div className="relative flex items-center bg-card-bg/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl focus-within:border-neon-cyan/50 transition-all">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-white focus:outline-none font-bengali text-sm md:text-base placeholder:text-text-muted/50"
              />
            </div>
            {notificationPermission !== 'granted' && (
              <button 
                onClick={requestNotificationPermission}
                className="p-3 rounded-full text-neon-yellow hover:bg-neon-yellow/10 transition-colors animate-pulse"
                title="Enable Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <MemberCard 
                key={member.id} 
                member={member} 
                onEdit={() => handleOpenModal(member)} 
                onDelete={() => handleDelete(member)} 
                currentTime={currentTime}
                isExpanded={expandedMemberId === member.id}
                onToggleExpand={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                language={language}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-text-muted py-20 font-bengali"
            >
              {t.noMemberFound}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card-bg border-2 border-neon-cyan rounded-3xl p-6 shadow-[0_0_40px_rgba(0,242,254,0.3)] font-bengali"
            >
              <button onClick={handleCloseModal} className="absolute top-4 right-4 text-white hover:text-neon-pink">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-neon-cyan mb-6">{editingMember ? t.editInfo : t.addNew}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neon-green bg-black relative">
                      <Image 
                        src={formData.photo || "https://picsum.photos/seed/user/200"} 
                        alt="Preview" 
                        fill 
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <label className="absolute bottom-0 right-0 bg-neon-green text-bg-dark p-2 rounded-full cursor-pointer hover:scale-110 transition-transform">
                      <Camera className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                  <p className="text-xs text-text-muted">{t.selectPhoto}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-text-muted">{t.nameLabel}</label>
                  <input 
                    type="text" 
                    required
                    placeholder={language === 'bn' ? "উদাঃ মোঃ রহিম" : "e.g. John Doe"}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-card-inner border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-text-muted">{t.relation}</label>
                  <select 
                    value={formData.relation}
                    onChange={(e) => setFormData(prev => ({ ...prev, relation: e.target.value }))}
                    className="w-full bg-card-inner border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan"
                  >
                    {relationsData.map(r => (
                      <option key={r.value} value={r.value}>{r[language]}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-text-muted">{t.dob}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select 
                      value={formData.dobDay}
                      onChange={(e) => setFormData(prev => ({ ...prev, dobDay: e.target.value }))}
                      className="bg-card-inner border border-white/10 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-neon-cyan"
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select 
                      value={formData.dobMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dobMonth: e.target.value }))}
                      className="bg-card-inner border border-white/10 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-neon-cyan"
                    >
                      {t.months.map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                      ))}
                    </select>
                    <select 
                      value={formData.dobYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, dobYear: e.target.value }))}
                      className="bg-card-inner border border-white/10 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-neon-cyan"
                    >
                      {Array.from({length: 120}, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isDeceased ? 'bg-neon-pink border-neon-pink' : 'border-white/20'}`}>
                      {formData.isDeceased && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={formData.isDeceased}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDeceased: e.target.checked }))}
                    />
                    <span className="text-sm text-text-muted group-hover:text-white transition-colors">{t.deceased}</span>
                  </label>
                </div>

                {formData.isDeceased && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1 overflow-hidden"
                  >
                    <label className="text-sm text-neon-pink">{t.dod}</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select 
                        value={formData.dodDay}
                        onChange={(e) => setFormData(prev => ({ ...prev, dodDay: e.target.value }))}
                        className="bg-card-inner border border-neon-pink/20 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-neon-pink"
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <select 
                        value={formData.dodMonth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dodMonth: e.target.value }))}
                        className="bg-card-inner border border-neon-pink/20 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-neon-pink"
                      >
                        {t.months.map((m, i) => (
                          <option key={m} value={i}>{m}</option>
                        ))}
                      </select>
                      <select 
                        value={formData.dodYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, dodYear: e.target.value }))}
                        className="bg-card-inner border border-neon-pink/20 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-neon-pink"
                      >
                        {Array.from({length: 120}, (_, i) => new Date().getFullYear() - i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}

                <button type="submit" className="w-full bg-gradient-to-r from-accent-blue to-neon-cyan py-4 rounded-xl font-bold text-lg mt-4 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                  <Check className="w-6 h-6" /> {t.save}
                </button>
              </form>
              <AdBanner />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmMember && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmMember(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-card-bg border-2 border-neon-pink rounded-3xl p-6 shadow-[0_0_40px_rgba(255,0,127,0.3)] font-bengali text-center"
            >
              <h2 className="text-xl font-bold text-neon-pink mb-4">{t.deleteMember}</h2>
              
              <div className="bg-card-inner border border-white/10 rounded-2xl p-4 mb-6">
                <p className="text-text-muted text-sm mb-2">{t.copyVerify}</p>
                <div className="flex items-center justify-center gap-3 bg-black/40 py-2 px-4 rounded-xl border border-neon-pink/20">
                  <span className="text-lg font-bold text-white">{deleteConfirmMember.name}</span>
                  <button 
                    onClick={() => handleCopyName(deleteConfirmMember.name)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-neon-cyan"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder={t.enterName}
                  value={deleteInputText}
                  onChange={(e) => setDeleteInputText(e.target.value)}
                  className="w-full bg-card-inner border border-white/10 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-neon-pink"
                />

                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteConfirmMember(null)}
                    className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-semibold transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={confirmDelete}
                    disabled={deleteInputText !== deleteConfirmMember.name}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      deleteInputText === deleteConfirmMember.name 
                        ? 'bg-neon-pink text-white hover:scale-105' 
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-5 h-5" /> {t.delete}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-card-bg border-2 border-neon-cyan rounded-3xl p-8 shadow-[0_0_50px_rgba(0,242,254,0.3)] font-bengali text-center"
            >
              <button onClick={() => setIsShareModalOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-white">
                <X className="w-6 h-6" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 text-neon-cyan flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">{t.shareTitle}</h2>
              <p className="text-sm text-text-muted mb-6">{t.shareDesc}</p>

              <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <QRCodeCanvas 
                  value={`${window.location.origin}${window.location.pathname}?share=${window.btoa(unescape(encodeURIComponent(JSON.stringify(members))))}`}
                  size={160}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <button 
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}?share=${window.btoa(unescape(encodeURIComponent(JSON.stringify(members))))}`;
                  navigator.clipboard.writeText(url);
                  alert(t.linkCopied);
                }}
                className="w-full flex items-center justify-center gap-3 bg-neon-cyan text-bg-dark py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(0,242,254,0.4)]"
              >
                <Copy className="w-5 h-5" /> {t.copyLink}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AdBanner />
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-card-bg border border-neon-green/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg"
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <h4 className="text-[10px] text-text-muted uppercase tracking-tighter">{label}</h4>
        <p className="text-lg font-bold text-neon-yellow truncate">{value}</p>
      </div>
    </motion.div>
  );
}

function MemberCard({ member, onEdit, onDelete, currentTime, isExpanded, onToggleExpand, language }: { 
  member: Member, 
  onEdit: () => void, 
  onDelete: () => void, 
  currentTime: Date,
  isExpanded: boolean,
  onToggleExpand: () => void,
  language: Language
}) {
  const t = translations[language];
  const age = React.useMemo(() => getDetailedAge(member.dob, currentTime, member.dod), [member.dob, currentTime, member.dod]);

  const relationLabel = relationsData.find(r => r.value === member.relation)?.[language] || member.relation;

  if (!age) return null;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={onToggleExpand}
      className={`bg-card-bg border-2 rounded-[2rem] shadow-lg overflow-hidden relative cursor-pointer transition-all duration-300 ${
        isExpanded ? 'p-6' : 'p-4 hover:border-white/20'
      } ${member.dod ? 'border-neon-pink/30 shadow-[0_0_25px_rgba(255,0,127,0.08)]' : 'border-neon-green/30 shadow-[0_0_25px_rgba(0,255,136,0.08)]'}`}
    >
      <div className={`flex items-center gap-4 ${isExpanded ? 'pb-6 border-b border-white/10 mb-6' : ''}`}>
        <div className={`relative shrink-0 p-1 rounded-full bg-gradient-to-br transition-all duration-300 ${
          isExpanded ? 'w-24 h-24' : 'w-14 h-14'
        } ${member.dod ? 'from-neon-pink to-neon-yellow' : 'from-neon-green to-neon-cyan'}`}>
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-black relative bg-black">
            <Image 
              src={member.photo} 
              alt={member.name} 
              fill 
              className={`object-cover ${member.dod ? 'grayscale' : ''}`}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <h3 className={`font-bold text-white truncate transition-all ${isExpanded ? 'text-2xl' : 'text-lg'}`}>{member.name}</h3>
            {member.dod && isExpanded && (
              <span className="inline-flex items-center gap-1 bg-neon-pink/20 text-neon-pink text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter w-fit">
                <X className="w-3 h-3" /> {language === 'bn' ? 'মৃত' : 'Deceased'}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full font-bengali ${member.dod ? 'bg-neon-pink/15 text-neon-pink' : 'bg-neon-cyan/15 text-neon-cyan'}`}>
              {relationLabel}
            </span>
            {!isExpanded && (
              <p className="text-xs font-bold text-neon-yellow">
                {age.years}{language === 'bn' ? 'Y' : 'Y'} {age.months}{language === 'bn' ? 'M' : 'M'} {age.days}{language === 'bn' ? 'D' : 'D'}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-cyan/20 hover:text-neon-cyan transition-colors">
            <Pencil className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button onClick={onDelete} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-pink/20 hover:text-neon-pink transition-colors">
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Age Hero */}
            <div className={`rounded-2xl p-4 text-center border mb-6 ${member.dod ? 'bg-neon-pink/5 border-neon-pink/20' : 'bg-black/30 border-neon-green/20'}`}>
              <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${member.dod ? 'text-neon-pink' : 'text-neon-green'}`}>
                {member.dod ? t.lifespanWas : t.ageIs}
              </span>
              <div className="text-xl md:text-3xl font-extrabold mt-1">
                <span className={member.dod ? 'text-neon-pink' : 'text-neon-yellow'}>{age.years}</span> <span className="text-sm font-normal text-text-muted">{t.yearsLabel}</span> <span className={member.dod ? 'text-neon-pink' : 'text-neon-yellow'}>{age.months}</span> <span className="text-sm font-normal text-text-muted">{t.monthsLabel}</span> <span className={member.dod ? 'text-neon-pink' : 'text-neon-yellow'}>{age.days}</span> <span className="text-sm font-normal text-text-muted">{t.daysLabel}</span>
              </div>
            </div>

            {/* Counter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <CounterBox icon={<Calendar className="w-4 h-4 text-neon-cyan" />} label={t.totalMonths} value={`${(age.years * 12 + age.months).toLocaleString()} M`} />
              <CounterBox icon={<Calendar className="w-4 h-4 text-neon-cyan" />} label={t.totalDays} value={age.totalDays.toLocaleString()} />
              <CounterBox icon={<Clock className="w-4 h-4 text-neon-cyan" />} label={t.totalHours} value={age.totalHours.toLocaleString()} />
              <CounterBox 
                icon={<Timer className={`w-4 h-4 ${member.dod ? 'text-neon-pink' : 'text-neon-yellow animate-pulse'}`} />} 
                label={member.dod ? t.totalLifespanSeconds : t.totalSeconds} 
                value={age.totalSeconds.toLocaleString()} 
                valueColor={member.dod ? "text-neon-pink" : "text-neon-yellow"} 
              />
            </div>

            {/* Status Banner */}
            {!member.dod ? (
              <div className="flex items-center justify-between bg-gradient-to-r from-[#1d1135] to-[#0c1b33] p-4 rounded-2xl border-l-4 border-neon-pink font-bengali">
                <div className="flex items-center gap-2">
                  <Cake className="w-5 h-5 text-neon-pink" />
                  <span className="text-sm font-medium">{t.nextBday}</span>
                </div>
                <strong className="text-white">
                  {age.daysUntilBday === 0 ? t.bdayToday : `${age.daysUntilBday} ${t.daysLeft}`}
                </strong>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border-l-4 border-white/20 font-bengali">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-white/40" />
                  <span className="text-sm font-medium text-white/60">{t.lifeEnded}</span>
                </div>
                <strong className="text-white/60">{t.rip}</strong>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CounterBox({ icon, label, value, valueColor = "text-white" }: { icon: React.ReactNode, label: string, value: string, valueColor?: string }) {
  return (
    <div className="bg-card-inner border border-white/5 rounded-2xl p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-[10px] text-text-muted mb-1">{label}</p>
      <h5 className={`text-sm font-bold truncate ${valueColor}`}>{value}</h5>
    </div>
  );
}
