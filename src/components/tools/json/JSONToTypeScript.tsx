'use client';
import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '@/lib/share';

function inferType(val: unknown): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) {
    if (val.length === 0) return 'unknown[]';
    return `${inferType(val[0])}[]`;
  }
  if (typeof val === 'object') return generateInterface(val as Record<string, unknown>, 1);
  if (typeof val === 'number') return Number.isInteger(val) ? 'number' : 'number';
  return typeof val;
}

function generateInterface(obj: Record<string, unknown>, depth = 0, name = 'Root'): string {
  const indent = '  '.repeat(depth);
  const lines = Object.entries(obj).map(([k, v]) => {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
    const type = Array.isArray(v) ? (v.length === 0 ? 'unknown[]' : `${inferType(v[0])}[]`) :
                 v === null ? 'null' :
                 typeof v === 'object' ? generateInterface(v as Record<string, unknown>, depth + 1) :
                 typeof v;
    return `${indent}  ${safeKey}: ${type};`;
  });
  return depth === 0 ? `{\n${lines.join('\n')}\n}` : `{\n${lines.join('\n')}\n${indent}}`;
}

export default function JSONToTypeScript() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [interfaceName, setInterfaceName] = useState('Root');
  const [useZod, setUseZod] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      const parsed = JSON.parse(input);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
      if (typeof obj !== 'object' || !obj) { setOutput(`type ${interfaceName} = ${inferType(parsed)};`); return; }
      
      if (useZod) {
        const genZod = (o: Record<string, unknown>, depth = 0): string => {
          const indent = '  '.repeat(depth);
          const lines = Object.entries(o).map(([k, v]) => {
            const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
            let zodType = '';
            if (v === null) zodType = 'z.null()';
            else if (typeof v === 'string') zodType = 'z.string()';
            else if (typeof v === 'number') zodType = 'z.number()';
            else if (typeof v === 'boolean') zodType = 'z.boolean()';
            else if (Array.isArray(v)) zodType = `z.array(z.unknown())`;
            else if (typeof v === 'object') zodType = `z.object(${genZod(v as Record<string, unknown>, depth + 1)})`;
            else zodType = 'z.unknown()';
            return `${indent}  ${safeKey}: ${zodType},`;
          });
          return `{\n${lines.join('\n')}\n${indent}}`;
        };
        setOutput(`import { z } from 'zod';\n\nexport const ${interfaceName}Schema = z.object(${genZod(obj as Record<string, unknown>)});\n\nexport type ${interfaceName} = z.infer<typeof ${interfaceName}Schema>;`);
      } else {
        setOutput(`export interface ${interfaceName} ${generateInterface(obj as Record<string, unknown>)}`);
      }
      setError('');
    } catch (e) {
      setError(String(e).replace('SyntaxError: ', ''));
      setOutput('');
    }
  }, [input, interfaceName, useZod]);

  const copy = async () => { await copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Interface name:</span>
          <input className="input" style={{ width: 160 }} value={interfaceName} onChange={e => setInterfaceName(e.target.value)} />
        </div>
        <div className="tabs" style={{ width: 'auto' }}>
          <button className={`tab${!useZod ? ' active' : ''}`} onClick={() => setUseZod(false)}>TypeScript</button>
          <button className={`tab${useZod ? ' active' : ''}`} onClick={() => setUseZod(true)}>Zod Schema</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">JSON Input</div>
          <textarea className="textarea-code" style={{ minHeight: 420 }} value={input} onChange={e => setInput(e.target.value)} placeholder={'{\n  "id": 1,\n  "name": "John",\n  "email": "john@example.com"\n}'} spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">
            {useZod ? 'Zod Schema' : 'TypeScript Interface'}
            {output && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={copy}>{copied ? '✓' : '📋'} Copy</button>}
          </div>
          {error ? (
            <div className="error-box"><div className="error-location">⚠ Invalid JSON</div><div className="error-message">{error}</div></div>
          ) : (
            <div className="output-box" style={{ minHeight: 420 }}>{output || <span style={{ color: 'var(--text-muted)' }}>Output appears here…</span>}</div>
          )}
        </div>
      </div>
    </div>
  );
}
