'use client';

import React, { useState, useMemo } from 'react';
import { BUILDER_STEPS, BuilderCourseData, BuilderStep } from './types';
import { CourseProgressStepper } from './CourseProgressStepper';
import { BuilderNavigation } from './BuilderNavigation';
import { Step1Basics } from './Step1Basics';
import { Step2Structure } from './Step2Structure';
import { Step3Lessons } from './Step3Lessons';
import { Step4Visuals } from './Step4Visuals';
import { Step5Review } from './Step5Review';
import { Step6Publish } from './Step6Publish';
import { validateSwallernCourse } from '@/lib/learning/validation';
import { getStepValidation } from './stepValidation';
import { SCHEMA_1_1_SAMPLE_COURSE, downloadCourseJSON } from '@/lib/learning/courseTemplate';

interface CourseBuilderProps {
  onClose: () => void;
  onTopicCreated: () => void;
  onOpenLearnerPreview: (data: BuilderCourseData) => void;
  onSwitchToJSON?: () => void;
  initialCourseData?: BuilderCourseData | null;
  fullPage?: boolean;
}

const DEFAULT_COURSE_DATA: BuilderCourseData = {
  title: 'How Bears Prepare for Winter',
  summary: 'Discover how Katmai brown bears enter hyperphagia to build energy reserves before winter hibernation.',
  category: 'Biology',
  difficulty: 'BEGINNER',
  visibility: 'PUBLIC',
  sections: [
    {
      id: 'sec_1',
      title: 'Hyperphagia and Metabolism',
      summary: 'The intensive feeding period where bears consume up to 40 pounds of salmon daily.',
      lessons: [
        {
          id: 'les_1',
          title: 'Building Fat Reserves',
          content: 'During late summer and early autumn, bears enter a state called hyperphagia. Their bodies continuously signal intense hunger, driving them to gorge on fatty sockeye salmon and berries to gain over four pounds of body fat each day.',
          key_concept: 'Hyperphagia is a biological state of relentless hunger that drives pre-hibernation weight gain.',
          visual: {
            mode: 'auto',
            characterId: 'swallern_bear_v1',
            expression: 'curious',
            pose: 'standing',
          },
          knowledge_check: {
            question: 'What biological state causes bears to eat non-stop before winter?',
            options: [
              { text: 'Hyperphagia', is_correct: true },
              { text: 'Torpor', is_correct: false },
              { text: 'Estivation', is_correct: false },
            ],
            explanation: 'Hyperphagia forces bears to consume massive caloric reserves required for hibernation.',
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
        ],
        explanation: 'Rich salmon diets allow bears to store critical fat for metabolic insulation.',
      },
    ],
  },
  sources: [
    {
      title: 'Katmai Fat Bear Biology Guide',
      url: 'https://www.nps.gov/katm/learn/nature/fat-bear-week.htm',
      publisher: 'National Park Service',
    },
  ],
};

/**
 * CourseBuilder Component
 * Guided 6-Step Workflow implementing progressive disclosure, validation gating,
 * Swallern Visual Engine integration, and clean brand consistency.
 */
export const CourseBuilder: React.FC<CourseBuilderProps> = ({
  onClose,
  onTopicCreated,
  onOpenLearnerPreview,
  onSwitchToJSON,
  initialCourseData,
  fullPage = false,
}) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('basics');
  const [completedSteps, setCompletedSteps] = useState<Set<BuilderStep>>(new Set(['basics']));
  const [courseData, setCourseData] = useState<BuilderCourseData>(initialCourseData || DEFAULT_COURSE_DATA);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<string>('Saved just now');

  const currentIndex = BUILDER_STEPS.findIndex((s) => s.id === currentStep);

  // Compute step-specific validation result
  const stepValidation = useMemo(
    () => getStepValidation(currentStep, courseData),
    [currentStep, courseData]
  );

  const updateCourseData = (patch: Partial<BuilderCourseData>) => {
    setCourseData((prev) => ({ ...prev, ...patch }));
    setSavedStatus('Editing...');
    setTimeout(() => setSavedStatus('Saved just now'), 600);
  };

  const markCompleted = (step: BuilderStep) => {
    setCompletedSteps((prev) => new Set([...Array.from(prev), step]));
  };

  const handleNextStep = () => {
    // Strict Validation Gating: Do not proceed if current step has violations
    if (!stepValidation.isValid) {
      setErrorMsg(`Please resolve the following requirements before continuing:\n• ${stepValidation.errors.join('\n• ')}`);
      return;
    }

    setErrorMsg(null);
    markCompleted(currentStep);
    if (currentIndex < BUILDER_STEPS.length - 1) {
      setCurrentStep(BUILDER_STEPS[currentIndex + 1].id);
    } else {
      handleSubmitCourse();
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (currentIndex > 0) {
      setCurrentStep(BUILDER_STEPS[currentIndex - 1].id);
    }
  };

  const handleSubmitCourse = async () => {
    setErrorMsg(null);
    const valResult = validateSwallernCourse(courseData);
    if (!valResult.valid) {
      setErrorMsg(`Cannot submit course. Learning violations:\n• ${valResult.errors.map((e) => e.error).join('\n• ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const firstSec = courseData.sections[0] || {};
      const firstLes = firstSec.lessons?.[0] || {};

      const payload = {
        title: courseData.title,
        summary: courseData.summary,
        category: courseData.category,
        difficulty: courseData.difficulty,
        explanation: firstLes.content || courseData.summary,
        quick_answer: courseData.summary,
        key_concepts: firstLes.key_concept ? [firstLes.key_concept] : [],
        lesson_title: firstLes.title || courseData.title,
        lesson_sections: courseData.sections.map((s) => ({
          title: s.title,
          content: s.lessons?.[0]?.content || s.summary || '',
          key_takeaway: s.lessons?.[0]?.key_concept || '',
        })),
        quiz_questions: courseData.final_quiz.questions.map((q) => ({
          question: q.question,
          explanation: q.explanation,
          options: q.options.map((o) => ({
            option_text: o.text,
            is_correct: o.is_correct,
          })),
        })),
        sources: courseData.sources || [],
      };

      const res = await fetch('/api/user/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed saving course');

      onTopicCreated();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: fullPage ? '100%' : '100%',
        minHeight: fullPage ? 'calc(100vh - 120px)' : undefined,
        backgroundColor: '#F8FAFC',
        borderRadius: fullPage ? '16px' : '0',
        overflow: 'hidden',
        border: fullPage ? '1.5px solid #E2E8F0' : 'none',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          padding: '0.85rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Swallern Course Builder
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
              Step {currentIndex + 1} of {BUILDER_STEPS.length}: {BUILDER_STEPS[currentIndex]?.label}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => downloadCourseJSON(SCHEMA_1_1_SAMPLE_COURSE, 'swallern-sample-course-v1.1.json')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Download Schema 1.1 Sample Course JSON"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download Sample JSON</span>
          </button>

          {onSwitchToJSON && (
            <button
              type="button"
              onClick={onSwitchToJSON}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Import Topic JSON</span>
            </button>
          )}

          {!fullPage && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close Builder"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress Stepper */}
      <CourseProgressStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onSelectStep={(step) => {
          // Allow going back to previous steps, but only advance if valid
          const targetIndex = BUILDER_STEPS.findIndex((s) => s.id === step);
          if (targetIndex > currentIndex && !stepValidation.isValid) {
            setErrorMsg(`Please resolve the requirements on this step before advancing:\n• ${stepValidation.errors.join('\n• ')}`);
            return;
          }
          setErrorMsg(null);
          setCurrentStep(step);
        }}
      />

      {/* Validation Requirements Alert Banner */}
      {!stepValidation.isValid && (
        <div
          style={{
            backgroundColor: '#FFFBEB',
            borderBottom: '1px solid #FDE68A',
            color: '#B45309',
            padding: '8px 1.5rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 800 }}>Complete current step requirements to proceed:</span>{' '}
            <span>{stepValidation.errors[0]}</span>
            {stepValidation.errors.length > 1 && (
              <span style={{ fontWeight: 600, color: '#92400E' }}> (+{stepValidation.errors.length - 1} more)</span>
            )}
          </div>
        </div>
      )}

      {/* General Submission Error Alert */}
      {errorMsg && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            borderBottom: '1px solid #FECACA',
            color: '#B91C1C',
            padding: '10px 1.5rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            whiteSpace: 'pre-line',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Main Step Canvas */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        {currentStep === 'basics' && <Step1Basics data={courseData} onChange={updateCourseData} />}
        {currentStep === 'structure' && <Step2Structure data={courseData} onChange={updateCourseData} />}
        {currentStep === 'lessons' && <Step3Lessons data={courseData} onChange={updateCourseData} />}
        {currentStep === 'visuals' && <Step4Visuals data={courseData} onChange={updateCourseData} />}
        {currentStep === 'review' && (
          <Step5Review data={courseData} onOpenPreview={() => onOpenLearnerPreview(courseData)} />
        )}
        {currentStep === 'publish' && (
          <Step6Publish
            data={courseData}
            onChange={updateCourseData}
            onSubmitForApproval={handleSubmitCourse}
            onSaveDraft={handleSubmitCourse}
            isSubmitting={submitting}
          />
        )}
      </div>

      {/* Sticky Bottom Navigation Bar with Strict Validation Gating */}
      <BuilderNavigation
        currentStep={currentStep}
        savedStatusText={savedStatus}
        isSubmitting={submitting}
        canContinue={stepValidation.isValid}
        stepErrors={stepValidation.errors}
        onBack={handlePrevStep}
        onContinue={handleNextStep}
        onSaveDraft={handleSubmitCourse}
      />
    </div>
  );
};
