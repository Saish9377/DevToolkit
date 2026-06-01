'use client';
import React, { useState } from 'react';
export default function ULIDGenerator() {
  const [count, setCount] = useState(5);
  const [ulids, setUlids] = useState<string[]>([]);
  const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const generate = () => {
    const gen = () => {
      const ts = Date.now();
      let t = '', r = '';
      let tmp = ts;
      for (let i = 9; i >= 0; i--) { t = ENCODING[tmp % 32] + t; tmp = Math.floor(tmp / 32); }
      for (let i = 0; i < 16; i++) r += ENCODING[Math.floor(Math.random() * 32)];
      return t + r;
    };
    setUlids(Array.from({length: count}, gen));
  };
  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Count:</span>
        {[1, 5, 10].map(n => <button key={n} className={`btn btn-sm ${count === n ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCount(n)}>{n}</button>)}
        <button className="btn btn-primary" onClick={generate}>⚡ Generate</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {ulids.length === 0 ? <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}><div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⊚</div>Click Generate</div>
          : ulids.map((u, i) => <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.625rem 0.875rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', minWidth: 20 }}>{i+1}</span>
            <code style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', color: '#818cf8', letterSpacing: '0.05em' }}>
              <span style={{ color: '#f9a8d4' }}>{u.slice(0,10)}</span>
              <span style={{ color: '#93c5fd' }}>{u.slice(10)}</span>
            </code>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ts+random</span>
          </div>)}
      </div>
      {ulids.length > 0 && <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--info)', border: '1px solid rgba(56,189,248,0.2)' }}>ℹ <span style={{ color: '#f9a8d4' }}>Pink = timestamp (10 chars)</span> · <span style={{ color: '#93c5fd' }}>Blue = random (16 chars)</span>. ULIDs are sortable and lexicographically ordered.</div>}
    </div>
  );
}
