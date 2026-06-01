'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { addToHistory } from '@/lib/history';
import { copyToClipboard } from '@/lib/share';

const VOID_TAGS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'col', 'base', 'area', 'param', 'embed', 'source', 'track', 'wbr']);

// ── HTML Formatter & Minifier Logic ──────────────────────────
function formatHTML(htmlStr: string): string {
  let html = htmlStr.trim();
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  
  // Split into tags and text contents
  const parts = html.split(/(<\/?[a-zA-Z0-9:-]+(?:\s+[^>]*?)?>)/g).map(x => x.trim()).filter(Boolean);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part.startsWith('<!') || (part.startsWith('<?') && part.endsWith('?>'))) {
      formatted += tab.repeat(indent) + part + '\n';
    } else if (part.startsWith('<!--')) {
      formatted += tab.repeat(indent) + part + '\n';
    } else if (part.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + part + '\n';
    } else {
      const isTag = part.startsWith('<') && part.endsWith('>');
      if (isTag) {
        const tagNameMatch = part.match(/^<([a-zA-Z0-9:-]+)/);
        const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
        const isVoid = VOID_TAGS.has(tagName) || part.endsWith('/>');
        
        if (isVoid) {
          formatted += tab.repeat(indent) + part + '\n';
        } else {
          const nextPart = parts[i + 1];
          const nextNextPart = parts[i + 2];
          
          if (nextPart && nextNextPart === `</${tagName}>` && !nextPart.startsWith('<')) {
            formatted += tab.repeat(indent) + part + nextPart + nextNextPart + '\n';
            i += 2;
          } else if (nextPart === `</${tagName}>`) {
            formatted += tab.repeat(indent) + part + nextPart + '\n';
            i++;
          } else {
            formatted += tab.repeat(indent) + part + '\n';
            indent++;
          }
        }
      } else {
        formatted += tab.repeat(indent) + part + '\n';
      }
    }
  }
  return formatted.trim();
}

function minifyHTML(htmlStr: string): string {
  return htmlStr
    .replace(/>\s+</g, '><') // remove whitespace between tags
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
    .trim();
}

// ── HTML Explain Engine ──────────────────────────────────────
interface HTMLExplainResult {
  rootTag: string;
  totalTags: number;
  maxDepth: number;
  voidTagsCount: number;
  attributesCount: number;
  commentsCount: number;
  summary: string;
}

function analyzeHTML(htmlStr: string): HTMLExplainResult {
  if (typeof window === 'undefined') {
    return {
      rootTag: 'None',
      totalTags: 0,
      maxDepth: 0,
      voidTagsCount: 0,
      attributesCount: 0,
      commentsCount: 0,
      summary: ''
    };
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlStr, "text/html");
  
  let totalTags = 0;
  let maxDepth = 0;
  let voidTagsCount = 0;
  let attributesCount = 0;
  
  function traverse(node: Element, depth: number) {
    totalTags++;
    maxDepth = Math.max(maxDepth, depth);
    attributesCount += node.attributes.length;
    
    if (VOID_TAGS.has(node.tagName.toLowerCase())) {
      voidTagsCount++;
    }
    
    Array.from(node.children).forEach(child => {
      traverse(child, depth + 1);
    });
  }
  
  // Find body or document root
  const root = doc.body || doc.documentElement;
  if (root) {
    traverse(root, 1);
  }
  
  const commentsCount = (htmlStr.match(/<!--/g) || []).length;
  
  return {
    rootTag: root ? root.tagName.toLowerCase() : 'None',
    totalTags,
    maxDepth,
    voidTagsCount,
    attributesCount,
    commentsCount,
    summary: `HTML Document parsed with <${root ? root.tagName.toLowerCase() : 'None'}> root, containing ${totalTags} total tags, ${voidTagsCount} self-closing/void tags, and ${commentsCount} comments.`
  };
}

// ── HTML Tree Node Component ──────────────────────────────────
function HTMLTreeNode({ node, depth = 0 }: { node: Node; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  
  if (node.nodeType === Node.TEXT_NODE) {
    const val = node.nodeValue?.trim();
    if (!val) return null;
    return (
      <div className="tree-node" style={{ paddingLeft: '1.25rem' }}>
        <span className="tree-string">"{val}"</span>
      </div>
    );
  }
  
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  
  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  const attrs = Array.from(element.attributes);
  const children = Array.from(element.childNodes).filter(child => {
    if (child.nodeType === Node.TEXT_NODE && !child.nodeValue?.trim()) return false;
    return true;
  });
  
  const isVoid = VOID_TAGS.has(tagName);
  const hasChildren = children.length > 0;
  const isSingleText = children.length === 1 && children[0].nodeType === Node.TEXT_NODE;
  
  return (
    <div className="tree-node" style={{ paddingLeft: depth === 0 ? 0 : '1.25rem' }}>
      {hasChildren && !isVoid ? (
        isSingleText ? (
          <div className="tree-node-row">
            <span className="tree-toggle" />
            <span className="tree-key">&lt;{tagName}</span>
            {attrs.map(attr => (
              <span key={attr.name} style={{ marginLeft: '0.25rem' }}>
                <span className="tree-number" style={{ color: '#fbbf24' }}>{attr.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>=</span>
                <span className="tree-string">"{attr.value}"</span>
              </span>
            ))}
            <span className="tree-key">&gt;</span>
            <span style={{ color: 'var(--text-primary)' }}>{children[0].nodeValue?.trim()}</span>
            <span className="tree-key">&lt;/{tagName}&gt;</span>
          </div>
        ) : (
          <>
            <div className="tree-node-row" onClick={() => setExpanded(e => !e)}>
              <span className="tree-toggle">{expanded ? '▾' : '▸'}</span>
              <span className="tree-key">&lt;{tagName}</span>
              {attrs.map(attr => (
                <span key={attr.name} style={{ marginLeft: '0.25rem' }}>
                  <span className="tree-number" style={{ color: '#fbbf24' }}>{attr.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>=</span>
                  <span className="tree-string">"{attr.value}"</span>
                </span>
              ))}
              <span className="tree-key">&gt;</span>
              {!expanded && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>... &lt;/{tagName}&gt;</span>}
            </div>
            {expanded && (
              <div>
                {children.map((child, idx) => (
                  <HTMLTreeNode key={idx} node={child} depth={depth + 1} />
                ))}
                <div className="tree-node-row" style={{ paddingLeft: '1.25rem' }}>
                  <span className="tree-toggle" />
                  <span className="tree-key">&lt;/{tagName}&gt;</span>
                </div>
              </div>
            )}
          </>
        )
      ) : (
        <div className="tree-node-row">
          <span className="tree-toggle" />
          <span className="tree-key">&lt;{tagName}</span>
          {attrs.map(attr => (
            <span key={attr.name} style={{ marginLeft: '0.25rem' }}>
              <span className="tree-number" style={{ color: '#fbbf24' }}>{attr.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>=</span>
              <span className="tree-string">"{attr.value}"</span>
            </span>
          ))}
          <span className="tree-key">{isVoid ? ' /' : ''}&gt;</span>
        </div>
      )}
    </div>
  );
}

// ── Copy As Language Helpers ────────────────────────────────
const LANGUAGES = [
  { id: 'html', label: 'HTML' },
  { id: 'js', label: 'JavaScript String' },
  { id: 'php', label: 'PHP String' },
];

function convertHTMLToLang(html: string, lang: string): string {
  switch (lang) {
    case 'html': return html;
    case 'js': return `const htmlTemplate = \`\n${html}\n\`;`;
    case 'php': return `<?php\n$html = '${html.replace(/'/g, "\\'")}';`;
    default: return html;
  }
}

// ── Main HTML Formatter Tool Component ────────────────────────
export default function HTMLFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'format' | 'explain' | 'tree' | 'copy'>('format');
  const [mode, setMode] = useState<'beautify' | 'minify'>('beautify');
  const [explainData, setExplainData] = useState<HTMLExplainResult | null>(null);
  const [parsedDoc, setParsedDoc] = useState<Document | null>(null);
  const [copyLang, setCopyLang] = useState('html');
  const [copied, setCopied] = useState(false);

  const processHTMLInput = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      setParsedDoc(null);
      setExplainData(null);
      return;
    }

    setError(null);
    try {
      const formatted = mode === 'beautify' ? formatHTML(input) : minifyHTML(input);
      setOutput(formatted);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "text/html");
      setParsedDoc(doc);
      setExplainData(analyzeHTML(input));

      addToHistory('html-formatter', input, input.substring(0, 80));
    } catch (e) {
      setError(String(e));
    }
  }, [input, mode]);

  useEffect(() => {
    const timer = setTimeout(processHTMLInput, 300);
    return () => clearTimeout(timer);
  }, [processHTMLInput]);

  const handleCopy = async () => {
    const text = copyLang === 'html' ? output : convertHTMLToLang(output, copyLang);
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const byteSize = (s: string) => new Blob([s]).size;

  const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sample Document</title>
</head>
<body>
  <div id="app" class="container">
    <h1>Welcome to DevToolkit</h1>
    <p class="lead">Fully client-side premium developer tools.</p>
    <img src="/globe.svg" alt="logo" width="100">
    <br>
    <input type="text" placeholder="Enter query..." class="input">
  </div>
</body>
</html>`;

  const tabs = [
    { id: 'format', label: 'Format', icon: '</>' },
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

            <button className="btn btn-ghost btn-sm" onClick={() => setInput(SAMPLE_HTML)}>
              Load Sample
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={processHTMLInput}
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
                <span>Input HTML</span>
                {input && <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{byteSize(input)}B</span>}
              </div>
              <textarea
                className="textarea-code"
                style={{ minHeight: '420px' }}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={'<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello</h1>\n  </body>\n</html>'}
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
                  <div className="error-location">Error</div>
                  <div className="error-message">{error}</div>
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
                    <span>Paste HTML on the left to format</span>
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
              Paste HTML in the Format tab first to see explanation.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Structure Analysis */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)', fontWeight: 600 }}>
                  <span>📊</span> HTML Structure Analysis
                </div>
                {[
                  { label: 'Document Root Tag', value: explainData.rootTag.toUpperCase() },
                  { label: 'Total Nodes/Tags', value: String(explainData.totalTags) },
                  { label: 'Max Element Depth', value: String(explainData.maxDepth) },
                  { label: 'Void / Self-closing Tags', value: String(explainData.voidTagsCount) },
                  { label: 'Attributes Declared', value: String(explainData.attributesCount) },
                  { label: 'Comment Blocks', value: String(explainData.commentsCount) },
                ].map(row => (
                  <div key={row.label} className="explain-row">
                    <span className="explain-row-key">{row.label}</span>
                    <span className="explain-row-value">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Tag Analysis Insights */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)', fontWeight: 600 }}>
                  <span>💡</span> HTML Structure Insights
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.875rem' }}>✓ Parsed successfully</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      The browser parsed and structured the HTML hierarchy.
                    </div>
                  </div>
                  {explainData.voidTagsCount > 0 && (
                    <div style={{ padding: '0.75rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56,189,248,0.2)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--info)', fontSize: '0.875rem' }}>ℹ Void Elements present</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Contains {explainData.voidTagsCount} tags that do not require close tags (e.g. img, input, br).
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tree Tab */}
      {activeTab === 'tree' && (
        <div style={{ padding: '1rem 0' }}>
          {!parsedDoc ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Paste HTML in the Format tab first to see the tree view.
            </div>
          ) : (
            <div className="output-box" style={{ minHeight: '420px', overflow: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>
              <div className="tree-view">
                <HTMLTreeNode node={parsedDoc.body || parsedDoc.documentElement} />
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
              Format some HTML first, then choose a language to copy as.
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
                  {convertHTMLToLang(output, copyLang)}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
                  onClick={handleCopy}
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
