'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalTopics: number;
  publishedTopics: number;
  draftOrReviewTopics: number;
  categoriesCount: number;
  recentActivity: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
    updated_at: string;
    category_id: string | null;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  DISCOVERED: '#6b7280',
  RESEARCHING: '#7c3aed',
  DRAFT: '#d97706',
  REVIEW: '#2563eb',
  APPROVED: '#059669',
  PUBLISHED: '#16a34a',
  UPDATED: '#0891b2',
  REJECTED: '#dc2626',
};

function StatCard({ label, value, accent, href }: { label: string; value: number | string; accent?: string; href?: string }) {
  const content = (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1.25rem 1.5rem',
        borderLeft: accent ? `4px solid ${accent}` : undefined,
        cursor: href ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (href) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(0, 0, 0, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (href) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{label}</span>
        {href && (
          <span style={{ color: accent || '#4f46e5', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
            View
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
        )}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>
        {value}
      </div>
    </div>
  );

  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

export function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
          Signed in as <strong>{adminEmail}</strong>
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/admin/topics" style={{ ...actionStyle, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          Manage Topics
        </Link>
        <Link href="/admin/review" style={{ ...actionStyle, background: '#16a34a', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Unified Content Review Dashboard
        </Link>
        <Link href="/admin/pipeline" style={{ ...actionStyle, background: '#4f46e5', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          Pipeline Engine
        </Link>
        <Link href="/admin/topics/new" style={{ ...actionStyle, background: '#0284c7', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Topic
        </Link>
      </div>

      {loading && (
        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading stats…</div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <StatCard label="Total Topics" value={stats.totalTopics} accent="#4f46e5" href="/admin/topics" />
            <StatCard label="Published" value={stats.publishedTopics} accent="#16a34a" href="/admin/topics?status=PUBLISHED" />
            <StatCard label="In Progress" value={stats.draftOrReviewTopics} accent="#d97706" href="/admin/topics?status=DRAFT" />
            <StatCard label="Categories" value={stats.categoriesCount} accent="#0891b2" href="/admin/topics" />
          </div>

          {/* Recent Activity */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#374151' }}>
                Recent Activity
              </h2>
            </div>
            {stats.recentActivity.length === 0 ? (
              <div style={{ padding: '1.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                No topics yet.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={thStyle}>Title</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Updated</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.map((t) => (
                    <tr key={t.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{t.title}</span>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#9ca3af' }}>{t.slug}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          background: `${STATUS_COLORS[t.status] || '#6b7280'}20`,
                          color: STATUS_COLORS[t.status] || '#6b7280',
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#9ca3af', fontSize: '0.8rem' }}>
                        {new Date(t.updated_at).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        <Link href={`/admin/topics/${t.id}`} style={linkStyle}>
                          Edit →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const actionStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  background: '#fff',
  border: '1px solid #d1d5db',
  color: '#374151',
  fontSize: '0.875rem',
  fontWeight: 500,
  textDecoration: 'none',
};

const thStyle: React.CSSProperties = {
  padding: '0.6rem 1rem',
  textAlign: 'left',
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  color: '#374151',
  verticalAlign: 'top',
};

const linkStyle: React.CSSProperties = {
  color: '#4f46e5',
  fontSize: '0.82rem',
  fontWeight: 500,
  textDecoration: 'none',
};
