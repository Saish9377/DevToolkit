'use client';
import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '@/lib/share';

function jsonDiff(a: unknown, b: unknown, path = ''): Array<{ path: string; type: 'added' | 'removed' | 'changed'; oldVal?: unknown; newVal?: unknown }> {
  const diffs: Array<{ path: string; type: 'added' | 'removed' | 'changed'; oldVal?: unknown; newVal?: unknown }> = [];
  if (JSON.stringify(a) === JSON.stringify(b)) return diffs;
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    return [{ path: path || 'root', type: 'changed', oldVal: a, newVal: b }];
  }
  if (a && b && typeof a === 'object' && !Array.isArray(a)) {
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);
    const allKeys = new Set([...aKeys, ...bKeys]);
    allKeys.forEach(k => {
      const p = path ? `${path}.${k}` : k;
      const aV = (a as Record<string, unknown>)[k];
      const bV = (b as Record<string, unknown>)[k];
      if (!(k in (a as object))) diffs.push({ path: p, type: 'added', newVal: bV });
      else if (!(k in (b as object))) diffs.push({ path: p, type: 'removed', oldVal: aV });
      else diffs.push(...jsonDiff(aV, bV, p));
    });
  } else {
    diffs.push({ path: path || 'root', type: 'changed', oldVal: a, newVal: b });
  }
  return diffs;
}

export default function JSONDiff() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diffs, setDiffs] = useState<ReturnType<typeof jsonDiff>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!left.trim() || !right.trim()) { setDiffs([]); setError(''); return; }
    try {
      const a = JSON.parse(left);
      const b = JSON.parse(right);
      setDiffs(jsonDiff(a, b));
      setError('');
    } catch (e) {
      setError(String(e));
      setDiffs([]);
    }
  }, [left, right]);

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {[{ label: 'JSON A (Original)', val: left, set: setLeft, color: '#ef4444' }, { label: 'JSON B (Modified)', val: right, set: setRight, color: '#22c55e' }].map(({ label, val, set, color }) => (
          <div key={label} className="tool-pane">
            <div className="pane-label"><span style={{ color }}>{label}</span></div>
            <textarea className="textarea-code" style={{ minHeight: 300 }} value={val} onChange={e => set(e.target.value)} placeholder={'{\n  "key": "value"\n}'} spellCheck={false} />
          </div>
        ))}
      </div>
      {error && <div className="error-box" style={{ marginBottom: '1rem' }}><div className="error-location">⚠ Parse Error</div><div className="error-message">{error}</div></div>}
      <div className="pane-label" style={{ marginBottom: '0.75rem' }}>
        Differences
        <span style={{ marginLeft: 'auto' }}>
          {diffs.filter(d => d.type === 'added').length > 0 && <span style={{ color: '#22c55e', marginRight: 8 }}>+{diffs.filter(d => d.type === 'added').length}</span>}
          {diffs.filter(d => d.type === 'removed').length > 0 && <span style={{ color: '#ef4444', marginRight: 8 }}>-{diffs.filter(d => d.type === 'removed').length}</span>}
          {diffs.filter(d => d.type === 'changed').length > 0 && <span style={{ color: '#f59e0b' }}>~{diffs.filter(d => d.type === 'changed').length}</span>}
        </span>
      </div>
      {diffs.length === 0 && left && right && !error ? (
        <div className="success-box">✓ No differences found — JSON objects are identical</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {diffs.map((d, i) => (
            <div key={i} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', background: d.type === 'added' ? 'rgba(34,197,94,0.08)' : d.type === 'removed' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${d.type === 'added' ? 'rgba(34,197,94,0.2)' : d.type === 'removed' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, color: d.type === 'added' ? '#22c55e' : d.type === 'removed' ? '#ef4444' : '#f59e0b', fontSize: '0.75rem' }}>
                  {d.type === 'added' ? '+ ADDED' : d.type === 'removed' ? '- REMOVED' : '~ CHANGED'}
                </span>
                <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', color: '#93c5fd' }}>{d.path}</code>
              </div>
              {d.type === 'changed' && (
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  <span style={{ color: '#ef4444' }}>- {JSON.stringify(d.oldVal)}</span>
                  <span style={{ color: '#22c55e' }}>+ {JSON.stringify(d.newVal)}</span>
                </div>
              )}
              {(d.type === 'added' || d.type === 'removed') && (
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', color: d.type === 'added' ? '#22c55e' : '#ef4444' }}>
                  {JSON.stringify(d.type === 'added' ? d.newVal : d.oldVal)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
