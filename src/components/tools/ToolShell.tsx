'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { type Tool, CATEGORY_META } from '@/lib/registry';
import { getToolDescription } from '@/lib/toolDescriptions';
import { addRecentTool, toggleFavorite, isFavorite } from '@/lib/profile';
import { buildShareUrl, copyToClipboard } from '@/lib/share';
import { addToHistory, getToolHistory, formatTimeAgo, type HistoryEntry } from '@/lib/history';

interface ToolShellProps {
  tool: Tool;
  children: React.ReactNode;
  extraTabs?: Array<{ id: string; label: string; icon: string; content: React.ReactNode }>;
}

const SHORTCUTS = [
  { keys: ['Ctrl', 'Enter'], desc: 'Run / Format' },
  { keys: ['Ctrl', 'Shift', 'C'], desc: 'Copy output' },
  { keys: ['Ctrl', 'Shift', 'S'], desc: 'Share link' },
  { keys: ['Ctrl', 'Shift', 'E'], desc: 'Toggle Explain' },
  { keys: ['Ctrl', 'K'], desc: 'Universal Search' },
];

export default function ToolShell({ tool, children, extraTabs }: ToolShellProps) {
  const [favorited, setFavorited] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set());

  const meta = CATEGORY_META[tool.category];
  const info = getToolDescription(tool.slug, tool.name, tool.description);

  const toggleFaq = (idx: number) => {
    setExpandedFaqs(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  useEffect(() => {
    addRecentTool(tool.slug);
    setFavorited(isFavorite(tool.slug));
    setHistory(getToolHistory(tool.slug));
  }, [tool.slug]);

  const handleFavorite = () => {
    const isNowFav = toggleFavorite(tool.slug);
    setFavorited(isNowFav);
  };

  const handleShare = async () => {
    try {
      const url = buildShareUrl({ toolSlug: tool.slug });
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert(String(e));
    }
  };

  // Keyboard shortcut: Ctrl+Shift+S to share
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleShare();
      }
      if (e.key === '?') {
        setShowShortcuts(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="tool-shell">
      {/* Header */}
      <div className="tool-header">
        <div className="tool-header-top">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem', width: '100%' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span className={`tag cat-${tool.category}`}>{meta.label}</span>
            <span>›</span>
            <span style={{ color: 'var(--text-secondary)' }}>{tool.name}</span>
          </div>
        </div>

        <div className="tool-header-top" style={{ marginBottom: '1rem' }}>
          <div className={`tool-header-icon cat-${tool.category}`}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.875rem' }}>
              {tool.icon}
            </span>
          </div>
          <div className="tool-header-info">
            <div className="tool-header-name">
              {tool.name}
              {tool.isNew && <span className="badge badge-new" style={{ marginLeft: '0.5rem' }}>New</span>}
            </div>
            <div className="tool-header-desc">{tool.description}</div>
          </div>

          {/* Actions */}
          <div className="tool-header-actions">
            {/* Privacy Badge */}
            <div className="privacy-badge" title="Your data never leaves your browser">
              <div className="privacy-badge-dot"></div>
              100% Client-Side · No Upload
            </div>

            {/* Favorite */}
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={handleFavorite}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={favorited ? '#f59e0b' : 'none'} stroke={favorited ? '#f59e0b' : 'currentColor'} strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>

            {/* History */}
            <div className="tooltip" style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => { setHistory(getToolHistory(tool.slug)); setShowHistory(h => !h); }}
                title="History"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </button>
            </div>

            {/* Share */}
            {tool.features?.includes('share') && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleShare}
                title="Share link (Ctrl+Shift+S)"
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                    Share
                  </>
                )}
              </button>
            )}

            {/* Shortcuts */}
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={() => setShowShortcuts(true)}
              title="Keyboard shortcuts (?)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="13" rx="2"/>
                <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h.01M12 14h.01M16 14h.01"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, position: 'relative' }}>
        {children}
      </div>

      {/* Tool Descriptions & FAQ section */}
      <div className="tool-desc-container animate-fade-in">
        {/* Intro */}
        <section className="tool-desc-intro">
          <h2 className="tool-desc-heading">What is {tool.name}?</h2>
          <p className="tool-desc-text">{info.whatIs}</p>
        </section>

        {/* How to use */}
        <section className="tool-desc-intro">
          <h2 className="tool-desc-heading">How to use {tool.name}?</h2>
          <div className="tool-usage-steps">
            {info.howToUse.map((step, idx) => (
              <div key={idx} className="tool-step-card">
                <div className="tool-step-number">{idx + 1}</div>
                <div className="tool-step-text">{step}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Example */}
        <section className="tool-desc-intro">
          <h2 className="tool-desc-heading">Interactive Example</h2>
          <div className="tool-example-card">
            <div className="tool-example-header">
              <span className="tool-example-title">{info.example.title}</span>
              <span className="tool-example-badge">
                {info.example.language?.toUpperCase() || 'TEXT'}
              </span>
            </div>
            <div className="tool-example-grid">
              <div className="tool-example-pane">
                <span className="tool-example-label">Input / Sample Source</span>
                <pre className="tool-example-code">
                  <code>{info.example.input}</code>
                </pre>
              </div>
              <div className="tool-example-pane">
                <span className="tool-example-label">Output / Result</span>
                <pre className="tool-example-code">
                  <code>{info.example.output}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="tool-desc-intro">
          <h2 className="tool-desc-heading">Benefits &amp; Features</h2>
          <div className="tool-benefits-grid">
            {info.benefits.map((benefit, idx) => {
              const [title, ...descParts] = benefit.split(': ');
              const desc = descParts.join(': ');
              return (
                <div key={idx} className="tool-benefit-item">
                  <span className="tool-benefit-check">✓</span>
                  <div className="tool-benefit-content">
                    <span className="tool-benefit-title">{title}</span>
                    {desc && <span className="tool-benefit-desc">{desc}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQs */}
        <section className="tool-desc-intro">
          <h2 className="tool-desc-heading">Frequently Asked Questions</h2>
          <div className="tool-faq-list">
            {info.faqs.map((faq, idx) => {
              const isOpen = expandedFaqs.has(idx);
              return (
                <div key={idx} className={`faq-item${isOpen ? ' open' : ''}`}>
                  <button className="faq-question" onClick={() => toggleFaq(idx)}>
                    <span>{faq.q}</span>
                    <span className={`faq-chevron${isOpen ? ' rotated' : ''}`}>▼</span>
                  </button>
                  {isOpen && <div className="faq-answer">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* History Dropdown */}
      {showHistory && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setShowHistory(false)} />
          <div style={{
            position: 'fixed',
            top: '120px',
            right: '1.5rem',
            width: '320px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 300,
            overflow: 'hidden',
            animation: 'slideDown 150ms ease',
          }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Recent Inputs</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowHistory(false)}>✕</button>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {history.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No history yet. Use this tool and your inputs will appear here.
                </div>
              ) : (
                history.map(entry => (
                  <div key={entry.id} style={{
                    padding: '0.625rem 1rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background var(--t-fast)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {formatTimeAgo(entry.timestamp)}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.label}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="modal-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4>Keyboard Shortcuts</h4>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowShortcuts(false)}>✕</button>
            </div>
            {SHORTCUTS.map(s => (
              <div key={s.desc} className="shortcut-row">
                <span className="shortcut-desc">{s.desc}</span>
                <div className="shortcut-keys">
                  {s.keys.map((k, i) => (
                    <React.Fragment key={k}>
                      <kbd>{k}</kbd>
                      {i < s.keys.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
