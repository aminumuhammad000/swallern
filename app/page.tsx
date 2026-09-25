import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Container, Badge, TopicCard } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchBar } from '@/components/search/SearchBar';
import { SurpriseMeButton } from '@/components/discovery/SurpriseMeButton';
import { ContinueLearningSection } from '@/components/discovery/ContinueLearningSection';
import { InteractiveHeroPreview } from '@/components/landing/InteractiveHeroPreview';
import { LandingScrollStory } from '@/components/landing/LandingScrollStory';
import { getPublishedCategories } from '@/lib/content/topics';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Swallern | Turn Curiosity Into Knowledge',
  description:
    'Swallern is a bite-sized learning platform. Choose whatever you are curious about, and Swallern turns it into a structured, visual learning journey.',
  alternates: { canonical: 'https://swallern.com' },
  openGraph: {
    type: 'website',
    title: 'Swallern | Turn Curiosity Into Knowledge',
    description:
      'Discover and understand interesting topics through structured bite-sized lessons, interactive visual checks, and evidence-backed research.',
    images: [{ url: '/swallern-logo.svg', width: 512, height: 512, alt: 'Swallern' }],
  },
};

const SUGGESTED_IDEAS = [
  'Why is the sky blue?',
  'How does the internet work?',
  'Fat Bear Week',
  'Quantum Computing',
  'Black Holes',
  'Human Memory',
];

export default async function LandingPage() {
  const categories = await getPublishedCategories();

  let topics: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    category: string;
    estimatedMinutes?: number;
  }> = [];
  let publishedSlugs: string[] = [];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('topics')
      .select('id, slug, title, summary, category_id')
      .in('status', ['PUBLISHED', 'UPDATED'])
      .limit(6);

    if (data && data.length > 0) {
      publishedSlugs = data.map((t) => t.slug);
      topics = data.map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        summary: t.summary || 'A structured bite-sized explanation.',
        category: 'Science',
        estimatedMinutes: 4,
      }));
    }
  } catch {
    // Fallback
  }

  if (topics.length < 3) {
    publishedSlugs = [
      'why-is-the-sky-blue',
      'how-does-the-internet-work',
      'fat-bear-week-voting',
      'quantum-computing-explained',
      'black-hole-physics',
      'neuroscience-of-memory',
    ];
    topics = [
      {
        id: '1',
        slug: 'why-is-the-sky-blue',
        title: 'Why is the sky blue?',
        summary: 'Sunlight scatters through atmospheric gases via Rayleigh scattering, dispersing shorter blue wavelengths.',
        category: 'Physics',
        estimatedMinutes: 3,
      },
      {
        id: '2',
        slug: 'how-does-the-internet-work',
        title: 'How does the internet work?',
        summary: 'Packet switching, IP addressing, and global fiber optic routing using TCP/IP protocols.',
        category: 'Technology',
        estimatedMinutes: 5,
      },
      {
        id: '3',
        slug: 'fat-bear-week-voting',
        title: 'Fat Bear Week & Ecosystem Ecology',
        summary: 'How Katmai brown bears undergo hyperphagia to survive winter hibernation.',
        category: 'Nature',
        estimatedMinutes: 4,
      },
      {
        id: '4',
        slug: 'quantum-computing-explained',
        title: 'Quantum Computing Fundamentals',
        summary: 'Understanding qubits, superposition, and quantum entanglement in modern physics.',
        category: 'Computer Science',
        estimatedMinutes: 6,
      },
      {
        id: '5',
        slug: 'black-hole-physics',
        title: 'How Black Holes Form',
        summary: 'When massive stars exhaust nuclear fuel, gravity collapses the core beyond escape velocity.',
        category: 'Astrophysics',
        estimatedMinutes: 5,
      },
      {
        id: '6',
        slug: 'neuroscience-of-memory',
        title: 'The Neuroscience of Memory',
        summary: 'How the hippocampus encodes experiences into long-term memory through synaptic consolidation.',
        category: 'Neuroscience',
        estimatedMinutes: 5,
      },
    ];
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC', overflowX: 'hidden' }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hand off to client component for all interactive / scroll reveal content */}
        <LandingScrollStory
          topics={topics}
          publishedSlugs={publishedSlugs}
          suggestedIdeas={SUGGESTED_IDEAS}
        />
      </main>

      <Footer />
    </div>
  );
}
