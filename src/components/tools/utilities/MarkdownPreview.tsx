'use client';
import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/share';
export default function MarkdownPreview() {
  const [input, setInput] = useState(`# Welcome to DevToolkit\n\nThis is a **Markdown** preview editor.\n\n## Features\n- Real-time preview\n- GFM support\n- Syntax highlighting\n\n\`\`\`javascript\nconsole.log('Hello, world!');\n\`\`\`\n\n> Blockquotes work too!\n\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |`);
  const [view, setView] = useState<'split'|'preview'|'edit'>('split');
  
  const renderMarkdown = (md: string): string => {
    return md
      .replace(/^#{6}\s(.+)$/gm, '<h6>$1</h6>')
      .replace(/^#{5}\s(.+)$/gm, '<h5>$1</h5>')
      .replace(/^#{4}\s(.+)$/gm, '<h4>$1</h4>')
      .replace(/^#{3}\s(.+)$/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s(.+)$/gm, '<h2>$1</h2>')
      .replace(/^#{1}\s(.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:var(--bg-elevated);padding:1px 5px;border-radius:3px;font-family:JetBrains Mono,monospace">$1</code>')
      .replace(/```[\w]*\n([\s\S]+?)```/gm, '<pre style="background:var(--bg-elevated);padding:1rem;border-radius:8px;border:1px solid var(--border);overflow:auto"><code>$1</code></pre>')
      .replace(/^>\s(.+)$/gm, '<blockquote style="border-left:3px solid var(--accent);padding-left:1rem;margin:0.5rem 0;color:var(--text-secondary)">$1</blockquote>')
      .replace(/^-\s(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gms, '<ul style="padding-left:1.5rem">$1</ul>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:var(--accent)">$1</a>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img alt="$1" src="$2" style="max-width:100%">')
      .replace(/^(\|.+\|)$/gm, (_, row) => `<tr>${row.split('|').filter(Boolean).map((c: string) => `<td style="padding:0.5rem 0.75rem;border:1px solid var(--border)">${c.trim()}</td>`).join('')}</tr>`)
      .replace(/(<tr>.*<\/tr>\n?)+/gms, '<table style="border-collapse:collapse;width:100%">$&</table>')
      .replace(/\n\n/g, '</p><p style="margin:0.75rem 0">')
      .replace(/^(?!<[a-z])(.+)$/gm, '<p style="margin:0.75rem 0">$1</p>');
  };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div className="tabs" style={{ width: 'auto' }}>
          {(['split', 'edit', 'preview'] as const).map(v => <button key={v} className={`tab${view === v ? ' active' : ''}`} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: view === 'split' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
        {(view === 'split' || view === 'edit') && (
          <div className="tool-pane">
            <div className="pane-label">Markdown</div>
            <textarea className="textarea-code" style={{ minHeight: 500 }} value={input} onChange={e => setInput(e.target.value)} spellCheck={false} />
          </div>
        )}
        {(view === 'split' || view === 'preview') && (
          <div className="tool-pane">
            <div className="pane-label">Preview</div>
            <div style={{ minHeight: 500, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', overflow: 'auto', lineHeight: 1.7, color: 'var(--text-primary)' }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(input) }} />
          </div>
        )}
      </div>
    </div>
  );
}
