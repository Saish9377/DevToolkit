'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';
import { addToHistory } from '@/lib/history';

function formatSQL(sql: string, dialect: string): string {
  // Simple SQL formatter
  const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'ON', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'INDEX', 'UNIQUE', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'CONSTRAINT', 'WITH', 'UNION', 'EXCEPT', 'INTERSECT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'DISTINCT', 'ALL', 'EXISTS', 'BETWEEN', 'LIKE', 'ASC', 'DESC'];
  
  let formatted = sql.trim().replace(/\s+/g, ' ');
  
  // Add newlines before major keywords
  ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'WITH'].forEach(kw => {
    const re = new RegExp(`\\b${kw}\\b`, 'gi');
    formatted = formatted.replace(re, `\n${kw}`);
  });

  // Indent AND/OR
  formatted = formatted.replace(/\b(AND|OR)\b/gi, '\n  $1');

  // Comma separation for SELECT columns
  formatted = formatted.replace(/,(?!\s*\n)/g, ',\n  ');

  // Uppercase keywords
  keywords.forEach(kw => {
    formatted = formatted.replace(new RegExp(`\\b${kw}\\b`, 'gi'), kw);
  });

  return formatted.replace(/^\n/, '').trim();
}

export default function SQLFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState('postgresql');
  const [mode, setMode] = useState<'format' | 'minify' | 'explain'>('format');
  const [copied, setCopied] = useState(false);

  const process = (val: string, m = mode, d = dialect) => {
    setInput(val);
    if (!val.trim()) { setOutput(''); return; }
    if (m === 'format') {
      setOutput(formatSQL(val, d));
    } else if (m === 'minify') {
      setOutput(val.replace(/\s+/g, ' ').replace(/\s*([,();])\s*/g, '$1').trim());
    } else {
      // Explain mode - parse the query type
      const q = val.trim().toUpperCase();
      const type = q.startsWith('SELECT') ? 'SELECT' : q.startsWith('INSERT') ? 'INSERT' : q.startsWith('UPDATE') ? 'UPDATE' : q.startsWith('DELETE') ? 'DELETE' : 'DDL';
      setOutput(`-- Query Analysis --\n-- Type: ${type}\n-- Dialect: ${d.toUpperCase()}\n\n${formatSQL(val, d)}`);
    }
    addToHistory('sql-formatter', val, val.substring(0, 60));
  };

  const copy = async () => { await copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const SAMPLE = `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = true AND u.created_at > '2024-01-01' GROUP BY u.id, u.name, u.email ORDER BY order_count DESC LIMIT 10`;

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div className="tabs" style={{ width: 'auto' }}>
          <button className={`tab${mode === 'format' ? ' active' : ''}`} onClick={() => { setMode('format'); process(input, 'format'); }}>Format</button>
          <button className={`tab${mode === 'minify' ? ' active' : ''}`} onClick={() => { setMode('minify'); process(input, 'minify'); }}>Minify</button>
          <button className={`tab${mode === 'explain' ? ' active' : ''}`} onClick={() => { setMode('explain'); process(input, 'explain'); }}>Explain ✨</button>
        </div>
        <select className="input select" style={{ width: 160 }} value={dialect} onChange={e => { setDialect(e.target.value); process(input, mode, e.target.value); }}>
          {['postgresql', 'mysql', 'sqlite', 'mssql'].map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => process(SAMPLE)}>Load Sample</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">SQL Input</div>
          <textarea className="textarea-code" style={{ minHeight: 380 }} value={input} onChange={e => process(e.target.value)} placeholder="SELECT * FROM users WHERE id = 1;" spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">
            {mode === 'explain' ? 'Analysis & Formatted Query' : mode === 'minify' ? 'Minified SQL' : 'Formatted SQL'}
            {output && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={copy}>{copied ? '✓' : '📋'} Copy</button>}
          </div>
          <div className="output-box" style={{ minHeight: 380 }}>{output || <span style={{ color: 'var(--text-muted)' }}>Output appears here…</span>}</div>
        </div>
      </div>
      {mode === 'explain' && output && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56,189,248,0.2)' }}>
          <div style={{ fontWeight: 600, color: 'var(--info)', marginBottom: '0.5rem' }}>ℹ Query Insights</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {input.toUpperCase().includes('JOIN') && <span>• Query uses JOINs — ensure columns are indexed for performance</span>}
            {input.toUpperCase().includes('SELECT *') && <span>⚠ Using SELECT * — specify columns explicitly for better performance</span>}
            {input.toUpperCase().includes('WHERE') && <span>• WHERE clause present — verify these columns have indexes</span>}
            {input.toUpperCase().includes('GROUP BY') && <span>• GROUP BY detected — aggregation query</span>}
          </div>
        </div>
      )}
    </div>
  );
}
