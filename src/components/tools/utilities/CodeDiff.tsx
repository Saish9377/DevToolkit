'use client';
import React, { useState } from 'react';
export default function CodeDiff() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const diff = () => {
    const la = left.split('\n'); const ra = right.split('\n');
    const max = Math.max(la.length, ra.length);
    return Array.from({length: max}, (_, i) => ({ l: la[i] ?? '', r: ra[i] ?? '', same: la[i] === ra[i] }));
  };
  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {[{label: 'Original', val: left, set: setLeft}, {label: 'Modified', val: right, set: setRight}].map(({label, val, set}) => (
          <div key={label} className="tool-pane">
            <div className="pane-label">{label}</div>
            <textarea className="textarea-code" style={{ minHeight: 300 }} value={val} onChange={e => set(e.target.value)} spellCheck={false} placeholder={`Paste ${label.toLowerCase()} code here…`} />
          </div>
        ))}
      </div>
      {(left || right) && (
        <div style={{ marginTop: '1rem' }}>
          <div className="pane-label" style={{ marginBottom: '0.5rem' }}>Diff</div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'auto', maxHeight: 400 }}>
            {diff().map((line, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.8125rem', fontFamily: 'JetBrains Mono, monospace' }}>
                <div style={{ padding: '2px 0.75rem', background: !line.same ? 'rgba(239,68,68,0.1)' : 'transparent', borderRight: '1px solid var(--border)', color: !line.same ? '#f87171' : 'var(--text-secondary)', whiteSpace: 'pre' }}>
                  {line.l !== undefined ? `${i+1} ${line.l}` : ''}
                </div>
                <div style={{ padding: '2px 0.75rem', background: !line.same ? 'rgba(34,197,94,0.1)' : 'transparent', color: !line.same ? '#4ade80' : 'var(--text-secondary)', whiteSpace: 'pre' }}>
                  {line.r !== undefined ? `${i+1} ${line.r}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
