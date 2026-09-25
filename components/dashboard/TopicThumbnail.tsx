'use client';

import React from 'react';

interface TopicThumbnailProps {
  slug?: string;
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export const TopicThumbnail: React.FC<TopicThumbnailProps> = ({
  slug = '',
  category = '',
  size,
  width: customWidth,
  height: customHeight,
  borderRadius: customRadius,
  className = '',
}) => {
  const width =
    customWidth ??
    (size === 'sm' ? '100%' : size === 'md' ? '96px' : '100%');
  const height =
    customHeight ??
    (size === 'sm' ? '110px' : size === 'md' ? '96px' : '140px');
  const borderRadius =
    customRadius ??
    (size === 'sm' ? '12px' : size === 'md' ? '16px' : '16px');

  const s = slug.toLowerCase();
  const c = category.toLowerCase();

  // 1. Photosynthesis / Plants / Nature / Biology
  if (s.includes('photo') || s.includes('plant') || c.includes('bio') || c.includes('nature') || s.includes('bear')) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #10B981 0%, #059669 45%, #064E3B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Sunbeams and leaves background */}
        <svg width="100%" height="100%" viewBox="0 0 200 140" fill="none" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="160" cy="20" r="38" fill="#FDE047" fillOpacity="0.4" />
          <circle cx="160" cy="20" r="22" fill="#FEF08A" fillOpacity="0.7" />
          <path d="M160 50 L145 90 M140 35 L90 70 M175 48 L170 95" stroke="#FEF08A" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="3 3" />
          {/* Plant pot & leaves */}
          <ellipse cx="100" cy="118" rx="28" ry="8" fill="#047857" />
          <path d="M82 114 L86 132 L114 132 L118 114 Z" fill="#D97706" />
          <path d="M80 114 L120 114 L120 118 L80 118 Z" fill="#B45309" />
          <path d="M100 114 Q100 80 94 65" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
          {/* Leaves */}
          <path d="M96 90 C80 82 72 68 84 62 C96 68 96 82 96 90 Z" fill="#6EE7B7" />
          <path d="M98 75 C114 68 122 55 110 50 C98 55 98 70 98 75 Z" fill="#A7F3D0" />
          <path d="M94 65 C88 50 96 40 102 38 C106 46 100 58 94 65 Z" fill="#34D399" />
        </svg>
      </div>
    );
  }

  // 2. Solar System / Space / Astronomy / Physics
  if (s.includes('space') || s.includes('solar') || s.includes('sky') || s.includes('black-hole') || c.includes('space') || c.includes('astronomy')) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #1E1B4B 0%, #312E81 50%, #0F172A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 140" fill="none" style={{ position: 'absolute', inset: 0 }}>
          {/* Stars */}
          <circle cx="25" cy="30" r="1.5" fill="#FFF" fillOpacity="0.8" />
          <circle cx="65" cy="18" r="1" fill="#FFF" fillOpacity="0.6" />
          <circle cx="170" cy="40" r="1.5" fill="#FFF" fillOpacity="0.9" />
          <circle cx="140" cy="110" r="1" fill="#FFF" fillOpacity="0.5" />
          <circle cx="45" cy="100" r="1.5" fill="#FFF" fillOpacity="0.7" />
          <circle cx="185" cy="90" r="1" fill="#FFF" fillOpacity="0.6" />
          {/* Saturn-like planet with rings */}
          <ellipse cx="120" cy="72" rx="42" ry="12" stroke="#FBBF24" strokeWidth="3.5" transform="rotate(-18 120 72)" strokeOpacity="0.9" />
          <circle cx="120" cy="72" r="22" fill="#F59E0B" />
          <ellipse cx="120" cy="72" rx="38" ry="10" stroke="#FDE68A" strokeWidth="2" transform="rotate(-18 120 72)" strokeOpacity="0.7" />
          {/* Small blue planet */}
          <circle cx="55" cy="48" r="9" fill="#38BDF8" />
          <circle cx="165" cy="105" r="6" fill="#F43F5E" />
        </svg>
      </div>
    );
  }

  // 3. Neuroscience / Brain / Psychology
  if (s.includes('brain') || s.includes('memory') || s.includes('neuro') || c.includes('psych')) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #FCE7F3 0%, #FBCFE8 50%, #F472B6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 140" fill="none" style={{ position: 'absolute', inset: 0 }}>
          {/* Glow particles */}
          <circle cx="50" cy="45" r="3" fill="#EC4899" fillOpacity="0.4" />
          <circle cx="150" cy="55" r="4" fill="#8B5CF6" fillOpacity="0.4" />
          <circle cx="100" cy="25" r="3" fill="#F43F5E" fillOpacity="0.4" />
          {/* Stylized Brain Vector */}
          <path
            d="M85 50 C75 40 60 52 64 68 C54 74 58 92 72 94 C76 106 94 104 98 94 C104 94 106 88 106 80 C106 68 96 50 85 50 Z"
            fill="#FB7185"
          />
          <path
            d="M115 50 C125 40 140 52 136 68 C146 74 142 92 128 94 C124 106 106 104 102 94 C96 94 94 88 94 80 C94 68 104 50 115 50 Z"
            fill="#F43F5E"
          />
          <path d="M80 62 Q90 68 85 80" stroke="#FFE4E6" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M120 62 Q110 68 115 80" stroke="#FFE4E6" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 4. Languages / Books / Humanities / History
  if (s.includes('spanish') || s.includes('language') || s.includes('history') || c.includes('lit') || c.includes('human')) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 140" fill="none" style={{ position: 'absolute', inset: 0 }}>
          {/* Stack of books */}
          <rect x="55" y="96" width="90" height="16" rx="4" fill="#F59E0B" />
          <rect x="52" y="93" width="96" height="5" rx="2" fill="#FBBF24" />
          <rect x="62" y="78" width="76" height="15" rx="3" fill="#10B981" />
          <rect x="60" y="75" width="80" height="5" rx="2" fill="#34D399" />
          <rect x="68" y="60" width="64" height="15" rx="3" fill="#EC4899" />
          <rect x="66" y="57" width="68" height="5" rx="2" fill="#F472B6" />
          {/* Open notebook leaning */}
          <path d="M128 50 L152 75 L144 112 L120 87 Z" fill="#FBBF24" />
          <path d="M132 54 L150 73 L144 104 L126 85 Z" fill="#FEF3C7" />
        </svg>
      </div>
    );
  }

  // 5. Environmental Science / Earth / Geography
  if (s.includes('earth') || s.includes('environ') || s.includes('season') || c.includes('geo')) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #0284C7 0%, #0369A1 50%, #075985 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 140" fill="none" style={{ position: 'absolute', inset: 0 }}>
          {/* Globe */}
          <circle cx="100" cy="70" r="38" fill="#38BDF8" />
          {/* Continents */}
          <path d="M85 52 Q92 48 98 56 Q106 52 112 58 Q108 72 95 68 Q88 64 85 52 Z" fill="#22C55E" />
          <path d="M88 78 Q100 76 108 84 Q104 98 94 96 Q86 90 88 78 Z" fill="#16A34A" />
          <path d="M118 64 Q128 62 130 72 Q124 78 118 72 Z" fill="#22C55E" />
          {/* Atmosphere ring */}
          <circle cx="100" cy="70" r="42" stroke="#E0F2FE" strokeWidth="2.5" strokeOpacity="0.5" />
        </svg>
      </div>
    );
  }

  // 6. Technology / Internet / Computing / Mathematics
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #4338CA 0%, #6366F1 50%, #8B5CF6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 200 140" fill="none" style={{ position: 'absolute', inset: 0 }}>
        {/* Tech nodes / grid */}
        <circle cx="60" cy="50" r="6" fill="#A5B4FC" />
        <circle cx="100" cy="35" r="7" fill="#C7D2FE" />
        <circle cx="140" cy="50" r="6" fill="#A5B4FC" />
        <circle cx="80" cy="90" r="8" fill="#DDD6FE" />
        <circle cx="120" cy="90" r="8" fill="#DDD6FE" />
        <line x1="60" y1="50" x2="100" y2="35" stroke="#E0E7FF" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="100" y1="35" x2="140" y2="50" stroke="#E0E7FF" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="60" y1="50" x2="80" y2="90" stroke="#E0E7FF" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="140" y1="50" x2="120" y2="90" stroke="#E0E7FF" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="80" y1="90" x2="120" y2="90" stroke="#E0E7FF" strokeWidth="2" strokeOpacity="0.6" />
      </svg>
    </div>
  );
};
