'use client';

import React from 'react';
import { Search, Bell, BellOff, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  notificationPermission: NotificationPermission;
  onRequestNotification: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  notificationPermission,
  onRequestNotification,
}) => {
  return (
    <div className="max-w-xl mx-auto w-full my-4">
      <div className="relative flex items-center bg-[#09132b] border border-cyan-950/80 rounded-full px-4 py-3 shadow-inner">
        {/* Search Icon (Left, Cyan) */}
        <Search className="w-5 h-5 text-neon-cyan shrink-0 mr-2.5 stroke-[2]" />

        {/* Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or relation..."
          className="w-full bg-transparent text-sm text-white placeholder-text-muted/60 focus:outline-none"
        />

        {/* Clear Search if typed */}
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-text-muted hover:text-white p-1 mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Notification Bell (Right, Yellow) */}
        <button
          onClick={onRequestNotification}
          title={notificationPermission === 'granted' ? 'Notification Active' : 'Enable Notification'}
          className="p-1 rounded-full hover:bg-white/10 transition-colors text-neon-yellow shrink-0 ml-1.5 cursor-pointer"
        >
          {notificationPermission === 'granted' ? (
            <Bell className="w-5 h-5 fill-neon-yellow/30 text-neon-yellow" />
          ) : (
            <Bell className="w-5 h-5 text-neon-yellow" />
          )}
        </button>
      </div>
    </div>
  );
};
