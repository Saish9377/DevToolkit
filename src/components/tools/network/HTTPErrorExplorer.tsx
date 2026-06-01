'use client';
import React, { useState } from 'react';
const HTTP_CODES: Record<number, { title: string; meaning: string; causes: string[]; fixes: string[]; rfc: string }> = {
  200: { title: 'OK', meaning: 'The request succeeded. The response body contains the requested data.', causes: ['Successful GET, POST, PUT, or DELETE'], fixes: ['No action needed — this is the expected success response'], rfc: 'RFC 9110' },
  201: { title: 'Created', meaning: 'The request succeeded and a new resource was created.', causes: ['Successful POST creating a new resource'], fixes: ['Check Location header for URL of created resource'], rfc: 'RFC 9110' },
  301: { title: 'Moved Permanently', meaning: 'The URL has permanently moved to a new location.', causes: ['URL restructuring', 'HTTP to HTTPS redirect'], fixes: ['Update bookmarks and links', 'Check Location header for new URL'], rfc: 'RFC 9110' },
  400: { title: 'Bad Request', meaning: 'The server cannot process the request due to a client error.', causes: ['Malformed JSON body', 'Missing required parameters', 'Invalid data types', 'Request too large'], fixes: ['Validate request body is valid JSON', 'Check all required fields are present', 'Verify Content-Type header'], rfc: 'RFC 9110' },
  401: { title: 'Unauthorized', meaning: 'The request requires authentication. The client must authenticate itself.', causes: ['Missing or invalid Authorization header', 'Expired JWT or session token', 'Invalid API key'], fixes: ['Check Authorization header is included', 'Refresh your token and retry', 'Verify API key is valid and not expired'], rfc: 'RFC 9110' },
  403: { title: 'Forbidden', meaning: 'The server understood the request but refuses to authorize it.', causes: ['Authenticated but lacking permissions', 'IP blocked', 'Rate limit exceeded', 'Account suspended'], fixes: ['Check user has required role/permission', 'Contact API owner for access', 'Wait for rate limit to reset'], rfc: 'RFC 9110' },
  404: { title: 'Not Found', meaning: 'The server cannot find the requested resource.', causes: ['URL typo', 'Resource deleted', 'ID does not exist', 'Wrong API endpoint'], fixes: ['Double-check the URL', 'Verify the resource ID exists', 'Check API documentation for correct endpoint'], rfc: 'RFC 9110' },
  405: { title: 'Method Not Allowed', meaning: 'The HTTP method is not supported for this endpoint.', causes: ['Using GET on a POST-only endpoint', 'Wrong HTTP verb'], fixes: ['Check API docs for allowed methods', 'Use Allow header in response to see what is permitted'], rfc: 'RFC 9110' },
  409: { title: 'Conflict', meaning: 'The request conflicts with the current state of the server.', causes: ['Duplicate unique constraint violation', 'Concurrent modification conflict', 'Resource already exists'], fixes: ['Check for existing resource before creating', 'Use PATCH instead of PUT for partial updates', 'Implement retry with exponential backoff'], rfc: 'RFC 9110' },
  422: { title: 'Unprocessable Entity', meaning: 'The request was well-formed but contains semantic errors.', causes: ['Validation errors in request body', 'Business logic constraints violated', 'Invalid field values'], fixes: ['Check response body for validation error details', 'Ensure data meets field constraints', 'Review API schema requirements'], rfc: 'RFC 9110' },
  429: { title: 'Too Many Requests', meaning: 'The client has sent too many requests in a given time.', causes: ['Rate limit exceeded', 'Burst limit hit', 'Per-user or global quota hit'], fixes: ['Check Retry-After header', 'Implement exponential backoff', 'Cache responses to reduce API calls', 'Request higher rate limits'], rfc: 'RFC 6585' },
  500: { title: 'Internal Server Error', meaning: 'The server encountered an unexpected error.', causes: ['Unhandled exception', 'Database connection failure', 'Out of memory', 'Configuration error', 'Bug in server code'], fixes: ['Check server logs', 'Retry the request (may be transient)', 'Contact API support with request ID'], rfc: 'RFC 9110' },
  502: { title: 'Bad Gateway', meaning: 'An upstream server returned an invalid response.', causes: ['Backend server crashed', 'Proxy misconfiguration', 'Upstream timeout'], fixes: ['Wait and retry', 'Check upstream service health', 'Review proxy/load balancer configuration'], rfc: 'RFC 9110' },
  503: { title: 'Service Unavailable', meaning: 'The server is temporarily unavailable (overloaded or down for maintenance).', causes: ['Server overload', 'Maintenance window', 'Deployment in progress', 'Auto-scaling lag'], fixes: ['Check Retry-After header', 'Monitor status page', 'Implement retry with backoff in your client'], rfc: 'RFC 9110' },
  504: { title: 'Gateway Timeout', meaning: 'The upstream server failed to respond in time.', causes: ['Database query timeout', 'External API slow response', 'Long-running computation', 'Network issues'], fixes: ['Increase timeout settings', 'Optimize slow queries', 'Add caching for expensive operations'], rfc: 'RFC 9110' },
};
const RANGES = [
  { range: '1xx', label: 'Informational', color: '#94a3b8', codes: [100,101,102,103] },
  { range: '2xx', label: 'Success', color: '#22c55e', codes: [200,201,202,204,206,207] },
  { range: '3xx', label: 'Redirection', color: '#38bdf8', codes: [301,302,303,304,307,308] },
  { range: '4xx', label: 'Client Error', color: '#f59e0b', codes: [400,401,403,404,405,409,422,429] },
  { range: '5xx', label: 'Server Error', color: '#ef4444', codes: [500,502,503,504,507] },
];
export default function HTTPErrorExplorer() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number | null>(404);
  const detail = selected ? HTTP_CODES[selected] : null;
  const filtered = Object.entries(HTTP_CODES).filter(([code, info]) =>
    !search || code.includes(search) || info.title.toLowerCase().includes(search.toLowerCase())
  );
  const statusColor = (code: number) => code < 200 ? '#94a3b8' : code < 300 ? '#22c55e' : code < 400 ? '#38bdf8' : code < 500 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ padding: '1rem 2rem', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', minHeight: 600 }}>
      <div>
        <input className="input" style={{ marginBottom: '0.75rem' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search code or name…" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: 520, overflowY: 'auto' }}>
          {filtered.map(([code, info]) => (
            <button key={code} onClick={() => setSelected(Number(code))} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid', borderColor: selected === Number(code) ? 'var(--accent)' : 'transparent', background: selected === Number(code) ? 'var(--accent-light)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all var(--t-fast)', width: '100%' }}>
              <code style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: statusColor(Number(code)), minWidth: 36 }}>{code}</code>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{info.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        {detail && selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '3rem', fontWeight: 900, color: statusColor(selected) }}>{selected}</div>
              <div>
                <h2 style={{ color: 'var(--text-bright)', marginBottom: '0.25rem' }}>{detail.title}</h2>
                <span className="badge badge-beta">{detail.rfc}</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>{detail.meaning}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="card"><div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: '0.5rem' }}>⚠ Common Causes</div>{detail.causes.map((c,i) => <div key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)' }}>• {c}</div>)}</div>
              <div className="card"><div style={{ fontWeight: 600, color: 'var(--success)', marginBottom: '0.5rem' }}>✓ How to Fix</div>{detail.fixes.map((f,i) => <div key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)' }}>• {f}</div>)}</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</div>
            <p>Select a status code to see details</p>
          </div>
        )}
      </div>
    </div>
  );
}
