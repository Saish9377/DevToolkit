'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';
import { addToHistory } from '@/lib/history';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const process = (val: string, m: typeof mode) => {
    setInput(val);
    setError('');
    try {
      if (!val.trim()) { setOutput(''); return; }
      if (m === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(val))));
      } else {
        setOutput(decodeURIComponent(escape(atob(val.trim()))));
      }
      addToHistory('base64', val, val.substring(0, 60));
    } catch {
      setError(m === 'decode' ? 'Invalid Base64 string. Ensure correct padding.' : 'Encoding error.');
      setOutput('');
    }
  };

  const copy = async () => { await copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const swap = () => { const o = output; setInput(o); process(o, mode === 'encode' ? 'decode' : 'encode'); setMode(m => m === 'encode' ? 'decode' : 'encode'); };

  const byteSize = (s: string) => new Blob([s]).size;

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div className="tabs" style={{ width: 240, marginBottom: '1rem' }}>
        <button className={`tab${mode === 'encode' ? ' active' : ''}`} onClick={() => { setMode('encode'); process(input, 'encode'); }}>Encode</button>
        <button className={`tab${mode === 'decode' ? ' active' : ''}`} onClick={() => { setMode('decode'); process(input, 'decode'); }}>Decode</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <div className="tool-pane">
          <div className="pane-label">
            {mode === 'encode' ? 'Plain Text' : 'Base64 String'}
            {input && <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{byteSize(input)}B</span>}
          </div>
          <textarea className="textarea-code" style={{ minHeight: 300 }} value={input} onChange={e => process(e.target.value, mode)} placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Enter Base64 to decode…'} spellCheck={false} />
        </div>
        <div style={{ paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => process(input, mode)}>→</button>
          <button className="btn btn-ghost btn-sm" onClick={swap} title="Swap & reverse">⇌</button>
        </div>
        <div className="tool-pane">
          <div className="pane-label">
            {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            {output && <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{byteSize(output)}B {mode === 'encode' ? `(${Math.round(byteSize(output)/byteSize(input)*100)}% of original)` : ''}</span>}
          </div>
          {error ? (
            <div className="error-box"><div className="error-location">⚠ Error</div><div className="error-message">{error}</div></div>
          ) : (
            <div className="output-box" style={{ minHeight: 300, position: 'relative' }}>
              {output || <span style={{ color: 'var(--text-muted)' }}>Output will appear here…</span>}
              {output && (
                <button className="btn btn-secondary btn-sm" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }} onClick={copy}>
                  {copied ? '✓' : '📋'} Copy
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
