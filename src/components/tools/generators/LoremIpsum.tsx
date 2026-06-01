'use client';
import React, { useState } from 'react';
const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
const words = (n: number) => Array.from({length: n}, (_, i) => LOREM_WORDS[i % LOREM_WORDS.length]).join(' ');
const sentence = (n = 8) => words(n + Math.floor(Math.random() * 5)).replace(/^./, s => s.toUpperCase()) + '.';
const paragraph = (sentences = 5) => Array.from({length: sentences}, () => sentence()).join(' ');
export default function LoremIpsum() {
  const [type, setType] = useState<'paragraphs'|'sentences'|'words'>('paragraphs');
  const [count, setCount] = useState(3);
  const [html, setHtml] = useState(false);
  const [output, setOutput] = useState('');
  const generate = () => {
    let result = '';
    if (type === 'paragraphs') { const ps = Array.from({length: count}, () => paragraph()); result = html ? ps.map(p => `<p>${p}</p>`).join('\n') : ps.join('\n\n'); }
    else if (type === 'sentences') { result = Array.from({length: count}, () => sentence()).join(' '); }
    else { result = words(count); }
    setOutput(result);
  };
  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div className="tabs" style={{ width: 'auto' }}>
          {(['paragraphs', 'sentences', 'words'] as const).map(t => <button key={t} className={`tab${type === t ? ' active' : ''}`} onClick={() => setType(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
        </div>
        <input type="number" className="input" style={{ width: 80 }} value={count} min={1} max={100} onChange={e => setCount(Number(e.target.value))} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={html} onChange={e => setHtml(e.target.checked)} style={{ accentColor: 'var(--accent)' }} /> HTML output
        </label>
        <button className="btn btn-primary" onClick={generate}>Generate</button>
      </div>
      <div className="output-box" style={{ minHeight: 380, whiteSpace: 'pre-wrap' }}>{output || <span style={{ color: 'var(--text-muted)' }}>Click Generate to create placeholder text</span>}</div>
    </div>
  );
}
