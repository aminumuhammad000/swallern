'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchPublishedTopics, TopicSearchResult } from '@/lib/content/topics';

export interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  placeholder = 'What are you curious about?',
  className = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState<TopicSearchResult[]>([]);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Synchronize initial query
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Debounced search preview
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setPreviewResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { results } = await searchPublishedTopics(trimmed);
        setPreviewResults(results.slice(0, 5));
      } catch {
        setPreviewResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    setIsFocused(false);
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }} className={className}>
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Global topic search"
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#FFFFFF',
          border: isFocused ? '1px solid #4F46E5' : '1px solid #CBD5E1',
          boxShadow: isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: '24px',
          padding: '4px 6px 4px 16px',
          height: '44px',
          transition: 'all 0.15s ease',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isFocused ? '#4F46E5' : '#64748B'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: '10px', flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          aria-label="Search topics, subjects, or ideas..."
          autoComplete="off"
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
            onClick={() => {
              setQuery('');
              setPreviewResults([]);
            }}
            aria-label="Clear search"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            ✕
          </button>
        )}

        <button
          type="submit"
          style={{
            border: 'none',
            background: '#4F46E5',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.84375rem',
            padding: '0 16px',
            height: '34px',
            borderRadius: '18px',
            cursor: 'pointer',
            marginLeft: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338CA')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4F46E5')}
        >
          Search
        </button>
      </form>

      {/* Live Results Preview Dropdown */}
      {isFocused && query.trim().length >= 1 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {isLoading && (
            <div style={{ padding: '12px 16px', fontSize: '0.84375rem', color: '#64748B' }}>
              Searching published topics...
            </div>
          )}

          {!isLoading && previewResults.length > 0 && (
            <div style={{ padding: '6px 0' }}>
              <div
                style={{
                  padding: '6px 16px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Topics Found
              </div>
              {previewResults.map((item) => (
                <Link
                  key={item.slug}
                  href={`/topics/${item.slug}`}
                  onClick={() => setIsFocused(false)}
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    textDecoration: 'none',
                    borderBottom: '1px solid #F8FAFC',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{item.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span style={{ color: '#4F46E5', fontWeight: 500 }}>{item.category.name}</span>
                    <span>• {item.summary.slice(0, 60)}...</span>
                  </div>
                </Link>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsFocused(false)}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '10px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#4F46E5',
                  background: '#F5F3FF',
                  textDecoration: 'none',
                }}
              >
                See all results for &ldquo;{query.trim()}&rdquo; →
              </Link>
            </div>
          )}

          {!isLoading && previewResults.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                No published topics found matching &ldquo;{query}&rdquo;
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsFocused(false)}
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#4F46E5',
                  textDecoration: 'none',
                }}
              >
                Search all topics →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
