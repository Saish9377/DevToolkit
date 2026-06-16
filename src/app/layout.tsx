import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

const BASE_URL = 'https://devtoolkit.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'DevToolkit — Free Developer Tools. Format, Validate & Convert.',
    template: '%s | DevToolkit',
  },
  description: '37 free developer tools — JSON formatter, JWT decoder, regex tester, Base64 encoder, UUID generator, SQL formatter and more. 100% client-side, no sign-up, works offline.',
  keywords: [
    'developer tools', 'json formatter', 'jwt decoder', 'regex tester',
    'base64 encoder', 'uuid generator', 'sql formatter', 'yaml to json',
    'url encoder', 'hash generator', 'xml formatter', 'free online tools',
    'devtoolkit', 'developer productivity',
  ],
  authors: [{ name: 'DevToolkit' }],
  creator: 'DevToolkit',
  publisher: 'DevToolkit',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: 'DevToolkit — Free Developer Tools',
    description: '37 free developer tools. JSON formatter, JWT decoder, regex tester, and more. 100% private — your data never leaves the browser.',
    siteName: 'DevToolkit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DevToolkit — Free Developer Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevToolkit — Free Developer Tools',
    description: '37 free developer tools. 100% private, no sign-up, works offline.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: 'BC0ex51x72S_DzimDir1d_TOhFijacwPPfd-h7O4968',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1829307111613201"
          crossOrigin="anonymous"
        />
        {/* Site-wide JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'DevToolkit',
              url: BASE_URL,
              description: '37 free developer tools — JSON formatter, JWT decoder, regex tester, and more.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${BASE_URL}/tools/{search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
