'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Candidate {
  id: string;
  query: string;
  slug: string;
  source: string;
  popularity_score: number;
  educational_score: number;
  score_breakdown: {
    curiosity: number;
    educational_domain: number;
    momentum: number;
    clarity: number;
    safety: number;
    ambiguity_penalty?: number;
    detected_entity?: string;
    confidence_score?: number;
    alternative_meanings?: string[];
    is_ambiguous?: boolean;
  };
  duplicate_status: string;
  matched_topic_id?: string | null;
  status: string;
  created_at: string;
  detected_entity?: string;
  confidence_score?: number;
  alternative_meanings?: string[];
}

interface PipelineJob {
  id: string;
  job_type: string;
  status: string;
  attempts: number;
  max_attempts: number;
  error_message?: string | null;
  created_at: string;
}

interface TopicDraftReview {
  id: string;
  title: string;
  slug: string;
  status: string;
  summary: string | null;
  created_at: string;
}

export default function PipelineDashboardPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'review' | 'jobs'>('queue');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [draftTopics, setDraftTopics] = useState<TopicDraftReview[]>([]);
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Entity selection modal state for ambiguous candidates
  const [ambiguousCandidate, setAmbiguousCandidate] = useState<Candidate | null>(null);
  const [selectedEntityChoice, setSelectedEntityChoice] = useState<string>('');
  const [customEntityInput, setCustomEntityInput] = useState<string>('');
  const [notificationConfig, setNotificationConfig] = useState<{ configured: boolean; providerName: string; adminEmail: string } | null>(null);

  // 1. Fetch Candidates Queue
  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pipeline/candidates?status=DISCOVERED');
      const data = await res.json();
      if (data.candidates) setCandidates(data.candidates);
      if (data.notification_config) setNotificationConfig(data.notification_config);
    } catch {
      // Ignore
    }
  }, []);

  // 2. Fetch Review Queue (Draft Topics)
  const fetchDraftTopics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/topics');
      const data = await res.json();
      if (data.topics) {
        const pendingReview = data.topics.filter(
          (t: TopicDraftReview) => t.status === 'DRAFT' || t.status === 'REVIEW' || t.status === 'RESEARCHING'
        );
        setDraftTopics(pendingReview);
      }
    } catch {
      // Ignore
    }
  }, []);

  // 3. Fetch Jobs
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pipeline/jobs?limit=25');
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
    } catch {
      // Ignore
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCandidates(), fetchDraftTopics(), fetchJobs()]);
    setLoading(false);
  }, [fetchCandidates, fetchDraftTopics, fetchJobs]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Ingest Fresh Trends
  const handleIngest = async () => {
    setIngesting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/pipeline/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ingest' }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage({
        type: 'success',
        text: `Ingested ${data.ingestedCount || 0} fresh educational trend candidates with entity resolution!`,
      });
      await refreshAll();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Ingestion failed',
      });
    } finally {
      setIngesting(false);
    }
  };

  // Approve Candidate -> Create Topic + Research + AI Draft
  const handleApproveCandidate = async (candidate: Candidate, confirmedEntity?: string) => {
    const isAmbiguous =
      candidate.score_breakdown?.is_ambiguous ||
      candidate.duplicate_status === 'AMBIGUOUS' ||
      (candidate.score_breakdown?.confidence_score && candidate.score_breakdown.confidence_score < 0.70);

    // If ambiguous and no entity confirmed yet, open modal for admin decision
    if (isAmbiguous && !confirmedEntity) {
      setAmbiguousCandidate(candidate);
      const alternatives = candidate.score_breakdown?.alternative_meanings || candidate.alternative_meanings || [];
      setSelectedEntityChoice(alternatives[0] || candidate.query);
      return;
    }

    setActionLoading(candidate.id);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/pipeline/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          candidate_id: candidate.id,
          confirmed_entity: confirmedEntity || selectedEntityChoice || customEntityInput || candidate.query,
        }),
      });
      const data = await res.json();

      if (data.requires_entity_confirmation) {
        setAmbiguousCandidate(candidate);
        setSelectedEntityChoice(data.alternative_meanings?.[0] || candidate.query);
        return;
      }

      if (data.error) throw new Error(data.error);

      setMessage({
        type: 'success',
        text: `Opportunity "${candidate.query}" approved for "${data.confirmed_entity || 'selected entity'}". Automated Research & AI Draft completed.`,
      });
      setAmbiguousCandidate(null);
      await refreshAll();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Approval failed',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Confirm Entity Choice Modal Submission
  const handleConfirmEntityChoice = () => {
    if (!ambiguousCandidate) return;
    const finalEntity = customEntityInput.trim() || selectedEntityChoice || ambiguousCandidate.query;
    handleApproveCandidate(ambiguousCandidate, finalEntity);
  };

  // Reject Candidate
  const handleRejectCandidate = async (candidateId: string) => {
    try {
      await fetch('/api/admin/pipeline/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', candidate_id: candidateId }),
      });
      await fetchCandidates();
    } catch {
      // Ignore
    }
  };

  // Human Approval & Publish Action
  const handlePublishTopic = async (topicId: string) => {
    setActionLoading(topicId);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/pipeline/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topicId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage({
        type: 'success',
        text: `Topic "${data.topic?.title}" has been approved & published live!`,
      });
      await refreshAll();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Publish failed',
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Automated Content Pipeline Engine
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
            Trend Discovery → Entity Resolution → Educational Scoring → Deduplication → Automated Research → AI Draft → Human Approval
          </p>
        </div>

        <button
          disabled={ingesting}
          onClick={handleIngest}
          style={{
            backgroundColor: ingesting ? '#9ca3af' : '#4f46e5',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            border: 'none',
            cursor: ingesting ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          {ingesting ? 'Ingesting Trends...' : 'Ingest Fresh Trends'}
        </button>
      </div>

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

      {/* Ambiguous Entity Confirmation Modal */}
      {ambiguousCandidate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1.5rem',
              maxWidth: '520px',
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#92400e' }}>
              ⚠️ Ambiguous Entity Meaning Confirmation
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563' }}>
              The trend keyword <strong>&ldquo;{ambiguousCandidate.query}&rdquo;</strong> matches multiple candidate interpretations with low automatic confidence. Please confirm the exact educational entity before generating content:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(
                ambiguousCandidate.score_breakdown?.alternative_meanings ||
                ambiguousCandidate.alternative_meanings ||
                [ambiguousCandidate.query]
              ).map((meaning) => (
                <label
                  key={meaning}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#111827',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: selectedEntityChoice === meaning ? '#f0f9ff' : '#fff',
                  }}
                >
                  <input
                    type="radio"
                    name="entity_choice"
                    value={meaning}
                    checked={selectedEntityChoice === meaning}
                    onChange={(e) => {
                      setSelectedEntityChoice(e.target.value);
                      setCustomEntityInput('');
                    }}
                  />
                  <span>{meaning}</span>
                </label>
              ))}
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.2rem' }}>
                Or specify custom entity interpretation:
              </label>
              <input
                type="text"
                placeholder="e.g. Chopin Nocturnes Op. 55"
                value={customEntityInput}
                onChange={(e) => {
                  setCustomEntityInput(e.target.value);
                  setSelectedEntityChoice('');
                }}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.82rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setAmbiguousCandidate(null)}
                style={rejectBtnStyle}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEntityChoice}
                style={approveBtnStyle}
              >
                Confirm Entity & Generate →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Overview Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>CANDIDATES QUEUE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{candidates.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Entity Resolved & Scored</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>DRAFTS AWAITING REVIEW</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{draftTopics.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Requires Human Approval</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>PIPELINE JOBS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>{jobs.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Automated Executions</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>APPROVAL REQUIREMENT</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a', marginTop: '0.2rem' }}>HUMAN ONLY</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Zero Auto-Publish</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>EMAIL NOTIFICATIONS</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: notificationConfig?.configured ? '#16a34a' : '#d97706', marginTop: '0.2rem' }}>
            {notificationConfig?.configured ? `ACTIVE (${notificationConfig.providerName})` : 'UNCONFIGURED'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
            {notificationConfig?.adminEmail || 'swallern@gmail.com'}
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '1.5rem' }}>
        {[
          { key: 'queue', label: `Opportunity Queue (${candidates.length})` },
          { key: 'review', label: `Human Review Queue (${draftTopics.length})` },
          { key: 'jobs', label: `Background Jobs (${jobs.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'queue' | 'review' | 'jobs')}
            style={{
              padding: '0.75rem 0.25rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: '0.9rem',
              color: activeTab === tab.key ? '#4f46e5' : '#6b7280',
              borderBottom: activeTab === tab.key ? '2px solid #4f46e5' : '2px solid transparent',
              background: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Tab 1: Opportunity Queue */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {candidates.length === 0 ? (
            <div style={emptyBoxStyle}>
              No candidates in queue. Click &ldquo;Ingest Fresh Trends&rdquo; above to discover educational opportunities.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {candidates.map((c) => {
                const detectedEntity = c.score_breakdown?.detected_entity || c.detected_entity || c.query;
                const confidence = c.score_breakdown?.confidence_score ?? c.confidence_score ?? 1.0;
                const isAmbiguous =
                  c.score_breakdown?.is_ambiguous ||
                  c.duplicate_status === 'AMBIGUOUS' ||
                  confidence < 0.70;

                return (
                  <div key={c.id} style={itemCardStyle}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                          {c.query}
                        </span>

                        {isAmbiguous ? (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fcd34d',
                              fontWeight: 700,
                            }}
                          >
                            ⚠️ AMBIGUOUS (Requires Confirmation)
                          </span>
                        ) : (
                          <span style={duplicateBadgeStyle(c.duplicate_status)}>
                            {c.duplicate_status}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#374151', marginTop: '0.25rem' }}>
                        <strong>Detected Entity:</strong> {detectedEntity} &nbsp;|&nbsp;
                        <strong>Confidence:</strong> {Math.round(confidence * 100)}%
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem' }}>
                        Source: {c.source} | Slug: <code>{c.slug}</code>
                      </div>

                      {/* Educational Score Breakdown */}
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.72rem', color: '#4b5563', flexWrap: 'wrap' }}>
                        <span>Score: <strong style={{ color: c.educational_score >= 60 ? '#16a34a' : '#d97706' }}>{c.educational_score}/100</strong></span>
                        <span>Curiosity: {c.score_breakdown?.curiosity || 0}</span>
                        <span>Domain: {c.score_breakdown?.educational_domain || 0}</span>
                        <span>Momentum: {c.score_breakdown?.momentum || 0}</span>
                        {c.score_breakdown?.ambiguity_penalty ? (
                          <span style={{ color: '#dc2626' }}>Ambiguity Penalty: -{c.score_breakdown.ambiguity_penalty}</span>
                        ) : null}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        disabled={actionLoading === c.id}
                        onClick={() => handleApproveCandidate(c)}
                        style={isAmbiguous ? warningBtnStyle : approveBtnStyle}
                      >
                        {actionLoading === c.id
                          ? 'Processing...'
                          : isAmbiguous
                          ? 'Confirm Entity & Approve →'
                          : 'Approve for Research & AI →'}
                      </button>
                      <button
                        onClick={() => handleRejectCandidate(c.id)}
                        style={rejectBtnStyle}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: Human Review Queue */}
      {activeTab === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {draftTopics.length === 0 ? (
            <div style={emptyBoxStyle}>
              No draft topics awaiting human review. Approve candidates from the Opportunity Queue to generate drafts.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {draftTopics.map((topic) => (
                <div key={topic.id} style={itemCardStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                        {topic.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: '#fef3c7',
                          color: '#92400e',
                          fontWeight: 600,
                        }}
                      >
                        {topic.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '0.2rem' }}>
                      {topic.summary || 'Draft explanation generated by AI engine.'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link
                      href={`/admin/topics/${topic.id}`}
                      style={{
                        fontSize: '0.78rem',
                        color: '#4f46e5',
                        textDecoration: 'none',
                        fontWeight: 600,
                        padding: '0.4rem 0.6rem',
                      }}
                    >
                      Edit in Editor ✏️
                    </Link>

                    <button
                      disabled={actionLoading === topic.id}
                      onClick={() => handlePublishTopic(topic.id)}
                      style={publishBtnStyle}
                    >
                      {actionLoading === topic.id ? 'Publishing...' : 'Approve & Publish Live 🚀'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Background Jobs */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {jobs.map((j) => (
              <div
                key={j.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                }}
              >
                <div>
                  <strong>{j.job_type}</strong> — Status: <span style={{ fontWeight: 600, color: j.status === 'COMPLETED' ? '#16a34a' : j.status === 'FAILED' ? '#dc2626' : '#d97706' }}>{j.status}</span> (Attempts: {j.attempts}/{j.max_attempts})
                  {j.error_message && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                      Error: {j.error_message}
                    </div>
                  )}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                  {new Date(j.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared Styles ─────────────────────────────────────────────────────────────

const statCardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '1rem',
};

const emptyBoxStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '2rem',
  textAlign: 'center',
  color: '#6b7280',
  fontSize: '0.875rem',
};

const itemCardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const approveBtnStyle: React.CSSProperties = {
  backgroundColor: '#16a34a',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '0.45rem 0.85rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const warningBtnStyle: React.CSSProperties = {
  backgroundColor: '#d97706',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '0.45rem 0.85rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const publishBtnStyle: React.CSSProperties = {
  backgroundColor: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '0.45rem 0.85rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const rejectBtnStyle: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  padding: '0.45rem 0.75rem',
  fontSize: '0.78rem',
  cursor: 'pointer',
};

function duplicateBadgeStyle(status: string): React.CSSProperties {
  const isUnique = status === 'UNIQUE';
  return {
    fontSize: '0.68rem',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    background: isUnique ? '#dcfce7' : '#fee2e2',
    color: isUnique ? '#166534' : '#991b1b',
    border: `1px solid ${isUnique ? '#86efac' : '#fca5a5'}`,
    fontWeight: 600,
  };
}
