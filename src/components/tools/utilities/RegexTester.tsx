'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { copyToClipboard } from '@/lib/share';
import { addToHistory } from '@/lib/history';

const REGEX_FLAGS = ['g', 'i', 'm', 's', 'u'];

const SYNTAX_EXPLAIN: Array<[RegExp, string]> = [
  [/^\^/, 'Anchors at start of string'],
  [/\$$/, 'Anchors at end of string'],
  [/\.\+/, 'One or more of any character'],
  [/\.\*/, 'Zero or more of any character'],
  [/\./,  'Any single character (except newline)'],
  [/\[a-z\]/i, 'Character class: a-z (lowercase letters)'],
  [/\[A-Z\]/,  'Character class: A-Z (uppercase letters)'],
  [/\[0-9\]/,  'Character class: 0-9 (digits)'],
  [/\\d/,  'Digit character [0-9]'],
  [/\\D/,  'Non-digit character'],
  [/\\w/,  'Word character [a-zA-Z0-9_]'],
  [/\\W/,  'Non-word character'],
  [/\\s/,  'Whitespace character'],
  [/\\S/,  'Non-whitespace character'],
  [/\{(\d+),(\d+)\}/, 'Quantifier: between {1} and {2} occurrences'],
  [/\{(\d+)\}/,        'Exactly {1} occurrences'],
  [/\+/,   'One or more occurrences'],
  [/\*/,   'Zero or more occurrences'],
  [/\?/,   'Zero or one occurrence (optional)'],
  [/\|/,   'Alternation — matches left OR right'],
  [/\(([^)]+)\)/, 'Capture group: captures "{1}"'],
  [/\(?:([^)]+)\)/, 'Non-capturing group'],
  [/\\b/,  'Word boundary'],
  [/\\n/,  'Newline character'],
];

function explainPattern(pattern: string): string[] {
  const explanations: string[] = [];
  SYNTAX_EXPLAIN.forEach(([regex, desc]) => {
    const match = pattern.match(regex);
    if (match) {
      explanations.push(desc.replace('{1}', match[1] || '').replace('{2}', match[2] || ''));
    }
  });
  return explanations.length > 0 ? explanations : ['Enter a pattern to see explanations'];
}

interface MatchResult {
  fullMatch: string;
  index: number;
  groups: string[];
  endIndex: number;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState(new Set(['g']));
  const [testStr, setTestStr] = useState('');
  const [replacement, setReplacement] = useState('');
  const [mode, setMode] = useState<'match' | 'replace' | 'learn'>('match');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState('');
  const [replaceResult, setReplaceResult] = useState('');
  const [isRedoSafe, setIsRedoSafe] = useState(true);

  const runRegex = useCallback(() => {
    if (!pattern || !testStr) {
      setMatches([]);
      setError('');
      setReplaceResult('');
      return;
    }
    try {
      const flagStr = Array.from(flags).join('');
      const regex = new RegExp(pattern, flagStr);

      // ReDoS check — time the regex
      const start = performance.now();
      const testResult = regex.test(testStr.substring(0, 1000));
      const elapsed = performance.now() - start;
      setIsRedoSafe(elapsed < 100);

      const results: MatchResult[] = [];
      const re = new RegExp(pattern, flagStr.includes('g') ? flagStr : flagStr + 'g');
      let m;
      while ((m = re.exec(testStr)) !== null) {
        results.push({
          fullMatch: m[0],
          index: m.index,
          groups: m.slice(1),
          endIndex: m.index + m[0].length,
        });
        if (!flagStr.includes('g')) break;
        if (m.index === re.lastIndex) re.lastIndex++;
      }

      setMatches(results);
      setError('');

      if (mode === 'replace') {
        setReplaceResult(testStr.replace(regex, replacement));
      }

      if (pattern) addToHistory('regex-tester', pattern, `/${pattern}/${flagStr}`);
    } catch (e) {
      setError(String(e).replace('SyntaxError: ', ''));
      setMatches([]);
    }
  }, [pattern, flags, testStr, replacement, mode]);

  useEffect(() => { const t = setTimeout(runRegex, 300); return () => clearTimeout(t); }, [runRegex]);

  const toggleFlag = (f: string) => {
    setFlags(prev => {
      const n = new Set(prev);
      if (n.has(f)) n.delete(f); else n.add(f);
      return n;
    });
  };

  // Highlighted test string
  const renderHighlighted = () => {
    if (!matches.length || !testStr) return testStr;
    const parts: React.ReactNode[] = [];
    let last = 0;
    matches.forEach((m, i) => {
      if (m.index > last) parts.push(testStr.slice(last, m.index));
      parts.push(
        <mark key={i} style={{ background: 'rgba(99,102,241,0.3)', color: 'var(--text-bright)', borderRadius: 2, padding: '1px 2px', border: '1px solid rgba(99,102,241,0.5)' }}>
          {m.fullMatch}
        </mark>
      );
      last = m.endIndex;
    });
    if (last < testStr.length) parts.push(testStr.slice(last));
    return parts;
  };

  const explanations = pattern ? explainPattern(pattern) : [];

  return (
    <div style={{ padding: '1rem 2rem' }}>
      {/* Tabs */}
      <div className="tabs-line" style={{ marginBottom: '1rem' }}>
        {([['match', '🔍 Match'], ['replace', '↔ Replace'], ['learn', '📚 Learn Mode']] as const).map(([id, label]) => (
          <button key={id} className={`tab${mode === id ? ' active' : ''}`} onClick={() => setMode(id)}>
            {label}
          </button>
        ))}
      </div>

      {/* Pattern Input */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', fontSize: '1.25rem' }}>/</span>
        <input
          className="input"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9375rem', flex: 1 }}
          value={pattern}
          onChange={e => setPattern(e.target.value)}
          placeholder="Enter regex pattern…"
          spellCheck={false}
        />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', fontSize: '1.25rem' }}>/</span>
        {/* Flags */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {REGEX_FLAGS.map(f => (
            <button
              key={f}
              className={`btn btn-sm ${flags.has(f) ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => toggleFlag(f)}
              title={`Flag: ${f}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-box" style={{ marginBottom: '0.75rem' }}>
          <div className="error-location">⚠ Invalid Pattern</div>
          <div className="error-message">{error}</div>
        </div>
      )}

      {!isRedoSafe && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--warning)' }}>
          ⚠ Potential ReDoS risk — this pattern may cause catastrophic backtracking.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: mode === 'learn' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
        <div>
          {/* Test String */}
          <div className="pane-label" style={{ marginBottom: '0.5rem' }}>Test String</div>
          <textarea
            className="textarea-code"
            style={{ minHeight: '180px' }}
            value={testStr}
            onChange={e => setTestStr(e.target.value)}
            placeholder="Enter text to test your regex against…"
            spellCheck={false}
          />

          {mode === 'replace' && (
            <div style={{ marginTop: '0.75rem' }}>
              <div className="pane-label" style={{ marginBottom: '0.5rem' }}>Replacement</div>
              <input
                className="input"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                value={replacement}
                onChange={e => setReplacement(e.target.value)}
                placeholder="$1, $2 for capture groups…"
              />
            </div>
          )}

          {/* Results */}
          <div style={{ marginTop: '1rem' }}>
            <div className="pane-label" style={{ marginBottom: '0.5rem' }}>
              {mode === 'replace' ? 'Result' : 'Highlighted Matches'}
              <span style={{ marginLeft: 'auto', color: matches.length > 0 ? 'var(--success)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                {matches.length} match{matches.length !== 1 ? 'es' : ''}
              </span>
            </div>

            {mode === 'replace' ? (
              <div className="output-box" style={{ minHeight: '120px' }}>
                {replaceResult || <span style={{ color: 'var(--text-muted)' }}>Enter a pattern and replacement…</span>}
              </div>
            ) : (
              <div className="output-box" style={{ minHeight: '120px', whiteSpace: 'pre-wrap' }}>
                {testStr ? renderHighlighted() : <span style={{ color: 'var(--text-muted)' }}>Enter test string above…</span>}
              </div>
            )}
          </div>

          {/* Match Details */}
          {matches.length > 0 && mode === 'match' && (
            <div style={{ marginTop: '1rem' }}>
              <div className="pane-label" style={{ marginBottom: '0.5rem' }}>Match Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '200px', overflowY: 'auto' }}>
                {matches.slice(0, 20).map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0.625rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', minWidth: 20 }}>#{i + 1}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#818cf8', fontSize: '0.875rem', flex: 1 }}>{m.fullMatch}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>pos {m.index}–{m.endIndex}</span>
                    {m.groups.length > 0 && (
                      <span style={{ color: '#86efac', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                        Groups: {m.groups.filter(Boolean).map((g, gi) => `$${gi + 1}="${g}"`).join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Learn Mode Panel */}
        {mode === 'learn' && (
          <div>
            <div className="pane-label" style={{ marginBottom: '0.5rem' }}>📚 Pattern Explanation</div>
            <div className="card" style={{ minHeight: '200px' }}>
              {!pattern ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Enter a regex pattern to see what each part means
                </div>
              ) : (
                <>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.125rem', color: '#818cf8', marginBottom: '1rem', wordBreak: 'break-all' }}>
                    /{pattern}/{Array.from(flags).join('')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {explanations.map((exp, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{exp}</span>
                      </div>
                    ))}
                  </div>

                  {/* Flag explanations */}
                  {flags.size > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Active Flags
                      </div>
                      {Array.from(flags).map(f => (
                        <div key={f} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          <code style={{ color: '#86efac' }}>{f}</code> — {
                            f === 'g' ? 'Global: find all matches' :
                            f === 'i' ? 'Case insensitive' :
                            f === 'm' ? 'Multiline: ^ and $ match line start/end' :
                            f === 's' ? 'Dot matches newline too' :
                            f === 'u' ? 'Unicode mode' : f
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Common Patterns Cheatsheet */}
            <div style={{ marginTop: '1rem' }}>
              <div className="pane-label" style={{ marginBottom: '0.5rem' }}>Common Patterns</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  ['Email', '^[\\w.-]+@[\\w.-]+\\.\\w{2,}$'],
                  ['URL', 'https?:\\/\\/[\\w.-]+\\.\\w+'],
                  ['IPv4', '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b'],
                  ['Phone (US)', '^\\+?1?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$'],
                  ['Hex Color', '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'],
                  ['UUID', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'],
                ].map(([name, pat]) => (
                  <div
                    key={name}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background var(--t-fast)' }}
                    onClick={() => setPattern(pat)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 80 }}>{name}</span>
                    <code style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'JetBrains Mono, monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pat}
                    </code>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>↗ Use</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
