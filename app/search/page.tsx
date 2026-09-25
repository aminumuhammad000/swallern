import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { RealtimeSearchPage } from '@/components/search/RealtimeSearchPage';
import { getExploreTopics } from '@/lib/content/topics';

export const metadata: Metadata = {
  title: 'Search Topics | Swallern',
  description: "Search Swallern's library of verified educational topics in real time.",
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchResultsContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = params.q || '';
  const query = rawQuery.trim();

  // Load all available published topics so the client can search and filter in real-time
  const { topics } = await getExploreTopics();

  return <RealtimeSearchPage initialTopics={topics} initialQuery={query} />;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
      <Header />

      <main style={{ flex: 1, padding: 'var(--space-6) 0 var(--space-12) 0' }}>
        <Container size="default">
          <Suspense fallback={<div style={{ padding: '32px 0', textAlign: 'center', color: '#64748B' }}>Loading search...</div>}>
            <SearchResultsContent searchParams={searchParams} />
          </Suspense>
        </Container>
      </main>
    </div>
  );
}
