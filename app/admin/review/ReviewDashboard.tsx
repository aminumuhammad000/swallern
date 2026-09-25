'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface ReviewTopic {
  id: string;
  title: string;
  slug: string;
  status: string;
  summary: string | null;
  created_at: string;
}

interface EntityResolutionData {
  query: string;
  detected_entity: string;
  confidence_score: number;
  alternative_meanings: string[];
  duplicate_status: string;
  is_ambiguous: boolean;
}

interface ClaimData {
  id: string;
  claim_text: string;
  status: string;
  notes?: string | null;
  sources?: Array<{ id: string; title: string; url: string; publisher?: string }>;
}

interface VisualBriefData {
  educationalPurpose?: string;
  mainConcept?: string;
  requiredVisualElements?: string[];
  recommendedStyle?: string;
  prohibitedElements?: string[];
  formattedPrompt?: string;
}

interface AssetData {
  id: string;
  url: string;
  provider: string;
  model?: string;
  prompt: string;
  status: string;
  approval_state: string;
  visual_brief?: VisualBriefData;
  metadata?: {
    visual_brief?: VisualBriefData;
  };
}

interface ReviewPayload {
  topic: ReviewTopic;
  entityResolution: EntityResolutionData;
  version?: {
    quick_answer?: string;
    explanation?: string;
    key_concepts?: Array<{ title: string; description: string }>;
  } | null;
  claims: ClaimData[];
  sources: Array<{ id: string; title: string; url: string; publisher?: string; reliability_score?: number }>;
  lessons: Array<{
    id: string;
    title: string;
    summary?: string;
    sections?: Array<{ id: string; title: string; content: string; key_takeaway?: string }>;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    questions?: Array<{
      id: string;
      question_text: string;
      options?: Array<{ id: string; option_text: string; is_correct: boolean }>;
    }>;
  }>;
  assets: AssetData[];
}

import { UserTopicsModeration } from '@/components/admin/UserTopicsModeration';

export function ReviewDashboard({ initialTopicId }: { initialTopicId?: string }) {
  const [viewTab, setViewTab] = useState<'system-topics' | 'user-topics'>('system-topics');
  const [topics, setTopics] = useState<ReviewTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || '');
  const [data, setData] = useState<ReviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Fetch List of Topics Available for Review
  const fetchTopicsList = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/review');
      const json = await res.json();
      if (json.topics) {
        setTopics(json.topics);
        if (!selectedTopicId && json.topics.length > 0) {
          setSelectedTopicId(json.topics[0].id);
        }
      }
    } catch {
      // Ignore
    }
  }, [selectedTopicId]);

  // 2. Fetch Full Consolidated Topic Review Data
  const fetchTopicData = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/review?topic_id=${id}`);
      const json = await res.json();
      if (json.topic) {
        setData(json);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopicsList();
  }, [fetchTopicsList]);

  useEffect(() => {
    if (selectedTopicId) {
      fetchTopicData(selectedTopicId);
    }
  }, [selectedTopicId, fetchTopicData]);

  // Handle Main Topic Decisions (Approve, Reject, Revision)
  const handleTopicAction = async (action: 'approve_topic' | 'reject_topic' | 'request_revision') => {
    if (!selectedTopicId) return;
    setActionLoading(action);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, topic_id: selectedTopicId }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      let actionLabel = 'approved & published live!';
      if (action === 'reject_topic') actionLabel = 'rejected.';
      if (action === 'request_revision') actionLabel = 'marked for revision.';

      setMessage({ type: 'success', text: `Topic status successfully updated: ${actionLabel}` });
      await fetchTopicsList();
      await fetchTopicData(selectedTopicId);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Action failed' });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Claim Status Review
  const handleClaimStatusChange = async (claimId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_claim_status', claim_id: claimId, claim_status: newStatus }),
      });
      const json = await res.json();
      if (json.success && selectedTopicId) {
        await fetchTopicData(selectedTopicId);
      }
    } catch {
      // Ignore
    }
  };

  // Handle Asset Image Approval Review
  const handleAssetApprovalChange = async (assetId: string, approvalState: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_asset_approval', asset_id: assetId, asset_approval: approvalState }),
      });
      const json = await res.json();
      if (json.success && selectedTopicId) {
        await fetchTopicData(selectedTopicId);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Bar Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            Swallern Unified Content Review Dashboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.2rem 0 0 0' }}>
            Single editorial place to inspect Entity Resolution, Claims, Learning Content, Visual Briefs & Images before publishing.
          </p>
        </div>

        {/* Topic Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Select Topic:</label>
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: '#fff',
            }}
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.status})
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Tab Switcher: System Topics Review vs User Topics Moderation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setViewTab('system-topics')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: viewTab === 'system-topics' ? '#EEF2FF' : '#F3F4F6',
            color: viewTab === 'system-topics' ? '#4F46E5' : '#4B5563',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          📋 System Topics Review
        </button>

        <button
          onClick={() => setViewTab('user-topics')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: viewTab === 'user-topics' ? '#EEF2FF' : '#F3F4F6',
            color: viewTab === 'user-topics' ? '#4F46E5' : '#4B5563',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          👤 User Topics Moderation & Settings
        </button>
      </div>

      {viewTab === 'user-topics' && <UserTopicsModeration />}

      {viewTab === 'system-topics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Alert Notification */}
          {message && (
            <div
              style={{
                background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                color: message.type === 'success' ? '#166534' : '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
              }}
            >
              {message.text}
            </div>
          )}

          {loading || !data ? (
            <div style={cardStyle}>Loading topic content review payload...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Action Bar */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Topic Status: </span>
              <span style={statusBadgeStyle(data.topic.status)}>{data.topic.status}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                disabled={actionLoading === 'approve_topic'}
                onClick={() => handleTopicAction('approve_topic')}
                style={approveBtnStyle}
              >
                {actionLoading === 'approve_topic' ? 'Publishing...' : 'Approve & Publish Live 🚀'}
              </button>
              <button
                disabled={actionLoading === 'request_revision'}
                onClick={() => handleTopicAction('request_revision')}
                style={revisionBtnStyle}
              >
                Request Revision ✏️
              </button>
              <button
                disabled={actionLoading === 'reject_topic'}
                onClick={() => handleTopicAction('reject_topic')}
                style={rejectBtnStyle}
              >
                Reject Topic ❌
              </button>
            </div>
          </div>

          {/* Section 1: Topic & Entity Resolution */}
          <div style={cardStyle}>
            <h2 style={sectionHeaderStyle}>1. Topic & Entity Resolution</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>{data.topic.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.2rem' }}>
                  Slug: <code>{data.topic.slug}</code> | ID: <code>{data.topic.id.slice(0, 8)}</code>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  {data.topic.summary || 'No summary provided.'}
                </p>
              </div>

              {/* Entity Resolution Card */}
              <div
                style={{
                  background: data.entityResolution.is_ambiguous ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${data.entityResolution.is_ambiguous ? '#fde68a' : '#bbf7d0'}`,
                  borderRadius: '6px',
                  padding: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#111827' }}>Entity Resolution Analysis:</strong>
                  {data.entityResolution.is_ambiguous ? (
                    <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                      ⚠️ AMBIGUOUS ENTITY
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                      ✓ CONFIRMED ENTITY
                    </span>
                  )}
                </div>

                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div><strong>Detected Entity:</strong> {data.entityResolution.detected_entity}</div>
                  <div><strong>Confidence Score:</strong> {Math.round(data.entityResolution.confidence_score * 100)}%</div>
                  {data.entityResolution.alternative_meanings.length > 0 && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <strong>Alternative Meanings:</strong>
                      <ul style={{ margin: '0.2rem 0 0 1rem', padding: 0, fontSize: '0.78rem', color: '#4b5563' }}>
                        {data.entityResolution.alternative_meanings.map((alt, i) => (
                          <li key={i}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Research & Verification */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={sectionHeaderStyle}>2. Research & Claim Verification</h2>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                Total Claims: <strong>{data.claims.length}</strong> | Sources: <strong>{data.sources.length}</strong>
              </div>
            </div>

            {/* Claims Table */}
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.claims.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No extracted claims found for this topic.</div>
              ) : (
                data.claims.map((claim) => (
                  <div
                    key={claim.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>&ldquo;{claim.claim_text}&rdquo;</div>
                      {claim.notes && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Notes: {claim.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <select
                        value={claim.status}
                        onChange={(e) => handleClaimStatusChange(claim.id, e.target.value)}
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.3rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontWeight: 600,
                          background: claim.status === 'VERIFIED' || claim.status === 'SUPPORTED' ? '#dcfce7' : claim.status === 'DISPUTED' || claim.status === 'REFUTED' ? '#fee2e2' : '#f1f5f9',
                          color: claim.status === 'VERIFIED' || claim.status === 'SUPPORTED' ? '#166534' : claim.status === 'DISPUTED' || claim.status === 'REFUTED' ? '#991b1b' : '#334155',
                        }}
                      >
                        <option value="UNVERIFIED">UNVERIFIED</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="SUPPORTED">SUPPORTED</option>
                        <option value="DISPUTED">DISPUTED</option>
                        <option value="REFUTED">REFUTED</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Authoritative Sources List */}
            {data.sources.length > 0 && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Authoritative Sources ({data.sources.length}):</strong>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  {data.sources.map((src) => (
                    <a
                      key={src.id}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.78rem',
                        color: '#2563eb',
                        textDecoration: 'none',
                        background: '#eff6ff',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      🔗 {src.title || src.publisher || 'Reference Link'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Learning Content Preview */}
          <div style={cardStyle}>
            <h2 style={sectionHeaderStyle}>3. Learning Content Preview</h2>

            {/* Explanation & Quick Answer */}
            {data.version && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                {data.version.quick_answer && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.75rem' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#166534' }}>Quick Answer:</strong>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#14532d' }}>{data.version.quick_answer}</p>
                  </div>
                )}

                {data.version.explanation && (
                  <div style={{ background: '#fafafa', border: '1px solid #f3f4f6', borderRadius: '6px', padding: '0.75rem' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#374151' }}>📖 Topic Explanation:</strong>
                    <div style={{ fontSize: '0.85rem', color: '#1f2937', whiteSpace: 'pre-line', marginTop: '0.2rem', lineHeight: 1.5 }}>
                      {data.version.explanation}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lessons & Sections */}
            <div style={{ marginTop: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#334155' }}>Lessons ({data.lessons.length}):</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
                {data.lessons.map((lesson, idx) => (
                  <div key={lesson.id} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.6rem 0.8rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                      Lesson {idx + 1}: {lesson.title}
                    </div>
                    {lesson.sections && lesson.sections.map((sec, sIdx) => (
                      <div key={sec.id || sIdx} style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.25rem', paddingLeft: '0.75rem' }}>
                        • <strong>{sec.title}:</strong> {sec.content.slice(0, 120)}...
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Quizzes Preview */}
            {data.quizzes.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#334155' }}>Quiz Questions ({data.quizzes[0]?.questions?.length || 0}):</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
                  {data.quizzes[0]?.questions?.map((q, qIdx) => (
                    <div key={q.id || qIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.8rem' }}>
                      <strong style={{ color: '#1e293b' }}>Q{qIdx + 1}: {q.question_text}</strong>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                        {q.options?.map((opt, oIdx) => (
                          <span
                            key={opt.id || oIdx}
                            style={{
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              background: opt.is_correct ? '#dcfce7' : '#f1f5f9',
                              color: opt.is_correct ? '#166534' : '#475569',
                              fontWeight: opt.is_correct ? 700 : 400,
                            }}
                          >
                            {opt.option_text} {opt.is_correct ? '✓' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Generated Images & Visual Briefs */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={sectionHeaderStyle}>4. Generated Educational Assets & Visual Briefs</h2>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total Assets: <strong>{data.assets.length}</strong></div>
            </div>

            {data.assets.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                No generated image assets found for this topic yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
                {data.assets.map((asset) => {
                  const brief = asset.visual_brief || asset.metadata?.visual_brief;
                  const isApproved = asset.approval_state === 'APPROVED';

                  return (
                    <div
                      key={asset.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex',
                        gap: '1.25rem',
                      }}
                    >
                      {/* Image Thumbnail */}
                      <div style={{ width: '220px', flexShrink: 0 }}>
                        <img
                          src={asset.url}
                          alt={asset.prompt}
                          style={{
                            width: '100%',
                            height: '140px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <span style={assetBadgeStyle(asset.approval_state)}>{asset.approval_state}</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{asset.provider}</span>
                        </div>
                      </div>

                      {/* Visual Brief Details */}
                      <div style={{ flex: 1, fontSize: '0.82rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          Visual Brief Breakdown
                        </div>

                        {brief ? (
                          <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: '#334155' }}>
                            <div><strong>Educational Purpose:</strong> {brief.educationalPurpose || 'N/A'}</div>
                            <div><strong>Main Concept:</strong> {brief.mainConcept || 'N/A'}</div>
                            <div><strong>Recommended Style:</strong> {brief.recommendedStyle || 'N/A'}</div>
                            {brief.requiredVisualElements && brief.requiredVisualElements.length > 0 && (
                              <div>
                                <strong>Required Visual Elements:</strong> {brief.requiredVisualElements.join(' • ')}
                              </div>
                            )}
                            {brief.prohibitedElements && brief.prohibitedElements.length > 0 && (
                              <div style={{ color: '#991b1b' }}>
                                <strong>Prohibited Elements:</strong> {brief.prohibitedElements.join(' • ')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ color: '#64748b', marginTop: '0.25rem' }}>
                            Prompt: <em>{asset.prompt}</em>
                          </div>
                        )}

                        {/* Image Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button
                            disabled={isApproved}
                            onClick={() => handleAssetApprovalChange(asset.id, 'APPROVED')}
                            style={{
                              backgroundColor: isApproved ? '#9ca3af' : '#16a34a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: isApproved ? 'default' : 'pointer',
                            }}
                          >
                            {isApproved ? '✓ Image Approved' : 'Approve Image ✓'}
                          </button>
                          <button
                            onClick={() => handleAssetApprovalChange(asset.id, 'REJECTED')}
                            style={{
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            Reject Image ✗
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )}
</div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '1.25rem',
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 700,
  color: '#1e1b4b',
  margin: 0,
};

const approveBtnStyle: React.CSSProperties = {
  backgroundColor: '#16a34a',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '0.55rem 1.1rem',
  fontSize: '0.82rem',
  fontWeight: 700,
  cursor: 'pointer',
};

const revisionBtnStyle: React.CSSProperties = {
  backgroundColor: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '0.55rem 1rem',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const rejectBtnStyle: React.CSSProperties = {
  backgroundColor: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '0.55rem 1rem',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
};

function statusBadgeStyle(status: string): React.CSSProperties {
  const isPublished = status === 'PUBLISHED';
  const isRejected = status === 'REJECTED';

  return {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    background: isPublished ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
    color: isPublished ? '#166534' : isRejected ? '#991b1b' : '#92400e',
  };
}

function assetBadgeStyle(state: string): React.CSSProperties {
  const isApproved = state === 'APPROVED';
  const isRejected = state === 'REJECTED';

  return {
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    background: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
    color: isApproved ? '#166534' : isRejected ? '#991b1b' : '#92400e',
  };
}
