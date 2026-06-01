'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const REASONS = [
  { value: 'bug', label: '🐛 Report a bug' },
  { value: 'feature', label: '✨ Suggest a feature' },
  { value: 'tool', label: '🔧 Request a new tool' },
  { value: 'question', label: '❓ General question' },
  { value: 'other', label: '💬 Other' },
];

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', email: '', reason: 'bug', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Client-side: open mailto as fallback (no server)
    await new Promise(r => setTimeout(r, 600));
    const subject = encodeURIComponent(`DevToolkit: ${REASONS.find(r => r.value === form.reason)?.label ?? form.reason}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nReason: ${form.reason}\n\n${form.message}`);
    window.open(`mailto:saishshinde92@gmail.com?subject=${subject}&body=${body}`, '_blank');
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="content-page animate-fade-in">
      <div className="content-page-inner" style={{ maxWidth: 680 }}>
        {/* Header */}
        <div className="content-page-header">
          <div className="section-label">
            <span>✉</span>
            Contact
          </div>
          <h1 className="content-page-title">Get in <span className="gradient-text">Touch</span></h1>
          <p className="content-page-subtitle">
            Found a bug? Have a feature idea? Want a new tool? We'd love to hear from you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          {/* Form */}
          <div style={{ gridColumn: '1 / -1' }}>
            {sent ? (
              <div className="contact-success">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-bright)' }}>Message sent!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Your email client has opened with a pre-filled message. If it didn't open,{' '}
                  <a href="mailto:saishshinde92@gmail.com" style={{ color: 'var(--accent)' }}>email us directly</a>.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={() => setSent(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-row">
                  <div className="contact-field">
                    <label className="contact-label">Your name</label>
                    <input
                      className="input"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="contact-field">
                    <label className="contact-label">Email address</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label className="contact-label">What's this about?</label>
                  <div className="contact-reasons">
                    {REASONS.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        className={`contact-reason-btn${form.reason === r.value ? ' active' : ''}`}
                        onClick={() => update('reason', r.value)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="contact-field">
                  <label className="contact-label">Message</label>
                  <textarea
                    className="textarea-code"
                    style={{ minHeight: 160, fontFamily: 'Inter, sans-serif', fontSize: '0.9375rem', resize: 'vertical' }}
                    placeholder={
                      form.reason === 'bug'
                        ? 'Describe what happened, what you expected, and which tool...'
                        : form.reason === 'feature'
                        ? 'Describe the feature and how you would use it...'
                        : form.reason === 'tool'
                        ? 'Which tool would you like to see added? What would it do?'
                        : 'Your message...'
                    }
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Sending…
                      </>
                    ) : '✉ Send message'}
                  </button>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Opens your email client
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Alternatives */}
        <div className="contact-alternatives">
          <div className="contact-alt-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🐛</div>
            <div style={{ fontWeight: 600, color: 'var(--text-bright)', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>Found a bug?</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Open a GitHub issue for fastest response — include the tool name and input.
            </div>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
              GitHub Issues →
            </a>
          </div>
          <div className="contact-alt-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>❓</div>
            <div style={{ fontWeight: 600, color: 'var(--text-bright)', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>Common questions</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Check the FAQ first — most questions about privacy, offline use, and features are answered there.
            </div>
            <Link href="/faq" className="btn btn-secondary btn-sm">
              Read FAQ →
            </Link>
          </div>
          <div className="contact-alt-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✉</div>
            <div style={{ fontWeight: 600, color: 'var(--text-bright)', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>Direct email</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              For anything else, email us directly.
            </div>
            <a href="mailto:saishshinde92@gmail.com" className="btn btn-secondary btn-sm">
              saishshinde92@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
