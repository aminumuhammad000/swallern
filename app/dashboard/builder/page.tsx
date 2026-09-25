'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CourseBuilder } from '@/components/dashboard/builder/CourseBuilder';
import { BuilderCourseData } from '@/components/dashboard/builder/types';
import { LearnerCoursePreview } from '@/components/dashboard/LearnerCoursePreview';
import { validateSwallernCourse, CourseValidationResult } from '@/lib/learning/validation';
import { SCHEMA_1_1_SAMPLE_COURSE, downloadCourseJSON } from '@/lib/learning/courseTemplate';

function BuilderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'import' ? 'json' : 'builder';

  const [activeMode, setActiveMode] = useState<'builder' | 'json'>(initialMode);
  const [builderCourseData, setBuilderCourseData] = useState<BuilderCourseData | null>(null);

  // Preview Modal State
  const [showLearnerPreview, setShowLearnerPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // JSON Studio States
  const [jsonText, setJsonText] = useState('');
  const [validationResult, setValidationResult] = useState<CourseValidationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'import') {
      setActiveMode('json');
    }
  }, [searchParams]);

  const handleCopyTemplate = () => {
    setJsonText(JSON.stringify(SCHEMA_1_1_SAMPLE_COURSE, null, 2));
    setValidationResult(null);
    setErrorMsg(null);
    setSuccessMsg('Loaded Schema 1.1 Sample Course template into editor.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDownloadSample = () => {
    downloadCourseJSON(SCHEMA_1_1_SAMPLE_COURSE, 'swallern-sample-course-v1.1.json');
    setSuccessMsg('Downloaded "swallern-sample-course-v1.1.json"');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDownloadCurrentJSON = () => {
    if (!jsonText.trim()) {
      handleDownloadSample();
      return;
    }
    try {
      const parsed = JSON.parse(jsonText);
      const titleSlug = (parsed.course?.title || parsed.title || 'course')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      downloadCourseJSON(parsed, `${titleSlug || 'swallern-course'}.json`);
      setSuccessMsg('Course JSON downloaded successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      downloadCourseJSON(jsonText, 'swallern-course-draft.json');
      setSuccessMsg('Downloaded course JSON file.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleFormatJSON = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setErrorMsg(null);
      setSuccessMsg('JSON formatted.');
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err) {
      setErrorMsg(`JSON Syntax Error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
    }
  };

  const processImportedJSONText = (rawContent: string) => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(rawContent);
      setJsonText(JSON.stringify(parsed, null, 2));
      const val = validateSwallernCourse(parsed);
      setValidationResult(val);

      const title = parsed.course?.title || parsed.topic?.title || 'Course';
      setSuccessMsg(`Successfully loaded: "${title}"`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setJsonText(rawContent);
      setErrorMsg(`JSON Parse Error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) processImportedJSONText(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) processImportedJSONText(content);
    };
    reader.readAsText(file);
  };

  const handleValidateJSON = () => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(jsonText);
      const val = validateSwallernCourse(parsed);
      setValidationResult(val);
      if (val.valid) {
        setSuccessMsg('✓ Structure and bite-sized limits verified!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      setErrorMsg(`JSON Parse Error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
    }
  };

  const buildNormalizedJsonCourseData = (): any => {
    try {
      const parsed = JSON.parse(jsonText);
      const meta = parsed.course || parsed.topic || parsed;
      const rawSections = parsed.sections || [];

      const normalizedSections = rawSections.map((s: any, sIdx: number) => ({
        id: s.id || `sec_${sIdx + 1}`,
        title: s.title || `Module ${sIdx + 1}`,
        summary: s.summary || '',
        lessons: (s.lessons || [s]).map((l: any, lIdx: number) => ({
          id: l.id || `les_${sIdx + 1}_${lIdx + 1}`,
          title: l.title || `Lesson ${lIdx + 1}`,
          content: l.content || l.explanation || '',
          key_concept: l.key_concept || l.key_takeaway || '',
          visual: l.visual || { mode: 'auto', characterId: 'swallern_bear_v1', expression: 'curious', pose: 'standing' },
          media: l.media || [],
          knowledge_check: l.knowledge_check || {
            question: l.quiz?.question || l.question || '',
            explanation: l.quiz?.explanation || l.explanation || '',
            options: (l.quiz?.options || l.options || []).map((o: any) => ({
              text: typeof o === 'string' ? o : o.text || o.option_text || '',
              is_correct: typeof o === 'object' ? Boolean(o.is_correct) : false,
            })),
          },
        })),
      }));

      const finalQuiz = parsed.final_quiz || parsed.quiz || {
        title: `${meta.title || 'Course'} Review Quiz`,
        passing_score: 80,
        questions: (parsed.quiz?.questions || parsed.quiz_questions || []).map((q: any) => ({
          question: q.question,
          explanation: q.explanation || '',
          options: (q.options || []).map((o: any) => ({
            text: typeof o === 'string' ? o : o.text || o.option_text || '',
            is_correct: typeof o === 'object' ? Boolean(o.is_correct) : false,
          })),
        })),
      };

      return {
        title: meta.title || 'Imported Course',
        summary: meta.summary || '',
        category: meta.category || 'Science',
        difficulty: meta.difficulty || 'BEGINNER',
        visibility: meta.visibility || 'PRIVATE',
        learning_objective: meta.learning_objective || '',
        sections: normalizedSections,
        final_quiz: finalQuiz,
        quiz: finalQuiz,
        sources: parsed.sources || [],
      };
    } catch {
      return null;
    }
  };

  const handleLoadIntoBuilder = () => {
    setErrorMsg(null);
    if (!jsonText.trim()) {
      setErrorMsg('Please paste or drop Swallern course JSON.');
      return;
    }

    const courseObj = buildNormalizedJsonCourseData();
    if (!courseObj) {
      setErrorMsg('Unable to parse JSON into Swallern Course schema.');
      return;
    }

    setBuilderCourseData(courseObj);
    setActiveMode('builder');
    setSuccessMsg('Loaded into Course Builder workspace.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleOpenPreview = () => {
    setErrorMsg(null);
    if (!jsonText.trim()) {
      setErrorMsg('Please paste or upload course JSON to preview.');
      return;
    }

    const courseObj = buildNormalizedJsonCourseData();
    if (!courseObj) {
      setErrorMsg('Unable to parse JSON into Swallern Course schema.');
      return;
    }

    setPreviewData(courseObj);
    setShowLearnerPreview(true);
  };

  const handleJSONImportSubmit = async () => {
    setErrorMsg(null);
    if (!jsonText.trim()) {
      setErrorMsg('Please paste or upload Swallern course JSON.');
      return;
    }

    const courseObj = buildNormalizedJsonCourseData();
    if (!courseObj) return;

    const val = validateSwallernCourse(courseObj);
    if (!val.valid) {
      setErrorMsg(`JSON Course Validation Failed:\n• ${val.errors.map((e) => e.error).join('\n• ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/topics/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: JSON.stringify(courseObj) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setSuccessMsg(`Swallern Course "${data.topic?.title || 'Draft'}" imported successfully! Redirecting to dashboard...`);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Breadcrumbs & Back link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#64748B',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: '#F1F5F9',
                transition: 'all 0.12s ease',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Dashboard</span>
            </Link>

            <span style={{ color: '#CBD5E1' }}>/</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                Swallern Course Studio
              </span>
            </div>
          </div>

          {/* Center: Mode Switcher Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F1F5F9',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveMode('builder')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeMode === 'builder' ? '#FFFFFF' : 'transparent',
                color: activeMode === 'builder' ? '#2563EB' : '#64748B',
                fontWeight: activeMode === 'builder' ? 800 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeMode === 'builder' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Guided Builder</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('json')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeMode === 'json' ? '#FFFFFF' : 'transparent',
                color: activeMode === 'json' ? '#2563EB' : '#64748B',
                fontWeight: activeMode === 'json' ? 800 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeMode === 'json' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Import Topic JSON</span>
            </button>
          </div>

          {/* Right: Download Sample JSON quick button & Visual System badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDownloadSample}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                padding: '5px 11px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Download official sample JSON file"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download Sample JSON</span>
            </button>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#059669',
                backgroundColor: '#ECFDF5',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #A7F3D0',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Visual System v1</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Canvas */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem' }}>
        {activeMode === 'builder' ? (
          <CourseBuilder
            fullPage={true}
            onClose={() => router.push('/dashboard')}
            onTopicCreated={() => router.push('/dashboard')}
            onOpenLearnerPreview={(data) => {
              setPreviewData(data);
              setShowLearnerPreview(true);
            }}
            onSwitchToJSON={() => setActiveMode('json')}
            initialCourseData={builderCourseData}
          />
        ) : (
          /* Full Page JSON Import Studio */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* JSON Studio Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Import Course from JSON
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '3px 0 0' }}>
                  Upload a Swallern course JSON document or paste your topic definition to validate, preview, and load into the builder.
                </p>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #2563EB',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(37, 99, 235, 0.1)',
                  }}
                  title="Download full sample schema 1.1 JSON file"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download Sample JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Load Template in Editor</span>
                </button>

                <button
                  type="button"
                  onClick={handleFormatJSON}
                  disabled={!jsonText.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: jsonText.trim() ? 'pointer' : 'default',
                    opacity: jsonText.trim() ? 1 : 0.5,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  <span>Format JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleValidateJSON}
                  disabled={!jsonText.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #2563EB',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: jsonText.trim() ? 'pointer' : 'default',
                    opacity: jsonText.trim() ? 1 : 0.5,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>Validate Structure</span>
                </button>
              </div>
            </div>

            {/* Error / Success Notifications */}
            {errorMsg && (
              <div
                style={{
                  margin: '1rem 1.5rem 0',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div style={{ whiteSpace: 'pre-line' }}>{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  margin: '1rem 1.5rem 0',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div>{successMsg}</div>
              </div>
            )}

            {/* Body: Drag-and-drop file zone & Code Editor */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Drag and Drop Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropFile}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragging ? '2px dashed #2563EB' : '2px dashed #CBD5E1',
                  borderRadius: '12px',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#EFF6FF' : '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    margin: '0 auto 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>
                  Click to browse or drag and drop your course JSON file
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Supports Swallern schema v1.0 and v1.1 (.json)
                </div>

                {/* Direct download helper link */}
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSample();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download sample course JSON template (swallern-sample-course-v1.1.json)</span>
                  </button>
                </div>
              </div>

              {/* Validation Status Box */}
              {validationResult && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: validationResult.valid ? '#ECFDF5' : '#FEF2F2',
                    border: `1.5px solid ${validationResult.valid ? '#A7F3D0' : '#FECACA'}`,
                    fontSize: '0.82rem',
                  }}
                >
                  {validationResult.valid ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', fontWeight: 800 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Course JSON is valid and complies with Swallern bite-sized limits!</span>
                    </div>
                  ) : (
                    <div style={{ color: '#991B1B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '6px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Course Validation Failed ({validationResult.errors.length} errors):</span>
                      </div>
                      <ul style={{ margin: '4px 0 0', paddingLeft: '1.25rem', lineHeight: 1.5 }}>
                        {validationResult.errors.map((e, idx) => (
                          <li key={idx}>{e.error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* JSON Code Area */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                    Raw Course JSON Document
                  </label>
                  {jsonText.trim() && (
                    <button
                      type="button"
                      onClick={handleDownloadCurrentJSON}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Download JSON</span>
                    </button>
                  )}
                </div>

                <textarea
                  rows={14}
                  placeholder="Paste or drop Swallern Course JSON (schema_version 1.1)..."
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setValidationResult(null);
                  }}
                  style={{
                    width: '100%',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: '0.82rem',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#0F172A',
                    color: '#38BDF8',
                    lineHeight: 1.5,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {jsonText.trim() && (
                  <>
                    <button
                      type="button"
                      onClick={handleLoadIntoBuilder}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <span>Load into Guided Builder</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenPreview}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#F8FAFC',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>Learner Experience Preview</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleJSONImportSubmit}
                  disabled={submitting}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: submitting ? 'default' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {submitting ? 'Importing...' : 'Import & Save Course'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Interactive Learner Experience Simulation Modal */}
      {showLearnerPreview && previewData && (
        <LearnerCoursePreview
          courseData={previewData}
          onClose={() => setShowLearnerPreview(false)}
        />
      )}
    </div>
  );
}

export default function CourseBuilderPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
          Loading Swallern Course Studio...
        </div>
      }
    >
      <BuilderPageContent />
    </Suspense>
  );
}
