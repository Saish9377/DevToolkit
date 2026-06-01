import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS, getBlogPostBySlug } from '@/lib/blog';
import { TOOLS } from '@/lib/registry';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | DevToolkit Blog`,
    description: post.description,
    alternates: { canonical: `https://devtoolkit.app/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | DevToolkit Blog`,
      description: post.description,
      url: `https://devtoolkit.app/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      tags: post.tags,
    },
  };
}

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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  // Find related tool if any
  const relatedTool = post.toolSlug ? TOOLS.find(t => t.slug === post.toolSlug) : null;

  return (
    <div className="content-page animate-fade-in">
      <div className="blog-post-inner">
        <Link href="/blog" className="blog-back-link">
          ← Back to Blog
        </Link>

        <header className="blog-post-header">
          <div className="blog-post-meta">
            <span className="blog-cat-badge" style={{ color: CATEGORY_COLORS[post.category] }}>
              {post.category}
            </span>
            <span className="blog-reading-time">⏱ {post.readingTime} min read</span>
            <span className="blog-date">{formatDate(post.publishedAt)}</span>
          </div>
          <h1 className="blog-post-title">{post.title}</h1>
          <p className="blog-post-desc">{post.description}</p>
        </header>

        <article className="blog-post-article">
          {post.sections.map((section, idx) => {
            switch (section.type) {
              case 'p':
                return <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(section.content || '') }} />;
              case 'h2':
                return <h2 key={idx} id={slugify(section.content || '')}>{section.content}</h2>;
              case 'h3':
                return <h3 key={idx}>{section.content}</h3>;
              case 'ul':
                return (
                  <ul key={idx}>
                    {section.items?.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                    ))}
                  </ul>
                );
              case 'ol':
                return (
                  <ol key={idx}>
                    {section.items?.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                    ))}
                  </ol>
                );
              case 'code':
                return (
                  <div key={idx} className="blog-code-block-wrapper">
                    {section.language && (
                      <span className="blog-code-lang-label">{section.language.toUpperCase()}</span>
                    )}
                    <pre className="blog-code-block">
                      <code>{section.code}</code>
                    </pre>
                  </div>
                );
              case 'table':
                return (
                  <div key={idx} className="blog-table-wrapper">
                    <table className="blog-table">
                      <thead>
                        <tr>
                          {section.headers?.map((h, i) => <th key={i}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {section.rows?.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              case 'tip':
                return (
                  <div key={idx} className="blog-callout blog-callout-tip">
                    <div className="blog-callout-icon">💡</div>
                    <div className="blog-callout-content" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(section.content || '') }} />
                  </div>
                );
              case 'warning':
                return (
                  <div key={idx} className="blog-callout blog-callout-warning">
                    <div className="blog-callout-icon">⚠️</div>
                    <div className="blog-callout-content" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(section.content || '') }} />
                  </div>
                );
              case 'note':
                return (
                  <div key={idx} className="blog-callout blog-callout-note">
                    <div className="blog-callout-icon">ℹ️</div>
                    <div className="blog-callout-content" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(section.content || '') }} />
                  </div>
                );
              default:
                return null;
            }
          })}
        </article>

        {relatedTool && (
          <div className="blog-related-tool-cta">
            <h3>Try it in DevToolkit</h3>
            <p>We built a free, 100% client-side, privacy-first tool specifically for this task.</p>
            <Link href={`/tools/${relatedTool.slug}`} className="blog-cta-button">
              Open {relatedTool.name} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple slugifier for H2 headers
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Simple markdown inline compiler
function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
}
