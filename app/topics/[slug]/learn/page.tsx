import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { getPublishedTopicBySlug } from '@/lib/content/topics';
import { LearningClassroom } from '@/components/learning/LearningClassroom';

interface LearnPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ step?: string }>;
}

export async function generateMetadata({ params }: LearnPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getPublishedTopicBySlug(slug);

  if (!topic) {
    return {
      title: 'Topic Unavailable',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Learning: ${topic.title} — Swallern`,
    description: topic.summary,
    robots: { index: false, follow: true },
  };
}

export default async function LearnPage({ params, searchParams }: LearnPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const initialStep = sParams.step ? parseInt(sParams.step, 10) : 0;
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
                  We couldn’t find a published topic matching &ldquo;{slug}&rdquo;.
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

  return <LearningClassroom topic={topic} initialStep={initialStep} />;
}
