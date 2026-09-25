'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopicCard } from '@/components/ui/TopicCard';
import { Button } from '@/components/ui/Button';
import { TopicSearchResult, CategoryInfo } from '@/lib/content/topics';
import { fetchUserCompletedTopicSlugs } from '@/lib/learning/progress';

interface DiscoverExplorerProps {
  initialTopics: TopicSearchResult[];
  categories: CategoryInfo[];
  activeCategorySlug?: string;
  initialQuery?: string;
  isUnknownCategory?: boolean;
}

const POPULAR_SUGGESTIONS = [
  'Why is the sky blue?',
  'Black Holes',
  'Internet',
  'Quantum Computing',
  'Neuroscience',
  'Fat Bear Week',
];

export const DiscoverExplorer: React.FC<DiscoverExplorerProps> = ({
  initialTopics,
  categories,
  activeCategorySlug = '',
  initialQuery = '',
  isUnknownCategory = false,
}) => {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(activeCategorySlug);
  const [isFocused, setIsFocused] = useState(false);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [isRemembered, setIsRemembered] = useState(false);

  // Check if we can remember the user session (via local storage or Supabase account)
  React.useEffect(() => {
    fetchUserCompletedTopicSlugs().then((slugs) => {
      if (slugs && slugs.length > 0) {
        setCompletedSlugs(slugs);
        setIsRemembered(true);
      }
    });
  }, []);

  // Sync URL when query or category changes (debounced)
  const syncUrl = (newQuery: string, newCat: string) => {
    const params = new URLSearchParams();
    if (newCat) params.set('category', newCat);
    if (newQuery.trim()) params.set('q', newQuery.trim());
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/explore?${qs}` : '/explore', { scroll: false });
    });
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    syncUrl(val, selectedCategory);
  };

  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategory(catSlug);
    syncUrl(query, catSlug);
  };

  const handleClearSearch = () => {
    setQuery('');
    syncUrl('', selectedCategory);
  };

  const handleResetAll = () => {
    setQuery('');
    setSelectedCategory('');
    syncUrl('', '');
  };

  // Client-side filtering across the loaded topic catalog
  const filteredTopics = useMemo(() => {
    return initialTopics.filter((topic) => {
      // RULE: If user is remembered, courses already finished MUST NOT show in discovery page
      if (isRemembered && completedSlugs.includes(topic.slug)) {
        return false;
      }

      // Category check
      if (selectedCategory && topic.category.slug.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search query check
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery) return true;

      const titleMatch = topic.title.toLowerCase().includes(trimmedQuery);
      const summaryMatch = topic.summary.toLowerCase().includes(trimmedQuery);
      const catMatch = topic.category.name.toLowerCase().includes(trimmedQuery);
      const slugMatch = topic.slug.toLowerCase().includes(trimmedQuery);

      return titleMatch || summaryMatch || catMatch || slugMatch;
    });
  }, [initialTopics, selectedCategory, query, isRemembered, completedSlugs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search Input Bar */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: isFocused ? '1px solid #4F46E5' : '1px solid #E2E8F0',
          boxShadow: isFocused
            ? '0 0 0 3px rgba(99, 102, 241, 0.15), 0 4px 12px rgba(15, 23, 42, 0.05)'
            : '0 2px 8px rgba(15, 23, 42, 0.03)',
          padding: '6px 8px 6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'all 200ms ease',
        }}
      >
        <div style={{ color: isFocused ? '#4F46E5' : '#94A3B8', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search topics, questions, or ideas (e.g. quantum, black holes, internet)..."
          aria-label="Search topics in Discover"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.9375rem',
            color: '#0F172A',
            background: 'transparent',
            padding: '8px 0',
          }}
        />

        {query && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Clear search query"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Popular Suggestions */}
      {!query && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '-12px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Popular:
          </span>
          {POPULAR_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => handleQueryChange(sug)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1';
                (e.currentTarget as HTMLElement).style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
                (e.currentTarget as HTMLElement).style.color = '#475569';
              }}
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Category Filter Pills Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Knowledge Domains
          </h2>
          {(query || selectedCategory) && (
            <button
              type="button"
              onClick={handleResetAll}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '0.75rem',
                color: '#6366F1',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Reset filters
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Button
            variant={!selectedCategory ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleCategorySelect('')}
            style={
              selectedCategory
                ? { border: '1px solid #CBD5E1', height: '34px', padding: '0 14px', borderRadius: '18px' }
                : { height: '34px', padding: '0 14px', borderRadius: '18px' }
            }
          >
            All Topics
          </Button>

          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
            return (
              <Button
                key={cat.slug}
                variant={isActive ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleCategorySelect(cat.slug)}
                style={
                  !isActive
                    ? { border: '1px solid #CBD5E1', height: '34px', padding: '0 14px', borderRadius: '18px' }
                    : { height: '34px', padding: '0 14px', borderRadius: '18px' }
                }
              >
                {cat.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Unknown Category Alert */}
      {isUnknownCategory && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #FDE68A',
            background: '#FFFBEB',
            color: '#92400E',
            fontSize: '0.875rem',
          }}
        >
          <strong>Category not found:</strong> The requested category does not exist. Displaying all available topics instead.
        </div>
      )}

      {/* Completed Courses Notification Banner for Remembered Users */}
      {isRemembered && completedSlugs.length > 0 && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '0.84375rem',
            color: '#166534',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#22C55E',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              ✓
            </span>
            <span>
              Hiding <strong>{completedSlugs.length} finished course{completedSlugs.length === 1 ? '' : 's'}</strong> to keep your discovery feed fresh.
            </span>
          </div>

          <Link
            href="/dashboard?tab=completed"
            style={{
              color: '#15803D',
              fontWeight: 700,
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            View finished courses &rarr;
          </Link>
        </div>
      )}

      {/* Results Header / Summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '0.84375rem', color: '#64748B', fontWeight: 600 }}>
          {query ? (
            <>
              Found {filteredTopics.length} topic{filteredTopics.length === 1 ? '' : 's'} matching{' '}
              <strong style={{ color: '#0F172A' }}>&ldquo;{query}&rdquo;</strong>
              {selectedCategory && ` in ${categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}`}
            </>
          ) : (
            <>
              Showing {filteredTopics.length} new topic{filteredTopics.length === 1 ? '' : 's'} to explore
              {selectedCategory && ` in ${categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}`}
            </>
          )}
        </span>

        {query && (
          <button
            type="button"
            onClick={handleClearSearch}
            style={{
              background: '#EEF2FF',
              border: '1px solid #E0E7FF',
              borderRadius: '12px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              color: '#4F46E5',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Clear search &times;
          </button>
        )}
      </div>

      {/* Topics Grid */}
      {filteredTopics.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredTopics.map((topic) => (
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
        /* Empty Search or All-Completed State */
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
              background: isRemembered && completedSlugs.length > 0 && !query ? '#ECFDF5' : '#F1F5F9',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isRemembered && completedSlugs.length > 0 && !query ? '#10B981' : '#64748B',
              marginBottom: '16px',
            }}
          >
            {isRemembered && completedSlugs.length > 0 && !query ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
            {isRemembered && completedSlugs.length > 0 && !query
              ? 'All topics in this view completed!'
              : 'No topics found'}
          </h3>

          <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
            {query
              ? `We couldn't find any uncompleted topics matching "${query}". Try searching with different keywords or clear your search to browse all topics.`
              : isRemembered && completedSlugs.length > 0
              ? 'Great job! You have finished all available courses in this domain. You can review them anytime in your completed courses page.'
              : 'No topics are currently available in this category.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {query && (
              <Button variant="secondary" size="sm" onClick={handleClearSearch}>
                Clear Search
              </Button>
            )}
            {selectedCategory && (
              <Button variant="secondary" size="sm" onClick={handleResetAll}>
                View All Categories
              </Button>
            )}
            {isRemembered && completedSlugs.length > 0 && (
              <Link href="/dashboard?tab=completed" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm">
                  View Completed Courses
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
