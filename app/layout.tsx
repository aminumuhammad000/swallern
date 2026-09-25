import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const SITE_URL = 'https://swallern.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Swallern — Turn Curiosity Into Learning', template: '%s | Swallern' },
  description:
    'Swallern turns curiosity into structured learning. Discover and understand topics through concise, sourced, expert-reviewed explanations.',
  keywords: ['learning', 'education', 'science', 'curiosity', 'explanations'],
  authors: [{ name: 'Swallern' }],
  creator: 'Swallern',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: 'Swallern',
    title: 'Swallern — Turn Curiosity Into Learning',
    description: 'Discover and understand topics through concise, sourced explanations.',
    images: [{ url: '/swallern-logo.svg', width: 512, height: 512, alt: 'Swallern' }],
  },
  twitter: {
    card: 'summary',
    site: '@swallern',
    creator: '@swallern',
    title: 'Swallern — Turn Curiosity Into Learning',
    description: 'Discover and understand topics through concise, sourced explanations.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: { icon: '/swallern-icon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Swallern',
              url: 'https://swallern.com',
              description: 'Turn curiosity into learning.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://swallern.com/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
