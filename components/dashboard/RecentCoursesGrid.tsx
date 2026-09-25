'use client';

import React from 'react';
import Link from 'next/link';
import { TopicThumbnail } from './TopicThumbnail';
import { TopicProgressState, getProgressPercentage } from '@/lib/learning/progress';

export interface CourseCardData {
  slug: string;
  title: string;
  category: string;
  summary?: string;
  estimatedMinutes?: number;
}

interface RecentCoursesGridProps {
  courses: CourseCardData[];
  userProgressMap: Record<string, TopicProgressState>;
}

export const RecentCoursesGrid: React.FC<RecentCoursesGridProps> = ({
  courses,
  userProgressMap,
}) => {
  return (
    <section style={{ marginBottom: '2rem' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 2px 0',
              letterSpacing: '-0.01em',
            }}
          >
            Recommended Courses
          </h2>
          <p
            style={{
              fontSize: '0.78rem',
              color: '#64748B',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Bite-sized interactive lessons crafted for curious minds.
          </p>
        </div>

        <Link
          href="/explore"
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#2563EB',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>View All</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </Link>
      </div>

      {/* 4-Card Course Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {courses.slice(0, 4).map((course) => {
          const progress = userProgressMap[course.slug];
          const isCompleted = progress?.isCompleted ?? false;
          const percent = progress ? getProgressPercentage(progress) : 0;
          const hasStarted = Boolean(progress && progress.completedStepIndexes?.length > 0);

          return (
            <Link
              key={course.slug}
              href={`/topics/${course.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="swallern-card-interactive"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div
                    style={{
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginBottom: '10px',
                    }}
                  >
                    <TopicThumbnail
                      category={course.category}
                      size="sm"
                    />
                  </div>

                  {/* Category Pill & Status */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: '#2563EB',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #DBEAFE',
                        padding: '1px 7px',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {course.category}
                    </span>

                    {isCompleted ? (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#059669',
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          padding: '1px 6px',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <span>✓</span> Done
                      </span>
                    ) : hasStarted ? (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#2563EB',
                          backgroundColor: '#EFF6FF',
                          padding: '1px 6px',
                          borderRadius: '9999px',
                        }}
                      >
                        {percent}%
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          color: '#94A3B8',
                          fontWeight: 600,
                        }}
                      >
                        ~{course.estimatedMinutes || 5} min
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 4px 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {course.title}
                  </h3>

                  {/* Summary preview */}
                  {course.summary && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748B',
                        margin: 0,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.summary}
                    </p>
                  )}
                </div>

                {/* Bottom Progress Bar or Start Link */}
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                  {hasStarted ? (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.68rem',
                          color: '#64748B',
                          fontWeight: 600,
                          marginBottom: '3px',
                        }}
                      >
                        <span>Progress</span>
                        <span style={{ color: isCompleted ? '#059669' : '#2563EB', fontWeight: 700 }}>
                          {isCompleted ? '100%' : `${percent}%`}
                        </span>
                      </div>
                      <div
                        style={{
                          height: '5px',
                          backgroundColor: '#F1F5F9',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${isCompleted ? 100 : percent}%`,
                            backgroundColor: isCompleted ? '#10B981' : '#3B82F6',
                            borderRadius: '9999px',
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                        5 interactive steps
                      </span>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: '#2563EB',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <span>Start</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
