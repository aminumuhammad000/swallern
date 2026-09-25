'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Login3DScene } from '@/components/auth/Login3DScene';
import { Login3DSocialButtons } from '@/components/auth/Login3DSocialButtons';
import { createClient } from '@/lib/supabase/client';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';
  const initialEmail = searchParams.get('email') || '';
  const initialError = searchParams.get('error') || null;

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [fieldErrors, setFieldErrors] = useState<{ email?: boolean; password?: boolean }>({});

  useEffect(() => {
    if (initialError) {
      setErrorMsg(decodeURIComponent(initialError));
    }
  }, [initialError]);

  const validateForm = () => {
    const errors: { email?: boolean; password?: boolean } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email.trim())) {
      errors.email = true;
    }
    if (!password) {
      errors.password = true;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateForm()) {
      if (!email && !password) {
        setErrorMsg('Please enter both your email and password.');
      } else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg('Please enter your password.');
      }
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFieldErrors({ email: true, password: true });
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
          setErrorMsg('Incorrect email or password. Please verify your details.');
        } else {
          setErrorMsg(error.message || 'Invalid email or password.');
        }
        setLoading(false);
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } catch {
      setErrorMsg('An unexpected error occurred during sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* ─── PANEL HEADER ─── */}
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#1E1B4B',
            margin: '0 0 3px 0',
            fontFamily: 'var(--font-heading), sans-serif',
          }}
        >
          Welcome Back!
        </h1>
        <p
          style={{
            fontSize: '0.8rem',
            color: '#837CA0',
            margin: 0,
            fontWeight: 500,
          }}
        >
          Please login to continue
        </p>
      </div>

      {/* ─── ERROR BANNER ─── */}
      {errorMsg && (
        <div
          className="swallern-input-shake"
          role="alert"
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '8px 12px',
            marginBottom: '12px',
            fontSize: '0.78rem',
            color: '#B91C1C',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            lineHeight: 1.35,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─── CREDENTIALS FORM ─── */}
      <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Username / Email Field */}
        <div className="login-3d-input-wrapper">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: false }));
            }}
            placeholder="Username / Email"
            aria-label="Username / Email"
            className={`login-3d-input ${fieldErrors.email ? 'login-3d-input-error' : ''}`}
          />
          {/* User Icon Left */}
          <div className="login-3d-icon-left" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        {/* Password Field */}
        <div className="login-3d-input-wrapper">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: false }));
            }}
            placeholder="Password"
            aria-label="Password"
            style={{ paddingRight: '44px' }}
            className={`login-3d-input ${fieldErrors.password ? 'login-3d-input-error' : ''}`}
          />
          {/* Lock Icon Left */}
          <div className="login-3d-icon-left" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          {/* Visibility Toggle Right */}
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#9D92B8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#7C3AED')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9D92B8')}
          >
            {showPassword ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-3px' }}>
          <Link
            href="/forgot-password"
            style={{
              fontSize: '0.76rem',
              fontWeight: 600,
              color: '#837CA0',
              textDecoration: 'none',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#7C3AED')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#837CA0')}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Primary Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="swallern-press"
          style={{
            marginTop: '3px',
            width: '100%',
            height: '46px',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 50%, #7C3AED 100%)',
            color: '#FFFFFF',
            fontSize: '0.94rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.75 : 1,
            boxShadow:
              '0 8px 20px -4px rgba(124, 58, 237, 0.4), 0 3px 8px -2px rgba(124, 58, 237, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 12px 24px -3px rgba(124, 58, 237, 0.5), 0 4px 10px -2px rgba(124, 58, 237, 0.28)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 8px 20px -4px rgba(124, 58, 237, 0.4), 0 3px 8px -2px rgba(124, 58, 237, 0.22)';
            }
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#FFFFFF',
                  borderRadius: '50%',
                  animation: 'swallernRotate 1s linear infinite',
                }}
                aria-hidden="true"
              />
              <span>Signing in…</span>
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* ─── "OR CONTINUE WITH" DIVIDER ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          margin: '14px 0 12px',
          textAlign: 'center',
        }}
      >
        <div style={{ flex: 1, height: '1px', backgroundColor: '#EFE9F8' }} />
        <span
          style={{
            padding: '0 10px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#9D92B8',
          }}
        >
          or continue with
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#EFE9F8' }} />
      </div>

      {/* ─── 3D CIRCULAR SOCIAL BUTTONS ─── */}
      <Login3DSocialButtons
        redirectPath={redirectPath}
        onError={(msg) => setErrorMsg(msg)}
      />

      {/* ─── SIGN UP SWITCH LINK ─── */}
      <div
        style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#837CA0',
          fontWeight: 500,
        }}
      >
        Don&apos;t have an account?{' '}
        <Link
          href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
          style={{
            color: '#7C3AED',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Sign Up
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Login3DScene>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '36px 0', color: '#837CA0' }}>Loading…</div>}>
        <LoginFormContent />
      </Suspense>
    </Login3DScene>
  );
}
