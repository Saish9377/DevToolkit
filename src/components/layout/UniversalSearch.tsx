'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TOOLS, COLLECTIONS, RECIPES, searchTools } from '@/lib/registry';

const QUICK_LINKS = [
  { label: 'Tool Recipes', href: '/recipes', icon: '⚡' },
  { label: 'Comparison Pages', href: '/compare', icon: '⟺' },
  { label: 'Knowledge Base', href: '/learn', icon: '📚' },
  { label: 'Error Decoder', href: '/tools/error-decoder', icon: '⚠' },
];

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UniversalSearch({ isOpen, onClose }: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const toolResults = query.trim() ? searchTools(query).slice(0, 6) : TOOLS.filter(t => t.popular).slice(0, 5);
  const collectionResults = query.trim()
    ? COLLECTIONS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 2)
    : COLLECTIONS.slice(0, 2);
  const recipeResults = query.trim()
    ? RECIPES.filter(r => r.name.toLowerCase().includes(query.toLowerCase())).slice(0, 2)
    : RECIPES.slice(0, 2);

  const allResults = [
    ...toolResults.map(t => ({ type: 'tool' as const, item: t, href: `/tools/${t.slug}` })),
    ...collectionResults.map(c => ({ type: 'collection' as const, item: c, href: `/toolkit/${c.slug}` })),
    ...recipeResults.map(r => ({ type: 'recipe' as const, item: r, href: `/recipes/${r.slug}` })),
  ];

  const navigate = useCallback((href: string) => {
    router.push(href);
    onClose();
    setQuery('');
    setSelectedIdx(0);
  }, [router, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIdx]) navigate(allResults[selectedIdx].href);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [allResults, selectedIdx, navigate, onClose]);

  useEffect(() => {
    const handleGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (isOpen && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleGlobal);
    return () => window.removeEventListener('keydown', handleGlobal);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let globalIdx = 0;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        {/* Input */}
        <div className="search-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search tools, guides, errors…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setQuery('')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Results */}
        <div className="search-results">
          {allResults.length === 0 && query && (
            <div className="search-no-results">
              No results for &ldquo;<strong>{query}</strong>&rdquo;
            </div>
          )}

          {!query && (
            <>
              <div className="search-group-label">Quick Links</div>
              {QUICK_LINKS.map(link => (
                <div key={link.href} className="search-result-item" onClick={() => navigate(link.href)}>
                  <div className="search-result-icon" style={{ fontSize: '1rem' }}>{link.icon}</div>
                  <div className="search-result-info">
                    <div className="search-result-name">{link.label}</div>
                  </div>
                  <span className="search-result-tag">Page</span>
                </div>
              ))}
            </>
          )}

          {toolResults.length > 0 && (
            <>
              <div className="search-group-label">{query ? 'Tools' : 'Popular Tools'}</div>
              {toolResults.map(tool => {
                const idx = globalIdx++;
                return (
                  <div
                    key={tool.slug}
                    className={`search-result-item${selectedIdx === idx ? ' selected' : ''}`}
                    onClick={() => navigate(`/tools/${tool.slug}`)}
                  >
                    <div className="search-result-icon" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 600 }}>
                      {tool.icon}
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-name">{tool.name}</div>
                      <div className="search-result-desc">{tool.description.substring(0, 60)}…</div>
                    </div>
                    <span className={`search-result-tag tag cat-${tool.category}`}>{tool.category}</span>
                  </div>
                );
              })}
            </>
          )}

          {collectionResults.length > 0 && (
            <>
              <div className="search-group-label">Collections</div>
              {collectionResults.map(col => {
                const idx = globalIdx++;
                return (
                  <div
                    key={col.slug}
                    className={`search-result-item${selectedIdx === idx ? ' selected' : ''}`}
                    onClick={() => navigate(`/toolkit/${col.slug}`)}
                  >
                    <div className="search-result-icon" style={{ fontSize: '1rem' }}>{col.icon}</div>
                    <div className="search-result-info">
                      <div className="search-result-name">{col.name}</div>
                      <div className="search-result-desc">{col.toolSlugs.length} tools</div>
                    </div>
                    <span className="search-result-tag">Collection</span>
                  </div>
                );
              })}
            </>
          )}

          {recipeResults.length > 0 && (
            <>
              <div className="search-group-label">Recipes</div>
              {recipeResults.map(rec => {
                const idx = globalIdx++;
                return (
                  <div
                    key={rec.slug}
                    className={`search-result-item${selectedIdx === idx ? ' selected' : ''}`}
                    onClick={() => navigate(`/recipes`)}
                  >
                    <div className="search-result-icon" style={{ fontSize: '1rem' }}>{rec.icon}</div>
                    <div className="search-result-info">
                      <div className="search-result-name">{rec.name}</div>
                      <div className="search-result-desc">{rec.description.substring(0, 60)}…</div>
                    </div>
                    <span className="search-result-tag">Recipe</span>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="search-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>Esc</kbd> Close</span>
          <span style={{ marginLeft: 'auto' }}>{TOOLS.length} tools available</span>
        </div>
      </div>
    </div>
  );
}
