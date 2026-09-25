'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ResearchTab } from './ResearchTab';
import { AIGeneratorPanel } from './AIGeneratorPanel';
import { JSONImporter } from './JSONImporter';


// ── Types ────────────────────────────────────────────────────────────────────

interface Category { id: string; name: string; slug: string; }

interface TopicVersion {
  id: string;
  version: number;
  quick_answer: string | null;
  explanation: string | null;
  key_concepts: unknown;
}

interface Source {
  id: string;
  url: string;
  title: string;
  publisher: string | null;
  reliability_score: number | null;
  source_type: string | null;
  notes: string | null;
  published_at: string | null;
  accessed_at: string | null;
}

interface RelatedTopic {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface LessonSection {
  id: string;
  title: string;
  content: string;
  key_takeaway: string | null;
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  summary: string | null;
  estimated_minutes: number;
  sections: LessonSection[];
}

interface QuizOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  explanation: string;
  order_index: number;
  options: QuizOption[];
}

interface Quiz {
  id: string;
  title: string;
  passing_score: number;
  questions: QuizQuestion[];
}

interface TopicFull {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  difficulty: string | null;
  status: string;
  category_id: string | null;
  published_version: number | null;
  updated_at: string;
  categories: Category | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_STATUSES = ['DISCOVERED', 'RESEARCHING', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'UPDATED', 'REJECTED'];
const STATUS_COLORS: Record<string, string> = {
  DISCOVERED: '#6b7280', RESEARCHING: '#7c3aed', DRAFT: '#d97706',
  REVIEW: '#2563eb', APPROVED: '#059669', PUBLISHED: '#16a34a',
  UPDATED: '#0891b2', REJECTED: '#dc2626',
};
const TABS = ['Details', 'Content', 'Sources', 'Research', 'AI Engine', 'Lesson', 'Quiz', 'Related'] as const;
type TabName = typeof TABS[number];


// ── Main component ─────────────────────────────────────────────────────────────

export function TopicEditor({ topicId }: { topicId: string | null }) {
  const router = useRouter();
  const isNew = topicId === null;

  // Core data
  const [topic, setTopic] = useState<TopicFull | null>(null);
  const [version, setVersion] = useState<TopicVersion | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // UI state
  const [creationMode, setCreationMode] = useState<'manual' | 'json'>('manual');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<TabName>('Details');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleExportJSON = async () => {
    if (!topicId) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/topics/${topicId}/export`);
      if (!res.ok) throw new Error('Failed to export topic JSON document');
      const data = await res.json();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `topic-${slug || topicId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('BEGINNER');
  const [status, setStatus] = useState('DRAFT');
  const [quickAnswer, setQuickAnswer] = useState('');
  const [explanation, setExplanation] = useState('');

  // Load categories
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  // Load existing topic
  const loadTopic = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/topics/${topicId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const t: TopicFull = data.topic;
      setTopic(t);
      setTitle(t.title);
      setSlug(t.slug);
      setSummary(t.summary || '');
      setCategoryId(t.category_id || '');
      setDifficulty(t.difficulty || 'BEGINNER');
      setStatus(t.status);

      if (data.latestVersion) {
        setVersion(data.latestVersion);
        setQuickAnswer(data.latestVersion.quick_answer || '');
        setExplanation(data.latestVersion.explanation || '');
      }

      setSources(data.sources || []);
      setRelatedTopics(data.relatedTopics || []);
      setLesson(data.lesson || null);
      setQuiz(data.quiz || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load topic');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => { loadTopic(); }, [loadTopic]);

  // Auto-generate slug from title (new topics only)
  useEffect(() => {
    if (!isNew) return;
    const generated = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-');
    setSlug(generated);
  }, [title, isNew]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ── Save details + content ──────────────────────────────────────────────────

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const res = await fetch('/api/admin/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, slug, summary, category_id: categoryId, difficulty, status, quick_answer: quickAnswer, explanation }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        router.push(`/admin/topics/${data.topic.id}`);
      } else {
        const res = await fetch(`/api/admin/topics/${topicId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, slug, summary, category_id: categoryId, difficulty, status, quick_answer: quickAnswer, explanation }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTopic(data.topic);
        showSuccess('Topic saved.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Change status ────────────────────────────────────────────────────────────

  const handleStatusChange = async (newStatus: string) => {
    if (!topicId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/topics/${topicId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStatus(data.topic.status);
      setTopic((prev) => prev ? { ...prev, status: data.topic.status } : prev);
      showSuccess(`Status changed to ${newStatus}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Status change failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: '#6b7280' }}>Loading topic…</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.3rem' }}>
            <a href="/admin/topics" style={{ color: '#6b7280', textDecoration: 'none' }}>Topics</a>
            {' / '}
            {isNew ? 'New Topic' : (topic?.title || topicId)}
          </div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#111827' }}>
            {isNew ? 'New Topic' : 'Edit Topic'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {!isNew && (
            <>
              <button
                onClick={handleExportJSON}
                disabled={exporting}
                style={{ ...secondaryBtn, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Export topic graph as a 1.0 Swallern JSON Document"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {exporting ? 'Exporting…' : 'Export JSON'}
              </button>

              <span style={{
                fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                background: `${STATUS_COLORS[status] || '#6b7280'}1a`,
                color: STATUS_COLORS[status] || '#6b7280',
              }}>
                {status}
              </span>
            </>
          )}

          {isNew && (
            <div style={{ display: 'flex', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                onClick={() => setCreationMode('manual')}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.82rem',
                  fontWeight: creationMode === 'manual' ? 700 : 500,
                  backgroundColor: creationMode === 'manual' ? '#4F46E5' : '#F8FAFC',
                  color: creationMode === 'manual' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Manual Creation
              </button>
              <button
                onClick={() => setCreationMode('json')}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.82rem',
                  fontWeight: creationMode === 'json' ? 700 : 500,
                  backgroundColor: creationMode === 'json' ? '#4F46E5' : '#F8FAFC',
                  color: creationMode === 'json' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Import JSON
              </button>
            </div>
          )}

          {creationMode === 'manual' && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={primaryBtn}
            >
              {saving ? 'Saving…' : (isNew ? 'Create Topic' : 'Save Changes')}
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={alertStyle('#fef2f2', '#fecaca', '#dc2626')}>{error}</div>
      )}
      {successMsg && (
        <div style={alertStyle('#f0fdf4', '#bbf7d0', '#16a34a')}>{successMsg}</div>
      )}

      {/* JSON Importer Mode for New Topic */}
      {isNew && creationMode === 'json' ? (
        <JSONImporter onCancel={() => setCreationMode('manual')} />
      ) : (
        <>
          {/* Tabs (only for existing topics) */}
          {!isNew && (
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e5e7eb' }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.6rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? '#4f46e5' : '#6b7280',
                    borderBottom: activeTab === tab ? '2px solid #4f46e5' : '2px solid transparent',
                    background: 'none',
                    border: 'none',
                    borderBottomStyle: 'solid',
                    borderBottomWidth: '2px',
                    borderBottomColor: activeTab === tab ? '#4f46e5' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Tab content */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem' }}>
            {(isNew || activeTab === 'Details') && (
              <DetailsTab
                title={title} setTitle={setTitle}
                slug={slug} setSlug={setSlug}
                summary={summary} setSummary={setSummary}
                categoryId={categoryId} setCategoryId={setCategoryId}
                difficulty={difficulty} setDifficulty={setDifficulty}
                status={status} setStatus={setStatus}
                categories={categories}
                isNew={isNew}
                onStatusChange={handleStatusChange}
                saving={saving}
              />
            )}
        {!isNew && activeTab === 'Content' && (
          <ContentTab
            quickAnswer={quickAnswer} setQuickAnswer={setQuickAnswer}
            explanation={explanation} setExplanation={setExplanation}
            version={version}
          />
        )}
        {!isNew && activeTab === 'Sources' && (
          <SourcesTab
            topicId={topicId!}
            sources={sources}
            setSources={setSources}
          />
        )}
        {!isNew && activeTab === 'Research' && (
          <ResearchTab
            topicId={topicId!}
            topicSources={sources}
          />
        )}
        {!isNew && activeTab === 'AI Engine' && (
          <AIGeneratorPanel
            topicId={topicId!}
            topicTitle={topic?.title || ''}
            topicSourcesCount={sources.length}
            onDraftAccepted={() => loadTopic()}
          />
        )}
        {!isNew && activeTab === 'Lesson' && (
          <LessonTab
            topicId={topicId!}
            lesson={lesson}
            setLesson={setLesson}
          />
        )}
        {!isNew && activeTab === 'Quiz' && (
          <QuizTab
            topicId={topicId!}
            quiz={quiz}
            setQuiz={setQuiz}
          />
        )}
        {!isNew && activeTab === 'Related' && (
          <RelatedTab
            topicId={topicId!}
            relatedTopics={relatedTopics}
            setRelatedTopics={setRelatedTopics}
          />
        )}
      </div>
    </>
  )}
</div>
  );
}

// ── Details Tab ───────────────────────────────────────────────────────────────

function DetailsTab({
  title, setTitle, slug, setSlug, summary, setSummary,
  categoryId, setCategoryId, difficulty, setDifficulty,
  status, setStatus, categories, isNew, onStatusChange, saving,
}: {
  title: string; setTitle: (v: string) => void;
  slug: string; setSlug: (v: string) => void;
  summary: string; setSummary: (v: string) => void;
  categoryId: string; setCategoryId: (v: string) => void;
  difficulty: string; setDifficulty: (v: string) => void;
  status: string; setStatus: (v: string) => void;
  categories: Category[];
  isNew: boolean;
  onStatusChange: (s: string) => void;
  saving: boolean;
}) {
  const WORKFLOW_TRANSITIONS: Record<string, string[]> = {
    DISCOVERED: ['RESEARCHING', 'REJECTED'],
    RESEARCHING: ['DRAFT', 'REJECTED'],
    DRAFT: ['REVIEW', 'REJECTED'],
    REVIEW: ['APPROVED', 'REJECTED', 'DRAFT'],
    APPROVED: ['PUBLISHED'],
    PUBLISHED: ['UPDATED', 'DRAFT'],
    UPDATED: ['DRAFT'],
    REJECTED: ['DRAFT'],
  };

  const allowedNext = isNew ? [] : (WORKFLOW_TRANSITIONS[status] || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <FormRow label="Title *">
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputFull} placeholder="e.g. Why is the sky blue?" />
      </FormRow>
      <FormRow label="Slug">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inputFull} placeholder="auto-generated-from-title" />
        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>URL: /topics/{slug || '…'}</span>
      </FormRow>
      <FormRow label="Short Summary">
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} style={{ ...inputFull, minHeight: '80px', resize: 'vertical' }} placeholder="A one-sentence description visible on topic cards." />
      </FormRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label="Category">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputFull}>
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormRow>
        <FormRow label="Difficulty">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={inputFull}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </FormRow>
      </div>
      {isNew ? (
        <FormRow label="Initial Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputFull}>
            {['DISCOVERED', 'RESEARCHING', 'DRAFT', 'REVIEW', 'APPROVED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </FormRow>
      ) : (
        <div>
          <div style={labelStyle}>Workflow Actions</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
            {allowedNext.map((s) => (
              <button
                key={s}
                disabled={saving}
                onClick={() => onStatusChange(s)}
                style={{
                  ...workflowBtn,
                  background: `${STATUS_COLORS[s] || '#6b7280'}12`,
                  color: STATUS_COLORS[s] || '#6b7280',
                  border: `1px solid ${STATUS_COLORS[s] || '#6b7280'}50`,
                }}
              >
                → {s}
              </button>
            ))}
            {allowedNext.length === 0 && (
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No further transitions available.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Content Tab ───────────────────────────────────────────────────────────────

function ContentTab({
  quickAnswer, setQuickAnswer,
  explanation, setExplanation,
  version,
}: {
  quickAnswer: string; setQuickAnswer: (v: string) => void;
  explanation: string; setExplanation: (v: string) => void;
  version: TopicVersion | null;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {version && (
        <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
          Editing version {version.version}. Changes save with the "Save Changes" button above.
        </div>
      )}
      <FormRow label="Quick Answer">
        <textarea value={quickAnswer} onChange={(e) => setQuickAnswer(e.target.value)}
          style={{ ...inputFull, minHeight: '90px', resize: 'vertical' }}
          placeholder="A concise, direct answer to the topic question." />
      </FormRow>
      <FormRow label="Full Explanation">
        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)}
          style={{ ...inputFull, minHeight: '260px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
          placeholder="Full markdown content for the topic explanation." />
      </FormRow>
    </div>
  );
}

// ── Sources Tab ───────────────────────────────────────────────────────────────

const ALL_SOURCE_TYPES = ['PRIMARY','GOVERNMENT','UNIVERSITY','SCIENTIFIC','REFERENCE','NEWS','VIDEO','OTHER'] as const;

interface SourceFormState {
  title: string;
  url: string;
  publisher: string;
  reliability_score: number | string;
  source_type: string;
  notes: string;
  published_at: string;
  accessed_at: string;
}

function SourceForm({
  form, setForm, saving, isAdd, onSave, onCancel,
}: {
  form: SourceFormState;
  setForm: React.Dispatch<React.SetStateAction<SourceFormState>>;
  saving: boolean;
  isAdd: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <FormRow label="Title *">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputFull} placeholder="Source title" />
        </FormRow>
        <FormRow label="Publisher">
          <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} style={inputFull} placeholder="e.g. NASA" />
        </FormRow>
      </div>
      <FormRow label="URL *">
        <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} style={inputFull} placeholder="https://…" />
      </FormRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <FormRow label="Source Type">
          <select value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })} style={inputFull}>
            <option value="">— Select —</option>
            {ALL_SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormRow>
        <FormRow label="Reliability (1–5)">
          <input type="number" min={1} max={5} value={form.reliability_score}
            onChange={(e) => setForm({ ...form, reliability_score: parseInt(e.target.value) || 5 })} style={inputFull} />
        </FormRow>
        <FormRow label="Published Date">
          <input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} style={inputFull} />
        </FormRow>
      </div>
      <FormRow label="Editorial Notes (internal, not public)">
        <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={inputFull} placeholder="Internal notes about this source" />
      </FormRow>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button disabled={saving} onClick={onSave} style={primaryBtn}>
          {saving ? 'Saving…' : (isAdd ? 'Add Source' : 'Update Source')}
        </button>
        <button onClick={onCancel} style={ghostBtn}>Cancel</button>
      </div>
    </div>
  );
}

const BLANK_SOURCE_FORM: SourceFormState = {
  title: '', url: '', publisher: '', reliability_score: 5,
  source_type: '', notes: '', published_at: '', accessed_at: '',
};

function SourcesTab({ topicId, sources, setSources }: {
  topicId: string;
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SourceFormState>(BLANK_SOURCE_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setAdding(false); setEditingId(null); setForm(BLANK_SOURCE_FORM); };

  const startEdit = (s: Source) => {
    setEditingId(s.id);
    setAdding(false);
    setForm({
      title: s.title,
      url: s.url,
      publisher: s.publisher || '',
      reliability_score: s.reliability_score ?? 5,
      source_type: s.source_type || '',
      notes: s.notes || '',
      published_at: s.published_at ? s.published_at.slice(0, 10) : '',
      accessed_at: s.accessed_at ? s.accessed_at.slice(0, 10) : '',
    });
  };

  const doSave = async (action: 'add' | 'edit') => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        action, topic_id: topicId,
        title: form.title,
        url: form.url,
        publisher: form.publisher,
        reliability_score: typeof form.reliability_score === 'number' ? form.reliability_score : parseInt(String(form.reliability_score)) || null,
        source_type: form.source_type || undefined,
        notes: form.notes || undefined,
        published_at: form.published_at || undefined,
        accessed_at: form.accessed_at || undefined,
        source_id: editingId,
      };
      const res = await fetch('/api/admin/sources', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (action === 'add') {
        setSources((prev) => [...prev, data.source]);
      } else {
        setSources((prev) => prev.map((s) => s.id === editingId ? data.source : s));
      }
      reset();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const doRemove = async (sourceId: string) => {
    if (!confirm('Remove this source from the topic?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', topic_id: topicId, source_id: sourceId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSources((prev) => prev.filter((s) => s.id !== sourceId));
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={sectionTitle}>Sources ({sources.length})</h3>
        {!adding && !editingId && (
          <button onClick={() => { setAdding(true); setEditingId(null); setForm(BLANK_SOURCE_FORM); }} style={secondaryBtn}>+ Add Source</button>
        )}
      </div>

      {error && <div style={alertStyle('#fef2f2', '#fecaca', '#dc2626')}>{error}</div>}

      {(adding || editingId) && (
        <div style={inlineFormStyle}>
          <SourceForm
            form={form}
            setForm={setForm}
            saving={saving}
            isAdd={adding}
            onSave={() => doSave(adding ? 'add' : 'edit')}
            onCancel={reset}
          />
        </div>
      )}

      {sources.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No sources attached. Add one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {sources.map((s) => (
            <div key={s.id} style={itemRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem', color: '#111827' }}>{s.title}</span>
                  {s.source_type && (
                    <span style={{
                      fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                      background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em',
                    }}>
                      {s.source_type}
                    </span>
                  )}
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '0.78rem', color: '#4f46e5', textDecoration: 'none', wordBreak: 'break-all' }}>
                  {s.url}
                </a>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                  {s.publisher && <span>{s.publisher}</span>}
                  {s.publisher && s.reliability_score != null && <span> · </span>}
                  {s.reliability_score != null && <span>Reliability: {s.reliability_score}/5</span>}
                  {s.published_at && <span> · Published: {s.published_at.slice(0, 10)}</span>}
                </div>
                {s.notes && (
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '0.1rem' }}>
                    Internal note: {s.notes}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                <button onClick={() => startEdit(s)} style={editMiniBtn}>Edit</button>
                <button onClick={() => doRemove(s.id)} style={deleteMiniBtn}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Lesson Tab ─────────────────────────────────────────────────────────────────

function LessonTab({ topicId, lesson, setLesson }: {
  topicId: string;
  lesson: Lesson | null;
  setLesson: React.Dispatch<React.SetStateAction<Lesson | null>>;
}) {
  const [editingLesson, setEditingLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', summary: '', estimated_minutes: 3 });
  const [addingSection, setAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState({ title: '', content: '', key_takeaway: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveLesson = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_lesson', topic_id: topicId, lesson_id: lesson?.id, ...lessonForm }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLesson((prev) => prev
        ? { ...prev, ...data.lesson }
        : { ...data.lesson, sections: [] }
      );
      setEditingLesson(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const startEditLesson = () => {
    setLessonForm({ title: lesson?.title || '', summary: lesson?.summary || '', estimated_minutes: lesson?.estimated_minutes || 3 });
    setEditingLesson(true);
  };

  const saveSection = async () => {
    if (!lesson) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_section',
          lesson_id: lesson.id,
          section_id: editingSectionId,
          order_index: editingSectionId
            ? lesson.sections.find((s) => s.id === editingSectionId)?.order_index ?? lesson.sections.length
            : lesson.sections.length,
          ...sectionForm,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (editingSectionId) {
        setLesson((prev) => prev ? { ...prev, sections: prev.sections.map((s) => s.id === editingSectionId ? data.section : s) } : prev);
      } else {
        setLesson((prev) => prev ? { ...prev, sections: [...prev.sections, data.section] } : prev);
      }
      setAddingSection(false);
      setEditingSectionId(null);
      setSectionForm({ title: '', content: '', key_takeaway: '' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_section', section_id: sectionId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLesson((prev) => prev ? { ...prev, sections: prev.sections.filter((s) => s.id !== sectionId) } : prev);
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const moveSection = async (idx: number, dir: -1 | 1) => {
    if (!lesson) return;
    const sections = [...lesson.sections];
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    [sections[idx], sections[target]] = [sections[target], sections[idx]];
    const updated = sections.map((s, i) => ({ ...s, order_index: i }));
    setLesson((prev) => prev ? { ...prev, sections: updated } : prev);
    // persist reorder
    await fetch('/api/admin/lessons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder_sections', sections: updated }),
    });
  };

  const startEditSection = (s: LessonSection) => {
    setEditingSectionId(s.id);
    setAddingSection(false);
    setSectionForm({ title: s.title, content: s.content, key_takeaway: s.key_takeaway || '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && <div style={alertStyle('#fef2f2', '#fecaca', '#dc2626')}>{error}</div>}

      {/* Lesson header */}
      {!lesson ? (
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No lesson yet for this topic.</p>
          <button onClick={() => { setLessonForm({ title: '', summary: '', estimated_minutes: 3 }); setEditingLesson(true); }} style={secondaryBtn}>
            + Create Lesson
          </button>
        </div>
      ) : (
        <div style={itemRow}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>{lesson.title}</div>
            {lesson.summary && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{lesson.summary}</div>}
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{lesson.estimated_minutes} min · {lesson.sections.length} section{lesson.sections.length !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={startEditLesson} style={editMiniBtn}>Edit Lesson</button>
        </div>
      )}

      {editingLesson && (
        <div style={inlineFormStyle}>
          <FormRow label="Lesson Title *">
            <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} style={inputFull} />
          </FormRow>
          <FormRow label="Summary">
            <textarea value={lessonForm.summary} onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })}
              style={{ ...inputFull, minHeight: '60px' }} />
          </FormRow>
          <FormRow label="Estimated Minutes">
            <input type="number" min={1} value={lessonForm.estimated_minutes}
              onChange={(e) => setLessonForm({ ...lessonForm, estimated_minutes: parseInt(e.target.value) || 3 })} style={{ ...inputFull, width: '120px' }} />
          </FormRow>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button disabled={saving} onClick={saveLesson} style={primaryBtn}>{saving ? 'Saving…' : 'Save Lesson'}</button>
            <button onClick={() => setEditingLesson(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Sections */}
      {lesson && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <h3 style={sectionTitle}>Sections</h3>
            {!addingSection && !editingSectionId && (
              <button onClick={() => { setAddingSection(true); setEditingSectionId(null); setSectionForm({ title: '', content: '', key_takeaway: '' }); }} style={secondaryBtn}>
                + Add Section
              </button>
            )}
          </div>

          {lesson.sections.length === 0 && !addingSection && (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No sections yet. Add one above.</p>
          )}

          {lesson.sections.map((s, idx) => (
            <div key={s.id}>
              {editingSectionId === s.id ? (
                <div style={inlineFormStyle}>
                  <SectionForm form={sectionForm} setForm={setSectionForm} saving={saving} onSave={saveSection} onCancel={() => setEditingSectionId(null)} />
                </div>
              ) : (
                <div style={{ ...itemRow, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '0.5rem' }}>
                    <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} style={moveBtn}>▲</button>
                    <button onClick={() => moveSection(idx, 1)} disabled={idx === lesson.sections.length - 1} style={moveBtn}>▼</button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', color: '#111827' }}>{s.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px', whiteSpace: 'pre-wrap', maxHeight: '60px', overflow: 'hidden' }}>
                      {s.content.slice(0, 120)}{s.content.length > 120 ? '…' : ''}
                    </div>
                    {s.key_takeaway && (
                      <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '2px' }}>✓ {s.key_takeaway}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button onClick={() => startEditSection(s)} style={editMiniBtn}>Edit</button>
                    <button onClick={() => deleteSection(s.id)} style={deleteMiniBtn}>Del</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {addingSection && (
            <div style={inlineFormStyle}>
              <SectionForm form={sectionForm} setForm={setSectionForm} saving={saving} onSave={saveSection} onCancel={() => setAddingSection(false)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SectionForm({ form, setForm, saving, onSave, onCancel }: {
  form: { title: string; content: string; key_takeaway: string };
  setForm: React.Dispatch<React.SetStateAction<{ title: string; content: string; key_takeaway: string }>>;
  saving: boolean; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FormRow label="Section Title *">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputFull} />
      </FormRow>
      <FormRow label="Content *">
        <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
          style={{ ...inputFull, minHeight: '120px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }} />
      </FormRow>
      <FormRow label="Key Takeaway">
        <input value={form.key_takeaway} onChange={(e) => setForm({ ...form, key_takeaway: e.target.value })} style={inputFull} placeholder="One sentence summary" />
      </FormRow>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button disabled={saving} onClick={onSave} style={primaryBtn}>{saving ? 'Saving…' : 'Save Section'}</button>
        <button onClick={onCancel} style={ghostBtn}>Cancel</button>
      </div>
    </div>
  );
}

// ── Quiz Tab ──────────────────────────────────────────────────────────────────

function QuizTab({ topicId, quiz, setQuiz }: {
  topicId: string;
  quiz: Quiz | null;
  setQuiz: React.Dispatch<React.SetStateAction<Quiz | null>>;
}) {
  const [editingQuiz, setEditingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: 'Test Your Knowledge', passing_score: 80 });
  const [addingQ, setAddingQ] = useState(false);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [qForm, setQForm] = useState({ question: '', explanation: '', options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveQuiz = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_quiz', topic_id: topicId, quiz_id: quiz?.id, ...quizForm }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuiz((prev) => prev ? { ...prev, ...data.quiz } : { ...data.quiz, questions: [] });
      setEditingQuiz(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const saveQuestion = async () => {
    if (!quiz) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_question',
          quiz_id: quiz.id,
          question_id: editingQId,
          order_index: quiz.questions.length,
          ...qForm,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Re-fetch questions with options
      const refetch = await fetch(`/api/admin/topics/${topicId}`);
      const refetchData = await refetch.json();
      if (refetchData.quiz) setQuiz(refetchData.quiz);
      setAddingQ(false);
      setEditingQId(null);
      setQForm({ question: '', explanation: '', options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteQuestion = async (qId: string) => {
    if (!confirm('Delete this question?')) return;
    const res = await fetch('/api/admin/quizzes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_question', question_id: qId }),
    });
    const data = await res.json();
    if (data.error) return alert(data.error);
    setQuiz((prev) => prev ? { ...prev, questions: prev.questions.filter((q) => q.id !== qId) } : prev);
  };

  const startEditQ = (q: QuizQuestion) => {
    setEditingQId(q.id);
    setAddingQ(false);
    setQForm({
      question: q.question,
      explanation: q.explanation,
      options: q.options.length > 0
        ? q.options.map((o) => ({ option_text: o.option_text, is_correct: o.is_correct }))
        : [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }],
    });
  };

  const moveQuestion = async (idx: number, dir: -1 | 1) => {
    if (!quiz) return;
    const qs = [...quiz.questions];
    const t = idx + dir;
    if (t < 0 || t >= qs.length) return;
    [qs[idx], qs[t]] = [qs[t], qs[idx]];
    const updated = qs.map((q, i) => ({ ...q, order_index: i }));
    setQuiz((prev) => prev ? { ...prev, questions: updated } : prev);
    await fetch('/api/admin/quizzes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder_questions', questions: updated }),
    });
  };

  const setOption = (idx: number, field: string, value: string | boolean) => {
    const opts = qForm.options.map((o, i) =>
      i === idx ? { ...o, [field]: field === 'is_correct' ? value : value } : o
    );
    setQForm({ ...qForm, options: opts });
  };

  const setCorrectOption = (idx: number) => {
    const opts = qForm.options.map((o, i) => ({ ...o, is_correct: i === idx }));
    setQForm({ ...qForm, options: opts });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && <div style={alertStyle('#fef2f2', '#fecaca', '#dc2626')}>{error}</div>}

      {/* Quiz header */}
      {!quiz ? (
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No quiz yet for this topic.</p>
          <button onClick={() => { setQuizForm({ title: 'Test Your Knowledge', passing_score: 80 }); setEditingQuiz(true); }} style={secondaryBtn}>
            + Create Quiz
          </button>
        </div>
      ) : (
        <div style={itemRow}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>{quiz.title}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Passing score: {quiz.passing_score}% · {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={() => { setQuizForm({ title: quiz.title, passing_score: quiz.passing_score }); setEditingQuiz(true); }} style={editMiniBtn}>
            Edit Quiz
          </button>
        </div>
      )}

      {editingQuiz && (
        <div style={inlineFormStyle}>
          <FormRow label="Quiz Title">
            <input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} style={inputFull} />
          </FormRow>
          <FormRow label="Passing Score (%)">
            <input type="number" min={0} max={100} value={quizForm.passing_score}
              onChange={(e) => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) || 80 })} style={{ ...inputFull, width: '120px' }} />
          </FormRow>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button disabled={saving} onClick={saveQuiz} style={primaryBtn}>{saving ? 'Saving…' : 'Save Quiz'}</button>
            <button onClick={() => setEditingQuiz(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Questions */}
      {quiz && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <h3 style={sectionTitle}>Questions</h3>
            {!addingQ && !editingQId && (
              <button onClick={() => { setAddingQ(true); setEditingQId(null); setQForm({ question: '', explanation: '', options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] }); }} style={secondaryBtn}>
                + Add Question
              </button>
            )}
          </div>

          {quiz.questions.length === 0 && !addingQ && (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No questions yet.</p>
          )}

          {quiz.questions.map((q, idx) => (
            <div key={q.id}>
              {editingQId === q.id ? (
                <div style={inlineFormStyle}>
                  <QuestionForm qForm={qForm} setQForm={setQForm} setOption={setOption} setCorrectOption={setCorrectOption} saving={saving} onSave={saveQuestion} onCancel={() => setEditingQId(null)} />
                </div>
              ) : (
                <div style={{ ...itemRow, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '0.5rem' }}>
                    <button onClick={() => moveQuestion(idx, -1)} disabled={idx === 0} style={moveBtn}>▲</button>
                    <button onClick={() => moveQuestion(idx, 1)} disabled={idx === quiz.questions.length - 1} style={moveBtn}>▼</button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', color: '#111827' }}>Q{idx + 1}. {q.question}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '4px' }}>
                      {q.options.map((o) => (
                        <span key={o.id} style={{
                          fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px',
                          background: o.is_correct ? '#d1fae5' : '#f3f4f6',
                          color: o.is_correct ? '#065f46' : '#6b7280',
                          fontWeight: o.is_correct ? 600 : 400,
                        }}>
                          {o.is_correct ? '✓ ' : ''}{o.option_text}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                      Explanation: {q.explanation.slice(0, 80)}{q.explanation.length > 80 ? '…' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button onClick={() => startEditQ(q)} style={editMiniBtn}>Edit</button>
                    <button onClick={() => deleteQuestion(q.id)} style={deleteMiniBtn}>Del</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {addingQ && (
            <div style={inlineFormStyle}>
              <QuestionForm qForm={qForm} setQForm={setQForm} setOption={setOption} setCorrectOption={setCorrectOption} saving={saving} onSave={saveQuestion} onCancel={() => setAddingQ(false)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function QuestionForm({ qForm, setQForm, setOption, setCorrectOption, saving, onSave, onCancel }: {
  qForm: { question: string; explanation: string; options: { option_text: string; is_correct: boolean }[] };
  setQForm: React.Dispatch<React.SetStateAction<{ question: string; explanation: string; options: { option_text: string; is_correct: boolean }[] }>>;
  setOption: (idx: number, field: string, value: string | boolean) => void;
  setCorrectOption: (idx: number) => void;
  saving: boolean; onSave: () => void; onCancel: () => void;
}) {
  const addOption = () => setQForm({ ...qForm, options: [...qForm.options, { option_text: '', is_correct: false }] });
  const removeOption = (idx: number) => setQForm({ ...qForm, options: qForm.options.filter((_, i) => i !== idx) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FormRow label="Question *">
        <input value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} style={inputFull} />
      </FormRow>
      <FormRow label="Explanation *">
        <textarea value={qForm.explanation} onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
          style={{ ...inputFull, minHeight: '70px' }} placeholder="Explain the correct answer." />
      </FormRow>
      <div>
        <div style={labelStyle}>Answer Options (select correct)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
          {qForm.options.map((opt, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="radio"
                name="correct_option"
                checked={opt.is_correct}
                onChange={() => setCorrectOption(idx)}
                title="Mark as correct"
              />
              <input
                value={opt.option_text}
                onChange={(e) => setOption(idx, 'option_text', e.target.value)}
                style={{ ...inputFull, flex: 1 }}
                placeholder={`Option ${idx + 1}`}
              />
              {qForm.options.length > 2 && (
                <button onClick={() => removeOption(idx)} style={deleteMiniBtn}>✕</button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addOption} style={{ ...ghostBtn, marginTop: '0.4rem', fontSize: '0.78rem' }}>+ Add Option</button>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button disabled={saving} onClick={onSave} style={primaryBtn}>{saving ? 'Saving…' : 'Save Question'}</button>
        <button onClick={onCancel} style={ghostBtn}>Cancel</button>
      </div>
    </div>
  );
}

// ── Related Topics Tab ─────────────────────────────────────────────────────────

function RelatedTab({ topicId, relatedTopics, setRelatedTopics }: {
  topicId: string;
  relatedTopics: RelatedTopic[];
  setRelatedTopics: React.Dispatch<React.SetStateAction<RelatedTopic[]>>;
}) {
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<RelatedTopic[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/admin/topics?search=${encodeURIComponent(searchQ)}`);
      const data = await res.json();
      const existing = new Set([topicId, ...relatedTopics.map((r) => r.id)]);
      setSearchResults((data.topics || []).filter((t: RelatedTopic) => !existing.has(t.id)));
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ, topicId, relatedTopics]);

  const addRelated = async (targetTopic: RelatedTopic) => {
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/admin/related', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', from_topic_id: topicId, to_topic_id: targetTopic.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRelatedTopics((prev) => [...prev, targetTopic]);
      setSearchQ('');
      setSearchResults([]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const removeRelated = async (targetId: string) => {
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/admin/related', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', from_topic_id: topicId, to_topic_id: targetId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRelatedTopics((prev) => prev.filter((r) => r.id !== targetId));
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={sectionTitle}>Related Topics ({relatedTopics.length})</h3>
      {error && <div style={alertStyle('#fef2f2', '#fecaca', '#dc2626')}>{error}</div>}

      {/* Search to add */}
      <div style={{ position: 'relative' }}>
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          style={{ ...inputFull, maxWidth: '360px' }}
          placeholder="Search topics to add…"
          disabled={saving}
        />
        {searching && <span style={{ fontSize: '0.78rem', color: '#9ca3af', marginLeft: '0.5rem' }}>Searching…</span>}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '2.2rem', left: 0, zIndex: 10,
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', minWidth: '320px', maxHeight: '280px', overflowY: 'auto',
          }}>
            {searchResults.map((t) => (
              <button
                key={t.id}
                disabled={saving}
                onClick={() => addRelated(t)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.6rem 1rem', background: 'none', border: 'none',
                  borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: '0.875rem',
                }}
              >
                <span style={{ color: '#111827' }}>{t.title}</span>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: '0.5rem' }}>{t.slug}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current related topics */}
      {relatedTopics.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No related topics. Search above to add some.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {relatedTopics.map((r) => (
            <div key={r.id} style={itemRow}>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500, fontSize: '0.875rem', color: '#111827' }}>{r.title}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.5rem' }}>{r.slug}</span>
              </div>
              <button onClick={() => removeRelated(r.id)} disabled={saving} style={deleteMiniBtn}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ marginTop: '0.3rem' }}>{children}</div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.03em',
};

const inputFull: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '0.45rem 0.75rem', border: '1px solid #d1d5db',
  borderRadius: '6px', fontSize: '0.875rem', outline: 'none',
};

const primaryBtn: React.CSSProperties = {
  padding: '0.45rem 1rem', borderRadius: '6px',
  background: '#4f46e5', color: '#fff',
  border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
};

const secondaryBtn: React.CSSProperties = {
  padding: '0.4rem 0.85rem', borderRadius: '6px',
  background: '#fff', color: '#374151',
  border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
};

const ghostBtn: React.CSSProperties = {
  padding: '0.45rem 0.9rem', borderRadius: '6px',
  background: 'transparent', color: '#6b7280',
  border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '0.875rem',
};

const editMiniBtn: React.CSSProperties = {
  fontSize: '0.75rem', padding: '0.18rem 0.5rem', borderRadius: '4px',
  border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4f46e5', cursor: 'pointer', fontWeight: 500,
};

const deleteMiniBtn: React.CSSProperties = {
  fontSize: '0.75rem', padding: '0.18rem 0.5rem', borderRadius: '4px',
  border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontWeight: 500,
};

const moveBtn: React.CSSProperties = {
  fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '3px',
  border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', color: '#9ca3af',
};

const workflowBtn: React.CSSProperties = {
  padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
};

const sectionTitle: React.CSSProperties = {
  margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#374151',
};

const itemRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.75rem', border: '1px solid #f3f4f6', borderRadius: '6px', background: '#fafafa',
};

const inlineFormStyle: React.CSSProperties = {
  padding: '1rem', border: '1px dashed #c7d2fe', borderRadius: '6px', background: '#f5f3ff',
};

function alertStyle(bg: string, border: string, text: string): React.CSSProperties {
  return { background: bg, border: `1px solid ${border}`, borderRadius: '6px', padding: '0.65rem 1rem', color: text, fontSize: '0.875rem' };
}
