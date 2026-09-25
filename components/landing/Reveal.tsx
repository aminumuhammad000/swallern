'use client';

/**
 * Swallern Landing Page — Scroll Reveal System
 * Lightweight IntersectionObserver-based reveal primitives.
 * No animation library needed. CSS transitions driven by data-attributes.
 * Respects prefers-reduced-motion.
 */

import React, { useEffect, useRef, ReactNode } from 'react';

type RevealVariant = 'fade-up' | 'fade' | 'scale' | 'slide-left' | 'slide-right';

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number; // ms
  threshold?: number;
  style?: React.CSSProperties;
  className?: string;
  as?: React.ElementType;
}

const MOTION_QUERY =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

const getInitialStyle = (variant: RevealVariant, reduced: boolean): React.CSSProperties => {
  if (reduced) return { opacity: 0, transition: 'opacity 300ms ease' };
  switch (variant) {
    case 'fade-up':
      return { opacity: 0, transform: 'translateY(22px)', transition: 'opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1)' };
    case 'fade':
      return { opacity: 0, transition: 'opacity 500ms ease' };
    case 'scale':
      return { opacity: 0, transform: 'scale(0.97)', transition: 'opacity 550ms cubic-bezier(0.16,1,0.3,1), transform 550ms cubic-bezier(0.16,1,0.3,1)' };
    case 'slide-left':
      return { opacity: 0, transform: 'translateX(-20px)', transition: 'opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1)' };
    case 'slide-right':
      return { opacity: 0, transform: 'translateX(20px)', transition: 'opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1)' };
  }
};

const REVEALED_STYLE: React.CSSProperties = {
  opacity: 1,
  transform: 'none',
};

export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  threshold = 0.12,
  style,
  className,
  as: Tag = 'div',
}) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = MOTION_QUERY?.matches ?? false;
  const initialStyle = getInitialStyle(variant, reduced);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Apply initial hidden state
    Object.assign(el.style, initialStyle);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (el) Object.assign(el.style, REVEALED_STYLE);
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} style={{ ...initialStyle, ...style }} className={className}>
      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Stagger children                                                            */
/* -------------------------------------------------------------------------- */
interface StaggerProps {
  children: ReactNode[];
  baseDelay?: number;
  stepDelay?: number;
  variant?: RevealVariant;
  style?: React.CSSProperties;
  className?: string;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  baseDelay = 0,
  stepDelay = 80,
  variant = 'fade-up',
  style,
  className,
}) => (
  <div style={style} className={className}>
    {React.Children.map(children, (child, i) => (
      <Reveal key={i} variant={variant} delay={baseDelay + i * stepDelay}>
        {child}
      </Reveal>
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Hero entrance sequence — runs once on mount                                 */
/* -------------------------------------------------------------------------- */
interface HeroSequenceProps {
  children: ReactNode[];
  stepDelay?: number;
}

export const HeroSequence: React.FC<HeroSequenceProps> = ({ children, stepDelay = 120 }) => {
  const reduced = MOTION_QUERY?.matches ?? false;

  return (
    <>
      {React.Children.map(children, (child, i) => (
        <HeroItem key={i} delay={i * stepDelay} reduced={reduced}>
          {child}
        </HeroItem>
      ))}
    </>
  );
};

interface HeroItemProps {
  children: ReactNode;
  delay: number;
  reduced: boolean;
}

const HeroItem: React.FC<HeroItemProps> = ({ children, delay, reduced }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.opacity = '0';
      el.style.transition = 'opacity 300ms ease';
    } else {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = `opacity 550ms cubic-bezier(0.16,1,0.3,1), transform 550ms cubic-bezier(0.16,1,0.3,1)`;
    }

    const t = setTimeout(() => {
      if (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    }, delay + 80);

    return () => clearTimeout(t);
  }, [delay, reduced]);

  return <div ref={ref}>{children}</div>;
};
