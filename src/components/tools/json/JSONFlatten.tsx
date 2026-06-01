'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';

function flatten(obj: unknown, prefix = '', delimiter = '.'): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const walk = (val: unknown, key: string) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.entries(val as Record<string, unknown>).forEach(([k, v]) => walk(v, key ? `${key}${delimiter}${k}` : k));
    } else {
      result[key] = val;
    }
  };
  if (obj && typeof obj === 'object') {
    Object.entries(obj as Record<string, unknown>).forEach(([k, v]) => walk(v, prefix ? `${prefix}${delimiter}${k}` : k));
  }
  return result;
}

function unflatten(obj: Record<string, unknown>, delimiter = '.'): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, val]) => {
    const parts = key.split(delimiter);
    let cur = result as Record<string, unknown>;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) { cur[p] = val; }
      else { cur[p] = cur[p] || {}; cur = cur[p] as Record<string, unknown>; }
    });
  });
  return result;
}

export default function JSONFlatten() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'flatten' | 'unflatten'>('flatten');
  const [delimiter, setDelimiter] = useState('.');
  const [copied, setCopied] = useState(false);

  const process = (val: string, m = mode, d = delimiter) => {
    setInput(val);
    if (!val.trim()) { setOutput(''); setError(''); return; }
    try {
      const parsed = JSON.parse(val);
      const result = m === 'flatten' ? flatten(parsed, '', d) : unflatten(parsed as Record<string, unknown>, d);
      setOutput(JSON.stringify(result, null, 2));
      setError('');
    } catch (e) {
      setError(String(e).replace('SyntaxError: ', ''));
      setOutput('');
    }
  };

  const copy = async () => { await copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div className="tabs" style={{ width: 'auto' }}>
          <button className={`tab${mode === 'flatten' ? ' active' : ''}`} onClick={() => { setMode('flatten'); process(input, 'flatten', delimiter); }}>Flatten</button>
          <button className={`tab${mode === 'unflatten' ? ' active' : ''}`} onClick={() => { setMode('unflatten'); process(input, 'unflatten', delimiter); }}>Unflatten</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Delimiter:</span>
          {['.', '_', '/', '->'].map(d => (
            <button key={d} className={`btn btn-sm ${delimiter === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setDelimiter(d); process(input, mode, d); }}>
              <code>{d}</code>
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">Input</div>
          <textarea className="textarea-code" style={{ minHeight: 380 }} value={input} onChange={e => process(e.target.value)} placeholder={'{\n  "user": {\n    "name": "John",\n    "address": {\n      "city": "NYC"\n    }\n  }\n}'} spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">
            Output {mode === 'flatten' ? '(Flattened)' : '(Nested)'}
            {output && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={copy}>{copied ? '✓' : '📋'} Copy</button>}
          </div>
          {error ? <div className="error-box"><div className="error-location">⚠</div><div className="error-message">{error}</div></div> :
            <div className="output-box" style={{ minHeight: 380 }}>{output || <span style={{ color: 'var(--text-muted)' }}>Output appears here…</span>}</div>}
        </div>
      </div>
    </div>
  );
}
