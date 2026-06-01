'use client';
import React, { useState } from 'react';
export default function APITester() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<{ status: number; statusText: string; headers: Record<string,string>; body: string; time: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'body'|'headers'|'raw'>('body');

  const send = async () => {
    if (!url.trim()) { setError('Please enter a URL'); return; }
    setLoading(true); setError(''); setResponse(null);
    const start = Date.now();
    try {
      const parsedHeaders = headers.trim() ? JSON.parse(headers) : {};
      const opts: RequestInit = { method, headers: parsedHeaders };
      if (['POST','PUT','PATCH'].includes(method) && body.trim()) opts.body = body;
      const res = await fetch(url, opts);
      const resBody = await res.text();
      const resHeaders: Record<string,string> = {};
      res.headers.forEach((v,k) => { resHeaders[k] = v; });
      setResponse({ status: res.status, statusText: res.statusText, headers: resHeaders, body: resBody, time: Date.now() - start });
    } catch (e) {
      setError(`Request failed: ${e}. Try enabling CORS proxy or use a CORS-enabled endpoint.`);
    } finally { setLoading(false); }
  };

  const tryFormat = (s: string) => { try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; } };
  const statusColor = (s: number) => s < 300 ? '#22c55e' : s < 400 ? '#38bdf8' : s < 500 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <select className="input select" style={{ width: 110, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }} value={method} onChange={e => setMethod(e.target.value)}>
          {['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].map(m => <option key={m}>{m}</option>)}
        </select>
        <input className="input" style={{ flex: 1 }} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" onKeyDown={e => e.key === 'Enter' && send()} />
        <button className="btn btn-primary" onClick={send} disabled={loading}>
          {loading ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : '→ Send'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <div className="tabs-line" style={{ marginBottom: '0.75rem' }}>
            <button className={`tab${activeTab === 'headers' ? ' active' : ''}`} onClick={() => setActiveTab('headers')}>Headers</button>
            {['POST','PUT','PATCH'].includes(method) && <button className={`tab${activeTab === 'body' ? ' active' : ''}`} onClick={() => setActiveTab('body')}>Body</button>}
          </div>
          <textarea className="textarea-code" style={{ minHeight: 250 }} value={activeTab === 'body' ? body : headers} onChange={e => activeTab === 'body' ? setBody(e.target.value) : setHeaders(e.target.value)} placeholder={activeTab === 'body' ? '{"key": "value"}' : '{"Authorization": "Bearer token"}'} spellCheck={false} />
        </div>
        <div>
          <div className="pane-label" style={{ marginBottom: '0.75rem' }}>
            Response
            {response && <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>
              <span style={{ color: statusColor(response.status), fontWeight: 700 }}>{response.status}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{response.time}ms</span>
            </span>}
          </div>
          {error && <div className="error-box" style={{ marginBottom: '0.5rem' }}><div className="error-message" style={{ fontSize: '0.8125rem' }}>{error}</div></div>}
          {response ? (
            <>
              <div className="tabs-line" style={{ marginBottom: '0.5rem' }}>
                <button className={`tab${activeTab === 'body' ? ' active' : ''}`} onClick={() => setActiveTab('body')}>Body</button>
                <button className={`tab${activeTab === 'headers' ? ' active' : ''}`} onClick={() => setActiveTab('headers')}>Headers ({Object.keys(response.headers).length})</button>
              </div>
              {activeTab === 'headers' ? (
                <div className="output-box" style={{ minHeight: 220 }}>
                  {Object.entries(response.headers).map(([k, v]) => <div key={k} style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', padding: '2px 0' }}>
                    <span style={{ color: '#93c5fd', minWidth: 180, flexShrink: 0, fontSize: '0.8125rem' }}>{k}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', wordBreak: 'break-all' }}>{v}</span>
                  </div>)}
                </div>
              ) : (
                <div className="output-box" style={{ minHeight: 220, fontSize: '0.8125rem' }}>{tryFormat(response.body)}</div>
              )}
            </>
          ) : (
            <div className="output-box" style={{ minHeight: 250 }}>
              <div className="output-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3 }}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                Response will appear here
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
