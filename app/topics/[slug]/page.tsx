import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { getPublishedTopicBySlug } from '@/lib/content/topics';
import { CourseJourney } from '@/components/journey/CourseJourney';
import { SaveTopicButton } from '@/components/topic/SaveTopicButton';
import { SourceList } from '@/components/topic/SourceList';
import { MediaSection } from '@/components/topic/MediaSection';
import { RelatedTopics } from '@/components/topic/RelatedTopics';
import { TopicTracker } from '@/components/topic/TopicTracker';
import { TopicJsonLd } from '@/components/topic/TopicJsonLd';

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getPublishedTopicBySlug(slug);

  if (!topic) {
    return {
      title: 'Topic Unavailable',
      description: 'The requested educational topic is currently unavailable on Swallern.',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${topic.title} — Course Journey | Swallern`,
    description: topic.summary,
    alternates: {
      canonical: `/topics/${topic.slug}`,
    },
    openGraph: {
      title: topic.title,
      description: topic.summary,
      url: `https://swallern.com/topics/${topic.slug}`,
      type: 'article',
      siteName: 'Swallern',
    },
    twitter: {
      card: 'summary',
      title: topic.title,
      description: topic.summary,
    },
    robots: { index: true, follow: true },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = await getPublishedTopicBySlug(slug);

  if (!topic) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
        <Header />
        <main style={{ flex: 1, padding: 'var(--space-12) 0' }}>
          <Container size="narrow">
            <Card className="glass-card" style={{ padding: 'var(--space-6)' }}>
              <CardHeader>
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <Badge variant="warning">Topic Unavailable</Badge>
                </div>
                <CardTitle as="h1">Topic Not Found</CardTitle>
                <CardDescription>
                  We couldn&apos;t find a published topic matching &ldquo;{slug}&rdquo;.
                </CardDescription>
              </CardHeader>
              <CardContent style={{ gap: 'var(--space-6)' }}>
                <p style={{ color: 'var(--color-neutral-slate)' }}>
                  Try searching for another topic or question below:
                </p>
                <SearchBar placeholder="What do you want to understand?" />
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <Link href="/search" style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" size="sm">
                      ← Go to Search
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Container>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
      <Header />

      <main style={{ flex: 1, padding: 'var(--space-6) 0 var(--space-12) 0' }}>
        <Container size="narrow">
          {/* Session tracker & structured data (silent server-side) */}
          {topic.id && <TopicTracker topicId={topic.id} />}
          <TopicJsonLd topic={topic} />

          {/* Breadcrumb + save */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <nav aria-label="Breadcrumb">
              <Link
                href="/explore"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#4F46E5',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ← Back to Topic Library
              </Link>
            </nav>
            {topic.id && <SaveTopicButton topicId={topic.id} topicSlug={topic.slug} />}
          </div>

          {/* ─── COURSE JOURNEY — main experience ─── */}
          <CourseJourney topic={topic} />

          {/* ─── Supporting content ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <SourceList sources={topic.sources} />
            <MediaSection media={topic.media} />
            <RelatedTopics topics={topic.related_topics} />
          </div>
        </Container>
      </main>
    </div>
  );
}
