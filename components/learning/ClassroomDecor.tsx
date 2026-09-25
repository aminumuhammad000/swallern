'use client';

import React from 'react';
import { ClassroomTheme } from '@/lib/learning/themes';

interface ClassroomDecorProps {
  theme: ClassroomTheme;
  reducedMotion: boolean;
  calmMode: boolean;
}

export const ClassroomDecor: React.FC<ClassroomDecorProps> = ({
  theme,
  reducedMotion,
  calmMode,
}) => {
  const animate = !reducedMotion && !calmMode;
  const { decorPrimary, decorSecondary, decorTertiary, id } = theme;

  const renderThemeDecor = () => {
    switch (id) {
      case 'classic_study':
        return (
          <ClassicStudyDecor
            primary={decorPrimary}
            secondary={decorSecondary}
            tertiary={decorTertiary || '#F59E0B'}
            animate={animate}
          />
        );
      case 'nature_explorer':
        return (
          <NatureExplorerDecor
            primary={decorPrimary}
            secondary={decorSecondary}
            tertiary={decorTertiary || '#10B981'}
            animate={animate}
          />
        );
      case 'science_lab':
        return (
          <ScienceLabDecor
            primary={decorPrimary}
            secondary={decorSecondary}
            tertiary={decorTertiary || '#06B6D4'}
            animate={animate}
          />
        );
      case 'library':
        return (
          <LibraryDecor
            primary={decorPrimary}
            secondary={decorSecondary}
            tertiary={decorTertiary || '#D97706'}
            animate={animate}
          />
        );
      case 'space_observatory':
        return (
          <SpaceDecor
            primary={decorPrimary}
            secondary={decorSecondary}
            tertiary={decorTertiary || '#A855F7'}
            animate={animate}
          />
        );
      case 'minimal':
        return <MinimalDecor primary={decorPrimary} secondary={decorSecondary} />;
      default:
        return (
          <ClassicStudyDecor
            primary={decorPrimary}
            secondary={decorSecondary}
            tertiary="#6366F1"
            animate={animate}
          />
        );
    }
  };

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Responsive layout styles */}
      <style>{`
        .classroom-side-decor {
          display: block;
        }
        @media (max-width: 1024px) {
          .classroom-side-decor {
            opacity: 0.6 !important;
            transform: scale(0.85);
          }
        }
        @media (max-width: 768px) {
          .classroom-side-decor {
            display: none !important;
          }
        }
        @keyframes gentleSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2.5deg); }
        }
        @keyframes lampBreathe {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.04); }
        }
        @keyframes balloonFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(4px, -12px) rotate(2deg); }
        }
        @keyframes steamRise {
          0% { opacity: 0.3; transform: translateY(0) scaleX(1); }
          50% { opacity: 0.6; transform: translateY(-6px) scaleX(1.1); }
          100% { opacity: 0; transform: translateY(-14px) scaleX(1.3); }
        }
      `}</style>

      {renderThemeDecor()}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Theme Props                                                                */
/* -------------------------------------------------------------------------- */

interface DecorProps {
  primary: string;
  secondary: string;
  tertiary: string;
  animate: boolean;
}

/* ========================================================================== */
/* 1. CLASSIC STUDY (Cozy, warm study room with books, lamp, mug, plant)       */
/* ========================================================================== */

const ClassicStudyDecor: React.FC<DecorProps> = ({ primary, secondary, tertiary, animate }) => (
  <>
    {/* Wall Clock (Top center-right) */}
    <div
      style={{
        position: 'absolute',
        top: '74px',
        right: 'calc(50% - 380px)',
        opacity: 0.22,
      }}
      className="classroom-side-decor"
    >
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="20" stroke={primary} strokeWidth="2.5" fill="#FFFFFF" />
        <circle cx="22" cy="22" r="2.5" fill={secondary} />
        <line x1="22" y1="22" x2="22" y2="10" stroke={primary} strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="22" x2="30" y2="22" stroke={secondary} strokeWidth="2" strokeLinecap="round" />
        <circle cx="22" cy="5" r="1.2" fill={secondary} />
        <circle cx="39" cy="22" r="1.2" fill={secondary} />
        <circle cx="22" cy="39" r="1.2" fill={secondary} />
        <circle cx="5" cy="22" r="1.2" fill={secondary} />
      </svg>
    </div>

    {/* Left Side: Potted desk plant & Stack of Hardcover Books */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        bottom: '48px',
        left: 'calc(50% - 460px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: 0.35,
      }}
    >
      {/* Potted succulent */}
      <svg
        width="60"
        height="64"
        viewBox="0 0 60 64"
        fill="none"
        style={{
          transformOrigin: 'bottom center',
          animation: animate ? 'gentleSway 6s ease-in-out infinite' : 'none',
        }}
      >
        {/* Leaves */}
        <ellipse cx="30" cy="24" rx="7" ry="16" fill="#10B981" />
        <ellipse cx="20" cy="27" rx="6" ry="14" fill="#059669" transform="rotate(-30 20 27)" />
        <ellipse cx="40" cy="27" rx="6" ry="14" fill="#34D399" transform="rotate(30 40 27)" />
        <ellipse cx="14" cy="34" rx="5" ry="12" fill="#047857" transform="rotate(-50 14 34)" />
        <ellipse cx="46" cy="34" rx="5" ry="12" fill="#10B981" transform="rotate(50 46 34)" />
        {/* Pot */}
        <path d="M16 38 H44 L40 60 H20 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="14" y="35" width="32" height="5" rx="2" fill="#94A3B8" />
      </svg>

      {/* Stack of books */}
      <svg width="84" height="42" viewBox="0 0 84 42" fill="none" style={{ marginTop: '2px' }}>
        {/* Bottom book */}
        <rect x="4" y="28" width="76" height="12" rx="3" fill={primary} />
        <rect x="76" y="30" width="3" height="8" rx="1.5" fill="#FFFFFF" />
        {/* Middle book */}
        <rect x="10" y="16" width="66" height="11" rx="3" fill={secondary} />
        <rect x="72" y="18" width="3" height="7" rx="1.5" fill="#FFFFFF" />
        {/* Top book */}
        <rect x="14" y="5" width="58" height="10" rx="2.5" fill={tertiary} />
      </svg>
    </div>

    {/* Right Side: Warm Desk Lamp & Ceramic Coffee Mug */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        bottom: '54px',
        right: 'calc(50% - 460px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: 0.38,
      }}
    >
      {/* Desk lamp with warm ambient conic light */}
      <div style={{ position: 'relative' }}>
        {/* Lamp glow */}
        <div
          style={{
            position: 'absolute',
            top: '18px',
            right: '-16px',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(250, 204, 21, 0.05) 60%, transparent 80%)',
            pointerEvents: 'none',
            animation: animate ? 'lampBreathe 4s ease-in-out infinite' : 'none',
          }}
        />

        <svg width="68" height="82" viewBox="0 0 68 82" fill="none">
          {/* Base */}
          <ellipse cx="26" cy="78" rx="18" ry="4" fill="#94A3B8" />
          {/* Stem */}
          <path d="M26 78 Q22 45 42 34" stroke={primary} strokeWidth="3.5" strokeLinecap="round" />
          {/* Shade */}
          <path d="M34 26 L56 34 L40 44 Z" fill={primary} />
          {/* Bulb point */}
          <circle cx="48" cy="38" r="4" fill="#FACC15" />
        </svg>
      </div>

      {/* Coffee/Tea Mug with gentle rising steam */}
      <div style={{ position: 'relative', marginTop: '-4px' }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            position: 'absolute',
            top: '-12px',
            left: '12px',
            animation: animate ? 'steamRise 3s ease-out infinite' : 'none',
          }}
        >
          <path d="M5 14 Q3 8 7 3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
          <rect x="4" y="2" width="24" height="22" rx="4" fill="#FFFFFF" stroke={secondary} strokeWidth="2" />
          <path d="M28 8 Q36 8 36 14 Q36 20 28 20" stroke={secondary} strokeWidth="2" fill="none" />
        </svg>
      </div>
    </div>

    {/* Background Wall: Pinned sticky study note */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        top: '120px',
        left: 'calc(50% - 410px)',
        opacity: 0.28,
        transform: 'rotate(-4deg)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#FEF08A',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderRadius: '2px',
          position: 'relative',
          padding: '8px 6px',
        }}
      >
        {/* Pin */}
        <div
          style={{
            position: 'absolute',
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#EF4444',
          }}
        />
        {/* Note lines */}
        <div style={{ width: '80%', height: '3px', backgroundColor: '#CA8A04', borderRadius: '1px', marginBottom: '4px' }} />
        <div style={{ width: '60%', height: '3px', backgroundColor: '#CA8A04', borderRadius: '1px', marginBottom: '4px' }} />
        <div style={{ width: '70%', height: '3px', backgroundColor: '#CA8A04', borderRadius: '1px' }} />
      </div>
    </div>
  </>
);

/* ========================================================================== */
/* 2. NATURE EXPLORER (Botanical leaves, field compass, gentle sunbeam)        */
/* ========================================================================== */

const NatureExplorerDecor: React.FC<DecorProps> = ({ primary, secondary, tertiary, animate }) => (
  <>
    {/* Subtle Sunbeam Ray (Top right) */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '280px',
        height: '280px',
        background: 'radial-gradient(circle at top right, rgba(254, 240, 138, 0.22) 0%, rgba(250, 204, 21, 0.04) 50%, transparent 70%)',
        opacity: 0.5,
      }}
    />

    {/* Left Side: Potted Fern & Field Journal */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        bottom: '48px',
        left: 'calc(50% - 460px)',
        opacity: 0.35,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Botanical Fern */}
      <svg
        width="76"
        height="80"
        viewBox="0 0 76 80"
        fill="none"
        style={{
          transformOrigin: 'bottom center',
          animation: animate ? 'gentleSway 5s ease-in-out infinite' : 'none',
        }}
      >
        <path d="M38 70 Q38 30 38 10" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="28" cy="22" rx="10" ry="4" fill="#10B981" transform="rotate(-25 28 22)" />
        <ellipse cx="48" cy="22" rx="10" ry="4" fill="#10B981" transform="rotate(25 48 22)" />
        <ellipse cx="24" cy="36" rx="12" ry="5" fill="#059669" transform="rotate(-30 24 36)" />
        <ellipse cx="52" cy="36" rx="12" ry="5" fill="#059669" transform="rotate(30 52 36)" />
        <ellipse cx="20" cy="50" rx="14" ry="5" fill="#047857" transform="rotate(-35 20 50)" />
        <ellipse cx="56" cy="50" rx="14" ry="5" fill="#047857" transform="rotate(35 56 50)" />
        {/* Pot */}
        <path d="M22 55 H54 L49 76 H27 Z" fill="#D97706" opacity="0.8" />
      </svg>

      {/* Field Map / Journal */}
      <svg width="68" height="32" viewBox="0 0 68 32" fill="none" style={{ marginTop: '2px' }}>
        <rect x="4" y="8" width="60" height="20" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
        <path d="M12 18 L24 14 L36 20 L48 15 L56 19" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>

    {/* Right Side: Brass Exploration Compass & Magnifying Glass */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        bottom: '60px',
        right: 'calc(50% - 450px)',
        opacity: 0.35,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {/* Magnifying Glass */}
      <svg width="48" height="60" viewBox="0 0 48 60" fill="none" style={{ transform: 'rotate(15deg)' }}>
        <circle cx="20" cy="20" r="16" stroke={primary} strokeWidth="3" fill="rgba(255,255,255,0.4)" />
        <line x1="32" y1="32" x2="44" y2="54" stroke={secondary} strokeWidth="4.5" strokeLinecap="round" />
      </svg>

      {/* Pocket Compass */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="15" stroke="#D97706" strokeWidth="2" fill="#FFFBEB" />
        <polygon points="18,6 21,18 18,16" fill="#EF4444" />
        <polygon points="18,30 21,18 18,20" fill="#64748B" />
      </svg>
    </div>

    {/* Single gentle background balloon */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        top: '90px',
        right: 'calc(50% - 410px)',
        opacity: 0.25,
        animation: animate ? 'balloonFloat 5s ease-in-out infinite' : 'none',
      }}
    >
      <svg width="36" height="54" viewBox="0 0 36 54" fill="none">
        <ellipse cx="18" cy="18" rx="14" ry="18" fill="#10B981" />
        <polygon points="18,36 15,39 21,39" fill="#059669" />
        <path d="M18 39 Q16 45 20 50" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      </svg>
    </div>
  </>
);

/* ========================================================================== */
/* 3. SCIENCE LAB (Microscope, flask, atom structure, laboratory diagram)      */
/* ========================================================================== */

const ScienceLabDecor: React.FC<DecorProps> = ({ primary, secondary, tertiary, animate }) => (
  <>
    {/* Left Side: Laboratory Microscope & Specimen Slide */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        bottom: '50px',
        left: 'calc(50% - 460px)',
        opacity: 0.35,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <svg width="68" height="84" viewBox="0 0 68 84" fill="none">
        {/* Base */}
        <rect x="12" y="74" width="44" height="6" rx="3" fill="#64748B" />
        {/* Arm */}
        <path d="M38 74 C48 55 48 35 34 26" stroke={primary} strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Eyepiece tube */}
        <line x1="28" y1="12" x2="36" y2="28" stroke={secondary} strokeWidth="6" strokeLinecap="round" />
        {/* Objective lens */}
        <rect x="22" y="38" width="8" height="12" rx="2" fill={secondary} />
        {/* Stage */}
        <rect x="14" y="52" width="28" height="4" rx="2" fill="#94A3B8" />
      </svg>
    </div>

    {/* Right Side: Erlenmeyer Flask & Chemical Beaker */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        bottom: '54px',
        right: 'calc(50% - 450px)',
        opacity: 0.35,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
      {/* Flask */}
      <svg width="44" height="58" viewBox="0 0 44 58" fill="none">
        <path d="M16 6 H28 V18 L38 48 H6 L16 18 Z" fill="rgba(6, 182, 212, 0.15)" stroke={primary} strokeWidth="2.5" />
        {/* Liquid */}
        <path d="M10 40 Q22 36 34 40 L37 46 H7 Z" fill={secondary} opacity="0.6" />
        {/* Bubbles */}
        <circle cx="20" cy="34" r="2.5" fill={tertiary} />
        <circle cx="26" cy="28" r="1.8" fill={tertiary} />
      </svg>

      {/* Beaker */}
      <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
        <rect x="4" y="6" width="26" height="34" rx="3" fill="rgba(59, 130, 246, 0.12)" stroke={secondary} strokeWidth="2" />
        <path d="M5 24 Q17 22 29 24 L29 38 H5 Z" fill={primary} opacity="0.4" />
      </svg>
    </div>

    {/* Pinned Atomic Structure (Top Right) */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        top: '80px',
        right: 'calc(50% - 410px)',
        opacity: 0.24,
      }}
    >
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        style={{
          animation: animate ? 'swallernRotate 16s linear infinite' : 'none',
        }}
      >
        <ellipse cx="30" cy="30" rx="26" ry="9" stroke={primary} strokeWidth="1.8" />
        <ellipse cx="30" cy="30" rx="26" ry="9" stroke={primary} strokeWidth="1.8" transform="rotate(60 30 30)" />
        <ellipse cx="30" cy="30" rx="26" ry="9" stroke={primary} strokeWidth="1.8" transform="rotate(120 30 30)" />
        <circle cx="30" cy="30" r="4" fill={tertiary} />
      </svg>
    </div>
  </>
);

/* ========================================================================== */
/* 4. LIBRARY (Bookshelf silhouette, leather-bound books, reading lamp)        */
/* ========================================================================== */

const LibraryDecor: React.FC<DecorProps> = ({ primary, secondary, tertiary, animate }) => (
  <>
    {/* Left Side: Bookshelf Section */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        bottom: '46px',
        left: 'calc(50% - 460px)',
        opacity: 0.35,
      }}
    >
      <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
        {/* Shelf plank */}
        <rect x="2" y="80" width="76" height="6" rx="2" fill="#B45309" />
        {/* Books lined up */}
        <rect x="8" y="24" width="12" height="56" rx="2" fill={primary} />
        <rect x="22" y="32" width="10" height="48" rx="2" fill={secondary} />
        <rect x="34" y="20" width="14" height="60" rx="2" fill={tertiary} />
        <rect x="50" y="28" width="11" height="52" rx="2" fill="#D97706" />
        {/* Leaning book */}
        <rect x="62" y="36" width="10" height="46" rx="2" fill={secondary} transform="rotate(12 62 36)" />
      </svg>
    </div>

    {/* Right Side: Vintage Reading Lamp with soft green shade */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        bottom: '52px',
        right: 'calc(50% - 450px)',
        opacity: 0.38,
      }}
    >
      <svg width="60" height="78" viewBox="0 0 60 78" fill="none">
        {/* Lamp base */}
        <ellipse cx="30" cy="74" rx="16" ry="3.5" fill="#D97706" />
        {/* Brass curved arm */}
        <path d="M30 74 V30 Q30 20 40 18" stroke="#D97706" strokeWidth="3" fill="none" />
        {/* Green banker shade */}
        <rect x="24" y="14" width="30" height="12" rx="5" fill="#047857" />
        {/* Warm light glow point */}
        <circle cx="39" cy="26" r="3.5" fill="#FEF08A" />
      </svg>
    </div>

    {/* Pinned Bookplate / Parchment (Top Left) */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        top: '86px',
        left: 'calc(50% - 410px)',
        opacity: 0.22,
      }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="4" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
        <path d="M12 14 H36 M12 22 H36 M12 30 H26" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  </>
);

/* ========================================================================== */
/* 5. SPACE OBSERVATORY (Telescope on tripod, constellation stars, planet)     */
/* ========================================================================== */

const SpaceDecor: React.FC<DecorProps> = ({ primary, secondary, tertiary, animate }) => (
  <>
    {/* Subtle Constellation Stars */}
    {[
      { x: 'calc(50% - 420px)', y: '80px', r: 2 },
      { x: 'calc(50% - 370px)', y: '130px', r: 1.5 },
      { x: 'calc(50% - 440px)', y: '190px', r: 2 },
      { x: 'calc(50% + 380px)', y: '90px', r: 2.2 },
      { x: 'calc(50% + 440px)', y: '150px', r: 1.6 },
      { x: 'calc(50% + 410px)', y: '230px', r: 2 },
    ].map((star, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: star.x,
          top: star.y,
          width: star.r * 2,
          height: star.r * 2,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          opacity: 0.6,
          boxShadow: `0 0 6px ${primary}`,
          animation: animate ? `swallernPulse ${2.5 + i * 0.4}s ease-in-out infinite` : 'none',
        }}
      />
    ))}

    {/* Left Side: Brass Astronomical Telescope on Tripod */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        bottom: '48px',
        left: 'calc(50% - 460px)',
        opacity: 0.38,
      }}
    >
      <svg width="74" height="96" viewBox="0 0 74 96" fill="none">
        {/* Optical tube pointed upward */}
        <rect x="22" y="16" width="46" height="12" rx="3" fill="#D97706" transform="rotate(-32 22 16)" />
        <rect x="18" y="15" width="8" height="14" rx="2" fill="#F59E0B" transform="rotate(-32 18 15)" />
        {/* Mount */}
        <circle cx="38" cy="46" r="4.5" fill="#94A3B8" />
        {/* Tripod legs */}
        <line x1="38" y1="46" x2="16" y2="92" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        <line x1="38" y1="46" x2="38" y2="94" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="38" y1="46" x2="60" y2="92" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>

    {/* Right Side: Celestial Ringed Planet */}
    <div
      className="classroom-side-decor"
      style={{
        position: 'absolute',
        bottom: '60px',
        right: 'calc(50% - 440px)',
        opacity: 0.35,
        animation: animate ? 'swallernFloat 6s ease-in-out infinite' : 'none',
      }}
    >
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        <circle cx="34" cy="34" r="20" fill={secondary} />
        <ellipse cx="34" cy="34" rx="32" ry="9" stroke={primary} strokeWidth="3" transform="rotate(-18 34 34)" />
        <circle cx="28" cy="26" r="4" fill="#FFFFFF" opacity="0.3" />
      </svg>
    </div>
  </>
);

/* ========================================================================== */
/* 6. MINIMAL (Intentionally calm, pure architectural subtle accents)           */
/* ========================================================================== */

const MinimalDecor: React.FC<{ primary: string; secondary: string }> = ({ primary }) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '160px',
        height: '160px',
        borderRadius: '0 0 0 160px',
        background: `radial-gradient(circle at top right, ${primary}15 0%, transparent 70%)`,
        opacity: 0.5,
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '120px',
        height: '120px',
        borderRadius: '0 120px 0 0',
        background: `radial-gradient(circle at bottom left, ${primary}12 0%, transparent 70%)`,
        opacity: 0.5,
      }}
    />
  </>
);
