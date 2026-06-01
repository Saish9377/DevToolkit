'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onSearchOpen: () => void;
  sidebarCollapsed: boolean;
}

export default function Navbar({ onSearchOpen, sidebarCollapsed }: NavbarProps) {
  const pathname = usePathname();

  // Derive a breadcrumb label from path
  const isToolPage = pathname.startsWith('/tools/') && !pathname.startsWith('/tools/category');
  const isCatPage  = pathname.startsWith('/tools/category/');
  const slug       = pathname.split('/').pop() ?? '';

  return (
    <header className={`navbar${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      {/* Breadcrumb / page title */}
      <div className="navbar-breadcrumb">
        <Link href="/" className="navbar-home-link">DevToolkit</Link>
        {(isToolPage || isCatPage) && (
          <>
            <span className="navbar-sep">›</span>
            <span className="navbar-crumb">
              {isCatPage ? `${slug.charAt(0).toUpperCase() + slug.slice(1)} Tools` : slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
        {/* ⌘K Search button (compact icon only) */}
        <button
          onClick={onSearchOpen}
          className="btn btn-ghost btn-sm btn-icon"
          title="Search tools (⌘K)"
          aria-label="Search tools"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        {/* Privacy indicator */}
        <div className="privacy-badge" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.625rem' }}>
          <div className="privacy-badge-dot"></div>
          100% Private
        </div>

        {/* Blog */}
        <Link href="/blog" className="btn btn-ghost btn-sm" title="Blog">
          Blog
        </Link>

        {/* FAQ */}
        <Link href="/faq" className="btn btn-ghost btn-sm" title="FAQ">
          FAQ
        </Link>

        {/* Contact */}
        <Link href="/contact" className="btn btn-ghost btn-sm" title="Contact">
          Contact
        </Link>
      </div>
    </header>
  );
}
