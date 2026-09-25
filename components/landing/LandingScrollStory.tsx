'use client';

/**
 * LandingScrollStory
 * The full Swallern landing page visual journey — all interactive, scroll-reveal,
 * and animated sections live here. Separated from the server page.tsx so it can
 * use client-side hooks while keeping server data-fetching clean.
 *
 * Story structure:
 *  01 — HERO (3-second test)
 *  02 — THE IDEA (core product principle)
 *  03 — DISCOVER (breadth of knowledge)
 *  04 — HOW IT WORKS (product storytelling — numbered)
 *  05 — PRODUCT PREVIEW (real interactive lesson preview)
 *  06 — TOPIC LIBRARY (real published topics)
 *  07 — FINAL INVITATION
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Badge, TopicCard } from '@/components/ui';
import { SearchBar } from '@/components/search/SearchBar';
import { SurpriseMeButton } from '@/components/discovery/SurpriseMeButton';
import { ContinueLearningSection } from '@/components/discovery/ContinueLearningSection';

import { Reveal, HeroSequence } from '@/components/landing/Reveal';

/* ========================================================================== */
/* Types                                                                       */
/* ========================================================================== */

interface Topic {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  estimatedMinutes?: number;
}

interface LandingScrollStoryProps {
  topics: Topic[];
  publishedSlugs: string[];
  suggestedIdeas: string[];
}

/* ========================================================================== */
/* Knowledge domains                                                           */
/* ========================================================================== */

const KNOWLEDGE_DOMAINS = [
  {
    name: 'Science',
    slug: 'science',
    desc: 'Physics, chemistry & natural phenomena',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
      </svg>
    ),
  },
  {
    name: 'Space',
    slug: 'space',
    desc: 'Cosmology, black holes & astrophysics',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 7.07 17.07M12 2a10 10 0 0 0-7.07 17.07"/>
        <path d="m16 6-1 1M8 18l-1 1M6 8l-1-1M18 16l1 1"/>
      </svg>
    ),
  },
  {
    name: 'Nature',
    slug: 'nature',
    desc: 'Ecosystems, wildlife & ecology',
    color: '#10B981',
    bgColor: '#ECFDF5',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    name: 'Technology',
    slug: 'technology',
    desc: 'Computing, AI & global networks',
    color: '#0D9488',
    bgColor: '#F0FDFA',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
  {
    name: 'History',
    slug: 'history',
    desc: 'Civilizations & world-changing events',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    name: 'Psychology',
    slug: 'psychology',
    desc: 'Human mind, memory & perception',
    color: '#F97316',
    bgColor: '#FFF7ED',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
];

/* ========================================================================== */
/* How it works steps                                                          */
/* ========================================================================== */

const HOW_STEPS = [
  {
    number: '01',
    label: 'Choose',
    headline: 'You decide what to learn.',
    body: 'Pick any question, topic, or curiosity, from black holes to bread making. Swallern has no syllabus. Your curiosity is the starting point.',
    color: '#3B82F6',
    accent: '#EFF6FF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
    ),
  },
  {
    number: '02',
    label: 'Structure',
    headline: 'Swallern builds the experience.',
    body: 'The topic is broken into focused bite-sized steps: intro, core concepts, lesson sections, and knowledge checks, in the right order for your understanding.',
    color: '#8B5CF6',
    accent: '#F5F3FF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    number: '03',
    label: 'Understand',
    headline: 'You read, see, and interact.',
    body: 'Every lesson includes visuals, clear explanations, and a knowledge check, not to test you, but to confirm understanding and strengthen recall.',
    color: '#10B981',
    accent: '#ECFDF5',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    number: '04',
    label: 'Progress',
    headline: 'You see where you stand.',
    body: 'Course progress, lesson completion, and meaningful feedback show exactly how far you have come, making learning feel like a real journey.',
    color: '#F59E0B',
    accent: '#FFFBEB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
];

/* ========================================================================== */
/* Component                                                                   */
/* ========================================================================== */

export const LandingScrollStory: React.FC<LandingScrollStoryProps> = ({
  topics,
  publishedSlugs,
  suggestedIdeas,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All Topics');

  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(topics.map((t) => t.category))).filter(Boolean);
    return ['All Topics', ...cats];
  }, [topics]);

  const displayedTopics = React.useMemo(() => {
    if (selectedCategory === 'All Topics') return topics;
    return topics.filter((t) => t.category === selectedCategory);
  }, [topics, selectedCategory]);

  // Auto-cycle the how-it-works step for ambient life
  useEffect(() => {
    const t = setInterval(() => setActiveStep((s) => (s + 1) % HOW_STEPS.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ================================================================ */}
      {/* 01 — HERO                                                        */}
      {/* 3-second test: visitor immediately understands what Swallern is  */}
      {/* ================================================================ */}
      <section
        style={{
          background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F4FF 55%, #EEF2FF 100%)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
          paddingTop: '52px',
          paddingBottom: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient radial glow — purely CSS, no JS */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container size="default">
          <div
            style={{
              maxWidth: '680px',
            }}
          >
            {/* Copy + search */}
            <div>
              <HeroSequence stepDelay={110}>
                {/* 0: eyebrow */}
                <div style={{ marginBottom: '14px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#6366F1',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#6366F1',
                        display: 'inline-block',
                      }}
                    />
                    Bite-sized learning platform
                  </span>
                </div>

                {/* 1: headline */}
                <h1
                  style={{
                    fontSize: 'clamp(2.4rem, 4.5vw, 3.75rem)',
                    fontWeight: 800,
                    lineHeight: 1.08,
                    letterSpacing: '-0.035em',
                    color: '#0F172A',
                    margin: '0 0 20px 0',
                  }}
                >
                  Turn curiosity
                  <br />
                  into{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 60%, #A855F7 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    understanding.
                  </span>
                </h1>

                {/* 2: subheading */}
                <p
                  style={{
                    fontSize: '1.125rem',
                    color: '#475569',
                    lineHeight: 1.65,
                    margin: '0 0 32px 0',
                    maxWidth: '520px',
                    fontWeight: 400,
                  }}
                >
                  You choose what to learn. Swallern builds a structured, visual, bite-sized learning experience around it.
                </p>

                {/* 3: search */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <div style={{ flex: '1 1 260px', minWidth: '260px', maxWidth: '440px' }}>
                    <SearchBar placeholder="What are you curious about?" />
                  </div>
                  <SurpriseMeButton publishedSlugs={publishedSlugs} />
                </div>

                {/* 4: curiosity chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: '#CBD5E1',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                    }}
                  >
                    Try:
                  </span>
                  {suggestedIdeas.map((idea) => (
                    <Link key={idea} href={`/search?q=${encodeURIComponent(idea)}`} style={{ textDecoration: 'none' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(255,255,255,0.85)',
                          border: '1px solid #E2E8F0',
                          padding: '4px 11px',
                          borderRadius: '20px',
                          color: '#475569',
                          fontWeight: 500,
                          display: 'inline-block',
                          transition: 'border-color 150ms ease, color 150ms ease',
                          backdropFilter: 'blur(8px)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = '#C7D2FE';
                          (e.currentTarget as HTMLElement).style.color = '#4F46E5';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
                          (e.currentTarget as HTMLElement).style.color = '#475569';
                        }}
                      >
                        {idea}
                      </span>
                    </Link>
                  ))}
                </div>
              </HeroSequence>
            </div>
          </div>

          {/* Continue Learning — shown only for returning learners */}
          <div style={{ marginTop: '28px', maxWidth: '680px' }}>
            <ContinueLearningSection />
          </div>
        </Container>
      </section>



      {/* ================================================================ */}
      {/* 02 — THE IDEA                                                    */}
      {/* A short, confident statement — lets whitespace do the work       */}
      {/* ================================================================ */}
      <section
        style={{
          padding: '72px 0',
          background: '#FFFFFF',
        }}
      >
        <Container size="default">
          <Reveal variant="fade-up">
            <div
              style={{
                maxWidth: '720px',
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '20px',
                }}
              >
                The Idea
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  color: '#0F172A',
                  margin: '0 0 20px 0',
                }}
              >
                You choose what to learn.
                <br />
                <span style={{ color: '#6366F1' }}>Swallern controls how.</span>
              </h2>

              <p
                style={{
                  fontSize: '1.0625rem',
                  color: '#64748B',
                  lineHeight: 1.7,
                  margin: '0 auto',
                  maxWidth: '520px',
                }}
              >
                Tell Swallern what you're curious about. It builds a focused, visual, bite-sized learning experience: structured explanations, knowledge checks, and real-world context, without you having to find and filter the information yourself.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ================================================================ */}
      {/* 03 — DISCOVER: KNOWLEDGE DOMAINS                                 */}
      {/* Elegant domain grid — not card soup                              */}
      {/* ================================================================ */}
      <section
        style={{
          padding: '64px 0',
          background: '#F8FAFC',
          borderTop: '1px solid #F1F5F9',
        }}
      >
        <Container size="default">
          <Reveal variant="fade-up">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '6px',
                  }}
                >
                  03 Explore
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(1.4rem, 2.4vw, 1.875rem)',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  What are you curious about?
                </h2>
              </div>
              <Link
                href="/explore"
                style={{
                  fontSize: '0.84375rem',
                  color: '#6366F1',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                All knowledge domains
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          </Reveal>

          {/* Domain list — open layout, not card soup */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '2px',
              background: '#E8EDF2',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {KNOWLEDGE_DOMAINS.map((domain, i) => (
              <Reveal key={domain.slug} variant="fade" delay={i * 60}>
                <Link
                  href={`/explore?category=${domain.slug}`}
                  style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                >
                  <div
                    style={{
                      padding: '24px',
                      background: '#FFFFFF',
                      height: '100%',
                      transition: 'background 150ms ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = domain.bgColor; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: domain.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: domain.color,
                        flexShrink: 0,
                        marginTop: '1px',
                      }}
                    >
                      {domain.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginBottom: '3px' }}>
                        {domain.name}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.45 }}>
                        {domain.desc}
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/* 04 — HOW SWALLERN WORKS (numbered product storytelling)          */}
      {/* Open two-column layout with interactive step indicator           */}
      {/* ================================================================ */}
      <section
        id="how-it-works"
        style={{
          padding: '80px 0',
          background: '#FFFFFF',
          borderTop: '1px solid #F1F5F9',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        <Container size="default">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: '64px',
              alignItems: 'start',
            }}
          >
            {/* Left: sticky narrative */}
            <Reveal variant="fade">
              <div style={{ position: 'sticky', top: '80px' }}>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '12px',
                  }}
                >
                  04 How it works
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)',
                    fontWeight: 800,
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    color: '#0F172A',
                    margin: '0 0 16px 0',
                  }}
                >
                  A curiosity becomes
                  <br />a complete learning journey.
                </h2>
                <p style={{ fontSize: '0.9375rem', color: '#64748B', lineHeight: 1.65, margin: '0 0 32px 0', maxWidth: '380px' }}>
                  Swallern transforms any topic you're curious about into a focused sequence of structured steps, so you always know exactly where you are and what comes next.
                </p>

                {/* Step navigator */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {HOW_STEPS.map((step, i) => (
                    <button
                      key={step.number}
                      onClick={() => setActiveStep(i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeStep === i ? step.accent : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 200ms ease',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          color: activeStep === i ? step.color : '#CBD5E1',
                          width: '24px',
                          letterSpacing: '0.04em',
                          transition: 'color 200ms ease',
                        }}
                      >
                        {step.number}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: activeStep === i ? 700 : 500,
                          color: activeStep === i ? '#0F172A' : '#94A3B8',
                          transition: 'color 200ms ease, font-weight 150ms ease',
                        }}
                      >
                        {step.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Right: step detail cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
              {HOW_STEPS.map((step, i) => (
                <Reveal key={step.number} variant="fade-up" delay={i * 100}>
                  <div
                    onClick={() => setActiveStep(i)}
                    style={{
                      padding: '24px 26px',
                      borderRadius: '16px',
                      background: activeStep === i ? step.accent : '#F8FAFC',
                      border: `1px solid ${activeStep === i ? step.color + '30' : '#F1F5F9'}`,
                      cursor: 'pointer',
                      transition: 'background 250ms ease, border-color 250ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: activeStep === i ? '#FFFFFF' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: step.color,
                          flexShrink: 0,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        }}
                      >
                        {step.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            color: step.color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.07em',
                            marginBottom: '4px',
                          }}
                        >
                          Step {step.number}
                        </div>
                        <h3
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#0F172A',
                            margin: '0 0 8px 0',
                            lineHeight: 1.3,
                          }}
                        >
                          {step.headline}
                        </h3>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: activeStep === i ? '#64748B' : '#94A3B8',
                            lineHeight: 1.6,
                            margin: 0,
                            opacity: activeStep === i ? 1 : 0.45,
                            transition: 'opacity 250ms ease, color 250ms ease',
                          }}
                        >
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/* 05 — LIVE PRODUCT PREVIEW                                        */}
      {/* Full-width soft section with real interactive lesson preview     */}
      {/* ================================================================ */}
      <section
        style={{
          padding: '80px 0',
          background: 'linear-gradient(160deg, #EFF6FF 0%, #F5F3FF 50%, #ECFDF5 100%)',
          borderTop: '1px solid #E8EDF8',
        }}
      >
        <Container size="default">
          <Reveal variant="fade-up">
            <div style={{ maxWidth: '680px' }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '12px',
                }}
              >
                05 The Classroom
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: '#0F172A',
                  margin: '0 0 16px 0',
                }}
              >
                Every lesson is a complete, focused experience.
              </h2>
              <p style={{ fontSize: '0.9375rem', color: '#64748B', lineHeight: 1.65, margin: '0 0 28px 0', maxWidth: '520px' }}>
                A topic overview, a core explanation, key concepts, bite-sized reading sections, and a knowledge check, structured in the right order, every time.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                {[
                  { label: 'Structured bite-sized steps', color: '#6366F1' },
                  { label: 'Visual learning support', color: '#10B981' },
                  { label: 'Interactive knowledge checks', color: '#F59E0B' },
                  { label: 'Real progress tracking', color: '#8B5CF6' },
                ].map((feat) => (
                  <div
                    key={feat.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid #F1F5F9',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: feat.color + '18',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke={feat.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>{feat.label}</span>
                  </div>
                ))}
              </div>

              <Link href="/explore" style={{ textDecoration: 'none' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: '#6366F1',
                    color: '#FFFFFF',
                    padding: '11px 22px',
                    borderRadius: '22px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    transition: 'background 150ms ease, transform 150ms ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#4F46E5'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#6366F1'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  Start a lesson
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ================================================================ */}
      {/* 06: TOPIC LIBRARY                                                */}
      {/* Compact, high-quality grid: real published topics                */}
      {/* ================================================================ */}
      <section
        style={{
          padding: '88px 0',
          background: '#FAFAFC',
          borderTop: '1px solid #F1F5F9',
        }}
      >
        <Container size="default">
          <Reveal variant="fade-up">
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginBottom: '28px',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              <div style={{ maxWidth: '640px' }}>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '8px',
                  }}
                >
                  06 Curated Library
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: '0 0 10px 0',
                    letterSpacing: '-0.025em',
                  }}
                >
                  Explore published topics
                </h2>
                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: '#64748B',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Curated, bite-sized knowledge journeys across science, technology, nature, and the human mind. Verified, structured, and ready to explore in under 6 minutes.
                </p>
              </div>

              <Link
                href="/explore"
                style={{
                  fontSize: '0.84375rem',
                  color: '#4F46E5',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '20px',
                  background: '#EEF2FF',
                  border: '1px solid #E0E7FF',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#E0E7FF';
                  (e.currentTarget as HTMLElement).style.borderColor = '#C7D2FE';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#EEF2FF';
                  (e.currentTarget as HTMLElement).style.borderColor = '#E0E7FF';
                }}
              >
                Browse the full library
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

            {/* Category filter pills */}
            {categories.length > 2 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '32px',
                }}
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.8125rem',
                        fontWeight: isSelected ? 700 : 500,
                        border: isSelected ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                        background: isSelected ? '#4F46E5' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        boxShadow: isSelected ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1';
                          (e.currentTarget as HTMLElement).style.color = '#0F172A';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
                          (e.currentTarget as HTMLElement).style.color = '#475569';
                        }
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '20px',
            }}
          >
            {displayedTopics.map((t, i) => (
              <Reveal key={t.id || t.slug} variant="fade-up" delay={i * 40}>
                <TopicCard
                  slug={t.slug}
                  title={t.title}
                  summary={t.summary}
                  category={t.category}
                  estimatedMinutes={t.estimatedMinutes || 5}
                />
              </Reveal>
            ))}
          </div>

          {/* Bottom Discovery Callout */}
          <Reveal variant="fade-up" delay={150}>
            <div
              style={{
                marginTop: '36px',
                padding: '22px 26px',
                borderRadius: '16px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#F0FDFA',
                    border: '1px solid #CCFBF1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0D9488',
                    flexShrink: 0,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                    Can&apos;t find what you&apos;re curious about?
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                    Swallern can build a structured learning journey for any topic in science, technology, or history.
                  </div>
                </div>
              </div>

              <Link
                href="/explore"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#1E293B';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#0F172A';
                }}
              >
                Search all topics
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ================================================================ */}
      {/* 07 — FINAL INVITATION                                            */}
      {/* Calm, spacious, confident close                                  */}
      {/* ================================================================ */}
      <section
        style={{
          padding: '88px 0',
          background: 'linear-gradient(160deg, #0F172A 0%, #1E1B4B 100%)',
          borderTop: '1px solid #1E293B',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient radial glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container size="default">
          <Reveal variant="fade-up">
            <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  margin: '0 0 16px 0',
                }}
              >
                Something interesting
                <br />
                is waiting to be learned.
              </h2>

              <p
                style={{
                  fontSize: '1rem',
                  color: '#94A3B8',
                  lineHeight: 1.65,
                  margin: '0 0 36px 0',
                }}
              >
                No onboarding. No prerequisites. Just pick something you're curious about and start learning it now.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                <Link href="/explore" style={{ textDecoration: 'none' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#6366F1',
                      color: '#FFFFFF',
                      padding: '13px 26px',
                      borderRadius: '26px',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      transition: 'background 150ms ease, transform 150ms ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#4F46E5'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#6366F1'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                  >
                    Explore topics
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </span>
                </Link>

                <Link href="/search" style={{ textDecoration: 'none' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#CBD5E1',
                      padding: '12px 22px',
                      borderRadius: '26px',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      transition: 'background 150ms ease, border-color 150ms ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.13)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                    </svg>
                    Search any question
                  </span>
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
};
