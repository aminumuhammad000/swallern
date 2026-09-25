'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopicCard } from '@/components/ui/TopicCard';
import { Button } from '@/components/ui/Button';
import { SurpriseMeButton } from '@/components/discovery/SurpriseMeButton';
import { ContinueLearningSection } from '@/components/discovery/ContinueLearningSection';
import { TopicSearchResult } from '@/lib/content/topics';

export interface RealtimeSearchPageProps {
  initialTopics: TopicSearchResult[];
  initialQuery?: string;
}

const DEFAULT_POPULAR_QUERIES = [
  'Why is the sky blue?',
  'Fat Bear Week',
  'Quantum Computing',
  'Black Holes',
  'Neuroscience of Memory',
  'How does the internet work?',
];

function getMatchScore(topic: TopicSearchResult, rawQuery: string): number {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return 1;

  const titleLower = topic.title.toLowerCase();
  const summaryLower = topic.summary.toLowerCase();
  const catLower = topic.category.name.toLowerCase();
  const slugLower = topic.slug.toLowerCase();

  // 1. Exact title match
  if (titleLower === q) return 1000;

  // 2. Title starts with query (e.g. typing "why" -> "Why is the sky blue?")
  if (titleLower.startsWith(q)) return 800;

  // 3. Any word in the title starts with query (e.g. typing "bea" -> "Fat Bear Week")
  const words = titleLower.split(/[\s\-–—/]+/);
  if (words.some((w) => w.startsWith(q))) return 600;

  // 4. Title contains query anywhere
  if (titleLower.includes(q)) return 400;

  // 5. Category starts with query
  if (catLower.startsWith(q)) return 300;

  // 6. Category contains query
  if (catLower.includes(q)) return 200;

  // 7. Slug contains query
  if (slugLower.includes(q)) return 150;

  // 8. Summary contains query
  if (summaryLower.includes(q)) return 100;

  return 0;
}

export const RealtimeSearchPage: React.FC<RealtimeSearchPageProps> = ({
  initialTopics,
  initialQuery = '',
}) => {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

  // Sync URL when query changes (debounced)
  const syncUrl = (newQuery: string) => {
    const trimmed = newQuery.trim();
    startTransition(() => {
      if (trimmed) {
        router.replace(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
      } else {
        router.replace('/search', { scroll: false });
      }
    });
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    syncUrl(val);
  };

  const handleClear = () => {
    setQuery('');
    syncUrl('');
  };

  // Rank and filter topics in real time
  const matchingTopics = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return initialTopics;
    }

    const scored = initialTopics
      .map((topic) => ({
        topic,
        score: getMatchScore(topic, trimmed),
      }))
      .filter((item) => item.score > 0);

    // Sort descending by relevance score
    scored.sort((a, b) => b.score - a.score);

    return scored.map((item) => item.topic);
  }, [initialTopics, query]);

  // Dynamic real-time suggestions based on current query
  const suggestions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return DEFAULT_POPULAR_QUERIES;
    }
    // Return top matching topic titles as live suggestions
    return matchingTopics.slice(0, 5).map((t) => t.title);
  }, [query, matchingTopics]);

  const publishedSlugs = useMemo(() => matchingTopics.map((t) => t.slug), [matchingTopics]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search Header */}
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
          Search
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.4rem, 2.8vw, 1.875rem)',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            What do you want to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              understand?
            </span>
          </h1>

          <SurpriseMeButton publishedSlugs={publishedSlugs.length > 0 ? publishedSlugs : undefined} />
        </div>

        {/* Real-time Search Input Box */}
        <div style={{ maxWidth: '680px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: isFocused ? '1px solid #4F46E5' : '1px solid #CBD5E1',
              boxShadow: isFocused
                ? '0 0 0 3px rgba(99, 102, 241, 0.15), 0 4px 12px rgba(15, 23, 42, 0.05)'
                : '0 1px 4px rgba(15, 23, 42, 0.04)',
              borderRadius: '24px',
              padding: '4px 8px 4px 16px',
              height: '48px',
              transition: 'all 0.15s ease',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isFocused ? '#4F46E5' : '#64748B'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '10px', flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search topics, questions, or ideas (e.g. why, bea, black holes)..."
              aria-label="Real-time topic search"
              autoFocus
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.9375rem',
                color: '#0F172A',
                background: 'transparent',
              }}
            />

            {query.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                style={{
                  border: 'none',
                  background: '#F1F5F9',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  marginRight: '6px',
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Real-time Dynamic Suggestions Chips */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginTop: '12px',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: '#94A3B8',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {query.trim() ? 'Matching topics:' : 'Try searching:'}
            </span>

            {suggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleQueryChange(sug)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#4F46E5';
                  (e.currentTarget as HTMLElement).style.color = '#4F46E5';
                  (e.currentTarget as HTMLElement).style.background = '#EEF2FF';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
                  (e.currentTarget as HTMLElement).style.color = '#475569';
                  (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                }}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Result Meta Status */}
        <div style={{ marginTop: '16px' }}>
          {query.trim() ? (
            <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>
              Found <strong style={{ color: '#0F172A' }}>{matchingTopics.length}</strong> topic
              {matchingTopics.length === 1 ? '' : 's'} matching{' '}
              <strong style={{ color: '#4F46E5' }}>&ldquo;{query}&rdquo;</strong>
            </p>
          ) : (
            <p style={{ color: '#64748B', fontSize: '0.84375rem', margin: 0 }}>
              Search across Swallern&apos;s library of verified explanations, structured research, and interactive lessons.
            </p>
          )}
        </div>
      </div>

      {/* Continue Learning Strip */}
      <ContinueLearningSection />

      {/* Matching Topics Grid */}
      {matchingTopics.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px',
          }}
        >
          {matchingTopics.map((topic) => (
            <TopicCard
              key={topic.slug}
              slug={topic.slug}
              title={topic.title}
              summary={topic.summary}
              category={topic.category.name}
              difficulty={topic.difficulty}
              estimatedMinutes={5}
            />
          ))}
        </div>
      ) : (
        /* Empty Results State */
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
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
            No topics found for &ldquo;{query}&rdquo;
          </h3>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#64748B',
              maxWidth: '440px',
              margin: '0 auto 20px auto',
              lineHeight: 1.6,
            }}
          >
            We couldn&apos;t find any published topics matching your search. Try checking your spelling or explore one
            of our popular topics below.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" onClick={handleClear}>
              Clear Search
            </Button>
            <Link href="/explore" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm">
                Browse Full Library
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
