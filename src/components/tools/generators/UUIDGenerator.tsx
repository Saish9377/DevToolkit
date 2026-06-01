'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';

function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function generateUUIDv7(): string {
  const now = BigInt(Date.now());
  const msHigh = (now >> 16n) & 0xFFFFFFFFn;
  const msLow  = now & 0xFFFFn;
  const randA  = BigInt(Math.random() * 0xFFF | 0);
  const randB  = BigInt(Math.random() * 0x3FFFFFFFFFFFFFFF | 0);
  const hex = [
    msHigh.toString(16).padStart(8, '0'),
    msLow.toString(16).padStart(4, '0'),
    (0x7000n | randA).toString(16).padStart(4, '0'),
    (0x8000n | (randB >> 48n)).toString(16).padStart(4, '0'),
    (randB & 0xFFFFFFFFFFFFn).toString(16).padStart(12, '0'),
  ];
  return hex.join('-');
}

export default function UUIDGenerator() {
  const [version, setVersion] = useState<'v4' | 'v7'>('v4');
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = () => {
    const gen = version === 'v4' ? generateUUIDv4 : generateUUIDv7;
    let list = Array.from({ length: count }, gen);
    if (uppercase) list = list.map(u => u.toUpperCase());
    if (!hyphens) list = list.map(u => u.replace(/-/g, ''));
    setUuids(list);
  };

  const copy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="tabs" style={{ width: 'auto' }}>
          <button className={`tab${version === 'v4' ? ' active' : ''}`} onClick={() => setVersion('v4')}>UUID v4</button>
          <button className={`tab${version === 'v7' ? ' active' : ''}`} onClick={() => setVersion('v7')}>UUID v7</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Count:</span>
          {[1, 5, 10, 25].map(n => (
            <button key={n} className={`btn btn-sm ${count === n ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCount(n)}>{n}</button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
          Uppercase
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={hyphens} onChange={e => setHyphens(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
          Hyphens
        </label>
        <button className="btn btn-primary" onClick={generate}>⚡ Generate</button>
        {uuids.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={() => copy(uuids.join('\n'), 'all')}>
            {copied === 'all' ? '✓ Copied All' : '📋 Copy All'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {uuids.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⊛</div>
            <p>Click Generate to create UUIDs</p>
          </div>
        ) : uuids.map((uuid, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', transition: 'border-color var(--t-fast)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', minWidth: 20 }}>{i + 1}</span>
            <code style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9375rem', color: '#818cf8', letterSpacing: '0.02em' }}>{uuid}</code>
            <button className="btn btn-ghost btn-sm" onClick={() => copy(uuid, uuid)}>
              {copied === uuid ? '✓' : '📋'}
            </button>
          </div>
        ))}
      </div>

      {version === 'v7' && uuids.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56,189,248,0.2)', fontSize: '0.875rem', color: 'var(--info)' }}>
          ℹ UUID v7 includes millisecond timestamp — naturally sortable and ideal for database primary keys.
        </div>
      )}
    </div>
  );
}
