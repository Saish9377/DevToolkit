import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://devtoolkit.app'; // Update to your actual domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
