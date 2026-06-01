import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS, ALL_BLOG_CATEGORIES } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — Developer Guides & Tutorials | DevToolkit',
  description: 'In-depth articles on JSON, XML, Base64, JWT, SQL, Regex, and more. Practical developer guides with real examples.',
  alternates: { canonical: 'https://devtoolkit.app/blog' },
  openGraph: {
    title: 'Blog — Developer Guides & Tutorials | DevToolkit',
    description: 'In-depth articles on JSON, XML, Base64, JWT, SQL, Regex, and more.',
    url: 'https://devtoolkit.app/blog',
    type: 'website',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  JSON: '#818cf8',
  Encoding: '#34d399',
  Security: '#f87171',
  SQL: '#a78bfa',
  Utilities: '#94a3b8',
  YAML: '#4ade80',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);

  return (
    <div className="content-page animate-fade-in">
      <div className="blog-inner">

        {/* Header */}
        <div className="blog-header">
          <div className="section-label">
            <span>✍</span>
            Blog
          </div>
          <h1 className="content-page-title">
            Developer Guides &amp; <span className="gradient-text">Tutorials</span>
          </h1>
          <p className="content-page-subtitle">
            Practical articles on data formats, security, and developer tools. Written for developers, by developers.
          </p>
        </div>

        {/* Featured Post */}
        <Link href={`/blog/${featured.slug}`} className="blog-featured-card">
          <div className="blog-featured-meta">
            <span className="blog-cat-badge" style={{ color: CATEGORY_COLORS[featured.category] }}>
              {featured.category}
            </span>
            <span className="blog-reading-time">⏱ {featured.readingTime} min read</span>
            <span className="blog-date">{formatDate(featured.publishedAt)}</span>
          </div>
          <h2 className="blog-featured-title">{featured.title}</h2>
          <p className="blog-featured-desc">{featured.description}</p>
          <div className="blog-tags">
            {featured.tags.slice(0, 4).map(tag => (
              <span key={tag} className="blog-tag">#{tag}</span>
            ))}
          </div>
          <span className="blog-read-more">Read article →</span>
        </Link>

        {/* Category Filter row */}
        <div className="blog-cats">
          <span className="blog-cats-label">Browse by topic:</span>
          {ALL_BLOG_CATEGORIES.map(cat => (
            <span key={cat} className="blog-cat-chip" style={{ color: CATEGORY_COLORS[cat], borderColor: `${CATEGORY_COLORS[cat]}33` }}>
              {cat}
            </span>
          ))}
        </div>

        {/* Post Grid */}
        <div className="blog-grid">
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
              <div className="blog-card-meta">
                <span className="blog-cat-badge" style={{ color: CATEGORY_COLORS[post.category] }}>
                  {post.category}
                </span>
                <span className="blog-reading-time">⏱ {post.readingTime} min</span>
              </div>
              <h3 className="blog-card-title">{post.title}</h3>
              <p className="blog-card-desc">{post.description}</p>
              <div className="blog-card-footer">
                <span className="blog-date">{formatDate(post.publishedAt)}</span>
                <span className="blog-read-more-sm">Read →</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
