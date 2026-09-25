'use client';

import React, { useEffect, useState, useRef } from 'react';

interface CelebrationLayerProps {
  trigger: 'none' | 'step' | 'lesson' | 'course';
  accent: string;
  calmMode: boolean;
  reducedMotion: boolean;
  onDone?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

interface Balloon {
  id: number;
  x: number;
  y: number;
  speed: number;
  swaySpeed: number;
  swayAmount: number;
  color: string;
  size: number;
  stringLength: number;
}

const CELEBRATION_COLORS = [
  '#6366F1', '#8B5CF6', '#3B82F6', '#06B6D4',
  '#10B981', '#F59E0B', '#EF4444', '#EC4899',
];

export const CelebrationLayer: React.FC<CelebrationLayerProps> = ({
  trigger,
  accent,
  calmMode,
  reducedMotion,
  onDone,
}) => {
  const [visible, setVisible] = useState(false);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevTrigger = useRef<string>('none');
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (trigger === 'none' || trigger === prevTrigger.current) return;
    prevTrigger.current = trigger;

    if (reducedMotion || calmMode) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 1000);
      return () => clearTimeout(t);
    }

    setVisible(true);

    // Create balloons for course completion
    if (trigger === 'course' && typeof window !== 'undefined') {
      const balloonCount = 7;
      const newBalloons: Balloon[] = Array.from({ length: balloonCount }, (_, i) => ({
        id: i,
        x: (window.innerWidth / (balloonCount + 1)) * (i + 1) + (Math.random() - 0.5) * 60,
        y: window.innerHeight + 40 + Math.random() * 80,
        speed: 1.8 + Math.random() * 1.4,
        swaySpeed: 0.02 + Math.random() * 0.02,
        swayAmount: 20 + Math.random() * 25,
        color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
        size: 38 + Math.random() * 14,
        stringLength: 45 + Math.random() * 15,
      }));
      setBalloons(newBalloons);
    } else {
      setBalloons([]);
    }

    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = trigger === 'course' ? 75 : trigger === 'lesson' ? 40 : 20;
    const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3.5,
      color: trigger === 'course'
        ? CELEBRATION_COLORS[i % CELEBRATION_COLORS.length]
        : i % 2 === 0 ? accent : '#8B5CF6',
      size: trigger === 'course' ? 7 + Math.random() * 5 : 5 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      opacity: 1,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    }));

    let frame = 0;
    const maxFrames = trigger === 'course' ? 220 : 100;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      let hasActiveParticles = false;

      // Draw and update confetti particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (frame > maxFrames * 0.6) {
          p.opacity = Math.max(0, p.opacity - 0.02);
        }

        if (p.opacity > 0 && p.y < canvas.height + 20) {
          hasActiveParticles = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      // Update balloons
      if (trigger === 'course') {
        setBalloons((prev) =>
          prev.map((b) => ({
            ...b,
            y: b.y - b.speed,
            x: b.x + Math.sin(frame * b.swaySpeed) * 0.8,
          }))
        );
      }

      if (frame < maxFrames && (hasActiveParticles || frame < 60)) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setVisible(false);
        setBalloons([]);
        prevTrigger.current = 'none';
        onDone?.();
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [trigger, accent, calmMode, reducedMotion, onDone]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Floating upward balloons */}
      {balloons.map((b) => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.x}px`,
            top: `${b.y}px`,
            width: `${b.size}px`,
            height: `${b.size * 1.25}px`,
            transition: 'transform 50ms linear',
          }}
        >
          {/* Balloon body */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
              backgroundColor: b.color,
              boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.15), inset 4px 4px 10px rgba(255,255,255,0.4)',
              position: 'relative',
            }}
          >
            {/* Knot */}
            <div
              style={{
                position: 'absolute',
                bottom: '-3px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '6px',
                height: '4px',
                backgroundColor: b.color,
                borderRadius: '2px',
              }}
            />
            {/* String */}
            <svg
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '12px',
                height: `${b.stringLength}px`,
                overflow: 'visible',
              }}
            >
              <path
                d={`M 6 0 Q 2 ${b.stringLength * 0.3} 8 ${b.stringLength * 0.6} T 6 ${b.stringLength}`}
                fill="none"
                stroke="rgba(148, 163, 184, 0.7)"
                strokeWidth="1.2"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};
