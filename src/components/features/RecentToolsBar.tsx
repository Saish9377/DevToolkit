'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getToolBySlug } from '@/lib/registry';

const STORAGE_KEY = 'devtoolkit_recent_tools';
const MAX_RECENT = 6;

export function recordToolVisit(slug: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const updated = [slug, ...list.filter(s => s !== slug)].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function getRecentTools(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function RecentToolsBar() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentTools());
    // Listen for storage changes (multi-tab)
    const onStorage = () => setRecent(getRecentTools());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (recent.length === 0) return null;

  const tools = recent.map(slug => getToolBySlug(slug)).filter(Boolean);
  if (tools.length === 0) return null;

  return (
    <div className="recent-bar">
      <span className="recent-bar-label">Recent</span>
      <div className="recent-bar-tools">
        {tools.map(tool => tool && (
          <Link key={tool.slug} href={`/tools/${tool.slug}`} className="recent-bar-chip" title={tool.name}>
            <span className="recent-bar-icon">{tool.icon}</span>
            <span className="recent-bar-name">{tool.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
