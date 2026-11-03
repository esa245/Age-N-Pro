'use client';

import { useState, useEffect, useCallback } from 'react';
import { Member } from '@/types/member';

const STORAGE_KEY = 'AGE_CALC_FAMILY_MEMBERS_V2';

export function useFamilyStorage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMembers(parsed);
        }
      } else {
        // Check legacy key if exists
        const legacy = localStorage.getItem('AGE_CALC_FAMILY_MEMBERS');
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMembers(parsed);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load members from localStorage', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever members change after initial load
  const persistMembers = useCallback((updated: Member[]) => {
    setMembers(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }, []);

  const addMember = useCallback((memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
    };
    persistMembers([...members, newMember]);
    return newMember;
  }, [members, persistMembers]);

  const updateMember = useCallback((updatedMember: Member) => {
    const updated = members.map((m) => (m.id === updatedMember.id ? updatedMember : m));
    persistMembers(updated);
  }, [members, persistMembers]);

  const deleteMember = useCallback((id: string) => {
    const updated = members.filter((m) => m.id !== id);
    persistMembers(updated);
  }, [members, persistMembers]);

  const backupData = useCallback(() => {
    if (members.length === 0) return false;
    const blob = new Blob([JSON.stringify(members, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family_age_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }, [members]);

  const restoreData = useCallback((file: File): Promise<{ success: boolean; count: number; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            // Validate required fields
            const valid = parsed.filter((m: any) => m && m.name && m.dob);
            if (valid.length > 0) {
              persistMembers(valid);
              resolve({ success: true, count: valid.length });
              return;
            }
          }
          resolve({ success: false, count: 0, error: 'Invalid format' });
        } catch (err) {
          resolve({ success: false, count: 0, error: 'Parse error' });
        }
      };
      reader.onerror = () => resolve({ success: false, count: 0, error: 'Read error' });
      reader.readAsText(file);
    });
  }, [persistMembers]);

  const importSharedData = useCallback((imported: Member[]) => {
    // Merge without duplicates by ID or name+dob
    const existingKeys = new Set(members.map((m) => `${m.name}_${m.dob}`));
    const newItems = imported.filter((m) => !existingKeys.has(`${m.name}_${m.dob}`));
    const merged = [...members, ...newItems];
    persistMembers(merged);
    return newItems.length;
  }, [members, persistMembers]);

  return {
    members,
    isLoaded,
    addMember,
    updateMember,
    deleteMember,
    backupData,
    restoreData,
    importSharedData,
  };
}
