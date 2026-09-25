'use client';

import React, { useState } from 'react';
import { BuilderCourseData } from './types';
import { SwallernVisualEngine, VisualAssetItem } from '@/components/visuals/SwallernVisualEngine';
import { UserVisualSelectionMode } from '@/components/visuals/SwallernVisualSelector';
import { CharacterExpression, CharacterPose } from '@/lib/visuals/characters';

interface Step4VisualsProps {
  data: BuilderCourseData;
  onChange: (updated: Partial<BuilderCourseData>) => void;
}

/**
 * Step 4 — Swallern Visual Engine Studio
 * Allows the creator to search, browse, scroll, and select high-quality animations, GIFs, diagrams,
 * illustrations, and mascot poses from the Swallern Visual Library for every lesson.
 */
export const Step4Visuals: React.FC<Step4VisualsProps> = ({ data, onChange }) => {
  const sections = data.sections || [];

  // Build a flat list of all lessons for quick switching
  const allLessons = sections.flatMap((sec, sIdx) =>
    (sec.lessons || []).map((les, lIdx) => ({
      sectionIndex: sIdx,
      lessonIndex: lIdx,
      moduleNumber: sIdx + 1,
      lessonNumber: lIdx + 1,
      sectionTitle: sec.title,
      lessonTitle: les.title,
      lessonId: les.id,
      visual: les.visual,
    }))
  );

  const [activeLessonKey, setActiveLessonKey] = useState<number>(0);

  const currentActiveLesson = allLessons[activeLessonKey] || allLessons[0];

  const handleSelectAsset = (asset: VisualAssetItem) => {
    if (!currentActiveLesson) return;

    const updatedSections = sections.map((sec, sIdx) => {
      if (sIdx === currentActiveLesson.sectionIndex) {
        const lessons = (sec.lessons || []).map((les, lIdx) => {
          if (lIdx === currentActiveLesson.lessonIndex) {
            return {
              ...les,
              visual: {
                mode: asset.mode as UserVisualSelectionMode,
                characterId: asset.characterId || 'swallern_bear_v1',
                expression: (asset.expression as CharacterExpression) || 'curious',
                pose: (asset.pose as CharacterPose) || 'standing',
              },
              media: [
                {
                  type: asset.mediaType,
                  asset_key: asset.id,
                  credit: asset.credit,
                },
              ],
            };
          }
          return les;
        });
        return { ...sec, lessons };
      }
      return sec;
    });

    onChange({ sections: updatedSections });
  };

  const handleCustomUpload = (file: File) => {
    if (!currentActiveLesson) return;
    const objectUrl = URL.createObjectURL(file);

    const updatedSections = sections.map((sec, sIdx) => {
      if (sIdx === currentActiveLesson.sectionIndex) {
        const lessons = (sec.lessons || []).map((les, lIdx) => {
          if (lIdx === currentActiveLesson.lessonIndex) {
            return {
              ...les,
              visual: {
                mode: 'C_REAL_WORLD' as UserVisualSelectionMode,
                characterId: 'swallern_bear_v1',
                expression: 'happy' as CharacterExpression,
                pose: 'standing' as CharacterPose,
              },
              media: [
                {
                  type: 'CUSTOM_UPLOAD',
                  url: objectUrl,
                  credit: `User upload: ${file.name}`,
                },
              ],
            };
          }
          return les;
        });
        return { ...sec, lessons };
      }
      return sec;
    });

    onChange({ sections: updatedSections });
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
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
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Swallern Visual Engine Studio
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.4 }}>
            Explore animations, diagrams, science illustrations, and mascot poses. Click any card to apply it to the selected lesson.
          </p>
        </div>

        {/* Total Lessons Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            padding: '6px 12px',
            borderRadius: '10px',
            color: '#065F46',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{allLessons.length} Lesson{allLessons.length === 1 ? '' : 's'} Configured</span>
        </div>
      </div>

      {/* Lesson Selector Tabs */}
      {allLessons.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
          }}
          className="swallern-scrollbar"
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
            Active Lesson:
          </span>
          {allLessons.map((item, idx) => {
            const isSelected = idx === activeLessonKey;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveLessonKey(idx)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                  color: isSelected ? '#1E40AF' : '#475569',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <span>M{item.moduleNumber}.L{item.lessonNumber}</span>
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.lessonTitle || 'Untitled'}
                </span>
                {item.visual?.mode && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: isSelected ? '#DBEAFE' : '#E2E8F0',
                      color: isSelected ? '#1D4ED8' : '#64748B',
                      padding: '1px 5px',
                      borderRadius: '4px',
                    }}
                  >
                    {item.visual.mode.replace(/^[A-E]_/, '')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Visual Engine Interactive Catalog */}
      <SwallernVisualEngine
        selectedAssetId={
          currentActiveLesson?.visual?.mode === 'auto'
            ? 'bio_bear_salmon_feed'
            : undefined
        }
        activeLessonTitle={
          currentActiveLesson
            ? `Module ${currentActiveLesson.moduleNumber} · Lesson ${currentActiveLesson.lessonNumber}: ${currentActiveLesson.lessonTitle}`
            : undefined
        }
        onSelectVisual={handleSelectAsset}
        onCustomUpload={handleCustomUpload}
      />
    </div>
  );
};
