import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TOOLS, CATEGORY_META, type ToolCategory } from '@/lib/registry';

interface Props {
  params: Promise<{ cat: string }>;
}

const BASE_URL = 'https://devtoolkit.app';

const VALID_CATS = Object.keys(CATEGORY_META) as ToolCategory[];

export async function generateStaticParams() {
  return VALID_CATS.map(cat => ({ cat }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  if (!VALID_CATS.includes(cat as ToolCategory)) return { title: 'Not Found' };

  const meta = CATEGORY_META[cat as ToolCategory];
  const tools = TOOLS.filter(t => t.category === cat);
  const title = `${meta.label} Tools — Free Online ${meta.label} Utilities`;
  const description = `${tools.length} free ${meta.label} tools online. ${meta.description}. 100% client-side, no sign-up required.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/tools/category/${cat}` },
    openGraph: { title, description, url: `${BASE_URL}/tools/category/${cat}`, type: 'website' },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params;
  if (!VALID_CATS.includes(cat as ToolCategory)) notFound();

  const category = cat as ToolCategory;
  const meta = CATEGORY_META[category];
  const tools = TOOLS.filter(t => t.category === category);
  const popular = tools.filter(t => t.popular);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <span>Tools</span>
        <span>›</span>
        <span className={`tag cat-${category}`}>{meta.label}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <div className={`cat-${category}`} style={{
            width: 52, height: 52, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.125rem',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)',
          }}>
            {meta.icon}
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>
              {meta.label} <span className="gradient-text">Tools</span>
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              {meta.description}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <span>{tools.length} tools available</span>
          <span>·</span>
          <span>{popular.length} popular</span>
          <span>·</span>
          <span>100% free &amp; client-side</span>
        </div>
      </div>

      {/* Popular Tools */}
      {popular.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem' }}>
            ★ Popular
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {popular.map(tool => (
              <ToolCard key={tool.slug} tool={tool} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* All Tools */}
      <section>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          All {meta.label} Tools
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
          {tools.map(tool => (
            <ToolCard key={tool.slug} tool={tool} category={category} />
          ))}
        </div>
      </section>

      {/* Back */}
      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <Link href="/" className="btn btn-ghost btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          All categories
        </Link>
      </div>
    </div>
  );
}

function ToolCard({ tool, category }: { tool: import('@/lib/registry').Tool; category: ToolCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <Link href={`/tools/${tool.slug}`} className="tool-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className={`tool-card-icon cat-${category}`} style={{ width: 38, height: 38, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--bg-root)' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.75rem' }}>
            {tool.icon}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tool-card-name" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {tool.name}
            {tool.isNew && <span className="badge badge-new">New</span>}
          </div>
        </div>
      </div>
      <div className="tool-card-desc">{tool.description}</div>
      <div className="tool-card-tags">
        {tool.popular && <span className="tag tag-accent">★ Popular</span>}
        {tool.features?.includes('explain') && <span className="tag">Explain ✨</span>}
      </div>
    </Link>
  );
}
