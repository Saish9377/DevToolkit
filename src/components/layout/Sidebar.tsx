'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOLS, CATEGORY_META, type ToolCategory } from '@/lib/registry';

interface SidebarProps {
  onSearchOpen: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

const CATEGORY_ORDER: ToolCategory[] = [
  'json', 'yaml', 'xml', 'html', 'sql',
  'encoding', 'security', 'network', 'generators', 'utilities',
];

export default function Sidebar({ onSearchOpen, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedCats, setExpandedCats] = useState<Set<ToolCategory>>(new Set(['json']));

  // Auto-expand the active category
  useEffect(() => {
    const activeCat = CATEGORY_ORDER.find(cat =>
      TOOLS.filter(t => t.category === cat).some(t => pathname === `/tools/${t.slug}`)
    );
    if (activeCat) {
      setExpandedCats(prev => new Set([...prev, activeCat]));
    }
  }, [pathname]);

  const toggleCat = (cat: ToolCategory) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Logo */}
      <Link href="/" className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            Dev<span>Toolkit</span>
          </div>
        )}
      </Link>

      {/* Search */}
      {!collapsed && (
        <div className="sidebar-search">
          <button className="sidebar-search-btn" onClick={onSearchOpen}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Search tools…</span>
            <span className="sidebar-search-kbd">⌘K</span>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {/* Home */}
        {!collapsed && <div className="sidebar-section-label">Navigation</div>}
        <Link
          href="/"
          className={`sidebar-item${pathname === '/' ? ' active' : ''}`}
          title={collapsed ? 'Home' : undefined}
        >
          <span className="sidebar-item-icon" style={{ fontSize: '1rem', textAlign: 'center' }}>⌂</span>
          {!collapsed && <span>Home</span>}
        </Link>

        {/* Blog */}
        <Link
          href="/blog"
          className={`sidebar-item${pathname.startsWith('/blog') ? ' active' : ''}`}
          title={collapsed ? 'Blog' : undefined}
        >
          <span className="sidebar-item-icon" style={{ fontSize: '1rem', textAlign: 'center' }}>✍</span>
          {!collapsed && <span>Blog</span>}
        </Link>

        {/* Tool Categories */}
        {!collapsed && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: '0.75rem' }}>Tools</div>
            {CATEGORY_ORDER.map(cat => {
              const meta = CATEGORY_META[cat];
              const catTools = TOOLS.filter(t => t.category === cat);
              const isExpanded = expandedCats.has(cat);
              const isActiveCat = catTools.some(t => pathname === `/tools/${t.slug}`);

              return (
                <div key={cat}>
                  <button
                    className={`sidebar-item${isActiveCat ? ' active' : ''}`}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', justifyContent: 'flex-start' }}
                    onClick={() => toggleCat(cat)}
                  >
                    <span className={`sidebar-item-icon cat-${cat}`} style={{ width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: '0.6875rem' }}>
                      {meta.icon}
                    </span>
                    <span style={{ flex: 1 }}>{meta.label}</span>
                    <span className="sidebar-item-badge">{catTools.length}</span>
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginLeft: 4, transition: 'transform 150ms ease', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                      ▸
                    </span>
                  </button>

                  {isExpanded && (
                    <div style={{ paddingLeft: '0.5rem' }}>
                      {catTools.map(tool => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className={`sidebar-item${pathname === `/tools/${tool.slug}` ? ' active' : ''}`}
                          style={{ fontSize: '0.8125rem', paddingLeft: '2rem' }}
                        >
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tool.name}
                          </span>
                          {tool.isNew && <span className="badge badge-new">New</span>}
                          {tool.popular && !tool.isNew && <span style={{ fontSize: '0.5625rem', color: 'var(--warning)' }}>★</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Collapsed: category icons */}
        {collapsed && (
          <>
            <Link href="/" className={`sidebar-item${pathname === '/' ? ' active' : ''}`} title="Home" style={{ justifyContent: 'center' }}>
              <span style={{ fontSize: '1rem' }}>⌂</span>
            </Link>
            <Link href="/blog" className={`sidebar-item${pathname.startsWith('/blog') ? ' active' : ''}`} title="Blog" style={{ justifyContent: 'center' }}>
              <span style={{ fontSize: '1rem' }}>✍</span>
            </Link>
            {CATEGORY_ORDER.map(cat => {
              const meta = CATEGORY_META[cat];
              const catTools = TOOLS.filter(t => t.category === cat);
              const isActiveCat = catTools.some(t => pathname === `/tools/${t.slug}`);
              return (
                <Link
                  key={cat}
                  href={`/tools/${catTools[0]?.slug || ''}`}
                  className={`sidebar-item${isActiveCat ? ' active' : ''}`}
                  title={meta.label}
                  style={{ justifyContent: 'center' }}
                >
                  <span className={`cat-${cat}`} style={{ width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: '0.6875rem' }}>
                    {meta.icon}
                  </span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-collapse-btn" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform var(--t-slow)' }}>
            <path d="M11 19l-7-7 7-7"/><path d="M18 19l-7-7 7-7"/>
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
