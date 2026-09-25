'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/components/ui';
import { LessonData } from '@/lib/content/contract';
import { createClient } from '@/lib/supabase/client';

interface LessonSectionProps {
  lesson?: LessonData;
}

export const LessonSection: React.FC<LessonSectionProps> = ({ lesson }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!lesson || !lesson.sections || lesson.sections.length === 0) {
    return null;
  }

  const currentSection = lesson.sections[currentStep];
  const totalSteps = lesson.sections.length;

  const handleFinishLesson = async () => {
    setCompleted(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && lesson.id) {
        await (supabase.from('lesson_progress') as any).upsert(
          {
            user_id: user.id,
            lesson_id: lesson.id,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' }
        );
      }
    } catch {
      // Silently handle progress saving error
    }
  };

  return (
    <section id="interactive-lesson" style={{ margin: 'var(--space-8) 0' }} aria-label="Interactive Lesson">
      <Card style={{ borderColor: 'var(--color-brand-indigo)', borderWidth: '2px', backgroundColor: '#FAFAFF' }}>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Badge variant="indigo">Interactive Lesson</Badge>
              <Badge variant="neutral">{lesson.estimated_minutes} min read</Badge>
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-brand-indigo)' }}>
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          <CardTitle as="h2" style={{ fontSize: 'var(--font-size-2xl)' }}>
            {lesson.title}
          </CardTitle>
          {lesson.summary && (
            <CardDescription style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-neutral-slate)' }}>
              {lesson.summary}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent style={{ gap: 'var(--space-6)' }}>
          {/* Section Progress Bar */}
          <div style={{ display: 'flex', gap: '4px', height: '6px', width: '100%', borderRadius: '3px', overflow: 'hidden', backgroundColor: 'var(--color-neutral-border)' }}>
            {lesson.sections.map((_, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  backgroundColor: idx <= currentStep ? 'var(--color-brand-indigo)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
              />
            ))}
          </div>

          {/* Current Section Content */}
          <div style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-border)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-neutral-dark)', marginBottom: 'var(--space-3)' }}>
              {currentStep + 1}. {currentSection.title}
            </h3>

            <p style={{ color: 'var(--color-neutral-dark)', fontSize: 'var(--font-size-base)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
              {currentSection.content}
            </p>

            {currentSection.key_takeaway && (
              <div
                style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: '#EEF2FF',
                  borderLeft: '4px solid var(--color-brand-indigo)',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                }}
              >
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-brand-indigo)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Key Takeaway
                </span>
                <p style={{ margin: 'var(--space-1) 0 0 0', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: '#312E81' }}>
                  {currentSection.key_takeaway}
                </p>
              </div>
            )}
          </div>

          {/* Step Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              ← Previous Step
            </Button>

            {currentStep < totalSteps - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1))}
              >
                Next Step →
              </Button>
            ) : (
              <Button
                variant={completed ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleFinishLesson}
              >
                {completed ? '✓ Lesson Completed' : 'Finish Lesson ✓'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
