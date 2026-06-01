'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Detection {
  type: string;
  label: string;
  icon: string;
  slug: string;
  confidence: 'high' | 'medium';
  description: string;
}

function detect(text: string): Detection | null {
  const t = text.trim();
  if (!t) return null;

  // JWT: three base64url segments separated by dots
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(t)) {
    try {
      const parts = t.split('.');
      if (parts.length === 3) {
        JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/') + '=='));
        return { type: 'jwt', label: 'JWT Token', icon: '🔐', slug: 'jwt-inspector', confidence: 'high', description: 'Detected a JSON Web Token — decode and inspect header, payload, and expiry.' };
      }
    } catch {}
  }

  // JSON
  try {
    if ((t.startsWith('{') || t.startsWith('[')) && (t.endsWith('}') || t.endsWith(']'))) {
      JSON.parse(t);
      return { type: 'json', label: 'JSON', icon: '{ }', slug: 'json-formatter', confidence: 'high', description: 'Valid JSON detected — format, validate, or convert it.' };
    }
  } catch {}

  // XML/HTML
  if (t.startsWith('<') && t.includes('>')) {
    if (/<!DOCTYPE html/i.test(t) || /<html/i.test(t) || /<body/i.test(t)) {
      return { type: 'html', label: 'HTML', icon: '⌘', slug: 'html-formatter', confidence: 'high', description: 'HTML markup detected — format or minify it.' };
    }
    return { type: 'xml', label: 'XML', icon: '< />', slug: 'xml-formatter', confidence: 'high', description: 'XML document detected — format and validate it.' };
  }

  // YAML: starts with --- or has key: value lines
  if (t.startsWith('---') || (/^[a-z_][a-z0-9_]*:\s+\S/im.test(t) && !t.startsWith('{'))) {
    return { type: 'yaml', label: 'YAML', icon: '≈', slug: 'yaml-to-json', confidence: 'medium', description: 'YAML configuration detected — convert to JSON or validate it.' };
  }

  // SQL
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH)\s/i.test(t)) {
    return { type: 'sql', label: 'SQL Query', icon: '⊡', slug: 'sql-formatter', confidence: 'high', description: 'SQL query detected — format and beautify it.' };
  }

  // Base64
  if (/^[A-Za-z0-9+/]{20,}={0,2}$/.test(t.replace(/\s/g, '')) && t.length % 4 <= 1) {
    return { type: 'base64', label: 'Base64', icon: '64', slug: 'base64', confidence: 'medium', description: 'Looks like Base64-encoded data — decode it instantly.' };
  }

  // URL encoded
  if (/%[0-9A-Fa-f]{2}/.test(t) || t.includes('%20') || t.includes('%2F')) {
    return { type: 'url', label: 'URL-encoded', icon: '🔗', slug: 'url-encode', confidence: 'high', description: 'URL-encoded string detected — decode all percent-encoded characters.' };
  }

  // URL (full)
  if (/^https?:\/\//.test(t)) {
    return { type: 'url', label: 'URL', icon: '🔗', slug: 'url-encode', confidence: 'high', description: 'URL detected — parse and encode/decode its components.' };
  }

  // Hash (hex string)
  if (/^[a-fA-F0-9]{32,128}$/.test(t) && [32, 40, 56, 64, 96, 128].includes(t.length)) {
    return { type: 'hash', label: 'Hash', icon: '#', slug: 'hash-generator', confidence: 'medium', description: `${t.length * 4}-bit hash detected — verify or generate similar hashes.` };
  }

  return null;
}

export default function SmartPasteDetector() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Detection | null>(null);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (val: string) => {
    setInput(val);
    setResult(detect(val));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    setTimeout(() => {
      setResult(detect(text));
    }, 0);
  };

  const go = () => {
    if (!result) return;
    // Encode input into URL hash for pre-filling
    const encoded = encodeURIComponent(input);
    router.push(`/tools/${result.slug}?input=${encoded}`);
  };

  return (
    <div className={`smart-paste${focused ? ' focused' : ''}`}>
      <div className="smart-paste-header">
        <div className="smart-paste-icon">⚡</div>
        <div>
          <div className="smart-paste-title">Smart Paste</div>
          <div className="smart-paste-sub">Paste anything — JSON, JWT, XML, SQL, Base64, URL… we'll detect it</div>
        </div>
      </div>

      <div className="smart-paste-input-wrap">
        <textarea
          ref={textareaRef}
          className="smart-paste-textarea"
          placeholder={'Paste JSON, JWT, XML, YAML, SQL, Base64, URL, or any dev data here…\n\nWe\'ll auto-detect what it is and open the right tool.'}
          value={input}
          onChange={e => handleChange(e.target.value)}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={5}
          spellCheck={false}
        />
      </div>

      {result ? (
        <div className="smart-paste-result">
          <div className="smart-paste-detected">
            <span className="smart-paste-detected-icon">{result.icon}</span>
            <div>
              <div className="smart-paste-detected-label">
                {result.label} detected
                <span className={`smart-paste-confidence ${result.confidence}`}>
                  {result.confidence === 'high' ? '● High confidence' : '● Likely'}
                </span>
              </div>
              <div className="smart-paste-detected-desc">{result.description}</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={go} style={{ flexShrink: 0 }}>
            Open in {result.label} tool →
          </button>
        </div>
      ) : input.trim() ? (
        <div className="smart-paste-unknown">
          <span style={{ opacity: 0.5 }}>🤔</span>
          <span>Format not recognized — <button onClick={() => router.push('/#all-tools')} className="smart-paste-link">browse all 37 tools</button></span>
        </div>
      ) : null}
    </div>
  );
}
