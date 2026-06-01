'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { copyToClipboard } from '@/lib/share';
import { addToHistory } from '@/lib/history';

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresIn?: string;
  issuedAt?: string;
  securityIssues: SecurityIssue[];
}

interface SecurityIssue {
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  try {
    return decodeURIComponent(
      atob(padded).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch {
    return atob(padded);
  }
}

function analyzeJWT(token: string): DecodedJWT {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT: must have 3 parts (header.payload.signature)');

  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  const signature = parts[2];

  const now = Math.floor(Date.now() / 1000);
  const exp = payload.exp as number | undefined;
  const iat = payload.iat as number | undefined;
  const isExpired = exp ? now > exp : false;

  const formatTime = (ts: number) => {
    const d = new Date(ts * 1000);
    return d.toLocaleString();
  };

  const timeUntilExpiry = (ts: number) => {
    const diff = ts - now;
    if (diff <= 0) return 'Expired';
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // Security analysis
  const issues: SecurityIssue[] = [];

  const alg = header.alg as string;
  if (alg === 'none') {
    issues.push({ severity: 'error', title: 'Algorithm: none', description: 'Algorithm "none" means no signature verification — this is a critical security flaw!' });
  } else if (alg === 'HS256') {
    issues.push({ severity: 'info', title: 'HMAC-SHA256', description: 'HS256 uses a shared secret. Prefer RS256 (asymmetric) for public APIs.' });
  } else if (alg?.startsWith('RS') || alg?.startsWith('ES')) {
    issues.push({ severity: 'info', title: 'Asymmetric Algorithm', description: `${alg} uses public/private key pairs — recommended for distributed systems.` });
  }

  if (!exp) {
    issues.push({ severity: 'warning', title: 'No Expiry (exp)', description: 'Token has no expiration claim. This is a security risk — tokens should expire.' });
  } else if (isExpired) {
    issues.push({ severity: 'error', title: 'Token Expired', description: `This token expired on ${formatTime(exp)}. It should be rejected by servers.` });
  }

  if (!payload.iss) issues.push({ severity: 'warning', title: 'Missing Issuer (iss)', description: 'No issuer claim. Consider adding "iss" to validate token origin.' });
  if (!payload.sub) issues.push({ severity: 'info', title: 'Missing Subject (sub)', description: 'No subject claim. "sub" identifies the user the token refers to.' });
  if (!payload.aud) issues.push({ severity: 'info', title: 'Missing Audience (aud)', description: 'No audience claim. "aud" restricts which services can use this token.' });

  if (signature.length < 20) {
    issues.push({ severity: 'error', title: 'Weak Signature', description: 'The signature appears very short or empty. This may indicate a security issue.' });
  }

  return {
    header,
    payload,
    signature,
    isExpired,
    expiresIn: exp ? (isExpired ? `Expired ${timeUntilExpiry(exp)} ago` : `Expires in ${timeUntilExpiry(exp)} (${formatTime(exp)})`) : undefined,
    issuedAt: iat ? formatTime(iat) : undefined,
    securityIssues: issues,
  };
}

function JSONDisplay({ data }: { data: Record<string, unknown> }) {
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', lineHeight: 1.6 }}>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: '0.5rem', padding: '0.2rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ color: '#93c5fd', minWidth: '120px', flexShrink: 0 }}>{k}</span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span style={{ color: typeof v === 'string' ? '#86efac' : typeof v === 'number' ? '#fcd34d' : 'var(--text-primary)', flex: 1, wordBreak: 'break-all' }}>
            {typeof v === 'string' ? `"${v}"` : JSON.stringify(v)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function JWTInspector() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'payload' | 'header' | 'security' | 'raw'>('payload');
  const [copied, setCopied] = useState<string | null>(null);

  const decode = useCallback(() => {
    const t = token.trim();
    if (!t) { setDecoded(null); setError(''); return; }
    try {
      setDecoded(analyzeJWT(t));
      setError('');
      addToHistory('jwt-inspector', t, t.substring(0, 40) + '…');
    } catch (e) {
      setError(String(e).replace('Error: ', ''));
      setDecoded(null);
    }
  }, [token]);

  useEffect(() => { const t = setTimeout(decode, 400); return () => clearTimeout(t); }, [decode]);

  const copy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  return (
    <div style={{ padding: '1rem 2rem' }}>
      {/* Input */}
      <div style={{ marginBottom: '1rem' }}>
        <div className="pane-label" style={{ marginBottom: '0.5rem' }}>
          JWT Token
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setToken(SAMPLE_JWT)}>
            Load Sample
          </button>
        </div>
        <textarea
          className="textarea-code"
          style={{ minHeight: '100px', fontSize: '0.8125rem' }}
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0..."
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="error-box" style={{ marginBottom: '1rem' }}>
          <div className="error-location">⚠ Invalid JWT</div>
          <div className="error-message">{error}</div>
        </div>
      )}

      {decoded && (
        <div>
          {/* Status banner */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div className={decoded.isExpired ? 'error-box' : 'success-box'} style={{ flex: 1, minWidth: 200 }}>
              {decoded.isExpired ? '❌ Token Expired' : '✓ Token Valid'}
              {decoded.expiresIn && <span style={{ marginLeft: '0.5rem', opacity: 0.8 }}>· {decoded.expiresIn}</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Algorithm:</span>
              <span className={`badge ${decoded.header.alg === 'none' ? 'badge-hot' : decoded.header.alg?.toString().startsWith('RS') ? 'badge-new' : 'badge-beta'}`}>
                {String(decoded.header.alg || 'unknown')}
              </span>
            </div>
            {decoded.issuedAt && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                Issued: {decoded.issuedAt}
              </div>
            )}
          </div>

          {/* Security issues summary */}
          {decoded.securityIssues.filter(i => i.severity === 'error').length > 0 && (
            <div className="error-box" style={{ marginBottom: '1rem' }}>
              <div className="error-location">🚨 Security Issues Found</div>
              {decoded.securityIssues.filter(i => i.severity === 'error').map((issue, idx) => (
                <div key={idx} style={{ marginTop: '0.25rem' }}>
                  <strong>{issue.title}:</strong> {issue.description}
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="tabs-line" style={{ marginBottom: '1rem' }}>
            {([['payload', '📦 Payload'], ['header', '📋 Header'], ['security', '🔒 Security'], ['raw', '⌨ Raw']] as const).map(([id, label]) => (
              <button key={id} className={`tab${activeTab === id ? ' active' : ''}`} onClick={() => setActiveTab(id)}>
                {label}
                {id === 'security' && decoded.securityIssues.filter(i => i.severity === 'error').length > 0 && (
                  <span style={{ background: 'var(--error)', color: 'white', borderRadius: '999px', padding: '0 5px', fontSize: '0.625rem', marginLeft: 4 }}>
                    {decoded.securityIssues.filter(i => i.severity === 'error').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'payload' && (
            <div className="output-box">
              <JSONDisplay data={decoded.payload} />
            </div>
          )}

          {activeTab === 'header' && (
            <div className="output-box">
              <JSONDisplay data={decoded.header} />
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {decoded.securityIssues.map((issue, idx) => (
                <div key={idx} style={{
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${issue.severity === 'error' ? 'rgba(239,68,68,0.3)' : issue.severity === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(56,189,248,0.2)'}`,
                  background: issue.severity === 'error' ? 'var(--error-bg)' : issue.severity === 'warning' ? 'var(--warning-bg)' : 'var(--info-bg)',
                }}>
                  <div style={{ fontWeight: 600, color: issue.severity === 'error' ? 'var(--error)' : issue.severity === 'warning' ? 'var(--warning)' : 'var(--info)', marginBottom: '0.25rem' }}>
                    {issue.severity === 'error' ? '🚨' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'} {issue.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{issue.description}</div>
                </div>
              ))}
              {decoded.securityIssues.length === 0 && (
                <div className="success-box">
                  <span>✓ No security issues detected</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <div>
              {[
                { label: 'Header', value: token.split('.')[0], color: '#f87171' },
                { label: 'Payload', value: token.split('.')[1], color: '#86efac' },
                { label: 'Signature', value: token.split('.')[2], color: '#38bdf8' },
              ].map(part => (
                <div key={part.label} style={{ marginBottom: '0.75rem' }}>
                  <div className="pane-label" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ color: part.color }}>{part.label}</span>
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => copy(part.value, part.label)}>
                      {copied === part.label ? '✓' : '📋'} Copy
                    </button>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', color: part.color, wordBreak: 'break-all', border: '1px solid var(--border)' }}>
                    {part.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!decoded && !error && !token && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <p style={{ marginBottom: '1rem' }}>Paste a JWT token above to decode and inspect it</p>
          <button className="btn btn-secondary" onClick={() => setToken(SAMPLE_JWT)}>
            Try with sample JWT
          </button>
        </div>
      )}
    </div>
  );
}
