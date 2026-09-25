'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/components/ui';
import { QuizData } from '@/lib/content/contract';
import { createClient } from '@/lib/supabase/client';

interface QuizSectionProps {
  quiz?: QuizData;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ quiz }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ optionId: string; isCorrect: boolean }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return null;
  }

  const currentQuestion = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId || isAnswered) return;
    const selectedOpt = currentQuestion.options.find((o) => o.id === selectedOptionId);
    const isCorrect = selectedOpt ? selectedOpt.is_correct : false;

    setIsAnswered(true);
    setUserAnswers((prev) => [...prev, { optionId: selectedOptionId, isCorrect }]);
  };

  const handleNextQuestion = async () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);

      // Persist quiz attempt if authenticated
      try {
        const finalAnswers = userAnswers;
        const finalScoreCount = finalAnswers.filter((a) => a.isCorrect).length;
        const finalPercent = Math.round((finalScoreCount / totalQuestions) * 100);
        const finalPassed = finalPercent >= (quiz.passing_score || 80);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user && quiz.id) {
          await (supabase.from('quiz_attempts') as any).insert({
            user_id: user.id,
            quiz_id: quiz.id,
            score: finalPercent,
            total_questions: totalQuestions,
            passed: finalPassed,
            answers: finalAnswers,
          });
        }
      } catch {
        // Silently handle quiz attempt saving error
      }
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setUserAnswers([]);
    setIsFinished(false);
  };

  const scoreCount = userAnswers.filter((a) => a.isCorrect).length;
  const scorePercent = Math.round((scoreCount / totalQuestions) * 100);
  const isPassed = scorePercent >= (quiz.passing_score || 80);

  return (
    <section id="knowledge-quiz" style={{ margin: 'var(--space-8) 0' }} aria-label="Topic Knowledge Quiz">
      <Card style={{ borderColor: 'var(--color-brand-cyan)', borderWidth: '2px', backgroundColor: '#F0FDF4' }}>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Badge variant="success">Knowledge Check</Badge>
              <Badge variant="neutral">{totalQuestions} Questions</Badge>
            </div>
            {!isFinished && (
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-neutral-slate)' }}>
                Question {currentIdx + 1} of {totalQuestions}
              </span>
            )}
          </div>

          <CardTitle as="h2" style={{ fontSize: 'var(--font-size-2xl)' }}>
            {quiz.title}
          </CardTitle>
          <CardDescription style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-neutral-slate)' }}>
            Test your understanding with instant explanation feedback.
          </CardDescription>
        </CardHeader>

        <CardContent style={{ gap: 'var(--space-6)' }}>
          {!isFinished ? (
            <>
              {/* Question Text */}
              <div style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-border)' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-neutral-dark)', marginBottom: 'var(--space-4)' }}>
                  {currentIdx + 1}. {currentQuestion.question}
                </h3>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;

                    let bg = '#FFFFFF';
                    let border = '1px solid var(--color-neutral-border)';
                    let color = 'var(--color-neutral-dark)';

                    if (isAnswered) {
                      if (opt.is_correct) {
                        bg = '#DCFCE7';
                        border = '2px solid #16A34A';
                        color = '#14532D';
                      } else if (isSelected && !opt.is_correct) {
                        bg = '#FEE2E2';
                        border = '2px solid #DC2626';
                        color = '#7F1D1D';
                      }
                    } else if (isSelected) {
                      bg = '#EFF6FF';
                      border = '2px solid var(--color-brand-indigo)';
                      color = 'var(--color-brand-indigo)';
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        disabled={isAnswered}
                        style={{
                          textAlign: 'left',
                          padding: 'var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: bg,
                          border,
                          color,
                          fontSize: 'var(--font-size-base)',
                          fontWeight: isSelected || (isAnswered && opt.is_correct) ? 600 : 400,
                          cursor: isAnswered ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{opt.option_text}</span>
                        {isAnswered && opt.is_correct && (
                          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#16A34A' }}>
                            ✓ Correct
                          </span>
                        )}
                        {isAnswered && isSelected && !opt.is_correct && (
                          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#DC2626' }}>
                            ✗ Incorrect
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card after answer submission */}
                {isAnswered && (
                  <div
                    style={{
                      marginTop: 'var(--space-4)',
                      padding: 'var(--space-4)',
                      backgroundColor: '#F8FAFC',
                      borderLeft: '4px solid #3B82F6',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Explanation
                    </span>
                    <p style={{ margin: 'var(--space-1) 0 0 0', fontSize: 'var(--font-size-sm)', color: '#1E293B', lineHeight: 1.5 }}>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {!isAnswered ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCheckAnswer}
                    disabled={!selectedOptionId}
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNextQuestion}
                  >
                    {currentIdx < totalQuestions - 1 ? 'Next Question →' : 'See Results →'}
                  </Button>
                )}
              </div>
            </>
          ) : (
            /* Quiz Completed Summary */
            <div style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-border)', textAlign: 'center' }}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <Badge variant={isPassed ? 'success' : 'warning'}>
                  {isPassed ? 'Quiz Passed' : 'Quiz Complete'}
                </Badge>
              </div>

              <h3 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-neutral-dark)', margin: 0 }}>
                {scorePercent}%
              </h3>
              <p style={{ color: 'var(--color-neutral-slate)', fontSize: 'var(--font-size-base)', marginTop: 'var(--space-2)' }}>
                You answered <strong>{scoreCount}</strong> out of <strong>{totalQuestions}</strong> questions correctly.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <Button variant="secondary" size="sm" onClick={handleReset}>
                  Retake Quiz
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
