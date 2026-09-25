'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swa } from '@/components/swa';

interface Login3DSceneProps {
  children: React.ReactNode;
}

/**
 * 3D Reference-Driven Login Scene
 * Faithful reproduction of 3d.png visual composition:
 * - Swallern logo anchored in the top-left corner
 * - 3D lavender/violet studio room environment
 * - Generously spaced environmental room decor (hanging lamp, wall shelf, plants, clouds)
 *   that frame the room without encroaching on the central form card
 * - Centered 3D circular podium / dais on the floor
 * - Swallern Bird companion (canonical 3D mascot) standing grounded beside the card on the dais
 * - Floating porcelain tablet panel housing the authentication form
 */
export const Login3DScene: React.FC<Login3DSceneProps> = ({ children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(20px, 3.5vh, 32px) 16px',
        boxSizing: 'border-box',
        // Soft 3D dimensional room background matching 3d.png
        background:
          'radial-gradient(ellipse at 50% 28%, #EFE8FA 0%, #DFD1F7 52%, #CFBEEB 100%)',
      }}
    >
      {/* ─── 1. TOP-LEFT BRAND LOGO ─── */}
      <header
        style={{
          position: 'absolute',
          top: 'clamp(16px, 3vh, 28px)',
          left: 'clamp(18px, 3vw, 36px)',
          zIndex: 30,
        }}
      >
        <Link
          href="/"
          aria-label="Swallern Homepage"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '7px 18px',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 14px -2px rgba(110, 80, 170, 0.14)',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.92)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)';
          }}
        >
          <Image
            src="/swallern-logo.svg"
            alt="Swallern"
            width={116}
            height={25}
            priority
            style={{ height: '21px', width: 'auto' }}
          />
        </Link>
      </header>

      {/* ─── 2. AMBIENT LIGHTING OVERLAYS ─── */}
      {/* Warm glow from the pendant lamp on the top right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '0',
          right: '8%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(254, 240, 138, 0.22) 0%, rgba(254, 240, 138, 0.05) 45%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Soft floor shadow horizon */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '220px',
          background: 'linear-gradient(to top, rgba(160, 140, 200, 0.25) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ─── 3. WIDE ROOM DECORATIONS LAYER (Framing the room with generous breathing room) ─── */}
      <div
        className="login-3d-room-decor-layer"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          maxWidth: '1240px',
          margin: '0 auto',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {/* A. Hanging Pendant Lamp (Far Top Right) */}
        <div
          className="login-3d-lamp"
          style={{
            position: 'absolute',
            top: '0',
            right: 'clamp(36px, 6vw, 110px)',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Cord */}
          <div
            style={{
              width: '2px',
              height: 'clamp(36px, 6vh, 60px)',
              background: 'linear-gradient(to bottom, #8B74BC, #A792D4)',
            }}
          />
          {/* Bell Shade */}
          <div
            style={{
              width: '40px',
              height: '30px',
              borderRadius: '22px 22px 8px 8px',
              background: 'linear-gradient(135deg, #BFA8E8 0%, #987FD1 60%, #7E63BE 100%)',
              boxShadow: '0 8px 16px -2px rgba(90, 60, 140, 0.3), inset 0 2px 3px rgba(255, 255, 255, 0.6)',
              position: 'relative',
            }}
          >
            {/* Glowing bulb tip */}
            <div
              style={{
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '13px',
                height: '9px',
                borderRadius: '50%',
                background: '#FEF08A',
                boxShadow: '0 0 18px 7px rgba(254, 240, 138, 0.65)',
              }}
            />
          </div>
        </div>

        {/* B. Soft 3D Clouds on Background Wall */}
        {/* Left Cloud */}
        <div
          className="login-3d-cloud-left"
          style={{
            position: 'absolute',
            top: 'clamp(30px, 6vh, 70px)',
            left: 'clamp(30px, 6vw, 90px)',
            zIndex: 2,
            opacity: 0.82,
          }}
        >
          <svg width="100" height="46" viewBox="0 0 110 52" fill="none">
            <ellipse cx="55" cy="34" rx="42" ry="16" fill="url(#cloudGrad1)" />
            <circle cx="36" cy="24" r="18" fill="url(#cloudGrad1)" />
            <circle cx="64" cy="18" r="22" fill="url(#cloudGrad1)" />
            <ellipse cx="80" cy="28" rx="16" ry="14" fill="url(#cloudGrad1)" />
            <defs>
              <linearGradient id="cloudGrad1" x1="55" y1="0" x2="55" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="0.7" stopColor="#F5EDFC" />
                <stop offset="1" stopColor="#E2D4F5" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Right Cloud */}
        <div
          className="login-3d-cloud-right"
          style={{
            position: 'absolute',
            top: 'clamp(50px, 8vh, 100px)',
            right: 'clamp(140px, 16vw, 240px)',
            zIndex: 2,
            opacity: 0.78,
          }}
        >
          <svg width="84" height="38" viewBox="0 0 90 42" fill="none">
            <ellipse cx="45" cy="28" rx="34" ry="13" fill="url(#cloudGrad2)" />
            <circle cx="30" cy="20" r="15" fill="url(#cloudGrad2)" />
            <circle cx="54" cy="15" r="18" fill="url(#cloudGrad2)" />
            <defs>
              <linearGradient id="cloudGrad2" x1="45" y1="0" x2="45" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="0.8" stopColor="#EADFF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* C. Modern Bookshelf on Right Wall (Comfortably separated from card) */}
        <div
          className="login-3d-shelf"
          style={{
            position: 'absolute',
            right: 'clamp(16px, 3.5vw, 48px)',
            top: '48%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {/* Books & Cat Planter standing on shelf */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', paddingLeft: '8px', marginBottom: '-1px' }}>
            {/* Book 1 (Coral pink) */}
            <div
              style={{
                width: '10px',
                height: '44px',
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
                boxShadow: '1px 2px 4px rgba(0,0,0,0.1)',
                transform: 'rotate(-4deg)',
              }}
            />
            {/* Book 2 (Pastel Gold) */}
            <div
              style={{
                width: '9px',
                height: '38px',
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(180deg, #FDE047 0%, #D97706 100%)',
                boxShadow: '1px 2px 4px rgba(0,0,0,0.1)',
                transform: 'rotate(2deg)',
              }}
            />
            {/* Book 3 (Pastel Teal) */}
            <div
              style={{
                width: '10px',
                height: '42px',
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(180deg, #5EEAD4 0%, #0D9488 100%)',
                boxShadow: '1px 2px 4px rgba(0,0,0,0.1)',
              }}
            />
            {/* Cute Cat Planter / Desk Figurine */}
            <div
              style={{
                marginLeft: '10px',
                width: '30px',
                height: '26px',
                borderRadius: '15px 15px 11px 11px',
                background: 'linear-gradient(145deg, #FDE8E8 0%, #FBCFE8 60%, #F472B6 100%)',
                boxShadow: '0 4px 8px rgba(180, 100, 140, 0.2), inset 0 2px 2px #FFFFFF',
                position: 'relative',
              }}
            >
              {/* Cat Ears */}
              <div style={{ position: 'absolute', top: '-4px', left: '4px', width: '6px', height: '6px', background: '#F472B6', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
              <div style={{ position: 'absolute', top: '-4px', right: '4px', width: '6px', height: '6px', background: '#F472B6', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
              {/* Cute Eyes & Nose */}
              <div style={{ position: 'absolute', top: '9px', left: '9px', width: '2.5px', height: '2.5px', borderRadius: '50%', background: '#4A044E' }} />
              <div style={{ position: 'absolute', top: '9px', right: '9px', width: '2.5px', height: '2.5px', borderRadius: '50%', background: '#4A044E' }} />
              <div style={{ position: 'absolute', top: '14px', left: '13px', width: '3.5px', height: '2px', borderRadius: '2px', background: '#E11D48' }} />
            </div>
          </div>
          {/* Wall Shelf plank */}
          <div
            style={{
              width: '84px',
              height: '7px',
              borderRadius: '3px',
              background: 'linear-gradient(180deg, #F3ECFA 0%, #D8C6EE 100%)',
              borderBottom: '2px solid #BCABDE',
              boxShadow: '0 6px 14px rgba(110, 80, 160, 0.16)',
            }}
          />
        </div>

        {/* D. Potted Monstera Plant on Left Floor */}
        <div
          className="login-3d-plant-left"
          style={{
            position: 'absolute',
            left: 'clamp(18px, 4vw, 56px)',
            bottom: 'clamp(20px, 4vh, 48px)',
            zIndex: 4,
          }}
        >
          {/* Green Leaves */}
          <div style={{ position: 'relative', width: '52px', height: '60px', marginBottom: '-5px' }}>
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '10px',
                width: '30px',
                height: '44px',
                borderRadius: '50% 50% 50% 10%',
                background: 'linear-gradient(135deg, #4ADE80 0%, #15803D 100%)',
                transform: 'rotate(-25deg)',
                boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.4)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '4px',
                width: '26px',
                height: '40px',
                borderRadius: '50% 50% 10% 50%',
                background: 'linear-gradient(135deg, #86EFAC 0%, #16A34A 100%)',
                transform: 'rotate(20deg)',
                boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.4)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                left: '18px',
                width: '22px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #22C55E 0%, #166534 100%)',
                transform: 'rotate(-2deg)',
              }}
            />
          </div>
          {/* Lavender Pot */}
          <div
            style={{
              width: '44px',
              height: '40px',
              borderRadius: '8px 8px 16px 16px',
              background: 'linear-gradient(145deg, #DDD0F7 0%, #BBA5E8 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 8px 16px rgba(100, 70, 150, 0.22), inset 0 2px 3px rgba(255, 255, 255, 0.8)',
            }}
          />
        </div>

        {/* E. Succulent on Wooden Tripod on Right Floor */}
        <div
          className="login-3d-plant-right"
          style={{
            position: 'absolute',
            right: 'clamp(24px, 5vw, 68px)',
            bottom: 'clamp(18px, 3.5vh, 42px)',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Succulent petals */}
          <div style={{ position: 'relative', width: '36px', height: '24px', marginBottom: '-3px' }}>
            <div style={{ position: 'absolute', bottom: '0', left: '5px', width: '26px', height: '18px', borderRadius: '50% 50% 20% 20%', background: 'linear-gradient(180deg, #6EE7B7 0%, #059669 100%)' }} />
            <div style={{ position: 'absolute', bottom: '2px', left: '0', width: '18px', height: '14px', borderRadius: '50%', background: '#34D399', transform: 'rotate(-30deg)' }} />
            <div style={{ position: 'absolute', bottom: '2px', right: '0', width: '18px', height: '14px', borderRadius: '50%', background: '#10B981', transform: 'rotate(30deg)' }} />
          </div>
          {/* Pot */}
          <div
            style={{
              width: '36px',
              height: '32px',
              borderRadius: '7px 7px 13px 13px',
              background: 'linear-gradient(145deg, #CBB7EE 0%, #A990DF 100%)',
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 6px 12px rgba(100, 70, 150, 0.18)',
              position: 'relative',
              zIndex: 2,
            }}
          />
          {/* Wooden Dowel Tripod Legs */}
          <div style={{ display: 'flex', gap: '7px', marginTop: '-3px', zIndex: 1 }}>
            <div style={{ width: '2.5px', height: '17px', background: '#D4B996', borderRadius: '2px', transform: 'rotate(15deg)' }} />
            <div style={{ width: '2.5px', height: '15px', background: '#B89B77', borderRadius: '2px' }} />
            <div style={{ width: '2.5px', height: '17px', background: '#D4B996', borderRadius: '2px', transform: 'rotate(-15deg)' }} />
          </div>
        </div>
      </div>

      {/* ─── 4. MAIN CENTRAL STAGE (Bird + Tablet Card on Podium) ─── */}
      <div
        className="login-3d-stage"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '680px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '22px', // space for podium bevel base
        }}
      >
        {/* A. The Circular Podium / Dais (Floor Platform) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '96%',
            maxWidth: '660px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #E6DCFA 0%, #D0BFF2 60%, #BCABE0 100%)',
            border: '2px solid rgba(255, 255, 255, 0.85)',
            borderBottom: '6px solid #A592CE',
            boxShadow:
              '0 22px 44px -6px rgba(100, 70, 160, 0.32), 0 8px 16px -2px rgba(100, 70, 160, 0.18), inset 0 3px 6px rgba(255, 255, 255, 0.85)',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />

        {/* B. Real 3D Swa Character (Grounded on the Dais on the Left) */}
        <div
          className="login-3d-character-col"
          style={{
            position: 'relative',
            zIndex: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginRight: '-28px',
            marginBottom: '4px',
            flexShrink: 0,
          }}
        >
          <Swa
            expression="curious"
            animation="curious"
            speech="Ready to explore?"
            showSpeechOnMount={true}
            size={225}
            float={true}
            alt="Swa — Swallern 3D Companion"
          />
        </div>

        {/* C. The 3D Floating Tablet Panel (Sitting on the Dais in the Center / Right) */}
        <div
          className="login-3d-tablet-panel"
          style={{
            position: 'relative',
            zIndex: 15,
            width: '100%',
            maxWidth: '368px',
            backgroundColor: '#FFFFFF',
            borderRadius: '34px',
            padding: '24px 26px 22px',
            boxSizing: 'border-box',
            marginBottom: '8px', // Sits snugly on podium
            // Multi-layered 3D porcelain shadow and bevel matching 3d.png
            boxShadow:
              '0 28px 56px -14px rgba(90, 60, 150, 0.26), 0 10px 20px -5px rgba(90, 60, 150, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.95), inset 0 2px 3px rgba(255, 255, 255, 1), inset 0 -3px 6px rgba(180, 160, 220, 0.1)',
            transition: 'transform 300ms ease, box-shadow 300ms ease',
          }}
        >
          {/* Top 3D App Icon Badge matching 3d.png */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '19px',
                background: 'linear-gradient(145deg, #A78BFA 0%, #8B5CF6 55%, #6D28D9 100%)',
                boxShadow:
                  '0 10px 22px -4px rgba(124, 58, 237, 0.42), inset 0 2.5px 4px rgba(255, 255, 255, 0.65), inset 0 -2.5px 5px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Swallern Logo Mark SVG */}
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="rgba(255,255,255,0.15)" />
                <path
                  d="M10 20C10 15 13 11 18 10C21.5 9.3 23 11.5 22 14.5C21 17.5 17.5 19 15 21C13.5 22.2 12 21.5 10 20Z"
                  fill="#FFFFFF"
                />
                <circle cx="16" cy="16" r="3" fill="#FBBF24" />
              </svg>

              {/* 3D Sparkle Star 1 (Top right) */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '9px',
                  right: '8px',
                  fontSize: '10px',
                  color: '#FDE047',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                }}
              >
                ★
              </span>
              {/* 3D Sparkle Star 2 (Lower right) */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: '9px',
                  right: '12px',
                  fontSize: '8px',
                  color: '#FDE047',
                  opacity: 0.85,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                }}
              >
                ✦
              </span>
            </div>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* ─── 5. MINIMAL FOOTER ─── */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: 'clamp(8px, 1.5vh, 14px)',
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: '0.74rem',
            color: '#7C6F98',
            margin: 0,
            fontWeight: 500,
          }}
        >
          By continuing, you agree to Swallern&apos;s{' '}
          <Link href="/terms" style={{ color: '#5B4E7E', fontWeight: 600, textDecoration: 'underline' }}>
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ color: '#5B4E7E', fontWeight: 600, textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </div>
  );
};
