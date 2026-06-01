import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getToolBySlug, TOOLS, CATEGORY_META } from '@/lib/registry';
import ToolPageClient from '@/components/pages/ToolPageClient';

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE_URL = 'https://devtoolkit.app';

export async function generateStaticParams() {
  return TOOLS.map(tool => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: 'Tool Not Found' };

  const catMeta = CATEGORY_META[tool.category];
  const title = `${tool.name} — Free Online Tool`;
  const description = `${tool.description} Free, fast, and 100% private — your data never leaves your browser. No sign-up required.`;
  const url = `${BASE_URL}/tools/${tool.slug}`;

  return {
    title,
    description,
    keywords: [
      ...tool.tags,
      ...(tool.altKeywords || []),
      'free online tool',
      'devtoolkit',
      catMeta.label.toLowerCase(),
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'DevToolkit',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const catMeta = CATEGORY_META[tool.category];
  const url = `${BASE_URL}/tools/${tool.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    keywords: [...tool.tags, ...(tool.altKeywords || [])].join(', '),
    applicationSubCategory: catMeta.label,
    browserRequirements: 'Requires JavaScript',
    creator: {
      '@type': 'Organization',
      name: 'DevToolkit',
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolPageClient tool={tool} />
    </>
  );
}
