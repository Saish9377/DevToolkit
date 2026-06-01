'use client';
import React, { useState } from 'react';
export default function ChmodCalculator() {
  const [perms, setPerms] = useState({ owner: {r:true,w:true,x:false}, group: {r:true,w:false,x:false}, other: {r:true,w:false,x:false} });
  const calcOctal = (p: {r:boolean,w:boolean,x:boolean}) => (p.r?4:0)+(p.w?2:0)+(p.x?1:0);
  const octal = `${calcOctal(perms.owner)}${calcOctal(perms.group)}${calcOctal(perms.other)}`;
  const symbolic = `${perms.owner.r?'r':'-'}${perms.owner.w?'w':'-'}${perms.owner.x?'x':'-'}${perms.group.r?'r':'-'}${perms.group.w?'w':'-'}${perms.group.x?'x':'-'}${perms.other.r?'r':'-'}${perms.other.w?'w':'-'}${perms.other.x?'x':'-'}`;
  const toggle = (who: 'owner'|'group'|'other', bit: 'r'|'w'|'x') => setPerms(p => ({ ...p, [who]: { ...p[who], [bit]: !p[who][bit] } }));
  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {(['owner', 'group', 'other'] as const).map(who => (
          <div key={who} className="card">
            <div style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: '1rem', color: 'var(--accent)' }}>{who}</div>
            {(['r', 'w', 'x'] as const).map(bit => (
              <label key={bit} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={perms[who][bit]} onChange={() => toggle(who, bit)} style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: bit === 'r' ? '#86efac' : bit === 'w' ? '#fcd34d' : '#f9a8d4' }}>{bit.toUpperCase()}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{bit === 'r' ? 'Read (4)' : bit === 'w' ? 'Write (2)' : 'Execute (1)'}</span>
              </label>
            ))}
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', color: 'var(--accent)' }}>{calcOctal(perms[who])}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Octal</div><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>0{octal}</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Symbolic</div><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{symbolic}</div></div>
      </div>
      <div style={{ marginTop: '1.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#86efac', marginBottom: '0.25rem' }}>$ chmod {octal} filename</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', fontSize: '0.875rem' }}>ls -la: -{symbolic} 1 user group 0 Jan 1 00:00 filename</div>
      </div>
    </div>
  );
}
