'use client';

import React, { useState, useRef, useEffect } from 'react';
import { countWords, SWALLERN_CONTENT_LIMITS, validateSwallernCourse, CourseValidationResult } from '@/lib/learning/validation';
import { LearnerCoursePreview } from './LearnerCoursePreview';
import { CourseBuilder } from './builder/CourseBuilder';
import { BuilderCourseData } from './builder/types';
import { SCHEMA_1_1_SAMPLE_COURSE, downloadCourseJSON } from '@/lib/learning/courseTemplate';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicCreated: () => void;
  initialMode?: 'builder' | 'json';
}

const SCHEMA_1_1_COURSE_TEMPLATE = {
  schema_version: '1.1',
  course: {
    title: 'How Bears Prepare for Winter',
    summary: 'Discover how Katmai brown bears enter hyperphagia to build energy reserves before winter hibernation.',
    learning_objective: 'Understand the physiological and ecological mechanisms of bear hibernation.',
    category: 'Science',
    difficulty: 'BEGINNER',
  },
  sections: [
    {
      title: 'Hyperphagia and Metabolism',
      summary: 'The intensive feeding period where bears consume up to 40 pounds of salmon daily.',
      lessons: [
        {
          title: 'Building Fat Reserves',
          content: 'During late summer and early autumn, bears enter a state called hyperphagia. Their bodies continuously signal intense hunger, driving them to gorge on fatty sockeye salmon and berries to gain over four pounds of body fat each day.',
          key_concept: 'Hyperphagia is a biological state of relentless hunger that drives pre-hibernation weight gain.',
          visual: {
            mode: 'auto',
            character: 'swallern_bear_v1',
          },
          media: [
            {
              type: 'gif',
              source: 'upload',
              asset_key: 'bear_feeding_gif',
            },
          ],
          knowledge_check: {
            question: 'What biological state causes bears to eat non-stop before winter?',
            options: [
              { text: 'Hyperphagia', is_correct: true },
              { text: 'Torpor', is_correct: false },
              { text: 'Estivation', is_correct: false },
              { text: 'Circadian Rest', is_correct: false },
            ],
            explanation: 'Hyperphagia forces bears to consume massive caloric reserves required for months of hibernation.',
          },
        },
      ],
    },
  ],
  final_quiz: {
    title: 'Bear Biology Review Quiz',
    passing_score: 80,
    questions: [
      {
        question: 'How much weight can a Katmai brown bear gain daily during peak feeding?',
        options: [
          { text: 'Up to 4 pounds of fat per day', is_correct: true },
          { text: 'Under 0.5 pounds per day', is_correct: false },
          { text: 'Bears lose weight during hyperphagia', is_correct: false },
        ],
        explanation: 'Rich salmon diets allow bears to store critical fat for metabolic insulation.',
      },
    ],
  },
  sources: [
    {
      id: 'src-1',
      title: 'Katmai Fat Bear Biology Guide',
      url: 'https://www.nps.gov/katm/learn/nature/fat-bear-week.htm',
      publisher: 'National Park Service',
    },
  ],
  research: {
    status: 'verified',
    researched_at: new Date().toISOString(),
  },
};

export function CreateTopicModal({
  isOpen,
  onClose,
  onTopicCreated,
  initialMode = 'builder',
}: CreateTopicModalProps) {
  const [activeMode, setActiveMode] = useState<'builder' | 'json'>(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Drag and drop / file upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Loaded data for guided builder
  const [builderCourseData, setBuilderCourseData] = useState<BuilderCourseData | null>(null);

  // Learner Preview Modal State
  const [showLearnerPreview, setShowLearnerPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // JSON Form States
  const [jsonText, setJsonText] = useState('');
  const [validationResult, setValidationResult] = useState<CourseValidationResult | null>(null);

  // Media Upload State: assetKey -> uploadedUrl
  const [uploadedMediaMap, setUploadedMediaMap] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [requiredUploads, setRequiredUploads] = useState<Array<{ asset_key: string; media_type: 'IMAGE' | 'GIF'; location: string; uploaded_url?: string }>>([]);

  useEffect(() => {
    if (isOpen && initialMode) {
      setActiveMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleCopyTemplate = () => {
    setJsonText(JSON.stringify(SCHEMA_1_1_SAMPLE_COURSE, null, 2));
    setValidationResult(null);
    setErrorMsg(null);
    detectMediaUploads(SCHEMA_1_1_SAMPLE_COURSE);
    setSuccessMsg('Loaded Schema 1.1 Sample Course template.');
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
      setSuccessMsg('Downloaded course JSON file.');
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
    } catch (err) {
      setErrorMsg(`JSON Syntax Error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
    }
  };

  const detectMediaUploads = (parsedDoc: any) => {
    const uploads: Array<{ asset_key: string; media_type: 'IMAGE' | 'GIF'; location: string; uploaded_url?: string }> = [];
    const keys = new Set<string>();

    const checkItem = (m: any, loc: string) => {
      if (!m || typeof m !== 'object') return;
      const key = m.asset_key || (typeof m.url === 'string' && m.url.startsWith('SWALLERN_UPLOAD:') ? m.url.replace('SWALLERN_UPLOAD:', '') : null);
      if (key && !keys.has(key)) {
        keys.add(key);
        const isGif = (m.type || '').toLowerCase().includes('gif');
        uploads.push({ asset_key: key, media_type: isGif ? 'GIF' : 'IMAGE', location: loc });
      }
    };

    if (Array.isArray(parsedDoc.sections)) {
      parsedDoc.sections.forEach((s: any, sIdx: number) => {
        if (Array.isArray(s.lessons)) {
          s.lessons.forEach((l: any, lIdx: number) => {
            if (Array.isArray(l.media)) {
              l.media.forEach((m: any) => checkItem(m, `Module ${sIdx + 1}, Lesson ${lIdx + 1}`));
            }
          });
        }
      });
    }
    setRequiredUploads(uploads);
  };

  const processImportedJSONText = (rawContent: string) => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(rawContent);
      setJsonText(JSON.stringify(parsed, null, 2));
      detectMediaUploads(parsed);
      const val = validateSwallernCourse(parsed);
      setValidationResult(val);

      const title = parsed.course?.title || parsed.topic?.title || 'Course';
      setSuccessMsg(`Successfully loaded topic: "${title}"`);
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
      if (content) {
        processImportedJSONText(content);
      }
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
      if (content) {
        processImportedJSONText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleValidateJSON = () => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(jsonText);
      detectMediaUploads(parsed);
      const val = validateSwallernCourse(parsed);
      setValidationResult(val);
    } catch (err) {
      setErrorMsg(`JSON Parse Error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
    }
  };

  const handleMediaFileUpload = async (assetKey: string, file: File, mediaType: 'IMAGE' | 'GIF') => {
    setUploadingKey(assetKey);
    setErrorMsg(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('asset_key', assetKey);
      fd.append('media_type', mediaType);

      const res = await fetch('/api/user/media/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadedMediaMap((prev) => ({
        ...prev,
        [assetKey]: data.url,
      }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'File upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

  const buildNormalizedJsonCourseData = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed.sections)) {
        parsed.sections.forEach((s: any) => {
          if (Array.isArray(s.lessons)) {
            s.lessons.forEach((l: any) => {
              if (Array.isArray(l.media)) {
                l.media.forEach((m: any) => {
                  const k = m.asset_key || (typeof m.url === 'string' && m.url.startsWith('SWALLERN_UPLOAD:') ? m.url.replace('SWALLERN_UPLOAD:', '') : null);
                  if (k && uploadedMediaMap[k]) {
                    m.url = uploadedMediaMap[k];
                  }
                });
              }
            });
          }
        });
      }
      return {
        title: parsed.course?.title || parsed.topic?.title || 'Untitled Course',
        summary: parsed.course?.summary || parsed.topic?.summary || '',
        category: parsed.course?.category || parsed.topic?.category || 'Science',
        difficulty: parsed.course?.difficulty || parsed.topic?.difficulty || 'BEGINNER',
        sections: parsed.sections || [],
        quiz: parsed.final_quiz || parsed.quiz,
        sources: parsed.sources || [],
      };
    } catch {
      return null;
    }
  };

  const handleLoadIntoBuilder = () => {
    const data = buildNormalizedJsonCourseData();
    if (!data) {
      setErrorMsg('Please paste or upload valid course JSON first.');
      return;
    }

    const transformed: BuilderCourseData = {
      title: data.title,
      summary: data.summary,
      category: data.category,
      difficulty: data.difficulty as any,
      visibility: 'PUBLIC',
      sections: data.sections.map((s: any, sIdx: number) => ({
        id: s.id || `sec_${sIdx + 1}`,
        title: s.title || `Section ${sIdx + 1}`,
        summary: s.summary || '',
        lessons: (s.lessons || []).map((l: any, lIdx: number) => ({
          id: l.id || `les_${sIdx + 1}_${lIdx + 1}`,
          title: l.title || `Lesson ${lIdx + 1}`,
          content: l.content || '',
          key_concept: l.key_concept || '',
          visual: l.visual || { mode: 'auto', characterId: 'swallern_bear_v1', expression: 'curious', pose: 'standing' },
          knowledge_check: l.knowledge_check,
        })),
      })),
      final_quiz: data.quiz || {
        title: `${data.title} Review Quiz`,
        passing_score: 80,
        questions: [],
      },
      sources: data.sources || [],
    };

    setBuilderCourseData(transformed);
    setActiveMode('builder');
  };

  const handleOpenPreview = () => {
    setErrorMsg(null);
    const data = buildNormalizedJsonCourseData();
    if (!data) {
      setErrorMsg('Please enter valid course data to preview.');
      return;
    }

    const val = validateSwallernCourse(data);
    if (!val.valid) {
      setErrorMsg(`Course structure validation failed:\n• ${val.errors.map((e) => e.error).join('\n• ')}`);
      return;
    }

    setPreviewData(data);
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

    const unuploaded = requiredUploads.filter((u) => !uploadedMediaMap[u.asset_key] && !u.uploaded_url);
    if (unuploaded.length > 0) {
      setErrorMsg(`Please upload required media assets before submitting: ${unuploaded.map((u) => u.asset_key).join(', ')}`);
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

      setSuccessMsg(`Swallern Course "${data.topic?.title || 'Draft'}" imported successfully!`);
      setTimeout(() => {
        onTopicCreated();
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '960px',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            border: '1.5px solid #E2E8F0',
          }}
        >
          {/* Top Mode Selector Header Bar */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            {/* Mode switch pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveMode('builder')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: activeMode === 'builder' ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                  backgroundColor: activeMode === 'builder' ? '#EFF6FF' : '#FFFFFF',
                  color: activeMode === 'builder' ? '#2563EB' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>🪄</span>
                <span>Guided Course Builder</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('json')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: activeMode === 'json' ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                  backgroundColor: activeMode === 'json' ? '#EFF6FF' : '#FFFFFF',
                  color: activeMode === 'json' ? '#2563EB' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
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

            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.4rem',
                color: '#94A3B8',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '4px',
              }}
            >
              ×
            </button>
          </div>

          {activeMode === 'builder' ? (
            <CourseBuilder
              onClose={onClose}
              onTopicCreated={onTopicCreated}
              onOpenLearnerPreview={(data) => {
                setPreviewData(data as any);
                setShowLearnerPreview(true);
              }}
              onSwitchToJSON={() => setActiveMode('json')}
              initialCourseData={builderCourseData}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
              <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Import Topic from JSON
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                  Upload a Swallern course JSON file or paste your topic definition to validate, preview, and save.
                </p>
              </div>

              <div className="swallern-scrollbar" style={{ flex: 1, padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {errorMsg && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Drag and Drop File Upload Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDropFile}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? '#2563EB' : '#CBD5E1'}`,
                    borderRadius: '14px',
                    backgroundColor: isDragging ? '#EFF6FF' : '#F8FAFC',
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
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
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', marginBottom: '2px' }}>
                    Click to browse or drop your topic .json file here
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                    Supports Schema 1.1 format with course metadata, sections, lessons, and quizzes
                  </div>

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

                {/* Helper action pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#EFF6FF',
                      border: '1.5px solid #2563EB',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      color: '#2563EB',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
                      gap: '5px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Load Template in Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFormatJSON}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    <span>Format JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleValidateJSON}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>Validate Structure</span>
                  </button>
                </div>

                {/* Validation Result Box */}
                {validationResult && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: validationResult.valid ? '#ECFDF5' : '#FEF2F2',
                      border: `1px solid ${validationResult.valid ? '#A7F3D0' : '#FECACA'}`,
                      color: validationResult.valid ? '#065F46' : '#991B1B',
                      fontSize: '0.82rem',
                    }}
                  >
                    {validationResult.valid ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <strong>Course JSON is valid and complies with Swallern bite-sized limits!</strong>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <strong>Course Validation Failed ({validationResult.errors.length} errors):</strong>
                        </div>
                        <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                          {validationResult.errors.map((e, idx) => (
                            <li key={idx}>{e.error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Required Media Uploads */}
                {requiredUploads.length > 0 && (
                  <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400E', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>Media Uploads Required ({requiredUploads.length})</span>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {requiredUploads.map((req, idx) => {
                        const isUploaded = !!uploadedMediaMap[req.asset_key] || !!req.uploaded_url;
                        return (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#FFFFFF',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #FCD34D',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                              Key: <code>{req.asset_key}</code> ({req.media_type})
                            </div>
                            {isUploaded ? (
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Uploaded</span>
                              </span>
                            ) : (
                              <label style={{ backgroundColor: '#2563EB', color: '#FFF', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                                {uploadingKey === req.asset_key ? 'Uploading...' : `Upload ${req.media_type}`}
                                <input
                                  type="file"
                                  accept={req.media_type === 'GIF' ? 'image/gif' : 'image/*'}
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleMediaFileUpload(req.asset_key, f, req.media_type);
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* JSON Textarea */}
                <textarea
                  rows={13}
                  placeholder="Paste or drop Swallern Course JSON (schema_version 1.1)..."
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setValidationResult(null);
                  }}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#0F172A',
                    color: '#38BDF8',
                    lineHeight: 1.5,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Bottom Action Footer */}
              <div
                style={{
                  padding: '0.85rem 1.5rem',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {jsonText.trim() && (
                    <>
                      <button
                        type="button"
                        onClick={handleLoadIntoBuilder}
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        Edit in Builder →
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenPreview}
                        style={{
                          backgroundColor: '#F8FAFC',
                          color: '#334155',
                          border: '1px solid #CBD5E1',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        Preview
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
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    {submitting ? 'Importing...' : 'Import & Save Draft'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLearnerPreview && previewData && (
        <LearnerCoursePreview
          courseData={previewData}
          onClose={() => setShowLearnerPreview(false)}
        />
      )}
    </>
  );
}
