'use client';
import React, { useState } from 'react';
const ERRORS: Record<string, { title: string; meaning: string; causes: string[]; fixes: string[]; example: string }> = {
  'NullPointerException': { title: 'NullPointerException (Java)', meaning: 'Attempted to use a null reference — calling a method or accessing a field on an object that is null.', causes: ['Object was never initialized', 'Method returned null and you used the result directly', 'Array element is null', 'Unboxing a null Integer/Long/etc.'], fixes: ['Check for null before using: if (obj != null)', 'Use Optional<T> for nullable return values', 'Initialize objects properly in constructors', 'Use Objects.requireNonNull() with a clear message'], example: 'String s = null;\ns.length(); // ❌ NullPointerException\n\n// Fix:\nif (s != null) { s.length(); }' },
  'TypeError': { title: 'TypeError (JavaScript)', meaning: "Operation was performed on a value of the wrong type, or a property/method doesn't exist on the object.", causes: ['Calling a non-function as a function', 'Accessing property of null or undefined', 'Using wrong operator for the type', 'Missing import/require'], fixes: ["Add null checks: value?.property", "Use typeof checks before operations", "Ensure async functions are awaited", "Check that imports are correct"], example: "const user = null;\nconsole.log(user.name); // ❌ TypeError\n\n// Fix:\nconsole.log(user?.name);" },
  'IndexError': { title: 'IndexError (Python)', meaning: 'Sequence subscript is out of range — you tried to access an index that does not exist.', causes: ['Off-by-one error', 'Empty list access', 'Loop boundary incorrect', 'Using hardcoded index on variable-length list'], fixes: ['Check len(list) before accessing', 'Use list[-1] for last element', 'Add bounds checking in loops', 'Use .get() for dict, try/except for lists'], example: 'items = [1, 2, 3]\nprint(items[5]) # ❌ IndexError\n\n# Fix:\nif len(items) > 5: print(items[5])' },
};
export default function ErrorDecoder() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<typeof ERRORS[string] | null>(null);
  const search = (val: string) => {
    setInput(val);
    const key = Object.keys(ERRORS).find(k => val.toLowerCase().includes(k.toLowerCase()));
    setResult(key ? ERRORS[key] : null);
  };
  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div className="pane-label" style={{ marginBottom: '0.5rem' }}>Paste your error message</div>
      <textarea className="textarea-code" style={{ minHeight: 120 }} value={input} onChange={e => search(e.target.value)} placeholder="NullPointerException at com.example.MyClass.method(MyClass.java:42)..." spellCheck={false} />
      {!result && input && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No match found. Try: NullPointerException, TypeError, IndexError</div>}
      {result && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>{result.title}</h3>
            <p>{result.meaning}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card"><div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--warning)' }}>⚠ Common Causes</div>{result.causes.map((c, i) => <div key={i} style={{ fontSize: '0.875rem', padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>• {c}</div>)}</div>
            <div className="card"><div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--success)' }}>✓ How to Fix</div>{result.fixes.map((f, i) => <div key={i} style={{ fontSize: '0.875rem', padding: '0.25rem 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>• {f}</div>)}</div>
          </div>
          <div className="card"><div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--info)' }}>💡 Example</div><div className="output-box" style={{ fontSize: '0.8125rem', whiteSpace: 'pre' }}>{result.example}</div></div>
        </div>
      )}
      {!input && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}><div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠</div><p>Paste any error message to decode it instantly</p></div>}
    </div>
  );
}
