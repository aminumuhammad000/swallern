'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LearnerCoursePreview } from '@/components/dashboard/LearnerCoursePreview';

export interface AdminUserTopic {
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
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  counts?: {
    lessons: number;
    quizzes: number;
    sources: number;
  };
}

export function UserTopicsModeration() {
  const [topics, setTopics] = useState<AdminUserTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [autoApproveSetting, setAutoApproveSetting] = useState<boolean>(false);
  const [settingLoading, setSettingLoading] = useState(false);

  // Review Feedback Modal State
  const [selectedTopic, setSelectedTopic] = useState<AdminUserTopic | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [inspectingCourse, setInspectingCourse] = useState<any>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setAutoApproveSetting(Boolean(data.settings.auto_approve_user_topics));
      }
    } catch (err) {
      console.error('Failed fetching admin settings:', err);
    }
  };

  const fetchUserTopics = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterStatus !== 'ALL' ? `/api/admin/user-topics?status=${filterStatus}` : '/api/admin/user-topics';
      const res = await fetch(url);
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err) {
      console.error('Failed fetching user topics:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchSettings();
    fetchUserTopics();
  }, [fetchUserTopics]);

  const handleToggleAutoApprove = async () => {
    setSettingLoading(true);
    const nextVal = !autoApproveSetting;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_approve_user_topics: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setAutoApproveSetting(Boolean(data.settings.auto_approve_user_topics));
      }
    } catch (err) {
      alert('Failed updating auto-approval setting');
    } finally {
      setSettingLoading(false);
    }
  };

  const handleOpenReviewModal = (topic: AdminUserTopic, action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES') => {
    setSelectedTopic(topic);
    setReviewAction(action);
    setFeedbackText(
      action === 'APPROVE'
        ? 'Approved by administrator.'
        : action === 'REQUEST_CHANGES'
        ? 'Please add verified source links for your key claims before publication.'
        : 'Topic does not meet Swallern community standards.'
    );
  };

  const handleExecuteReviewAction = async () => {
    if (!selectedTopic || !reviewAction) return;

    setActionSubmitting(true);
    try {
      const res = await fetch(`/api/admin/user-topics/${selectedTopic.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: reviewAction,
          feedback: feedbackText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      alert(`Review action "${reviewAction}" applied to "${selectedTopic.title}"`);
      setSelectedTopic(null);
      setReviewAction(null);
      await fetchUserTopics();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Review action failed');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleUnpublish = async (topicId: string) => {
    if (!confirm('Are you sure you want to unpublish this topic?')) return;
    try {
      const res = await fetch(`/api/admin/user-topics/${topicId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UNPUBLISH' }),
      });
      if (res.ok) fetchUserTopics();
    } catch (err) {
      alert('Failed unpublishing topic');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* PLATFORM SETTINGS BANNER (Auto-Approval Toggle)               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #E2E8F0',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              ⚙️ Auto-Approve User Topics
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: autoApproveSetting ? '#ECFDF5' : '#F1F5F9',
                color: autoApproveSetting ? '#059669' : '#64748B',
                border: autoApproveSetting ? '1.5px solid #A7F3D0' : '1.5px solid #CBD5E1',
              }}
            >
              {autoApproveSetting ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, maxWidth: '640px' }}>
            When enabled, user-submitted topics that pass automated quality and research checks are approved automatically. When disabled (default), all user topics require manual admin approval.
          </p>
        </div>

        <button
          onClick={handleToggleAutoApprove}
          disabled={settingLoading}
          style={{
            backgroundColor: autoApproveSetting ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {settingLoading ? 'Saving…' : autoApproveSetting ? 'Disable Auto-Approval' : 'Enable Auto-Approval'}
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* FILTER TABS & SUBMISSIONS LIST                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '2px solid #E2E8F0', padding: '1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #F1F5F9', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: filterStatus === st ? '#4F46E5' : '#F1F5F9',
                color: filterStatus === st ? '#FFFFFF' : '#475569',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {st === 'ALL' && 'All Submissions'}
              {st === 'PENDING_REVIEW' && '⏳ Pending Review'}
              {st === 'APPROVED' && '✅ Approved'}
              {st === 'CHANGES_REQUESTED' && '⚠️ Changes Requested'}
              {st === 'REJECTED' && '❌ Rejected'}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B', fontWeight: 600 }}>
            Loading user topics…
          </div>
        ) : topics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B', fontWeight: 500 }}>
            No user topics found for filter &ldquo;{filterStatus}&rdquo;.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topics.map((t) => (
              <div
                key={t.id}
                style={{
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '8px' }}>
                        {t.categories?.name || 'General'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                        By: {t.owner?.name} ({t.owner?.email})
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {t.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.4 }}>
                      {t.summary || 'No summary provided.'}
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={getAdminApprovalStyle(t.approval_status)}>
                      {t.approval_status || 'DRAFT'}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', backgroundColor: t.publication_status === 'PUBLISHED' ? '#EEF2FF' : '#F1F5F9', color: t.publication_status === 'PUBLISHED' ? '#4F46E5' : '#64748B' }}>
                      {t.publication_status || 'UNPUBLISHED'}
                    </span>
                    {t.auto_approved && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669' }}>
                        ⚡ Auto-Approved
                      </span>
                    )}
                  </div>
                </div>

                {/* Counts & Feedback */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', fontWeight: 600, borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span>📖 Lessons: {t.counts?.lessons || 0}</span>
                    <span>❓ Quizzes: {t.counts?.quizzes || 0}</span>
                    <span>🔗 Sources: {t.counts?.sources || 0}</span>
                  </div>

                  {t.admin_feedback && (
                    <div style={{ fontStyle: 'italic', color: '#475569' }}>
                      Note: &ldquo;{t.admin_feedback}&rdquo;
                    </div>
                  )}
                </div>

                {/* Moderation Actions Toolbar */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/user/topics/${t.id}`);
                        const data = await res.json();
                        if (res.ok) {
                          setInspectingCourse({
                            title: t.title,
                            summary: t.summary || '',
                            category: t.categories?.name || 'General',
                            difficulty: t.difficulty || 'BEGINNER',
                            sections: [
                              {
                                title: data.lesson?.title || 'Core Module',
                                lessons: [
                                  {
                                    title: data.lesson?.title || t.title,
                                    content: data.version?.explanation || t.summary || '',
                                    key_concept: data.version?.key_concepts?.[0]?.title || data.version?.key_concepts?.[0],
                                    media: data.media,
                                    knowledge_check: data.quiz?.questions?.[0] ? {
                                      question: data.quiz.questions[0].question,
                                      explanation: data.quiz.questions[0].explanation,
                                      options: data.quiz.questions[0].options?.map((o: any) => ({
                                        text: o.option_text,
                                        is_correct: o.is_correct,
                                      })),
                                    } : undefined,
                                  },
                                ],
                              },
                            ],
                            quiz: data.quiz ? {
                              title: data.quiz.title,
                              questions: data.quiz.questions?.map((q: any) => ({
                                question: q.question,
                                explanation: q.explanation,
                                options: q.options?.map((o: any) => ({ text: o.option_text, is_correct: o.is_correct })),
                              })),
                            } : undefined,
                            sources: data.sources,
                          });
                        }
                      } catch (err) {
                        alert('Failed loading course preview data');
                      }
                    }}
                    style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', border: '1.5px solid #C7D2FE', padding: '6px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    👁️ Inspect Course Preview
                  </button>

                  <button
                    onClick={() => handleOpenReviewModal(t, 'APPROVE')}
                    style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    ✅ Approve Topic
                  </button>

                  <button
                    onClick={() => handleOpenReviewModal(t, 'REQUEST_CHANGES')}
                    style={{ backgroundColor: '#F59E0B', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    💬 Request Changes
                  </button>

                  <button
                    onClick={() => handleOpenReviewModal(t, 'REJECT')}
                    style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    ❌ Reject
                  </button>

                  {t.publication_status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleUnpublish(t.id)}
                      style={{ backgroundColor: '#64748B', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      🔒 Unpublish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* REVIEW ACTION MODAL                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedTopic && reviewAction && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.5rem 1.75rem', width: '100%', maxWidth: '520px', border: '2px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Confirm Moderation Action: {reviewAction}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 14px' }}>
              Topic: <strong>{selectedTopic.title}</strong>
            </p>

            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Feedback Note to User Creator:
            </label>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.88rem',
                fontWeight: 500,
                marginBottom: '1rem',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedTopic(null)}
                style={{ backgroundColor: '#F1F5F9', color: '#475569', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReviewAction}
                disabled={actionSubmitting}
                style={{
                  backgroundColor: reviewAction === 'APPROVE' ? '#10B981' : reviewAction === 'REJECT' ? '#EF4444' : '#F59E0B',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {actionSubmitting ? 'Applying…' : `Confirm ${reviewAction}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Learner Experience Preview Modal */}
      {inspectingCourse && (
        <LearnerCoursePreview
          courseData={inspectingCourse}
          onClose={() => setInspectingCourse(null)}
        />
      )}
    </div>
  );
}

function getAdminApprovalStyle(status: string | null): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: '0.72rem',
    fontWeight: 800,
    padding: '3px 10px',
    borderRadius: '10px',
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
