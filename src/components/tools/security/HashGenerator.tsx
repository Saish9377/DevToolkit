'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';
import { addToHistory } from '@/lib/history';

const HASH_WARNINGS: Record<string, string> = {
  sha1: '⚠ SHA-1 is deprecated for security use. Use SHA-256 or SHA-512.',
  md5: '❌ MD5 is broken for security. Do NOT use for passwords or signatures.',
};

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async (val: string) => {
    setInput(val);
    if (!val.trim()) { setHashes({}); return; }
    setLoading(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(val);
      const algos = [
        { id: 'sha1', name: 'SHA-1', algo: 'SHA-1' },
        { id: 'sha256', name: 'SHA-256', algo: 'SHA-256' },
        { id: 'sha512', name: 'SHA-512', algo: 'SHA-512' },
      ];
      const results: Record<string, string> = {};
      for (const { id, algo } of algos) {
        const hashBuffer = await crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        results[id] = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
      setHashes(results);
      addToHistory('hash-generator', val, val.substring(0, 40));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const LABELS: Record<string, { name: string; bits: number }> = {
    sha1:   { name: 'SHA-1',   bits: 160 },
    sha256: { name: 'SHA-256', bits: 256 },
    sha512: { name: 'SHA-512', bits: 512 },
  };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div className="pane-label" style={{ marginBottom: '0.5rem' }}>Input Text</div>
      <textarea
        className="textarea-code"
        style={{ minHeight: '120px', marginBottom: '1rem' }}
        value={input}
        onChange={e => generate(e.target.value)}
        placeholder="Enter any text to compute its hash…"
        spellCheck={false}
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>
      )}

      {Object.keys(hashes).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(hashes).map(([id, hash]) => (
            <div key={id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{LABELS[id].name}</span>
                <span className="badge badge-beta">{LABELS[id].bits} bits</span>
                {HASH_WARNINGS[id] && (
                  <span style={{ fontSize: '0.75rem', color: id === 'md5' ? 'var(--error)' : 'var(--warning)' }}>
                    {HASH_WARNINGS[id]}
                  </span>
                )}
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => copy(hash, id)}>
                  {copied === id ? '✓' : '📋'} Copy
                </button>
              </div>
              <div style={{ background: 'var(--bg-elevated)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', color: '#86efac', wordBreak: 'break-all', letterSpacing: '0.02em' }}>
                {hash}
              </div>
            </div>
          ))}
          <div style={{ padding: '0.75rem 1rem', background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--success)' }}>
            ✓ All hashes computed client-side using the Web Crypto API. Your input never leaves this page.
          </div>
        </div>
      )}

      {!input && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>#</div>
          <p>Type text above to see SHA-1, SHA-256, and SHA-512 hashes</p>
        </div>
      )}
    </div>
  );
}
