import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { getSharedTopicByToken } from '@/lib/topics/userTopics';
import { TopicHeader } from '@/components/topic/TopicHeader';
import { QuickAnswer } from '@/components/topic/QuickAnswer';
import { KeyConcepts } from '@/components/topic/KeyConcepts';
import { ExplanationSection } from '@/components/topic/ExplanationSection';
import { LessonSection } from '@/components/topic/LessonSection';
import { QuizSection } from '@/components/topic/QuizSection';
import { MediaSection } from '@/components/topic/MediaSection';
import { SourceList } from '@/components/topic/SourceList';

interface SharedTopicPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: SharedTopicPageProps): Promise<Metadata> {
  const { token } = await params;
  const topic = await getSharedTopicByToken(token);

  if (!topic) {
    return {
      title: 'Private Topic Unavailable',
      description: 'The requested private link is invalid or has been revoked.',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${topic.title} (Private Shared Topic)`,
    description: topic.summary,
    robots: { index: false, follow: false }, // Prevent search engine indexing of private share links
  };
}

export default async function SharedTopicPage({ params }: SharedTopicPageProps) {
  const { token } = await params;
  const topic = await getSharedTopicByToken(token);

  if (!topic) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
        <Header />
        <main style={{ flex: 1, padding: 'var(--space-12) 0' }}>
          <Container size="narrow">
            <Card className="glass-card" style={{ padding: 'var(--space-6)' }}>
              <CardHeader>
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <Badge variant="warning">Link Revoked or Invalid</Badge>
                </div>
                <CardTitle as="h1">Private Topic Unavailable</CardTitle>
                <CardDescription>
                  This shared link is invalid, unapproved, or has been revoked by the owner.
                </CardDescription>
              </CardHeader>
              <CardContent style={{ gap: 'var(--space-6)' }}>
                <p style={{ color: 'var(--color-neutral-slate)' }}>
                  If you received this link from a creator, ask them to generate a new share link from their dashboard.
                </p>
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <Link href="/explore" style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" size="sm">
                      ← Browse Public Topic Library
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

      <main style={{ flex: 1, padding: 'var(--space-8) 0' }}>
        <Container size="narrow">
          {/* Top Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', backgroundColor: '#EEF2FF', border: '1.5px solid #C7D2FE', padding: '12px 18px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4338CA', fontWeight: 700, fontSize: '0.88rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Private Shared Topic — Visible via direct link only</span>
            </div>

            <Link
              href="/explore"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#4F46E5',
                textDecoration: 'none',
              }}
            >
              ← Explore Library
            </Link>
          </div>

          {/* 1. Header */}
          <TopicHeader topic={topic as any} />

          {/* 2. Quick Answer */}
          <QuickAnswer answer={topic.quick_answer} />

          {/* 3. Main Explanation */}
          <ExplanationSection explanation={topic.explanation} />

          {/* 4. Key Concepts */}
          <KeyConcepts concepts={topic.key_concepts} />

          {/* 5. Interactive Progressive Lesson */}
          {topic.has_lesson && <LessonSection lesson={topic.lesson} />}

          {/* 6. Knowledge Check Quiz */}
          {topic.has_quiz && <QuizSection quiz={topic.quiz} />}

          {/* 7. Media */}
          {topic.media && topic.media.length > 0 && <MediaSection media={topic.media} />}

          {/* 8. Sources */}
          {topic.sources && topic.sources.length > 0 && <SourceList sources={topic.sources} />}
        </Container>
      </main>

    </div>
  );
}
