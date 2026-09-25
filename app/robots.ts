import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/account/',
        '/login',
        '/register',
        '/api/',
        '/design-system',
      ],
    },
    sitemap: 'https://swallern.com/sitemap.xml',
  };
}
