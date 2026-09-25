'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { DashboardSidebar, DashboardNavTab } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { MyLearningJourney } from '@/components/dashboard/MyLearningJourney';
import { RecentCoursesGrid, CourseCardData } from '@/components/dashboard/RecentCoursesGrid';
import { DashboardRightColumn } from '@/components/dashboard/DashboardRightColumn';
import { EncouragementBanner } from '@/components/dashboard/EncouragementBanner';
import { UserTopicsTab } from '@/components/dashboard/UserTopicsTab';
import { CreateTopicModal } from '@/components/dashboard/CreateTopicModal';
import { SettingsView } from '@/components/dashboard/settings/SettingsView';
import { NotesView } from '@/components/dashboard/NotesView';

import {
  getCompletedTopics,
  getInProgressTopics,
  getLocalProgressStore,
  TopicProgressState,
} from '@/lib/learning/progress';

interface SavedTopicItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category?: string;
}

interface HistoryItem {
  id: string;
  event_name: string;
  created_at: string;
  topic?: {
    slug: string;
    title: string;
  };
}

interface QuizAttemptItem {
  id: string;
  score: number;
  total_questions: number;
  passed: boolean;
  created_at: string;
  quiz?: {
    title: string;
    topic?: {
      slug: string;
      title: string;
    };
  };
}

// Curated library courses for the dashboard grid
const DASHBOARD_COURSES: CourseCardData[] = [
  {
    slug: 'why-is-the-sky-blue',
    title: 'Why is the sky blue?',
    category: 'Physics',
    summary: 'Sunlight scatters through atmospheric gases via Rayleigh scattering, dispersing shorter blue wavelengths.',
    estimatedMinutes: 5,
  },
  {
    slug: 'how-does-the-internet-work',
    title: 'How does the internet work?',
    category: 'Technology',
    summary: 'Global networks route packets using TCP/IP protocols across undersea fiber optic cables.',
    estimatedMinutes: 5,
  },
  {
    slug: 'fat-bear-week-voting',
    title: 'Katmai Fat Bear Week & Biology',
    category: 'Biology',
    summary: 'Discover how brown bears enter hyperphagia to consume 40 lbs of salmon daily for winter hibernation.',
    estimatedMinutes: 5,
  },
  {
    slug: 'black-hole-physics',
    title: 'How Black Holes Work',
    category: 'Space',
    summary: 'Gravitational attraction so dense that light cannot escape the event horizon.',
    estimatedMinutes: 5,
  },
];

const RECOMMENDED_TOPIC = {
  slug: 'neuroscience-of-memory',
  title: 'The Neuroscience of Memory',
  category: 'Neuroscience',
  summary: 'Explore synaptic plasticity, long-term potentiation, and how the brain stores memories.',
  estimatedMinutes: 5,
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Learner');
  const [userRole, setUserRole] = useState<string>('Learner');

  const [activeTab, setActiveTab] = useState<DashboardNavTab>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<'builder' | 'json'>('builder');
  const [refreshTopicsKey, setRefreshTopicsKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('swallern_sidebar_collapsed');
      if (saved === 'true') setIsSidebarCollapsed(true);
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('swallern_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  const [savedTopics, setSavedTopics] = useState<SavedTopicItem[]>([]);
  const [completedTopics, setCompletedTopics] = useState<TopicProgressState[]>([]);
  const [inProgressTopics, setInProgressTopics] = useState<TopicProgressState[]>([]);
  const [userProgressMap, setUserProgressMap] = useState<Record<string, TopicProgressState>>({});
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptItem[]>([]);

  // Load local learner progress
  const reloadProgress = useCallback(() => {
    const finished = getCompletedTopics();
    const inProg = getInProgressTopics();
    const map = getLocalProgressStore();

    setCompletedTopics(finished);
    setInProgressTopics(inProg);
    setUserProgressMap(map);
  }, []);

  // Listen to searchParams tab query
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (tabParam === 'completed' || tabParam === 'my-learning') {
        setActiveTab('my-learning');
      } else if (tabParam === 'saved' || tabParam === 'bookmarks') {
        setActiveTab('bookmarks');
      } else if (tabParam === 'quizzes' || tabParam === 'history' || tabParam === 'progress') {
        setActiveTab('progress');
      } else if (tabParam === 'settings') {
        setActiveTab('settings');
      } else if (tabParam === 'discover') {
        setActiveTab('discover');
      } else if (tabParam === 'create') {
        router.push('/dashboard/builder');
      } else if (tabParam === 'import') {
        router.push('/dashboard/builder?mode=import');
      }
    }
  }, [searchParams, router]);

  // Load authenticated user and database data
  useEffect(() => {
    async function loadUserData() {
      try {
        reloadProgress();

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUserEmail(user.email || null);
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Learner';
        setUserName(name);
        setUserRole(user.app_metadata?.role || 'Learner');

        // Fetch Saved Topics
        const { data: savedData } = await (supabase
          .from('saved_topics') as any)
          .select('topic_id, topics(id, slug, title, summary, category)')
          .eq('user_id', user.id);

        if (savedData) {
          const formattedSaved: SavedTopicItem[] = (savedData as any[])
            .map((item) => item.topics as unknown as SavedTopicItem)
            .filter(Boolean);
          setSavedTopics(formattedSaved);
        }

        // Fetch Learning Sessions History
        const { data: historyData } = await (supabase
          .from('learning_sessions') as any)
          .select('id, event_name, created_at, topics(slug, title)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (historyData) {
          setHistoryItems(historyData as unknown as HistoryItem[]);
        }

        // Fetch Quiz Attempts
        const { data: quizData } = await (supabase
          .from('user_quiz_attempts') as any)
          .select('id, score, total_questions, passed, created_at, quizzes(title, topics(slug, title))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (quizData) {
          setQuizAttempts(quizData as unknown as QuizAttemptItem[]);
        }
      } catch (err) {
        console.error('Failed loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router, reloadProgress]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Find the most recently active in-progress topic
  const activeTopic = useMemo(() => {
    const uncompleted = inProgressTopics.filter((t) => !t.isCompleted);
    return uncompleted.length > 0 ? uncompleted[0] : null;
  }, [inProgressTopics]);

  // Real quiz accuracy percentage
  const quizAccuracy = useMemo(() => {
    if (quizAttempts.length === 0) return null;
    const passedCount = quizAttempts.filter((q) => q.passed).length;
    return Math.round((passedCount / quizAttempts.length) * 100);
  }, [quizAttempts]);

  // Tab change handler
  const handleSelectTab = (tab: DashboardNavTab | string) => {
    if (tab === 'create') {
      router.push('/dashboard/builder');
      return;
    }
    if (tab === 'courses') {
      router.push('/explore');
      return;
    }
    if (tab === 'discover') {
      router.push('/explore');
      return;
    }
    setActiveTab(tab as DashboardNavTab);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          fontFamily: 'var(--font-plus-jakarta), sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              border: '3px solid #E2E8F0',
              borderTopColor: '#2563EB',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.92rem' }}>
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        fontFamily: 'var(--font-plus-jakarta), sans-serif',
      }}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* SIDEBAR NAVIGATION (Matching 1.png)                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <DashboardSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        savedCount={savedTopics.length}
        completedCount={completedTopics.length}
        onOpenCreateModal={() => router.push('/dashboard/builder')}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN CONTAINER                                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="swallern-scrollbar"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowY: 'auto',
          height: '100vh',
        }}
      >
        {/* Top Header Bar - perfectly fit and aligned with dashboard content grid */}
        <div
          style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '1.5rem 2.5rem 0.5rem 2.5rem',
            boxSizing: 'border-box',
          }}
        >
          <DashboardHeader
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            onSignOut={handleSignOut}
            onSelectTab={handleSelectTab}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
          />
        </div>

        {/* Content Body */}
        <main
          style={{
            flex: 1,
            padding: '0.75rem 2.5rem 3.5rem 2.5rem',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {/* TAB 1: HOME (THE MAIN DASHBOARD IN 1.png) */}
          {activeTab === 'home' && (
            <div>
              {/* Welcome Hero Banner with dynamic greeting and Swallern Bear */}
              <DashboardHero
                userName={userName}
                activeTopic={activeTopic}
                onExploreClick={() => router.push('/explore')}
              />

              {/* Two-Column Layout (Matching 1.png: Left Content + Right Profile/Stats) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 340px',
                  gap: '2rem',
                  alignItems: 'start',
                }}
              >
                {/* LEFT CONTENT COLUMN */}
                <div>
                  {/* My Learning Journey (Active course progress + next lesson) */}
                  <MyLearningJourney
                    activeTopic={activeTopic}
                    onExploreClick={() => router.push('/explore')}
                  />

                  {/* Recent Courses Grid (4 cards with real user progress badges) */}
                  <RecentCoursesGrid
                    courses={DASHBOARD_COURSES}
                    userProgressMap={userProgressMap}
                  />

                  {/* Bottom Encouragement Banner with Swallern mascot */}
                  <EncouragementBanner userName={userName} />
                </div>

                {/* RIGHT COLUMN (Profile summary, quick stats, goals, recommendations) */}
                <div>
                  <DashboardRightColumn
                    userName={userName}
                    userEmail={userEmail}
                    userRole={userRole}
                    completedTopics={completedTopics}
                    inProgressTopics={inProgressTopics}
                    totalSavedCount={savedTopics.length}
                    quizAccuracy={quizAccuracy}
                    onNavigateTab={handleSelectTab}
                    recommendedTopic={RECOMMENDED_TOPIC}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY LEARNING (In-progress & Completed Courses) */}
          {activeTab === 'my-learning' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.75rem',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                    My Learning
                  </h1>
                  <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
                    Track all topics you are currently exploring or have completed.
                  </p>
                </div>

                <Link href="/explore" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Browse All Topics</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </Link>
              </div>

              {/* In Progress Section */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                  In Progress ({inProgressTopics.filter((t) => !t.isCompleted).length})
                </h2>

                {inProgressTopics.filter((t) => !t.isCompleted).length === 0 ? (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1.5px dashed #CBD5E1',
                      padding: '2rem',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                      No topics currently in progress. Start an interactive topic anytime!
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '1.25rem',
                    }}
                  >
                    {inProgressTopics
                      .filter((t) => !t.isCompleted)
                      .map((t) => {
                        const stepNum = (t.currentStep ?? 0) + 1;
                        const total = t.totalSteps || 5;
                        const pct = Math.min(100, Math.round(((t.completedStepIndexes?.length || 0) / total) * 100));

                        return (
                          <div
                            key={t.slug}
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: '20px',
                              border: '1.5px solid #E2E8F0',
                              padding: '1.4rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '9999px' }}>
                                  {t.category || 'Topic'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                                  Step {stepNum} of {total}
                                </span>
                              </div>

                              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                                {t.title}
                              </h3>

                              {t.summary && (
                                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                                  {t.summary}
                                </p>
                              )}
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>
                                <span>Progress</span>
                                <span style={{ color: '#2563EB', fontWeight: 700 }}>{pct}%</span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '14px' }}>
                                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#3B82F6', borderRadius: '9999px' }} />
                              </div>

                              <Link href={`/topics/${t.slug}/learn?step=${t.currentStep || 0}`} style={{ textDecoration: 'none' }}>
                                <button
                                  style={{
                                    width: '100%',
                                    backgroundColor: '#2563EB',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '0.6rem',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <span>Continue Lesson</span>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                  </svg>
                                </button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Completed Section */}
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                  Completed Topics ({completedTopics.length})
                </h2>

                {completedTopics.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1.5px dashed #CBD5E1',
                      padding: '2.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                      No completed topics yet. Finished courses will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '1.25rem',
                    }}
                  >
                    {completedTopics.map((t) => (
                      <div
                        key={t.slug}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '20px',
                          border: '1.5px solid #E2E8F0',
                          padding: '1.4rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span>✓</span> Completed
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                              100% finished
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                            {t.title}
                          </h3>

                          {t.summary && (
                            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                              {t.summary}
                            </p>
                          )}
                        </div>

                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
                            {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'Completed'}
                          </span>
                          <Link href={`/topics/${t.slug}`} style={{ textDecoration: 'none' }}>
                            <button
                              style={{
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                                padding: '5px 12px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                            >
                              Review Topic
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BOOKMARKS / SAVED TOPICS */}
          {activeTab === 'bookmarks' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Saved Topics ({savedTopics.length})
                </h1>
                <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
                  Curious topics you have bookmarked to read or study later.
                </p>
              </div>

              {savedTopics.length === 0 ? (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    border: '2px dashed #CBD5E1',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                    No bookmarked topics yet
                  </h3>
                  <p style={{ color: '#64748B', fontWeight: 500, fontSize: '0.88rem', margin: '0 0 18px 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Click the bookmark icon on any topic page to save it for later review.
                  </p>
                  <Link href="/explore" style={{ textDecoration: 'none' }}>
                    <button
                      style={{
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '0.65rem 1.3rem',
                        borderRadius: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Explore Library
                    </button>
                  </Link>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {savedTopics.map((t) => (
                    <div
                      key={t.id || t.slug}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '20px',
                        padding: '1.4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {t.category && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '9999px', display: 'inline-block', marginBottom: '8px' }}>
                            {t.category}
                          </span>
                        )}
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                          {t.title}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                          {t.summary}
                        </p>
                      </div>

                      <Link href={`/topics/${t.slug}`} style={{ textDecoration: 'none' }}>
                        <button
                          style={{
                            width: '100%',
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.55rem',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Read Topic
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROGRESS & ACTIVITY LOG */}
          {activeTab === 'progress' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Progress & Activity
                </h1>
                <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
                  Real record of your learning sessions and knowledge quiz attempts.
                </p>
              </div>

              {/* Quiz Attempts Section */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                  Quiz Results ({quizAttempts.length})
                </h2>

                {quizAttempts.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1.5px dashed #CBD5E1',
                      padding: '2rem',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                      No quiz attempts yet. Test your knowledge inside any topic classroom!
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {quizAttempts.map((q) => (
                      <div
                        key={q.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '16px',
                          padding: '1rem 1.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                            {q.quiz?.title || 'Knowledge Quiz'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            Topic: {q.quiz?.topic?.title || 'Science'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: q.passed ? '#059669' : '#DC2626' }}>
                            {q.score}/{q.total_questions} ({Math.round((q.score / q.total_questions) * 100)}%)
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: q.passed ? '#ECFDF5' : '#FEF2F2',
                              color: q.passed ? '#059669' : '#DC2626',
                              border: `1px solid ${q.passed ? '#A7F3D0' : '#FECACA'}`,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                            }}
                          >
                            {q.passed ? 'PASSED' : 'RETRY'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Learning Activity Log Section */}
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                  Recent Activity Log
                </h2>

                {historyItems.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1.5px dashed #CBD5E1',
                      padding: '2rem',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                      No recent learning sessions recorded yet.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      border: '1.5px solid #E2E8F0',
                      overflow: 'hidden',
                    }}
                  >
                    {historyItems.map((item, idx) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '1rem 1.25rem',
                          borderBottom: idx !== historyItems.length - 1 ? '1px solid #F1F5F9' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                            {item.topic?.title || item.event_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                            {item.event_name}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: NOTES */}
          {activeTab === 'notes' && (
            <NotesView />
          )}

          {/* TAB 6: SETTINGS & PROFILE */}
          {activeTab === 'settings' && (
            <SettingsView
              userName={userName}
              userEmail={userEmail}
              userRole={userRole}
              onSignOut={handleSignOut}
            />
          )}

          {/* TAB 7: USER CREATED TOPICS (MY TOPICS) */}
          {activeTab === 'create' && (
            <UserTopicsTab
              key={refreshTopicsKey}
              onOpenCreateModal={() => {
                router.push('/dashboard/builder');
              }}
              onOpenImportModal={() => {
                router.push('/dashboard/builder?mode=import');
              }}
            />
          )}
        </main>
      </div>

      {/* Create Topic Modal */}
      <CreateTopicModal
        isOpen={isCreateModalOpen}
        initialMode={createModalMode}
        onClose={() => setIsCreateModalOpen(false)}
        onTopicCreated={() => {
          setRefreshTopicsKey((k) => k + 1);
          reloadProgress();
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F8FAFC',
            fontFamily: 'var(--font-plus-jakarta), sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                border: '3px solid #E2E8F0',
                borderTopColor: '#2563EB',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.92rem' }}>
              Loading dashboard...
            </p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

