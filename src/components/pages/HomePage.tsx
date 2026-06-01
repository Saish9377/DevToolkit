'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TOOLS, COLLECTIONS, CATEGORY_META, type ToolCategory, type Tool, TOOL_COUNT } from '@/lib/registry';
import SmartPasteDetector from '@/components/features/SmartPasteDetector';

const POPULAR = TOOLS.filter(t => t.popular);
const CATEGORY_ORDER: ToolCategory[] = [
  'json', 'yaml', 'xml', 'html', 'sql',
  'encoding', 'security', 'network', 'generators', 'utilities',
];

function ToolCard({ tool, featured = false }: { tool: Tool; featured?: boolean }) {
  const meta = CATEGORY_META[tool.category];
  return (
    <Link href={`/tools/${tool.slug}`} className={`tool-card${featured ? ' tool-card-featured' : ''}`}>
      <div className="tool-card-header">
        <div className={`tool-card-icon cat-${tool.category}`}>
          <span>{tool.icon}</span>
        </div>
        <div className="tool-card-badges">
          {tool.isNew && <span className="badge badge-new">New</span>}
          {tool.popular && !tool.isNew && <span className="badge badge-popular">★</span>}
        </div>
      </div>
      <div className="tool-card-name">{tool.name}</div>
      <div className="tool-card-desc">{tool.description}</div>
      <div className="tool-card-footer">
        <span className={`tag cat-${tool.category} tag-inline`}>{meta.label}</span>
        {tool.features?.includes('explain') && <span className="tag tag-dim">Explain ✨</span>}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSmartPaste, setShowSmartPaste] = useState(false);

  const filteredTools = TOOLS.filter(tool => {
    const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.tags.some(t => t.includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="home-page">

      {/* ── Compact Hero ─────────────────────────────────── */}
      <section className="home-hero home-hero-compact">
        <div className="hero-mesh" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>{TOOL_COUNT} tools · 100% client-side · works offline</span>
          </div>
          <h1 className="hero-title hero-title-compact">
            Developer tools that <span className="gradient-text">actually work.</span>
          </h1>
          <p className="hero-subtitle hero-subtitle-compact">
            Format, validate, convert, debug — all in your browser. No uploads, no accounts.
          </p>
          <div className="hero-actions">
            <div className="hero-search hero-search-compact">
              <svg className="hero-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="hero-search-input"
                placeholder={`Search ${TOOL_COUNT} tools…`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search tools"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0.25rem', fontSize: '1rem' }}>×</button>
              )}
            </div>
            <button
              className={`btn btn-secondary${showSmartPaste ? ' active' : ''}`}
              onClick={() => setShowSmartPaste(v => !v)}
              title="Smart Paste — auto-detect and route to the right tool"
            >
              ⚡ Smart Paste
            </button>
          </div>
        </div>
      </section>

      {/* ── Smart Paste Detector ─────────────────────────── */}
      {showSmartPaste && (
        <div className="home-section" style={{ paddingTop: 0 }}>
          <SmartPasteDetector />
        </div>
      )}

      {/* ── ALL TOOLS (first thing users see) ───────────── */}
      <section className="home-section" id="all-tools">
        <div className="section-header-row">
          <div className="section-label" style={{ marginBottom: 0 }}>
            <span>⚙</span>
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeCategory !== 'all'
              ? `${CATEGORY_META[activeCategory].label} Tools`
              : 'All Tools'}
            <span className="section-count">{filteredTools.length}</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="cat-filter">
          <button className={`cat-filter-btn${activeCategory === 'all' ? ' active' : ''}`} onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}>
            All <span className="cat-filter-count">{TOOLS.length}</span>
          </button>
          {CATEGORY_ORDER.map(cat => {
            const meta = CATEGORY_META[cat];
            const count = TOOLS.filter(t => t.category === cat).length;
            return (
              <button key={cat} className={`cat-filter-btn${activeCategory === cat ? ' active' : ''}`} onClick={() => setActiveCategory(cat)}>
                <span className={`cat-${cat}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', background: 'none', color: 'inherit' }}>{meta.icon}</span>
                {meta.label}
                <span className="cat-filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        {filteredTools.length > 0 ? (
          <div className="tools-grid">
            {filteredTools.map(tool => (
              <ToolCard key={tool.slug} tool={tool} featured={tool.popular} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>No tools match &ldquo;{searchQuery}&rdquo;</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                Browse all tools
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Collections ──────────────────────────────────── */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="home-section">
          <div className="section-label"><span>⊞</span> Tool Collections</div>
          <div className="collections-grid">
            {COLLECTIONS.map(col => (
              <div key={col.slug} className="collection-card">
                <div className="collection-header">
                  <span className={`collection-icon cat-${col.color}`}>{col.icon}</span>
                  <div>
                    <div className="collection-name">{col.name}</div>
                    <div className="collection-meta">{col.toolSlugs.length} tools</div>
                  </div>
                </div>
                <p className="collection-desc">{col.description}</p>
                <div className="collection-tools">
                  {col.toolSlugs.slice(0, 4).map(slug => {
                    const t = TOOLS.find(x => x.slug === slug);
                    return t ? (
                      <Link key={slug} href={`/tools/${slug}`} className="collection-tool-chip">
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem' }}>{t.icon}</span>
                        {t.name}
                      </Link>
                    ) : null;
                  })}
                  {col.toolSlugs.length > 4 && <span className="collection-more">+{col.toolSlugs.length - 4} more</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Why DevToolkit ───────────────────────────────── */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="home-section why-section">
          <div className="section-label"><span>◆</span> Why DevToolkit?</div>
          <div className="why-grid">
            {[
              { icon: '🔒', title: '100% Private', desc: 'Your code never leaves your browser. No server ever touches your data.', accent: '#ef4444' },
              { icon: '⚡', title: 'Smart Paste', desc: 'Paste anything — JSON, JWT, XML, SQL, Base64 — and we instantly route you to the right tool.', accent: '#f59e0b' },
              { icon: '🕐', title: 'Recent Tools', desc: 'Your last 6 tools are always one click away in the quick-access bar.', accent: '#6366f1' },
              { icon: '📡', title: 'Works Offline', desc: 'Install as a PWA. All 37 tools work without internet after first visit.', accent: '#22c55e' },
              { icon: '🎯', title: 'No Fluff', desc: 'No banners, no sign-up walls, no ads. Just tools that work.', accent: '#8b5cf6' },
              { icon: '⌨', title: 'Keyboard First', desc: '⌘K to search. Everything accessible without touching the mouse.', accent: '#38bdf8' },
            ].map((feat, i) => (
              <div key={feat.title} className="why-card" style={{ '--why-accent': feat.accent, animationDelay: `${i * 60}ms` } as React.CSSProperties}>
                <div className="why-icon">{feat.icon}</div>
                <h3 className="why-title">{feat.title}</h3>
                <p className="why-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
