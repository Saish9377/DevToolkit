'use client';
import React, { useState } from 'react';
export default function RandomPort() {
  const [port, setPort] = useState<number|null>(null);
  const RESERVED: Record<number, string> = { 80: 'HTTP', 443: 'HTTPS', 22: 'SSH', 21: 'FTP', 25: 'SMTP', 3306: 'MySQL', 5432: 'PostgreSQL', 6379: 'Redis', 27017: 'MongoDB', 8080: 'HTTP Alt', 3000: 'Dev servers', 5000: 'Dev servers', 8000: 'Dev servers' };
  const generate = () => {
    let p: number;
    do { p = Math.floor(Math.random() * (65535 - 1024) + 1024); } while (RESERVED[p]);
    setPort(p);
  };
  return (
    <div style={{ padding: '1rem 2rem', textAlign: 'center' }}>
      <button className="btn btn-primary btn-lg" onClick={generate} style={{ marginBottom: '2rem' }}>⚡ Generate Random Port</button>
      {port && (
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '4rem', fontWeight: 800, background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2, marginBottom: '0.5rem' }}>{port}</div>
          <div className={`badge ${port < 1024 ? 'badge-hot' : port > 49151 ? 'badge-beta' : 'badge-new'}`} style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }}>
            {port < 1024 ? 'Well-Known Port' : port > 49151 ? 'Dynamic/Private Port' : 'Registered Port'}
          </div>
          {RESERVED[port] ? <div style={{ color: 'var(--warning)', marginTop: '0.75rem', fontSize: '0.875rem' }}>⚠ Used by: {RESERVED[port]}</div>
            : <div style={{ color: 'var(--success)', marginTop: '0.75rem', fontSize: '0.875rem' }}>✓ No known service conflicts</div>}
          <div style={{ marginTop: '1.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '0.875rem', border: '1px solid var(--border)', display: 'inline-block' }}>
            <code style={{ fontFamily: 'JetBrains Mono, monospace', color: '#86efac' }}>localhost:{port}</code>
          </div>
        </div>
      )}
    </div>
  );
}
