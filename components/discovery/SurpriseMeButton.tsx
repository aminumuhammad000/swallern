'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface SurpriseMeButtonProps {
  publishedSlugs?: string[];
  className?: string;
}

const DEFAULT_SLUGS = [
  'why-is-the-sky-blue',
  'how-does-the-internet-work',
  'fat-bear-week-voting',
  'quantum-computing-explained',
  'hawking-radiation-black-holes',
  'neuroscience-of-memory',
];

export const SurpriseMeButton: React.FC<SurpriseMeButtonProps> = ({
  publishedSlugs = DEFAULT_SLUGS,
  className = '',
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSurprise = () => {
    setLoading(true);
    const pool = publishedSlugs.length > 0 ? publishedSlugs : DEFAULT_SLUGS;
    const randomSlug = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/topics/${randomSlug}`);
  };

  return (
    <Button
      variant="secondary"
      size="md"
      onClick={handleSurprise}
      disabled={loading}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        border: '1px solid #C7D2FE',
        backgroundColor: '#F5F3FF',
        color: '#4F46E5',
        fontWeight: 600,
        height: '38px',
        padding: '0 16px',
        borderRadius: '20px',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
      <span>{loading ? 'Finding topic...' : 'Surprise me'}</span>
    </Button>
  );
};
