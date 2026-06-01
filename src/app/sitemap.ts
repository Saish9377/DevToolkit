import type { MetadataRoute } from 'next';
import { TOOLS, CATEGORY_META } from '@/lib/registry';

const BASE_URL = 'https://devtoolkit.app'; // Update this to your actual domain

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Home page
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = (Object.keys(CATEGORY_META) as Array<keyof typeof CATEGORY_META>).map(cat => ({
    url: `${BASE_URL}/tools/category/${cat}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Individual tool pages
  const toolPages: MetadataRoute.Sitemap = TOOLS.map(tool => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: tool.popular ? 0.9 : 0.7,
  }));

  return [...staticPages, ...categoryPages, ...toolPages];
}
