'use client';
import React, { useState } from 'react';
export default function DockerCompose() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'run-to-compose'|'compose-to-run'>('run-to-compose');
  const convert = (val: string, m = mode) => {
    setInput(val);
    if (!val.trim()) { setOutput(''); return; }
    if (m === 'run-to-compose') {
      const name = val.match(/--name\s+(\S+)/)?.[1] || 'myapp';
      const image = val.match(/docker run[^|&]+\s(\S+)\s*$/)?.[1] || val.split(' ').pop() || 'image';
      const ports = [...val.matchAll(/-p\s+(\d+):(\d+)/g)].map(m => `      - "${m[1]}:${m[2]}"`);
      const envs = [...val.matchAll(/-e\s+(\S+)/g)].map(m => `      - ${m[1]}`);
      const vols = [...val.matchAll(/-v\s+([^-\s]+)/g)].map(m => `      - ${m[1]}`);
      const nets = [...val.matchAll(/--network\s+(\S+)/g)].map(m => m[1]);
      setOutput(`version: '3.8'\n\nservices:\n  ${name}:\n    image: ${image}${ports.length ? `\n    ports:\n${ports.join('\n')}` : ''}${envs.length ? `\n    environment:\n${envs.join('\n')}` : ''}${vols.length ? `\n    volumes:\n${vols.join('\n')}` : ''}${nets.length ? `\n    networks:\n      - ${nets.join('\n      - ')}` : ''}\n    restart: unless-stopped${nets.length ? `\n\nnetworks:\n  ${nets.map(n => `${n}:\n    driver: bridge`).join('\n  ')}` : ''}`);
    } else {
      const svcMatch = val.match(/^\s{2}(\w+):/m);
      const svc = svcMatch?.[1] || 'app';
      const image = val.match(/image:\s*(\S+)/)?.[1] || 'image';
      const ports = [...val.matchAll(/- "?(\d+):(\d+)"?/g)].map(m => `-p ${m[1]}:${m[2]}`);
      const envs = [...val.matchAll(/- ([A-Z_]+=\S+)/g)].map(m => `-e ${m[1]}`);
      setOutput(`docker run -d --name ${svc} ${ports.join(' ')} ${envs.join(' ')} ${image}`);
    }
  };
  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div className="tabs" style={{ width: 'auto', marginBottom: '1rem' }}>
        <button className={`tab${mode === 'run-to-compose' ? ' active' : ''}`} onClick={() => { setMode('run-to-compose'); convert(input, 'run-to-compose'); }}>docker run → Compose</button>
        <button className={`tab${mode === 'compose-to-run' ? ' active' : ''}`} onClick={() => { setMode('compose-to-run'); convert(input, 'compose-to-run'); }}>Compose → docker run</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="tool-pane">
          <div className="pane-label">{mode === 'run-to-compose' ? 'docker run Command' : 'docker-compose.yml'}</div>
          <textarea className="textarea-code" style={{ minHeight: 360 }} value={input} onChange={e => convert(e.target.value)}
            placeholder={mode === 'run-to-compose' ? 'docker run -d --name webapp -p 80:8080 -e NODE_ENV=production myapp:latest' : 'version: \'3.8\'\nservices:\n  webapp:\n    image: myapp:latest'} spellCheck={false} />
        </div>
        <div className="tool-pane">
          <div className="pane-label">{mode === 'run-to-compose' ? 'docker-compose.yml' : 'docker run Command'}</div>
          <div className="output-box" style={{ minHeight: 360 }}>{output || <span style={{ color: 'var(--text-muted)' }}>Output appears here…</span>}</div>
        </div>
      </div>
    </div>
  );
}
