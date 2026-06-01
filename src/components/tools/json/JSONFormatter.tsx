'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { addToHistory } from '@/lib/history';
import { copyToClipboard } from '@/lib/share';

// ── JSON Explain Engine ──────────────────────────────────────
interface ExplainResult {
  rootType: string;
  totalKeys: number;
  maxDepth: number;
  arrays: number;
  nulls: number;
  fields: FieldInfo[];
  summary: string;
}

interface FieldInfo {
  path: string;
  type: string;
  value?: string;
}

function getType(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function explainJSON(obj: unknown, path = '', depth = 0): FieldInfo[] {
  const fields: FieldInfo[] = [];
  if (depth > 10) return fields;

  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    Object.entries(obj as Record<string, unknown>).forEach(([k, v]) => {
      const p = path ? `${path}.${k}` : k;
      fields.push({
        path: p,
        type: getType(v),
        value: typeof v === 'string' ? `"${v.substring(0, 30)}"` :
               typeof v === 'number' ? String(v) :
               Array.isArray(v) ? `[${v.length} items]` :
               v === null ? 'null' : '{…}',
      });
      if (v && typeof v === 'object') {
        fields.push(...explainJSON(v, p, depth + 1));
      }
    });
  } else if (Array.isArray(obj)) {
    obj.slice(0, 3).forEach((item, i) => {
      const p = `${path}[${i}]`;
      fields.push({ path: p, type: getType(item) });
      if (item && typeof item === 'object') {
        fields.push(...explainJSON(item, p, depth + 1));
      }
    });
  }
  return fields;
}

function analyzeJSON(obj: unknown): ExplainResult {
  const fields = explainJSON(obj);
  const types = fields.map(f => f.type);
  
  let maxDepth = 0;
  fields.forEach(f => {
    const d = (f.path.match(/\./g) || []).length + (f.path.match(/\[/g) || []).length;
    maxDepth = Math.max(maxDepth, d);
  });

  return {
    rootType: getType(obj),
    totalKeys: fields.length,
    maxDepth: maxDepth + 1,
    arrays: types.filter(t => t === 'array').length,
    nulls: types.filter(t => t === 'null').length,
    fields: fields.slice(0, 30),
    summary: `${getType(obj) === 'object' ? 'Object' : getType(obj) === 'array' ? 'Array' : 'Value'} with ${fields.length} total fields, max depth ${maxDepth + 1}`,
  };
}

// ── Tree View ────────────────────────────────────────────────
function TreeNode({ data, path = '', depth = 0 }: { data: unknown; path?: string; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 3);
  const type = getType(data);
  const isExpandable = type === 'object' || type === 'array';
  const keys = isExpandable ? (Array.isArray(data) ? data.map((_, i) => String(i)) : Object.keys(data as object)) : [];

  return (
    <div className="tree-node" style={{ paddingLeft: depth === 0 ? 0 : '1.25rem' }}>
      {isExpandable ? (
        <>
          <div className="tree-node-row" onClick={() => setExpanded(e => !e)}>
            <span className="tree-toggle">{expanded ? '▾' : '▸'}</span>
            {path && <span className="tree-key">&ldquo;{path}&rdquo;</span>}
            {path && <span style={{ color: 'var(--text-muted)' }}>: </span>}
            <span className={type === 'array' ? 'tree-string' : 'tree-key'}>
              {type === 'array' ? `[${keys.length}]` : `{${keys.length}}`}
            </span>
            <span className={`tree-type-badge`}>{type}</span>
          </div>
          {expanded && (
            <div>
              {keys.map(k => (
                <TreeNode
                  key={k}
                  data={Array.isArray(data) ? (data as unknown[])[Number(k)] : (data as Record<string, unknown>)[k]}
                  path={k}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="tree-node-row">
          <span className="tree-toggle" />
          {path && <span className="tree-key">&ldquo;{path}&rdquo;</span>}
          {path && <span style={{ color: 'var(--text-muted)' }}>: </span>}
          <span className={`tree-${type}`}>
            {type === 'string' ? `"${String(data).substring(0, 60)}"` : String(data)}
          </span>
          <span className="tree-type-badge">{type}</span>
        </div>
      )}
    </div>
  );
}

// ── Copy As Code ─────────────────────────────────────────────
const LANGUAGES = [
  { id: 'json', label: 'JSON' },
  { id: 'js', label: 'JavaScript' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go struct' },
  { id: 'java', label: 'Java' },
  { id: 'csharp', label: 'C#' },
  { id: 'rust', label: 'Rust' },
  { id: 'php', label: 'PHP' },
];

function convertToLang(obj: unknown, lang: string, json: string): string {
  switch (lang) {
    case 'json': return json;
    case 'js': return `const data = ${json};`;
    case 'ts': return `const data: unknown = ${json};`;
    case 'python': {
      // Simple Python conversion
      const py = json.replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None');
      return `data = ${py}`;
    }
    case 'go': return `// Go struct — use JSON to TypeScript tool for full type generation\nvar data interface{}\njson.Unmarshal([]byte(\`${json}\`), &data)`;
    case 'java': return `// Java — use Gson\nGson gson = new Gson();\nObject data = gson.fromJson("${json.replace(/"/g, '\\"')}", Object.class);`;
    case 'csharp': return `// C# — use Newtonsoft.Json\nvar data = JsonConvert.DeserializeObject(${JSON.stringify(json)});`;
    case 'rust': return `// Rust — use serde_json\nlet data: serde_json::Value = serde_json::from_str(${JSON.stringify(json)}).unwrap();`;
    case 'php': return `<?php\n$data = json_decode('${json.replace(/'/g, "\\'")}', true);`;
    default: return json;
  }
}

// ── Main Component ────────────────────────────────────────────
export default function JSONFormatterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<{ line: number; col: number; msg: string; expected?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'format' | 'explain' | 'tree' | 'copy'>('format');
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [mode, setMode] = useState<'beautify' | 'minify'>('beautify');
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [explainData, setExplainData] = useState<ExplainResult | null>(null);
  const [copyLang, setCopyLang] = useState('json');
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const processJSON = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      setParsedData(null);
      setExplainData(null);
      return;
    }

    try {
      let parsed = JSON.parse(input);
      setParsedData(parsed);
      setExplainData(analyzeJSON(parsed));
      setError(null);

      if (sortKeys && typeof parsed === 'object' && parsed !== null) {
        const sortObj = (o: unknown): unknown => {
          if (Array.isArray(o)) return o.map(sortObj);
          if (o && typeof o === 'object') {
            return Object.keys(o as object).sort().reduce((acc, k) => {
              (acc as Record<string, unknown>)[k] = sortObj((o as Record<string, unknown>)[k]);
              return acc;
            }, {} as object);
          }
          return o;
        };
        parsed = sortObj(parsed);
      }

      const formatted = mode === 'beautify'
        ? JSON.stringify(parsed, null, indent)
        : JSON.stringify(parsed);

      setOutput(formatted);
      addToHistory('json-formatter', input, input.substring(0, 80));
    } catch (e) {
      const msg = String(e);
      // Extract line number from error
      const lineMatch = msg.match(/line (\d+)/i) || msg.match(/position (\d+)/i);
      const line = lineMatch ? parseInt(lineMatch[1]) : 1;
      setError({ line, col: 0, msg: msg.replace('JSON.parse: ', '').replace('SyntaxError: ', ''), expected: undefined });
      setOutput('');
      setParsedData(null);
    }
  }, [input, indent, sortKeys, mode]);

  // Auto-process on input change
  useEffect(() => {
    const timer = setTimeout(processJSON, 300);
    return () => clearTimeout(timer);
  }, [processJSON]);

  // Keyboard shortcut: Ctrl+Enter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        processJSON();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [processJSON]);

  const handleCopy = async () => {
    const text = copyLang === 'json' ? output : (parsedData ? convertToLang(parsedData, copyLang, output) : output);
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const byteSize = (s: string) => new Blob([s]).size;

  const tabs = [
    { id: 'format', label: 'Format', icon: '{ }' },
    { id: 'explain', label: 'Explain ✨', icon: '⭐' },
    { id: 'tree', label: 'Tree 🌳', icon: '🌲' },
    { id: 'copy', label: 'Copy As…', icon: '📋' },
  ] as const;

  return (
    <div className="tool-body" style={{ flexDirection: 'column', padding: '1rem 2rem' }}>
      {/* Tabs */}
      <div className="tabs-line">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Format Tab */}
      {activeTab === 'format' && (
        <div>
          {/* Options bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', flexWrap: 'wrap' }}>
            <div className="tabs" style={{ width: 'auto' }}>
              <button className={`tab${mode === 'beautify' ? ' active' : ''}`} onClick={() => setMode('beautify')}>
                Beautify
              </button>
              <button className={`tab${mode === 'minify' ? ' active' : ''}`} onClick={() => setMode('minify')}>
                Minify
              </button>
            </div>

            {mode === 'beautify' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Indent:</span>
                {[2, 4].map(n => (
                  <button
                    key={n}
                    className={`btn btn-sm ${indent === n ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setIndent(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={e => setSortKeys(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              Sort Keys
            </label>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={processJSON}
                title="Ctrl+Enter"
              >
                ⚡ Format
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopy}
                disabled={!output}
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setInput(''); setOutput(''); setError(null); }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Editor panes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Input */}
            <div className="tool-pane">
              <div className="pane-label">
                <span>Input JSON</span>
                {input && <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{byteSize(input)}B</span>}
              </div>
              <textarea
                className="textarea-code"
                style={{ minHeight: '420px' }}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={'{\n  "paste": "your JSON here…"\n}'}
                spellCheck={false}
              />
            </div>

            {/* Output */}
            <div className="tool-pane">
              <div className="pane-label">
                <span>Output</span>
                {output && (
                  <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                    {byteSize(output)}B
                    {mode === 'minify' && input && (
                      <span style={{ color: 'var(--success)', marginLeft: 4 }}>
                        ({Math.round((1 - byteSize(output) / byteSize(input)) * 100)}% smaller)
                      </span>
                    )}
                  </span>
                )}
              </div>
              {error ? (
                <div className="error-box">
                  <div className="error-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Error at Line {error.line}
                  </div>
                  <div className="error-message">{error.msg}</div>
                  <div className="error-context">
                    {input.split('\n').slice(Math.max(0, error.line - 2), error.line + 1).map((line, i) => {
                      const lineNum = Math.max(1, error.line - 1) + i;
                      return (
                        <div key={i} className={lineNum === error.line ? 'error-line-highlight' : ''}>
                          <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem', fontSize: '0.75rem' }}>{lineNum}</span>
                          {line}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    💡 Check for missing quotes, commas, or brackets near this line.
                  </div>
                </div>
              ) : output ? (
                <div className="output-box" style={{ minHeight: '420px' }}>{output}</div>
              ) : (
                <div className="output-box" style={{ minHeight: '420px' }}>
                  <div className="output-empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>Paste JSON on the left to format</span>
                    <span style={{ fontSize: '0.75rem' }}>Press <kbd style={{ background: 'var(--bg-root)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px' }}>Ctrl+Enter</kbd> to format</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Explain Tab */}
      {activeTab === 'explain' && (
        <div style={{ padding: '1rem 0' }}>
          {!explainData ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Paste valid JSON in the Format tab first to see the explanation.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Structure Analysis */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)', fontWeight: 600 }}>
                  <span>📊</span> Structure Analysis
                </div>
                {[
                  { label: 'Root Type', value: explainData.rootType },
                  { label: 'Total Fields', value: String(explainData.totalKeys) },
                  { label: 'Max Depth', value: String(explainData.maxDepth) },
                  { label: 'Arrays Found', value: String(explainData.arrays) },
                  { label: 'Null Values', value: String(explainData.nulls) },
                  { label: 'Summary', value: explainData.summary },
                ].map(row => (
                  <div key={row.label} className="explain-row">
                    <span className="explain-row-key">{row.label}</span>
                    <span className="explain-row-value">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Field Breakdown */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)', fontWeight: 600 }}>
                  <span>🔍</span> Field Breakdown
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {explainData.fields.length} fields
                  </span>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {explainData.fields.map((field, i) => (
                    <div key={i} className="explain-field-item">
                      <span className="explain-field-path">{field.path}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', marginRight: '0.5rem' }}>
                        {field.value}
                      </span>
                      <span className={`explain-field-type type-${field.type}`}>{field.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complexity & Recommendations */}
              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)', fontWeight: 600 }}>
                  <span>💡</span> Insights & Recommendations
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {explainData.maxDepth > 5 && (
                    <div style={{ padding: '0.75rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--warning)', fontSize: '0.875rem' }}>⚠ Deep Nesting</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Depth of {explainData.maxDepth} may impact readability. Consider flattening.
                      </div>
                    </div>
                  )}
                  {explainData.nulls > 0 && (
                    <div style={{ padding: '0.75rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56,189,248,0.2)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--info)', fontSize: '0.875rem' }}>ℹ Null Values</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        {explainData.nulls} null field(s). Consider if these are optional or required.
                      </div>
                    </div>
                  )}
                  <div style={{ padding: '0.75rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.875rem' }}>✓ Valid JSON</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {explainData.rootType === 'object' ? 'Well-structured JSON object.' : `JSON ${explainData.rootType}.`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tree Tab */}
      {activeTab === 'tree' && (
        <div style={{ padding: '1rem 0' }}>
          {!parsedData ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Paste valid JSON in the Format tab first to see the tree view.
            </div>
          ) : (
            <div className="output-box" style={{ minHeight: '420px', overflow: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>
              <div className="tree-view">
                <TreeNode data={parsedData} depth={0} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Copy As Tab */}
      {activeTab === 'copy' && (
        <div style={{ padding: '1rem 0' }}>
          {!output ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Format some JSON first, then choose a language to copy as.
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    className={`btn btn-sm ${copyLang === lang.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCopyLang(lang.id)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <div className="output-box" style={{ minHeight: '300px' }}>
                  {convertToLang(parsedData, copyLang, output)}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
                  onClick={async () => {
                    await copyToClipboard(convertToLang(parsedData, copyLang, output));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
