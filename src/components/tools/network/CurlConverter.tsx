'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';
export default function CurlConverter() {
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('python');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const convert = (val: string) => {
    setInput(val);
    if (!val.trim()) { setOutput(''); return; }
    const url = val.match(/(?:curl\s+)(?:-[A-Za-z]\s+\S+\s+)*['"]?([^\s'"]+)['"]?/)?.[1] || '';
    const method = (val.match(/-X\s+(\w+)/i)?.[1] || 'GET').toUpperCase();
    const headers = [...val.matchAll(/-H\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
    const body = val.match(/(?:-d|--data)\s+['"]([^'"]+)['"]/)?.[1];
    if (lang === 'python') {
      setOutput(`import requests\n\nheaders = {\n${headers.map(h => `    "${h.split(': ')[0]}": "${h.split(': ').slice(1).join(': ')}"`).join(',\n')}\n}\n\nresponse = requests.${method.toLowerCase()}(\n    "${url}",\n    headers=headers${body ? `,\n    json=${body}` : ''}\n)\n\nprint(response.status_code)\nprint(response.json())`);
    } else if (lang === 'javascript') {
      setOutput(`const response = await fetch("${url}", {\n  method: "${method}",\n  headers: {\n${headers.map(h => `    "${h.split(': ')[0]}": "${h.split(': ').slice(1).join(': ')}"`).join(',\n')}\n  }${body ? `,\n  body: JSON.stringify(${body})` : ''}\n});\n\nconst data = await response.json();\nconsole.log(data);`);
    } else if (lang === 'go') {
      setOutput(`package main\n\nimport (\n    "fmt"\n    "net/http"\n)\n\nfunc main() {\n    req, _ := http.NewRequest("${method}", "${url}", nil)\n${headers.map(h => `    req.Header.Set("${h.split(': ')[0]}", "${h.split(': ').slice(1).join(': ')}")`).join('\n')}\n    client := &http.Client{}\n    resp, _ := client.Do(req)\n    defer resp.Body.Close()\n    fmt.Println(resp.StatusCode)\n}`);
    } else {
      setOutput(`# ${lang} converter coming soon\n# URL: ${url}\n# Method: ${method}\n# Headers: ${headers.length}`);
    }
  };
  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['python', 'javascript', 'go', 'php', 'ruby'].map(l => <button key={l} className={`btn btn-sm ${lang === l ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setLang(l); convert(input); }}>{l}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">cURL Command</div>
          <textarea className="textarea-code" style={{ minHeight: 280 }} value={input} onChange={e => convert(e.target.value)} placeholder={`curl -X GET 'https://api.example.com/users' \\\n  -H 'Authorization: Bearer token' \\\n  -H 'Content-Type: application/json'`} spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">{lang} Code {output && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={async () => { await copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? '✓' : '📋'} Copy</button>}</div>
          <div className="output-box" style={{ minHeight: 280 }}>{output || <span style={{ color: 'var(--text-muted)' }}>Paste cURL and select a language…</span>}</div>
        </div>
      </div>
    </div>
  );
}
