'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const ALL_STATUSES = [
  'ALL', 'DISCOVERED', 'RESEARCHING', 'DRAFT', 'REVIEW',
  'APPROVED', 'PUBLISHED', 'UPDATED', 'REJECTED',
];

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

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Topic {
  id: string;
  slug: string;
  title: string;
  status: string;
  difficulty: string | null;
  updated_at: string;
  categories: { id: string; name: string; slug: string } | null;
}

function TopicsListContent() {
  const searchParams = useSearchParams();
  const paramStatus = searchParams?.get('status') || 'ALL';

  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(paramStatus);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (categoryFilter !== 'ALL') params.set('category_id', categoryFilter);

      const res = await fetch(`/api/admin/topics?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTopics(data.topics || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchTopics, 250);
    return () => clearTimeout(t);
  }, [fetchTopics]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/topics/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTopics((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#111827' }}>Topics</h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#6b7280' }}>
            {topics.length} topic{topics.length !== 1 ? 's' : ''} {loading ? '(loading…)' : ''}
          </p>
        </div>
        <Link href="/admin/topics/new" style={{ ...primaryBtnStyle, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Topic
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem 1rem' }}>
        <input
          type="text"
          placeholder="Search by title, slug, or summary…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Topics table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'auto' }}>
        {loading && topics.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Loading…</div>
        ) : topics.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
            No topics found.{' '}
            <Link href="/admin/topics/new" style={{ color: '#4f46e5' }}>Create one →</Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={thStyle}>Title / Slug</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Difficulty</th>
                <th style={thStyle}>Updated</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{t.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{t.slug}</div>
                  </td>
                  <td style={tdStyle}>
                    {t.categories ? (
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{t.categories.name}</span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#d1d5db' }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      background: `${STATUS_COLORS[t.status] || '#6b7280'}1a`,
                      color: STATUS_COLORS[t.status] || '#6b7280',
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.8rem' }}>
                    {t.difficulty || '—'}
                  </td>
                  <td style={{ ...tdStyle, color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(t.updated_at).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                      <Link href={`/admin/topics/${t.id}`} style={editBtnStyle}>
                        Edit
                      </Link>
                      {['PUBLISHED', 'UPDATED'].includes(t.status) && (
                        <a href={`/topics/${t.slug}`} target="_blank" rel="noopener noreferrer" style={viewBtnStyle}>
                          View
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(t.id, t.title)}
                        style={deleteBtnStyle}
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const primaryBtnStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  background: '#4f46e5',
  color: '#fff',
  fontSize: '0.875rem',
  fontWeight: 500,
  textDecoration: 'none',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '180px',
  padding: '0.4rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.875rem',
  outline: 'none',
};

const selectStyle: React.CSSProperties = {
  padding: '0.4rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.82rem',
  outline: 'none',
  background: '#fff',
};

const thStyle: React.CSSProperties = {
  padding: '0.6rem 1rem',
  textAlign: 'left',
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '0.7rem 1rem',
  verticalAlign: 'top',
};

const editBtnStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  padding: '0.2rem 0.55rem',
  borderRadius: '5px',
  border: '1px solid #c7d2fe',
  background: '#eef2ff',
  color: '#4f46e5',
  textDecoration: 'none',
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

const viewBtnStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  padding: '0.2rem 0.55rem',
  borderRadius: '5px',
  border: '1px solid #d1fae5',
  background: '#f0fdf4',
  color: '#16a34a',
  textDecoration: 'none',
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

const deleteBtnStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  padding: '0.2rem 0.55rem',
  borderRadius: '5px',
  border: '1px solid #fecaca',
  background: '#fff5f5',
  color: '#dc2626',
  cursor: 'pointer',
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

export function TopicsList() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: '#6b7280' }}>Loading topics list…</div>}>
      <TopicsListContent />
    </Suspense>
  );
}

