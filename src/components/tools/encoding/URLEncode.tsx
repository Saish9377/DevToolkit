'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';

export default function URLEncode() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [output, setOutput] = useState('');
  const [params, setParams] = useState<Array<{key: string; value: string}>>([]);
  const [copied, setCopied] = useState(false);

  const process = (val: string, m: typeof mode) => {
    setInput(val);
    try {
      if (!val.trim()) { setOutput(''); setParams([]); return; }
      if (m === 'encode') {
        setOutput(encodeURIComponent(val));
        setParams([]);
      } else {
        const decoded = decodeURIComponent(val.trim());
        setOutput(decoded);
        // Try parse query string
        try {
          const url = val.includes('?') ? new URL(val) : new URL('http://x?' + val);
          const p: Array<{key: string; value: string}> = [];
          url.searchParams.forEach((v, k) => p.push({ key: k, value: v }));
          setParams(p);
        } catch { setParams([]); }
      }
    } catch (e) {
      setOutput(`Error: ${e}`);
    }
  };

  const copy = async () => { await copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div className="tabs" style={{ width: 240, marginBottom: '1rem' }}>
        <button className={`tab${mode === 'encode' ? ' active' : ''}`} onClick={() => { setMode('encode'); process(input, 'encode'); }}>Encode</button>
        <button className={`tab${mode === 'decode' ? ' active' : ''}`} onClick={() => { setMode('decode'); process(input, 'decode'); }}>Decode</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">{mode === 'encode' ? 'URL / Text' : 'Encoded URL'}</div>
          <textarea className="textarea-code" style={{ minHeight: 200 }} value={input} onChange={e => process(e.target.value, mode)}
            placeholder={mode === 'encode' ? 'https://example.com/path?q=hello world&lang=en' : 'https%3A%2F%2Fexample.com%2F'} spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">
            {mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}
            {output && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={copy}>{copied ? '✓' : '📋'} Copy</button>}
          </div>
          <div className="output-box" style={{ minHeight: 200 }}>{output || <span style={{ color: 'var(--text-muted)' }}>Output appears here…</span>}</div>
        </div>
      </div>
      {params.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="pane-label" style={{ marginBottom: '0.75rem' }}>📊 Query Parameters</div>
          <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.5rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Key</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Value</span>
            </div>
            {params.map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.5rem 1rem', borderBottom: i < params.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <code style={{ color: '#93c5fd', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>{p.key}</code>
                <code style={{ color: '#86efac', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>{p.value}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
