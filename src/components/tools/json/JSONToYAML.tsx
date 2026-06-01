'use client';
import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '@/lib/share';
import { addToHistory } from '@/lib/history';

function jsonToYaml(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return String(obj);
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes('"') || obj.includes("'") || obj.match(/^\s|\s$|^[&*!|>'"%@`?:,\[\]{}#]/)) {
      return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => `${pad}- ${jsonToYaml(item, indent + 1)}`).join('\n');
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries.map(([k, v]) => {
      const valStr = jsonToYaml(v, indent + 1);
      if (typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).length > 0) {
        return `${pad}${k}:\n${valStr}`;
      }
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') {
        return `${pad}${k}:\n${valStr}`;
      }
      return `${pad}${k}: ${valStr}`;
    }).join('\n');
  }
  return String(obj);
}

export default function JSONToYAML() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      const parsed = JSON.parse(input);
      setOutput(jsonToYaml(parsed));
      setError('');
      addToHistory('json-to-yaml', input, input.substring(0, 60));
    } catch (e) {
      setError(String(e).replace('SyntaxError: ', ''));
      setOutput('');
    }
  }, [input]);

  const copy = async () => { await copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">JSON Input</div>
          <textarea className="textarea-code" style={{ minHeight: 420 }} value={input} onChange={e => setInput(e.target.value)} placeholder={'{\n  "name": "John",\n  "age": 25\n}'} spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">
            YAML Output
            {output && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={copy}>{copied ? '✓' : '📋'} Copy</button>}
          </div>
          {error ? (
            <div className="error-box"><div className="error-location">⚠ Invalid JSON</div><div className="error-message">{error}</div></div>
          ) : (
            <div className="output-box" style={{ minHeight: 420 }}>{output || <span style={{ color: 'var(--text-muted)' }}>YAML output will appear here…</span>}</div>
          )}
        </div>
      </div>
    </div>
  );
}
