import { TopicContract } from '@/lib/content/contract';

const SITE_URL = 'https://swallern.com';

export function TopicJsonLd({ topic }: { topic: TopicContract }) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: topic.title,
    description: topic.summary,
    url: `${SITE_URL}/topics/${topic.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Swallern',
      url: SITE_URL,
    },
    ...(topic.last_reviewed_at && { dateModified: topic.last_reviewed_at }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Explore', item: `${SITE_URL}/explore` },
      {
        '@type': 'ListItem',
        position: 3,
        name: topic.category?.name ?? 'Topics',
        item: topic.category?.slug
          ? `${SITE_URL}/explore?category=${topic.category.slug}`
          : `${SITE_URL}/explore`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: topic.title,
        item: `${SITE_URL}/topics/${topic.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
