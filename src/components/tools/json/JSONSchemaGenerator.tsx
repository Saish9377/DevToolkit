'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';

function inferSchema(val: unknown, required = true): Record<string, unknown> {
  if (val === null) return { type: 'null' };
  if (Array.isArray(val)) {
    return { type: 'array', items: val.length > 0 ? inferSchema(val[0]) : {} };
  }
  if (typeof val === 'object') {
    const props: Record<string, unknown> = {};
    const req: string[] = [];
    Object.entries(val as Record<string, unknown>).forEach(([k, v]) => {
      props[k] = inferSchema(v);
      req.push(k);
    });
    return { type: 'object', properties: props, required: req };
  }
  if (typeof val === 'number') return { type: 'number' };
  if (typeof val === 'boolean') return { type: 'boolean' };
  return { type: 'string' };
}

export default function JSONSchemaGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [title, setTitle] = useState('MySchema');
  const [copied, setCopied] = useState(false);

  const generate = (val: string) => {
    setInput(val);
    if (!val.trim()) { setOutput(''); setError(''); return; }
    try {
      const parsed = JSON.parse(val);
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title,
        ...inferSchema(parsed),
      };
      setOutput(JSON.stringify(schema, null, 2));
      setError('');
    } catch (e) {
      setError(String(e).replace('SyntaxError: ', ''));
      setOutput('');
    }
  };

  const copy = async () => { await copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Schema title:</span>
        <input className="input" style={{ width: 200 }} value={title} onChange={e => { setTitle(e.target.value); generate(input); }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">JSON Input</div>
          <textarea className="textarea-code" style={{ minHeight: 420 }} value={input} onChange={e => generate(e.target.value)} placeholder={'{\n  "id": 1,\n  "name": "Alice",\n  "active": true\n}'} spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">
            JSON Schema (Draft 7)
            {output && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={copy}>{copied ? '✓' : '📋'} Copy</button>}
          </div>
          {error ? (
            <div className="error-box"><div className="error-location">⚠ Invalid JSON</div><div className="error-message">{error}</div></div>
          ) : (
            <div className="output-box" style={{ minHeight: 420 }}>{output || <span style={{ color: 'var(--text-muted)' }}>Schema will appear here…</span>}</div>
          )}
        </div>
      </div>
    </div>
  );
}
