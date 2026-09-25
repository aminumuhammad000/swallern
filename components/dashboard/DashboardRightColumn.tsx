'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopicThumbnail } from './TopicThumbnail';
import { TopicProgressState } from '@/lib/learning/progress';

interface DashboardRightColumnProps {
  userName: string;
  userEmail: string | null;
  userRole?: string;
  completedTopics: TopicProgressState[];
  inProgressTopics: TopicProgressState[];
  totalSavedCount: number;
  quizAccuracy?: number | null;
  onNavigateTab: (tab: string) => void;
  recommendedTopic?: {
    slug: string;
    title: string;
    category: string;
    summary: string;
    estimatedMinutes?: number;
  } | null;
}

export const DashboardRightColumn: React.FC<DashboardRightColumnProps> = ({
  userName,
  userEmail,
  userRole = 'Learner',
  completedTopics,
  inProgressTopics,
  totalSavedCount,
  quizAccuracy,
  onNavigateTab,
  recommendedTopic,
}) => {
  const [statsPeriod, setStatsPeriod] = useState<'7days' | 'all'>('7days');

  // Compute real metrics
  const completedCount = completedTopics.length;
  const inProgressCount = inProgressTopics.filter((t) => !t.isCompleted).length;
  const totalCourses = completedCount + inProgressCount;

  // Compute total finished steps (real lessons completed)
  const totalCompletedLessons = [
    ...completedTopics.map((t) => t.totalSteps || 5),
    ...inProgressTopics
      .filter((t) => !t.isCompleted)
      .map((t) => t.completedStepIndexes?.length || 0),
  ].reduce((acc, curr) => acc + curr, 0);

  const estimatedStudyMinutes = totalCompletedLessons * 5;
  const studyTimeFormatted =
    estimatedStudyMinutes >= 60
      ? `${Math.floor(estimatedStudyMinutes / 60)}h ${estimatedStudyMinutes % 60}m`
      : `${estimatedStudyMinutes}m`;

  // Goal: complete 3 courses this month
  const monthlyGoalTarget = 3;
  const goalProgress = Math.min(
    100,
    Math.round((completedCount / monthlyGoalTarget) * 100)
  );

  const initials = (userName || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. USER PROFILE SUMMARY CARD                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          padding: '1.5rem',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Avatar */}
          <div
            style={{
              position: 'relative',
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              border: '3px solid #BFDBFE',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.4rem',
              marginBottom: '10px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
            }}
          >
            {initials}
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                border: '2px solid #FFFFFF',
              }}
              title="Active Learner"
            />
          </div>

          {/* User Name & Role */}
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 2px 0',
              lineHeight: 1.3,
            }}
          >
            {userName}
          </h3>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 10px',
              borderRadius: '9999px',
              marginBottom: '6px',
            }}
          >
            <span>★</span>
            <span>{userRole}</span>
          </div>

          {userEmail && (
            <p
              style={{
                fontSize: '0.78rem',
                color: '#64748B',
                margin: '0 0 14px 0',
                wordBreak: 'break-all',
              }}
            >
              {userEmail}
            </p>
          )}

          {/* Real Metrics Row */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              padding: '12px 6px',
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              marginBottom: '14px',
            }}
          >
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                {totalCourses}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                Courses
              </div>
            </div>

            <div style={{ borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                {completedCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                Completed
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563EB' }}>
                {inProgressCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                In Progress
              </div>
            </div>
          </div>

          {/* Settings / Profile Button */}
          <button
            onClick={() => onNavigateTab('settings')}
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1.5px solid #CBD5E1',
              padding: '0.55rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#94A3B8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Account Settings</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. QUICK STATS CARD                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          padding: '1.25rem 1.4rem',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h4
            style={{
              fontSize: '0.98rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
            }}
          >
            Quick Stats
          </h4>

          {/* Period toggle pill */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              borderRadius: '8px',
              padding: '2px',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            <button
              onClick={() => setStatsPeriod('7days')}
              style={{
                border: 'none',
                backgroundColor: statsPeriod === '7days' ? '#FFFFFF' : 'transparent',
                color: statsPeriod === '7days' ? '#0F172A' : '#64748B',
                borderRadius: '6px',
                padding: '2px 8px',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: statsPeriod === '7days' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              7 Days
            </button>
            <button
              onClick={() => setStatsPeriod('all')}
              style={{
                border: 'none',
                backgroundColor: statsPeriod === 'all' ? '#FFFFFF' : 'transparent',
                color: statsPeriod === 'all' ? '#0F172A' : '#64748B',
                borderRadius: '6px',
                padding: '2px 8px',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: statsPeriod === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              All Time
            </button>
          </div>
        </div>

        {/* 3 Metric Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {/* Tile 1: Lessons */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '10px 8px',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ color: '#2563EB', marginBottom: '4px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              {totalCompletedLessons}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
              Lessons
            </div>
          </div>

          {/* Tile 2: Study Time */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '10px 8px',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ color: '#D97706', marginBottom: '4px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              {studyTimeFormatted}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
              Study Time
            </div>
          </div>

          {/* Tile 3: Accuracy */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '10px 8px',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ color: '#059669', marginBottom: '4px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              {quizAccuracy != null ? `${quizAccuracy}%` : '100%'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
              Accuracy
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. LEARNING GOALS CARD                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          padding: '1.25rem 1.4rem',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>🎯</span>
            <h4
              style={{
                fontSize: '0.98rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
              }}
            >
              Monthly Goal
            </h4>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: goalProgress >= 100 ? '#059669' : '#2563EB',
              backgroundColor: goalProgress >= 100 ? '#ECFDF5' : '#EFF6FF',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}
          >
            {goalProgress >= 100 ? 'Achieved!' : `${goalProgress}%`}
          </span>
        </div>

        <p
          style={{
            fontSize: '0.8rem',
            color: '#64748B',
            margin: '0 0 10px 0',
            lineHeight: 1.4,
          }}
        >
          Complete {monthlyGoalTarget} topics this month to build your daily learning habit.
        </p>

        {/* Progress Bar */}
        <div
          style={{
            height: '8px',
            backgroundColor: '#F1F5F9',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${goalProgress}%`,
              backgroundColor: goalProgress >= 100 ? '#10B981' : '#3B82F6',
              borderRadius: '9999px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#64748B',
            fontWeight: 600,
          }}
        >
          <span>Progress</span>
          <span style={{ color: '#0F172A', fontWeight: 700 }}>
            {completedCount} of {monthlyGoalTarget} completed
          </span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. RECOMMENDED FOR YOU CARD                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {recommendedTopic && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            padding: '1.25rem 1.4rem',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '10px',
              color: '#D97706',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <span>💡</span>
            <span>Recommended For You</span>
          </div>

          <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
            <TopicThumbnail
              category={recommendedTopic.category}
              size="sm"
            />
          </div>

          <h5
            style={{
              fontSize: '0.94rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 6px 0',
              lineHeight: 1.35,
            }}
          >
            {recommendedTopic.title}
          </h5>

          <p
            style={{
              fontSize: '0.78rem',
              color: '#64748B',
              margin: '0 0 12px 0',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {recommendedTopic.summary}
          </p>

          <Link href={`/topics/${recommendedTopic.slug}`} style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                padding: '0.55rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DBEAFE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#EFF6FF';
              }}
            >
              <span>Start Course</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </Link>
        </div>
      )}
    </aside>
  );
};
