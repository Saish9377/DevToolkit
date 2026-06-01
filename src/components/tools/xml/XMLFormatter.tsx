'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { addToHistory } from '@/lib/history';
import { copyToClipboard } from '@/lib/share';

// ── XML Formatter & Minifier Logic ───────────────────────────
function formatXML(xmlStr: string): string {
  let xml = xmlStr.trim();
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  
  // Split into tags and text contents
  const parts = xml.split(/(<\/?[^>]+>)/g).map(x => x.trim()).filter(Boolean);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part.startsWith('<?') && part.endsWith('?>')) {
      formatted += tab.repeat(indent) + part + '\n';
    } else if (part.startsWith('<!--')) {
      formatted += tab.repeat(indent) + part + '\n';
    } else if (part.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + part + '\n';
    } else if (part.startsWith('<') && part.endsWith('/>')) {
      formatted += tab.repeat(indent) + part + '\n';
    } else if (part.startsWith('<')) {
      const tagNameMatch = part.match(/^<([^\s>]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1] : '';
      
      const nextPart = parts[i + 1];
      const nextNextPart = parts[i + 2];
      
      if (nextPart && nextNextPart === `</${tagName}>` && !nextPart.startsWith('<')) {
        // Simple element with text only: <tag>text</tag>
        formatted += tab.repeat(indent) + part + nextPart + nextNextPart + '\n';
        i += 2; // skip text and closing tag
      } else if (nextPart === `</${tagName}>`) {
        // Empty element: <tag></tag>
        formatted += tab.repeat(indent) + part + nextPart + '\n';
        i++; // skip closing tag
      } else {
        formatted += tab.repeat(indent) + part + '\n';
        indent++;
      }
    } else {
      // Floating text node
      formatted += tab.repeat(indent) + part + '\n';
    }
  }
  return formatted.trim();
}

function minifyXML(xmlStr: string): string {
  return xmlStr
    .replace(/>\s+</g, '><') // remove whitespace between tags
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
    .trim();
}

// ── XML Validator ───────────────────────────────────────────
interface XMLError {
  line: number;
  column: number;
  message: string;
}

function validateXML(xml: string): XMLError | null {
  if (typeof window === 'undefined') return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      const errorText = parserError.textContent || "";
      // Parse Chrome/Safari: "error on line 3 at column 6: ..."
      let match = errorText.match(/line\s+(\d+)\s+at\s+column\s+(\d+)/i);
      if (match) {
        return {
          line: parseInt(match[1], 10),
          column: parseInt(match[2], 10),
          message: errorText.replace(/line\s+\d+\s+at\s+column\s+\d+:\s*/i, '').trim()
        };
      }
      // Parse Firefox: "XML Parsing Error: ...\nLine Number 3, Column 6:"
      match = errorText.match(/Line\s+Number\s+(\d+),\s+Column\s+(\d+)/i);
      if (match) {
        const msgMatch = errorText.match(/XML\s+Parsing\s+Error:\s*(.*?)\n/i);
        return {
          line: parseInt(match[1], 10),
          column: parseInt(match[2], 10),
          message: msgMatch ? msgMatch[1].trim() : 'XML Syntax Error'
        };
      }
      return {
        line: 1,
        column: 1,
        message: errorText.split('\n')[0] || 'Invalid XML structure'
      };
    }
    return null;
  } catch (e) {
    return {
      line: 1,
      column: 1,
      message: String(e)
    };
  }
}

// ── XML Explain Engine ───────────────────────────────────────
interface XMLExplainResult {
  rootTag: string;
  totalTags: number;
  maxDepth: number;
  namespaces: string[];
  attributesCount: number;
  commentsCount: number;
  summary: string;
}

function analyzeXML(xmlStr: string): XMLExplainResult {
  if (typeof window === 'undefined') {
    return {
      rootTag: 'None',
      totalTags: 0,
      maxDepth: 0,
      namespaces: [],
      attributesCount: 0,
      commentsCount: 0,
      summary: ''
    };
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, "application/xml");
  
  let totalTags = 0;
  let maxDepth = 0;
  let attributesCount = 0;
  const namespaces = new Set<string>();
  
  function traverse(node: Element, depth: number) {
    totalTags++;
    maxDepth = Math.max(maxDepth, depth);
    attributesCount += node.attributes.length;
    
    if (node.namespaceURI && node.namespaceURI !== 'http://www.w3.org/1999/xhtml') {
      namespaces.add(node.namespaceURI);
    }
    
    Array.from(node.children).forEach(child => {
      traverse(child, depth + 1);
    });
  }
  
  const root = doc.documentElement;
  if (root && root.tagName !== 'parsererror') {
    traverse(root, 1);
  }
  
  const commentsCount = (xmlStr.match(/<!--/g) || []).length;
  
  return {
    rootTag: root ? root.tagName : 'None',
    totalTags,
    maxDepth,
    namespaces: Array.from(namespaces),
    attributesCount,
    commentsCount,
    summary: `Root <${root ? root.tagName : 'None'}> containing ${totalTags} total tags with max nesting depth of ${maxDepth}.`
  };
}

// ── XML Tree Node Component ──────────────────────────────────
function XMLTreeNode({ node, depth = 0 }: { node: Node; depth?: number }) {
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
  const tagName = element.tagName;
  const attrs = Array.from(element.attributes);
  const children = Array.from(element.childNodes).filter(child => {
    if (child.nodeType === Node.TEXT_NODE && !child.nodeValue?.trim()) return false;
    return true;
  });
  
  const hasChildren = children.length > 0;
  const isSingleText = children.length === 1 && children[0].nodeType === Node.TEXT_NODE;
  
  return (
    <div className="tree-node" style={{ paddingLeft: depth === 0 ? 0 : '1.25rem' }}>
      {hasChildren ? (
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
                  <XMLTreeNode key={idx} node={child} depth={depth + 1} />
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
          <span className="tree-key">/&gt;</span>
        </div>
      )}
    </div>
  );
}

// ── Copy As Language Helpers ────────────────────────────────
const LANGUAGES = [
  { id: 'xml', label: 'XML' },
  { id: 'js', label: 'JavaScript String' },
  { id: 'python', label: 'Python ElementTree' },
  { id: 'php', label: 'PHP SimpleXML' },
];

function convertXMLToLang(xml: string, lang: string): string {
  switch (lang) {
    case 'xml': return xml;
    case 'js': return `const xmlData = \`\n${xml}\n\`;`;
    case 'python': return `import xml.etree.ElementTree as ET\n\nxml_data = """${xml}"""\nroot = ET.fromstring(xml_data)`;
    case 'php': return `<?php\n$xml = new SimpleXMLElement('${xml.replace(/'/g, "\\'")}');`;
    default: return xml;
  }
}

// ── Main XML Formatter Tool Component ────────────────────────
export default function XMLFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<XMLError | null>(null);
  const [activeTab, setActiveTab] = useState<'format' | 'explain' | 'tree' | 'copy'>('format');
  const [mode, setMode] = useState<'beautify' | 'minify'>('beautify');
  const [explainData, setExplainData] = useState<XMLExplainResult | null>(null);
  const [parsedDoc, setParsedDoc] = useState<Document | null>(null);
  const [copyLang, setCopyLang] = useState('xml');
  const [copied, setCopied] = useState(false);

  const processXML = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      setParsedDoc(null);
      setExplainData(null);
      return;
    }

    const xmlError = validateXML(input);
    if (xmlError) {
      setError(xmlError);
      setOutput('');
      setParsedDoc(null);
      setExplainData(null);
      return;
    }

    setError(null);
    try {
      const formatted = mode === 'beautify' ? formatXML(input) : minifyXML(input);
      setOutput(formatted);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "application/xml");
      setParsedDoc(doc);
      setExplainData(analyzeXML(input));

      addToHistory('xml-formatter', input, input.substring(0, 80));
    } catch (e) {
      setError({ line: 1, column: 1, message: String(e) });
    }
  }, [input, mode]);

  useEffect(() => {
    const timer = setTimeout(processXML, 300);
    return () => clearTimeout(timer);
  }, [processXML]);

  const handleCopy = async () => {
    const text = copyLang === 'xml' ? output : convertXMLToLang(output, copyLang);
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const byteSize = (s: string) => new Blob([s]).size;

  const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children">
    <title lang="en">Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
</bookstore>`;

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

            <button className="btn btn-ghost btn-sm" onClick={() => setInput(SAMPLE_XML)}>
              Load Sample
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={processXML}
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
                <span>Input XML</span>
                {input && <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{byteSize(input)}B</span>}
              </div>
              <textarea
                className="textarea-code"
                style={{ minHeight: '420px' }}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={'<paste>\n  <your>XML here…</your>\n</paste>'}
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
                    XML Error at Line {error.line}, Column {error.column}
                  </div>
                  <div className="error-message">{error.message}</div>
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
                    💡 Check for missing closing tags, unquoted attribute values, or invalid symbols.
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
                    <span>Paste XML on the left to format</span>
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
              Paste valid XML in the Format tab first to see explanation.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Structure Analysis */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)', fontWeight: 600 }}>
                  <span>📊</span> XML Structure Analysis
                </div>
                {[
                  { label: 'Root Tag Name', value: explainData.rootTag },
                  { label: 'Total Element Tags', value: String(explainData.totalTags) },
                  { label: 'Max Nesting Depth', value: String(explainData.maxDepth) },
                  { label: 'Total Attributes', value: String(explainData.attributesCount) },
                  { label: 'Comment Nodes', value: String(explainData.commentsCount) },
                ].map(row => (
                  <div key={row.label} className="explain-row">
                    <span className="explain-row-key">{row.label}</span>
                    <span className="explain-row-value">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Namespaces & Schema Info */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)', fontWeight: 600 }}>
                  <span>🌐</span> XML Namespaces & Schemas
                </div>
                {explainData.namespaces.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No explicit XML Namespaces (xmlns) found in this document.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {explainData.namespaces.map((ns, i) => (
                      <div key={i} className="explain-field-item">
                        <span className="explain-field-path" style={{ fontSize: '0.8125rem' }}>{ns}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Insights */}
              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)', fontWeight: 600 }}>
                  <span>💡</span> XML Document Insights
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.875rem' }}>✓ Well-Formed</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      Document parsed correctly. Syntactically sound.
                    </div>
                  </div>
                  {explainData.commentsCount > 0 && (
                    <div style={{ padding: '0.75rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56,189,248,0.2)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--info)', fontSize: '0.875rem' }}>ℹ Comments Found</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Contains {explainData.commentsCount} comments. Minifying will remove comments.
                      </div>
                    </div>
                  )}
                  {explainData.maxDepth > 4 && (
                    <div style={{ padding: '0.75rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--warning)', fontSize: '0.875rem' }}>⚠ Complex Hierarchy</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Max nesting depth of {explainData.maxDepth} tags. Check readability.
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
          {!parsedDoc || parsedDoc.documentElement.tagName === 'parsererror' ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Paste valid XML in the Format tab first to see the tree view.
            </div>
          ) : (
            <div className="output-box" style={{ minHeight: '420px', overflow: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>
              <div className="tree-view">
                <XMLTreeNode node={parsedDoc.documentElement} />
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
              Format some XML first, then choose a language to copy as.
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
                  {convertXMLToLang(output, copyLang)}
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
