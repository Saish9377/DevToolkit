import Link from 'next/link';
import { getPopularTools } from '@/lib/registry';

export const metadata = {
  title: '404 — Page Not Found | DevToolkit',
  description: 'The page you were looking for could not be found. Browse our free developer tools.',
};

export default function NotFound() {
  const popular = getPopularTools().slice(0, 6);

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '6rem',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1,
        marginBottom: '1rem',
      }}>
        404
      </div>

      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-bright)' }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 400, marginBottom: '2rem' }}>
        The tool or page you&apos;re looking for doesn&apos;t exist. Try one of our popular tools below.
      </p>

      <Link href="/" className="btn btn-primary" style={{ marginBottom: '3rem' }}>
        ← Back to all tools
      </Link>

      {popular.length > 0 && (
        <div style={{ width: '100%', maxWidth: 720 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Popular Tools
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.625rem' }}>
            {popular.map(tool => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="popular-chip"
                style={{ justifyContent: 'flex-start', borderRadius: 10 }}
              >
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>{tool.icon}</span>
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
