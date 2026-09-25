'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Container, Button } from '@/components/ui';
import { TopicCard } from '@/components/ui/TopicCard';
import { getCompletedTopics, TopicProgressState } from '@/lib/learning/progress';

export default function CompletedCoursesPage() {
  const [completedTopics, setCompletedTopics] = useState<TopicProgressState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list = getCompletedTopics();
    setCompletedTopics(list);
    setLoading(false);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
      <Header />

      <main style={{ flex: 1, padding: 'var(--space-6) 0 var(--space-12) 0' }}>
        <Container size="default">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px',
                  }}
                >
                  Your Learning Archive
                </div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  Completed Courses ({completedTopics.length})
                </h1>
                <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
                  Every course you have completed is safely archived here so your Discovery page stays clean and focused on new topics.
                </p>
              </div>

              <Link href="/explore" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="md">
                  Discover New Topics &rarr;
                </Button>
              </Link>
            </div>

            {/* List */}
            {loading ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: '#64748B' }}>
                Loading your completed courses...
              </div>
            ) : completedTopics.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '20px',
                }}
              >
                {completedTopics.map((topic) => (
                  <TopicCard
                    key={topic.slug}
                    slug={topic.slug}
                    title={topic.title}
                    summary={topic.summary || 'A completed bite-sized learning journey.'}
                    category={topic.category || 'General'}
                    estimatedMinutes={topic.estimatedMinutes || 5}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                  No completed courses yet
                </h3>

                <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
                  Once you finish a course in the Classroom, it will be automatically cataloged here and hidden from your Discovery page so you can explore new things to learn.
                </p>

                <Link href="/explore" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="sm">
                    Explore Library &rarr;
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
