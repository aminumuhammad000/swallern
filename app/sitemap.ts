import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const SITE_URL = 'https://swallern.com';

const staticPages: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: `${SITE_URL}/explore`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/search`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/trending`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.8,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createAdminClient();
    const { data: topics, error } = await supabase
      .from('topics')
      .select('slug, updated_at')
      .in('status', ['PUBLISHED', 'UPDATED']);

    if (error) {
      console.error('[sitemap] DB error, returning static pages only:', error.message);
      return staticPages;
    }

    const topicPages: MetadataRoute.Sitemap = (topics ?? []).map((topic) => ({
      url: `${SITE_URL}/topics/${topic.slug}`,
      lastModified: topic.updated_at ? new Date(topic.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...topicPages];
  } catch (err) {
    console.error('[sitemap] Unexpected error, returning static pages only:', err);
    return staticPages;
  }
}
