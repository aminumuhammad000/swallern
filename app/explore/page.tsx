import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { SurpriseMeButton, ContinueLearningSection, DiscoverExplorer } from '@/components/discovery';
import { getPublishedCategories, getExploreTopics } from '@/lib/content/topics';

interface ExplorePageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export async function generateMetadata({ searchParams }: ExplorePageProps): Promise<Metadata> {
  const params = await searchParams;
  const cat = params.category?.trim().toLowerCase();
  const query = params.q?.trim();

  if (query) {
    return {
      title: `Search "${query}" | Swallern Discover`,
      description: `Search results for "${query}" in Swallern's library of verified educational topics.`,
      robots: { index: false, follow: true },
    };
  }

  if (cat) {
    return {
      title: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Topics | Swallern`,
      description: `Browse verified educational topics in ${cat} on Swallern.`,
      alternates: { canonical: `/explore?category=${cat}` },
      robots: { index: true, follow: true },
    };
  }

  return {
    title: 'Discover & Explore Topics | Swallern',
    description:
      'Browse and search verified educational topics across Science, Technology, Space, Psychology, and more on Swallern.',
    alternates: { canonical: '/explore' },
    openGraph: {
      title: 'Discover Topics | Swallern',
      description: 'Browse and search verified educational topics across Science, Technology, Space, and more.',
      url: '/explore',
    },
    robots: { index: true, follow: true },
  };
}

async function ExploreContent({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const categoryParam = params.category?.trim().toLowerCase();
  const queryParam = params.q?.trim();

  const [categories, exploreData] = await Promise.all([
    getPublishedCategories(),
    getExploreTopics(categoryParam, queryParam),
  ]);

  const { topics, isUnknownCategory } = exploreData;
  const publishedSlugs = topics.map((t) => t.slug);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title & Header */}
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
            Discover Library
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            What are you curious to learn?
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
            Search or browse verified, bite-sized knowledge journeys across all domains.
          </p>
        </div>
        <SurpriseMeButton publishedSlugs={publishedSlugs} />
      </div>

      {/* Continue Learning strip if user has active topics */}
      <ContinueLearningSection />

      {/* Integrated Search Bar, Category Filters, and Topics Grid */}
      <DiscoverExplorer
        initialTopics={topics}
        categories={categories}
        activeCategorySlug={categoryParam}
        initialQuery={queryParam}
        isUnknownCategory={isUnknownCategory}
      />
    </div>
  );
}

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
      <Header />

      <main style={{ flex: 1, padding: 'var(--space-6) 0 var(--space-12) 0' }}>
        <Container size="default">
          <Suspense fallback={<div style={{ padding: '32px 0', textAlign: 'center', color: '#64748B' }}>Loading topic library...</div>}>
            <ExploreContent searchParams={searchParams} />
          </Suspense>
        </Container>
      </main>
    </div>
  );
}
