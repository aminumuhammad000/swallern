'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateTopicJSON, ValidatedImportPayload } from '@/lib/admin/importValidator';
import { createClient } from '@/lib/supabase/client';

const FAT_BEAR_WEEK_TEMPLATE = {
  schema_version: '1.0',
  topic: {
    title: 'Fat Bear Week Voting',
    slug: 'fat-bear-week-voting',
    summary: 'How Fat Bear Week works and how people vote for participating brown bears at Katmai National Park.',
    category: 'Wildlife',
    difficulty: 'BEGINNER',
    status: 'DRAFT',
    featured: false,
  },
  research: {
    status: 'verified',
    researched_at: '2026-09-23T00:00:00Z',
    entity: {
      name: 'Fat Bear Week',
      type: 'annual public competition',
      description: 'An annual public competition centered on brown bears preparing for winter at Katmai National Park.',
      domains: ['wildlife', 'conservation', 'public engagement'],
      current_event: true,
    },
    key_facts: [
      {
        claim: 'Fat Bear Week is an annual public competition involving brown bears at Katmai National Park in Alaska.',
        source_ids: ['source-1'],
      },
      {
        claim: 'The public votes online in a bracket-style tournament hosted by Katmai National Park and Explore.org.',
        source_ids: ['source-2'],
      },
      {
        claim: 'Bears enter hyperphagia during autumn, consuming up to 40 lbs of salmon daily to gain survival body fat before hibernation.',
        source_ids: ['source-1'],
      },
    ],
    current_information: [
      {
        claim: 'The 2026 voting period runs from late September through early October 2026 on Explore.org.',
        source_ids: ['source-2'],
        as_of: '2026-09-23',
      },
    ],
  },
  sources: [
    {
      id: 'source-1',
      title: 'NPS Katmai National Park — Fat Bear Week Guide',
      url: 'https://www.nps.gov/katm/learn/fat-bear-week.htm',
      publisher: 'National Park Service (U.S. Department of the Interior)',
      source_type: 'PRIMARY',
      published_at: null,
      accessed_at: '2026-09-23T00:00:00Z',
    },
    {
      id: 'source-2',
      title: 'Explore.org — Fat Bear Week Official Voting Bracket',
      url: 'https://explore.org/fat-bear-week',
      publisher: 'Explore.org',
      source_type: 'PRIMARY',
      published_at: null,
      accessed_at: '2026-09-23T00:00:00Z',
    },
  ],
  version: {
    quick_answer: 'Fat Bear Week Voting is an annual online bracket competition where the public votes on brown bears at Katmai National Park as they fatten up for winter hibernation.',
    explanation: 'Every autumn, Katmai National Park and Preserve in Alaska hosts Fat Bear Week in partnership with Explore.org. The event highlights the incredible biological transformation brown bears undergo during hyperphagia as they consume massive quantities of sockeye salmon.\n\nThe public compares before-and-after photographs of competing bears and votes online in single-elimination bracket rounds until a champion is crowned.',
    key_concepts: [
      'Hyperphagia',
      'Katmai Brown Bears',
      'Hibernation Physiology',
      'Public Conservation Engagement',
    ],
  },
  lesson: {
    title: 'How Fat Bear Week Voting Works',
    summary: 'A 5-minute structured lesson covering Katmai brown bears, hyperphagia, and how public voting works.',
    estimated_minutes: 5,
    sections: [
      {
        title: '1. What Is Fat Bear Week?',
        content: 'Fat Bear Week is an annual public competition celebrating brown bear survival preparation at Katmai National Park in Alaska. It turns biological survival into a popular public learning experience.',
        key_takeaway: 'Fat Bear Week celebrates brown bear health, ecosystems, and pre-hibernation survival preparation.',
      },
      {
        title: '2. Hyperphagia: Preparing for Winter Hibernation',
        content: 'During hyperphagia, brown bears eat almost non-stop from July through October, gaining up to 40 pounds of salmon daily. This fat is essential to survive up to 6 months of winter hibernation without food or water.',
        key_takeaway: 'Brown bears can lose up to one-third of their body weight during winter hibernation.',
      },
      {
        title: '3. How Online Bracket Voting Works',
        content: 'Explore.org hosts a single-elimination tournament bracket. Each day, voters compare two bears using webcam footage and high-resolution photos, selecting the bear that best demonstrates pre-winter fitness.',
        key_takeaway: 'Public voting connects millions of people with wildlife conservation and Katmai ecosystems.',
      },
    ],
  },
  quiz: {
    title: 'Fat Bear Week Knowledge Check',
    passing_score: 80,
    questions: [
      {
        question: 'Why do brown bears at Katmai National Park eat non-stop during autumn?',
        explanation: 'Hyperphagia forces bears to accumulate massive body fat reserves to survive months of winter hibernation.',
        options: [
          { option_text: 'To gain fat reserves needed for winter hibernation', is_correct: true },
          { option_text: 'To migrate south to warmer climates', is_correct: false },
          { option_text: 'To grow larger permanently year-round', is_correct: false },
          { option_text: 'To avoid drinking river water', is_correct: false },
        ],
      },
      {
        question: 'Who organizes and hosts the Fat Bear Week voting bracket?',
        explanation: 'Fat Bear Week is created and presented by Katmai National Park & Preserve in partnership with Explore.org.',
        options: [
          { option_text: 'Katmai National Park & Preserve and Explore.org', is_correct: true },
          { option_text: 'International Olympic Committee', is_correct: false },
          { option_text: 'Universal Studios Wildlife Division', is_correct: false },
          { option_text: 'Local Alaskan Grocery Stores', is_correct: false },
        ],
      },
    ],
  },
  media: [
    {
      media_type: 'ARTICLE',
      url: 'https://www.nps.gov/katm/learn/fat-bear-week.htm',
      title: 'Official NPS Katmai Fat Bear Week Guide',
      channel_or_creator: 'National Park Service',
    },
  ],
};

export function JSONImporter({ onCancel }: { onCancel?: () => void }) {
  const router = useRouter();
  const [jsonText, setJsonText] = useState(JSON.stringify(FAT_BEAR_WEEK_TEMPLATE, null, 2));
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [previewPayload, setPreviewPayload] = useState<ValidatedImportPayload | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleCopyTemplate = () => {
    const templateString = JSON.stringify(FAT_BEAR_WEEK_TEMPLATE, null, 2);
    setJsonText(templateString);
    navigator.clipboard.writeText(templateString);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleFormatJSON = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      alert('Cannot format invalid JSON syntax.');
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const res = await validateTopicJSON(jsonText, supabase);
      setValidationResult(res);
      if (res.valid && res.payload) {
        setPreviewPayload(res.payload);
      } else {
        setPreviewPayload(null);
      }
    } catch (e) {
      setValidationResult({
        valid: false,
        errors: [e instanceof Error ? e.message : 'Validation failed'],
      });
      setPreviewPayload(null);
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!previewPayload) return;
    setImporting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/admin/topics/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: jsonText }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || (data.errors ? data.errors.join(' | ') : 'Import failed'));
      }

      alert(`Topic "${data.message || 'imported'}" successfully in DRAFT status!`);
      router.push(`/admin/topics/${data.topic_id}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to import topic');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Action Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Import Topic via JSON Document
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0' }}>
            Paste a complete Swallern topic JSON document to validate, preview, and import into DRAFT status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyTemplate}
            style={secondaryBtnStyle}
            title="Copy real valid Fat Bear Week JSON template to clipboard"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {copySuccess ? 'Template Copied! ✓' : 'Copy JSON Template'}
          </button>

          <button onClick={handleFormatJSON} style={secondaryBtnStyle}>
            Format JSON
          </button>

          <button onClick={handleValidate} disabled={validating} style={primaryBtnStyle}>
            {validating ? 'Validating…' : 'Validate JSON'}
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', padding: '1rem', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>
          <span>SWALLERN JSON DOCUMENT EDITOR (Schema 1.0)</span>
          <span>{jsonText.length} characters</span>
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setValidationResult(null);
            setPreviewPayload(null);
          }}
          rows={18}
          style={{
            width: '100%',
            backgroundColor: '#0F172A',
            color: '#38BDF8',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '0.85rem',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #334155',
            lineHeight: 1.5,
            outline: 'none',
            resize: 'vertical',
          }}
          placeholder="Paste complete Swallern Topic JSON here..."
        />
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600 }}>
          ⚠️ Import Error: {serverError}
        </div>
      )}

      {/* Validation Result Notification */}
      {validationResult && (
        <div
          style={{
            backgroundColor: validationResult.valid ? '#ECFDF5' : '#FEF2F2',
            border: `2px solid ${validationResult.valid ? '#A7F3D0' : '#FECACA'}`,
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: validationResult.valid ? 0 : '0.75rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: validationResult.valid ? '#047857' : '#B91C1C', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {validationResult.valid ? '✓ Valid Swallern Topic JSON Document' : `✕ ${validationResult.errors.length} Validation Errors Found`}
            </span>
            {validationResult.valid && (
              <button
                onClick={() => setPreviewPayload(previewPayload)}
                style={{ backgroundColor: '#059669', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Inspect Preview Below ↓
              </button>
            )}
          </div>

          {!validationResult.valid && (
            <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#DC2626', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {validationResult.errors.map((err, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>
                  {err}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Preview Section */}
      {previewPayload && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '2px solid #6366F1', padding: '1.5rem', boxShadow: '0 10px 30px -5px rgba(99, 102, 241, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #F1F5F9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                Validated Preview Mode
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 0' }}>
                {previewPayload.course?.title || previewPayload.topic?.title || 'Untitled Course'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0' }}>
                Slug: <code>/topics={(previewPayload.course as any)?.slug || previewPayload.topic?.slug || 'draft'}</code> · Category: <strong>{previewPayload.course?.category || previewPayload.topic?.category || 'General'}</strong> · Status: <strong>DRAFT</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {onCancel && (
                <button onClick={onCancel} style={secondaryBtnStyle}>
                  Cancel
                </button>
              )}
              <button onClick={handleImport} disabled={importing} style={{ ...primaryBtnStyle, backgroundColor: '#059669' }}>
                {importing ? 'Importing Topic…' : 'Import Topic to Database →'}
              </button>
            </div>
          </div>

          {/* Structured Preview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Research Brief Preview */}
            <div style={previewBoxStyle}>
              <h4 style={previewTitleStyle}>🔬 Verified Research Brief</h4>
              <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 10px', fontWeight: 600 }}>
                Entity: {previewPayload.research?.entity?.name} ({previewPayload.research?.entity?.type || 'Topic'})
              </p>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '10px' }}>
                {previewPayload.research?.entity?.description}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Key Facts ({previewPayload.research?.key_facts?.length || 0}):</div>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                {(previewPayload.research?.key_facts || []).map((f, i) => (
                  <li key={i}>{f.claim}</li>
                ))}
              </ul>
            </div>

            {/* Sources Preview */}
            <div style={previewBoxStyle}>
              <h4 style={previewTitleStyle}>📚 Sources ({previewPayload.sources?.length || 0})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(previewPayload.sources || []).map((s) => (
                  <div key={s.id} style={{ fontSize: '0.78rem', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{s.title}</div>
                    <div style={{ color: '#4F46E5', wordBreak: 'break-all' }}>{s.url}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lesson Sections Preview */}
            <div style={previewBoxStyle}>
              <h4 style={previewTitleStyle}>📖 Lesson Sections ({previewPayload.lesson?.sections?.length || 0})</h4>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                {previewPayload.lesson?.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(previewPayload.lesson?.sections || []).map((sec, idx) => (
                  <div key={idx} style={{ fontSize: '0.78rem', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, color: '#334155' }}>{sec.title}</div>
                    <div style={{ color: '#64748B', marginTop: '2px' }}>{sec.key_takeaway}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Preview */}
            <div style={previewBoxStyle}>
              <h4 style={previewTitleStyle}>⚡ Knowledge Quiz ({previewPayload.quiz?.questions?.length || 0} Questions)</h4>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                {previewPayload.quiz?.title || 'Knowledge Check'} (Passing Score: {previewPayload.quiz?.passing_score || 80}%)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(previewPayload.quiz?.questions || []).map((q, idx) => (
                  <div key={idx} style={{ fontSize: '0.78rem', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>Q{idx + 1}: {q.question}</div>
                    <div style={{ color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                      Correct Answer: {q.options.find((o) => o.is_correct)?.option_text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: '#4F46E5',
  color: '#FFFFFF',
  border: 'none',
  padding: '0.6rem 1.2rem',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const secondaryBtnStyle: React.CSSProperties = {
  backgroundColor: '#F1F5F9',
  color: '#334155',
  border: '1px solid #CBD5E1',
  padding: '0.6rem 1rem',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const previewBoxStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '1rem',
};

const previewTitleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: 800,
  color: '#0F172A',
  margin: '0 0 10px',
};
