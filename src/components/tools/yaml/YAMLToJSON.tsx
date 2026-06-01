'use client';
import React, { useState } from 'react';

export default function YAMLToJSON() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const parseYAML = (yaml: string): unknown => {
    // Simple YAML-to-object parser (no external dep)
    const lines = yaml.split('\n');
    const stack: Array<{ indent: number; obj: Record<string, unknown> | unknown[] }> = [];
    const root: Record<string, unknown> = {};
    stack.push({ indent: -1, obj: root });
    
    lines.forEach(line => {
      if (!line.trim() || line.trim().startsWith('#')) return;
      const indent = line.search(/\S/);
      const content = line.trim();
      
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      
      const parent = stack[stack.length - 1].obj;
      if (content.startsWith('- ')) {
        const val = content.slice(2);
        if (Array.isArray(parent)) (parent as unknown[]).push(val);
      } else if (content.includes(': ')) {
        const colonIdx = content.indexOf(': ');
        const key = content.slice(0, colonIdx);
        const val = content.slice(colonIdx + 2);
        const parsed = val === 'true' ? true : val === 'false' ? false : val === 'null' ? null : isNaN(Number(val)) ? val : Number(val);
        if (typeof parent === 'object' && !Array.isArray(parent)) {
          (parent as Record<string, unknown>)[key] = parsed;
        }
      } else if (content.endsWith(':')) {
        const key = content.slice(0, -1);
        const newObj: Record<string, unknown> = {};
        if (typeof parent === 'object' && !Array.isArray(parent)) {
          (parent as Record<string, unknown>)[key] = newObj;
          stack.push({ indent, obj: newObj });
        }
      }
    });
    return root;
  };

  const process = (val: string) => {
    setInput(val);
    if (!val.trim()) { setOutput(''); setError(''); return; }
    try {
      const parsed = parseYAML(val);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError(String(e));
      setOutput('');
    }
  };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">YAML Input</div>
          <textarea className="textarea-code" style={{ minHeight: 420 }} value={input} onChange={e => process(e.target.value)} placeholder={'name: John Doe\nage: 30\nroles:\n  - admin\n  - user'} spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">JSON Output</div>
          {error ? <div className="error-box"><div className="error-location">⚠ Parse Error</div><div className="error-message">{error}</div></div> :
            <div className="output-box" style={{ minHeight: 420 }}>{output || <span style={{ color: 'var(--text-muted)' }}>JSON will appear here…</span>}</div>}
        </div>
      </div>
    </div>
  );
}
