'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UniversalSearch from './UniversalSearch';
import RecentToolsBar from '@/components/features/RecentToolsBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Load sidebar state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('devtoolkit:sidebar-collapsed');
    if (stored === 'true') setSidebarCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      localStorage.setItem('devtoolkit:sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  return (
    <div className="app-shell">
      <Sidebar
        onSearchOpen={openSearch}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Navbar
          onSearchOpen={openSearch}
          sidebarCollapsed={sidebarCollapsed}
        />
        <RecentToolsBar />
        <main>
          {children}
        </main>
      </div>
      <UniversalSearch isOpen={searchOpen} onClose={closeSearch} />
    </div>
  );
}
