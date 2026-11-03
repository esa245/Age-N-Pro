'use client';

import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { Member } from '@/types/member';

const STORAGE_KEY = 'AGE_CALC_FAMILY_MEMBERS_V2';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('family-storage-updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('family-storage-updated', callback);
  };
}

function getSnapshot(): string {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val) return val;
    const legacy = localStorage.getItem('AGE_CALC_FAMILY_MEMBERS');
    if (legacy) return legacy;
    return '[]';
  } catch {
    return '[]';
  }
}

function getServerSnapshot(): string {
  return '[]';
}

export function useFamilyStorage() {
  const rawData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const members = useMemo<Member[]>(() => {
    try {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Ignored
    }
    return [];
  }, [rawData]);

  const persistMembers = useCallback((updated: Member[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('family-storage-updated'));
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
    const existingKeys = new Set(members.map((m) => `${m.name}_${m.dob}`));
    const newItems = imported.filter((m) => !existingKeys.has(`${m.name}_${m.dob}`));
    const merged = [...members, ...newItems];
    persistMembers(merged);
    return newItems.length;
  }, [members, persistMembers]);

  return {
    members,
    addMember,
    updateMember,
    deleteMember,
    backupData,
    restoreData,
    importSharedData,
  };
}
