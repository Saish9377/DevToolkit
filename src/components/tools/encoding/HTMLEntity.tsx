'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';
export default function HTMLEntity() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'escape'|'unescape'>('escape');
  const [output, setOutput] = useState('');
  const process = (val: string, m = mode) => {
    setInput(val);
    if (m === 'escape') {
      setOutput(val.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'));
    } else {
      const el = document.createElement('textarea'); el.innerHTML = val; setOutput(el.value);
    }
  };
  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div className="tabs" style={{ width: 240, marginBottom: '1rem' }}>
        <button className={`tab${mode === 'escape' ? ' active' : ''}`} onClick={() => { setMode('escape'); process(input, 'escape'); }}>Escape</button>
        <button className={`tab${mode === 'unescape' ? ' active' : ''}`} onClick={() => { setMode('unescape'); process(input, 'unescape'); }}>Unescape</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">Input</div>
          <textarea className="textarea-code" style={{ minHeight: 300 }} value={input} onChange={e => process(e.target.value)} placeholder={mode === 'escape' ? '<h1>Hello & "World"</h1>' : '&lt;h1&gt;Hello &amp; &quot;World&quot;&lt;/h1&gt;'} spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">Output {output && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => copyToClipboard(output)}>📋</button>}</div>
          <div className="output-box" style={{ minHeight: 300 }}>{output || <span style={{ color: 'var(--text-muted)' }}>Output here…</span>}</div>
        </div>
      </div>
    </div>
  );
}
