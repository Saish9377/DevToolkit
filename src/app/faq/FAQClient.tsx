'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  {
    category: 'Privacy & Security',
    items: [
      {
        q: 'Does DevToolkit send my data to any server?',
        a: 'No. Every single tool runs entirely in your browser using JavaScript. Your data — whether it\'s a JWT token, JSON payload, source code, or SQL query — never leaves your device. There is no backend server processing your input.',
      },
      {
        q: 'Is it safe to paste sensitive data like JWT tokens or API keys?',
        a: 'Yes. Since all processing is client-side, your sensitive data cannot be intercepted, logged, or stored anywhere except your own browser\'s localStorage (for history). You can clear that anytime via browser settings.',
      },
      {
        q: 'Do you use cookies or track usage?',
        a: 'No cookies, no analytics, no tracking scripts. The only storage used is your browser\'s localStorage to save tool history and preferences — and only on your own machine.',
      },
      {
        q: 'Is the source code open?',
        a: 'Yes. DevToolkit is built with Next.js, React, and vanilla CSS. The source is available on GitHub. You can inspect every tool\'s implementation to verify it\'s client-side.',
      },
    ],
  },
  {
    category: 'Tools & Usage',
    items: [
      {
        q: 'Which tools are currently available?',
        a: 'DevToolkit has 37 fully working tools across 10 categories: JSON (9 tools), YAML, XML, HTML, SQL, Encoding, Security, Network, Generators, and Utilities. Every tool listed is fully functional — no "coming soon" stubs.',
      },
      {
        q: 'Do the tools work offline?',
        a: 'Yes! DevToolkit is a Progressive Web App (PWA). You can install it on your desktop or phone and use all tools without an internet connection. The app caches itself after your first visit.',
      },
      {
        q: 'How do I install DevToolkit as an app?',
        a: 'In Chrome or Edge: click the install icon in the address bar (or go to Settings → Install DevToolkit). On iOS Safari: tap Share → Add to Home Screen. Once installed, it opens instantly without a browser tab.',
      },
      {
        q: 'Can I save my inputs for later?',
        a: 'Yes. Each tool automatically saves your last 20 inputs in localStorage. Click the clock icon in the tool header to see and restore past inputs. You can also use the History feature within each tool.',
      },
      {
        q: 'How do I share a tool with pre-filled input?',
        a: 'Tools with the "Share" feature (JSON Formatter, JWT Inspector, Regex Tester, etc.) have a Share button. Clicking it copies a URL with your input encoded in the URL fragment. Share that link and anyone who opens it gets your exact input pre-loaded.',
      },
    ],
  },
  {
    category: 'Features',
    items: [
      {
        q: 'What is "Explain Mode" and how do I use it?',
        a: 'Explain Mode is available on tools that support it (look for the ✨ tag on a tool card). When active, it analyzes your input and explains it in plain English — field types, structure, complexity, common issues. It\'s perfect for understanding unfamiliar data formats.',
      },
      {
        q: 'What is the Smart Paste Detector?',
        a: 'The Smart Paste Detector (on the homepage) automatically identifies what you\'ve pasted — JSON, JWT, XML, YAML, Base64, URL-encoded data, SQL, or HTML — and instantly routes you to the right tool with your input pre-filled. No more guessing which tool to use.',
      },
      {
        q: 'How do keyboard shortcuts work?',
        a: 'Press ⌘K (Mac) or Ctrl+K (Windows) anywhere to open the universal search. Inside a tool, press Ctrl+Enter to run/format, Ctrl+Shift+C to copy output, Ctrl+Shift+S to share, and ? to see all shortcuts.',
      },
      {
        q: 'What happens if I find a bug or the tool gives wrong output?',
        a: 'Please report it! Use the Contact page or open an issue on GitHub. Include the input that caused the issue and what you expected. We typically fix bugs within 24 hours.',
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <span className={`faq-chevron${open ? ' rotated' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </span>
      </button>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

export default function FAQClient() {
  return (
    <div className="content-page animate-fade-in">
      <div className="content-page-inner">
        {/* Header */}
        <div className="content-page-header">
          <div className="section-label">
            <span>?</span>
            FAQ
          </div>
          <h1 className="content-page-title">Frequently Asked <span className="gradient-text">Questions</span></h1>
          <p className="content-page-subtitle">
            Everything you need to know about DevToolkit. Can't find your answer?{' '}
            <Link href="/contact">Contact us →</Link>
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="faq-sections">
          {FAQS.map(section => (
            <div key={section.category} className="faq-section">
              <div className="faq-section-label">{section.category}</div>
              <div className="faq-list">
                {section.items.map(item => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div className="content-page-cta">
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💬</div>
          <h3>Still have questions?</h3>
          <p>We're happy to help. Reach out via the contact form or GitHub.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn btn-primary">Contact us</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-secondary">
              Open GitHub issue
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
