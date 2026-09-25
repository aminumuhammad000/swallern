'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface UserTopicItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  status: string;
  approval_status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED' | null;
  publication_status: 'UNPUBLISHED' | 'PUBLISHED' | null;
  visibility: 'PUBLIC' | 'LINK_ONLY' | null;
  share_token: string | null;
  admin_feedback: string | null;
  auto_approved: boolean | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string } | null;
}

interface UserTopicsTabProps {
  onOpenCreateModal: () => void;
  onOpenImportModal?: () => void;
}

export function UserTopicsTab({ onOpenCreateModal, onOpenImportModal }: UserTopicsTabProps) {
  const [topics, setTopics] = useState<UserTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const loadUserTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/topics');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed loading your topics');
      setTopics(data.topics || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading user topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserTopics();
  }, []);

  const handleSubmitForReview = async (topicId: string) => {
    setActionLoadingId(topicId);
    try {
      const res = await fetch(`/api/user/topics/${topicId}/submit`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      alert(data.message || 'Topic submitted for review!');
      await loadUserTopics();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTogglePublish = async (topicId: string, currentPubStatus: string | null, approvalStatus: string | null) => {
    if (approvalStatus !== 'APPROVED') {
      alert('Topic must be APPROVED by an administrator before it can be published.');
      return;
    }

    const nextPubStatus = currentPubStatus === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
    setActionLoadingId(topicId);

    try {
      const res = await fetch(`/api/user/topics/${topicId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publication_status: nextPubStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publish toggle failed');

      await loadUserTopics();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Publish toggle failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleVisibility = async (topicId: string, currentVisibility: string | null) => {
    const nextVisibility = currentVisibility === 'LINK_ONLY' ? 'PUBLIC' : 'LINK_ONLY';
    setActionLoadingId(topicId);

    try {
      const res = await fetch(`/api/user/topics/${topicId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: nextVisibility }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Visibility toggle failed');

      await loadUserTopics();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Visibility toggle failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyLink = (shareToken: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(shareToken);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRegenerateLink = async (topicId: string) => {
    if (!confirm('Are you sure you want to regenerate the share link? Any previously shared link will be immediately revoked.')) {
      return;
    }

    setActionLoadingId(topicId);
    try {
      const res = await fetch(`/api/user/topics/${topicId}/regenerate-link`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Regenerate link failed');

      alert('Share link regenerated successfully!');
      await loadUserTopics();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed regenerating link');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportJSON = async (topicId: string, slug: string) => {
    try {
      const res = await fetch(`/api/user/topics/${topicId}/export`);
      if (!res.ok) throw new Error('Export failed');
      const jsonDoc = await res.json();

      const blob = new Blob([JSON.stringify(jsonDoc, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swallern-topic-${slug}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            My Educational Topics ({topics.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
            Manage your created topics, submit for admin approval, publish publicly, or share privately.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              style={{
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                padding: '0.75rem 1.15rem',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Import Topic JSON</span>
            </button>
          )}

          <button
            onClick={onOpenCreateModal}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>+ Create Topic</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', color: '#991B1B', padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B', fontWeight: 600 }}>
          Loading your topics…
        </div>
      ) : topics.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            border: '2px dashed #CBD5E1',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
            No Created Topics Yet
          </h3>
          <p style={{ color: '#64748B', fontWeight: 500, fontSize: '0.92rem', margin: '0 0 20px', maxWidth: '460px', marginInline: 'auto' }}>
            Share your curiosity with the world! Create a custom topic manually or import a ready Swallern Topic JSON document.
          </p>
          <button
            onClick={onOpenCreateModal}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.8rem 1.6rem',
              borderRadius: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Create Your First Topic</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {topics.map((t) => {
            const approval = t.approval_status || 'DRAFT';
            const publication = t.publication_status || 'UNPUBLISHED';
            const visibility = t.visibility || 'PUBLIC';

            return (
              <div
                key={t.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '2px solid #E2E8F0',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  {/* Status Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {/* Approval Status Badge */}
                    <span style={getApprovalBadgeStyle(approval)}>
                      {approval === 'DRAFT' && 'Draft'}
                      {approval === 'PENDING_REVIEW' && 'Pending Review'}
                      {approval === 'APPROVED' && 'Approved'}
                      {approval === 'CHANGES_REQUESTED' && 'Changes Requested'}
                      {approval === 'REJECTED' && 'Rejected'}
                    </span>

                    {/* Publication Status Badge */}
                    <span style={getPublicationBadgeStyle(publication)}>
                      {publication === 'PUBLISHED' ? 'Published' : 'Unpublished'}
                    </span>

                    {/* Visibility Badge */}
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                      {visibility === 'LINK_ONLY' ? 'Link-Only' : 'Public'}
                    </span>

                    {/* Auto Approved Badge */}
                    {t.auto_approved && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                        Auto-Approved
                      </span>
                    )}
                  </div>

                  {/* Title & Category */}
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {t.categories?.name || 'General'}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '4px 0 8px', lineHeight: 1.3 }}>
                    {t.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.summary || 'No summary provided.'}
                  </p>

                  {/* Admin Feedback Box */}
                  {t.admin_feedback && (
                    <div
                      style={{
                        marginTop: '12px',
                        backgroundColor: approval === 'CHANGES_REQUESTED' ? '#FFFBEB' : approval === 'REJECTED' ? '#FEF2F2' : '#F8FAFC',
                        border: `1.5px solid ${approval === 'CHANGES_REQUESTED' ? '#FDE68A' : approval === 'REJECTED' ? '#FCA5A5' : '#E2E8F0'}`,
                        borderRadius: '12px',
                        padding: '10px 12px',
                        fontSize: '0.82rem',
                      }}
                    >
                      <strong style={{ color: approval === 'REJECTED' ? '#991B1B' : '#92400E', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Reviewer Feedback:</span>
                      </strong>
                      <span style={{ color: '#334155' }}>{t.admin_feedback}</span>
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div style={{ borderTop: '2px solid #F1F5F9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Row 1: Submit / Publish Controls */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(approval === 'DRAFT' || approval === 'CHANGES_REQUESTED') && (
                      <button
                        onClick={() => handleSubmitForReview(t.id)}
                        disabled={actionLoadingId === t.id}
                        style={{
                          flex: 1,
                          backgroundColor: '#4F46E5',
                          color: '#FFF',
                          border: 'none',
                          padding: '7px 12px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        {actionLoadingId === t.id ? 'Submitting…' : 'Submit for Review'}
                      </button>
                    )}

                    {approval === 'APPROVED' && (
                      <button
                        onClick={() => handleTogglePublish(t.id, publication, approval)}
                        disabled={actionLoadingId === t.id}
                        style={{
                          flex: 1,
                          backgroundColor: publication === 'PUBLISHED' ? '#FEF2F2' : '#10B981',
                          color: publication === 'PUBLISHED' ? '#DC2626' : '#FFFFFF',
                          border: 'none',
                          padding: '7px 12px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        {publication === 'PUBLISHED' ? 'Unpublish' : 'Publish Live'}
                      </button>
                    )}

                    {publication === 'PUBLISHED' && (
                      <button
                        onClick={() => handleToggleVisibility(t.id, visibility)}
                        disabled={actionLoadingId === t.id}
                        style={{
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          border: '1px solid #CBD5E1',
                          padding: '7px 12px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        {visibility === 'LINK_ONLY' ? 'Make Public' : 'Make Link-Only'}
                      </button>
                    )}
                  </div>

                  {/* Row 2: Private Share Link Bar */}
                  {publication === 'PUBLISHED' && visibility === 'LINK_ONLY' && t.share_token && (
                    <div style={{ backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1E40AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span>/shared/{t.share_token.slice(0, 12)}…</span>
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleCopyLink(t.share_token!)}
                          style={{ backgroundColor: '#2563EB', color: '#FFF', border: 'none', padding: '4px 8px', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {copiedToken === t.share_token ? (
                            <>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>Copied!</span>
                            </>
                          ) : (
                            'Copy'
                          )}
                        </button>
                        <button
                          onClick={() => handleRegenerateLink(t.id)}
                          style={{ backgroundColor: '#FFFFFF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '4px 8px', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          title="Revoke and generate new link"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Row 3: Export & View Links */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                    <button
                      onClick={() => handleExportJSON(t.id, t.slug)}
                      style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Export JSON 1.0</span>
                    </button>

                    {publication === 'PUBLISHED' && (
                      <Link
                        href={visibility === 'LINK_ONLY' && t.share_token ? `/shared/${t.share_token}` : `/topics/${t.slug}`}
                        target="_blank"
                        style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>View Page</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getApprovalBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: '0.72rem',
    fontWeight: 800,
    padding: '3px 10px',
    borderRadius: '12px',
  };

  switch (status) {
    case 'APPROVED':
      return { ...base, backgroundColor: '#ECFDF5', color: '#059669' };
    case 'PENDING_REVIEW':
      return { ...base, backgroundColor: '#FFFBEB', color: '#D97706' };
    case 'CHANGES_REQUESTED':
      return { ...base, backgroundColor: '#F3E8FF', color: '#7E22CE' };
    case 'REJECTED':
      return { ...base, backgroundColor: '#FEF2F2', color: '#DC2626' };
    default:
      return { ...base, backgroundColor: '#F1F5F9', color: '#64748B' };
  }
}

function getPublicationBadgeStyle(status: string): React.CSSProperties {
  return {
    fontSize: '0.72rem',
    fontWeight: 800,
    padding: '3px 10px',
    borderRadius: '12px',
    backgroundColor: status === 'PUBLISHED' ? '#EEF2FF' : '#F8FAFC',
    color: status === 'PUBLISHED' ? '#4F46E5' : '#64748B',
    border: status === 'PUBLISHED' ? 'none' : '1px solid #E2E8F0',
  };
}
