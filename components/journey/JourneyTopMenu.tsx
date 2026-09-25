'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface JourneyTopMenuProps {
  topicSlug: string;
}

export const JourneyTopMenu: React.FC<JourneyTopMenuProps> = ({ topicSlug }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const navItems = [
    {
      label: 'Home',
      href: '/',
      bg: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      shadow: 'rgba(99, 102, 241, 0.35)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'Discover',
      href: '/explore',
      bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      shadow: 'rgba(16, 185, 129, 0.35)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
    },
    {
      label: 'Journey',
      href: `/topics/${topicSlug}`,
      isActive: true,
      bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      shadow: 'rgba(59, 130, 246, 0.45)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="19" r="3" />
          <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
          <circle cx="18" cy="5" r="3" />
        </svg>
      ),
    },
    {
      label: 'Search',
      href: '/search',
      bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      shadow: 'rgba(245, 158, 11, 0.35)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      label: 'Profile',
      href: '/dashboard',
      bg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      shadow: 'rgba(139, 92, 246, 0.35)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* ─── Trigger Button in Top Corner ─── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Navigation Menu"
        aria-expanded={isOpen}
        className="swallern-press"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: isOpen
            ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
            : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOpen ? '#FFFFFF' : '#334155',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {isOpen ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          /* Mobile app launcher grid icon */
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
          </svg>
        )}
      </button>

      {/* ─── Animated Rounded Corner App Menu Dropdown ─── */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Swallern Quick Navigation"
          className="journey-menu-pop"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '290px',
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(226, 232, 240, 0.95)',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(99, 102, 241, 0.08)',
            padding: '16px',
            zIndex: 90,
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#94A3B8',
              padding: '0 6px 10px 6px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Navigation</span>
            <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 700 }}>● Swallern</span>
          </div>

          {/* Grid of Mobile App Icons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 4px',
                  borderRadius: '16px',
                  background: item.isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                className="swallern-press"
              >
                {/* Rounded Mobile Icon Bubble */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: item.bg,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 6px 14px -2px ${item.shadow}`,
                    position: 'relative',
                  }}
                >
                  {item.icon}

                  {item.isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#10B981',
                        border: '2px solid #FFFFFF',
                      }}
                      aria-label="Active"
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: item.isActive ? 800 : 700,
                    color: item.isActive ? '#1D4ED8' : '#334155',
                    textAlign: 'center',
                  }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
