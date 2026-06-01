'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';

export default function JSONStringEscape() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const process = (val: string, m = mode) => {
    setInput(val);
    if (!val) { setOutput(''); return; }
    if (m === 'escape') {
      setOutput(JSON.stringify(val));
    } else {
      try { setOutput(JSON.parse(val.startsWith('"') ? val : `"${val}"`)); }
      catch { setOutput('Error: invalid escaped string'); }
    }
  };

  const copy = async () => { await copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div className="tabs" style={{ width: 240, marginBottom: '1rem' }}>
        <button className={`tab${mode === 'escape' ? ' active' : ''}`} onClick={() => { setMode('escape'); process(input, 'escape'); }}>Escape</button>
        <button className={`tab${mode === 'unescape' ? ' active' : ''}`} onClick={() => { setMode('unescape'); process(input, 'unescape'); }}>Unescape</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">{mode === 'escape' ? 'Raw String' : 'Escaped JSON String'}</div>
          <textarea className="textarea-code" style={{ minHeight: 300 }} value={input} onChange={e => process(e.target.value)}
            placeholder={mode === 'escape' ? 'Enter text with "quotes", \nnewlines, and special chars…' : '"Escaped string with \\"quotes\\" here"'} spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">
            {mode === 'escape' ? 'Escaped Output' : 'Unescaped Output'}
            {output && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={copy}>{copied ? '✓' : '📋'} Copy</button>}
          </div>
          <div className="output-box" style={{ minHeight: 300 }}>{output || <span style={{ color: 'var(--text-muted)' }}>Output appears here…</span>}</div>
        </div>
      </div>
    </div>
  );
}
