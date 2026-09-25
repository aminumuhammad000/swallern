'use client';

import React from 'react';
import type { ClassroomThemeId } from '@/lib/learning/themes';

interface JourneyLandmarkProps {
  themeId: ClassroomThemeId;
  title: string;
  isCompleted: boolean;
  onClick?: () => void;
}

export const JourneyLandmark: React.FC<JourneyLandmarkProps> = ({
  themeId,
  title,
  isCompleted,
  onClick,
}) => {
  // Select icon and colors based on theme
  const getThemeDetails = () => {
    switch (themeId) {
      case 'space_observatory':
        return {
          name: 'Cosmic Observatory',
          sub: 'Mastery of the Cosmos',
          primary: '#8B5CF6',
          glow: 'rgba(139, 92, 246, 0.4)',
          accent: '#F59E0B',
          icon: (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a9 9 0 0 0-9 9c0 3.6 2.1 6.7 5.2 8.1L7 22l4-2 4 2-1.2-2.9C16.9 17.7 19 14.6 19 11a9 9 0 0 0-7-9z" />
              <circle cx="12" cy="10" r="3" />
              <path d="M12 2v3" />
            </svg>
          ),
        };
      case 'nature_explorer':
        return {
          name: 'Discovery Bio-Sphere',
          sub: 'Mastery of Life & Nature',
          primary: '#10B981',
          glow: 'rgba(16, 185, 129, 0.4)',
          accent: '#059669',
          icon: (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          ),
        };
      case 'library':
        return {
          name: 'Knowledge Archive',
          sub: 'Mastery of Thought & History',
          primary: '#D97706',
          glow: 'rgba(217, 119, 6, 0.4)',
          accent: '#B45309',
          icon: (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m16 6 4 14" />
              <path d="M12 6v14" />
              <path d="M8 8v12" />
              <path d="M4 4v16" />
            </svg>
          ),
        };
      case 'science_lab':
        return {
          name: 'Quantum Discovery Lab',
          sub: 'Mastery of Scientific Principles',
          primary: '#4F46E5',
          glow: 'rgba(79, 70, 229, 0.4)',
          accent: '#06B6D4',
          icon: (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v7.31L4.62 18.23A2 2 0 0 0 6.34 21h11.32a2 2 0 0 0 1.72-2.77L14 9.31V2" />
              <path d="M8.5 2h7" />
              <path d="M14 9.3a6.5 6.5 0 0 1-4 0" />
            </svg>
          ),
        };
      case 'minimal':
        return {
          name: 'Innovation Core',
          sub: 'Mastery of Systems & Technology',
          primary: '#0D9488',
          glow: 'rgba(13, 148, 136, 0.4)',
          accent: '#3B82F6',
          icon: (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          ),
        };
      case 'classic_study':
      default:
        return {
          name: 'Academy of Mastery',
          sub: 'Mastery of the Big Idea',
          primary: '#3B82F6',
          glow: 'rgba(59, 130, 246, 0.4)',
          accent: '#F59E0B',
          icon: (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          ),
        };
    }
  };

  const details = getThemeDetails();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Final destination: ${details.name} — ${isCompleted ? 'Completed' : 'Upcoming'}`}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Outer ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-15px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: isCompleted
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)'
            : `radial-gradient(circle, ${details.glow} 0%, transparent 70%)`,
          filter: 'blur(10px)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating 3D Star / Landmark Icon Badge */}
      <div
        style={{
          position: 'relative',
          width: '82px',
          height: '82px',
          borderRadius: '26px',
          background: isCompleted
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : `linear-gradient(135deg, ${details.primary} 0%, #0F172A 100%)`,
          boxShadow: isCompleted
            ? '0 14px 28px -6px rgba(16, 185, 129, 0.45), 0 0 0 3px #FFFFFF, 0 0 0 5px #10B981'
            : `0 14px 28px -6px ${details.glow}, 0 0 0 3px #FFFFFF, 0 0 0 5px ${details.primary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="swallern-press"
      >
        {details.icon}

        {/* Golden star badge attached to corner */}
        <div
          className="journey-landmark-star"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isCompleted
              ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
              : 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)',
            border: '2px solid #FFFFFF',
          }}
        >
          ★
        </div>
      </div>

      {/* Destination Podium Base */}
      <div
        style={{
          width: '100px',
          height: '14px',
          background: 'linear-gradient(180deg, rgba(226, 232, 240, 0.9) 0%, rgba(203, 213, 225, 0.5) 100%)',
          borderRadius: '50%',
          marginTop: '-4px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      />
    </button>
  );
};

