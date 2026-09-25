'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import styles from '@/components/auth/AuthForm.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setHasError(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setHasError(true);
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/callback?next=/account`,
      });

      if (error) {
        setHasError(true);
        setErrorMsg(error.message || 'Unable to send password reset email. Please try again.');
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch {
      setHasError(true);
      setErrorMsg('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      {submitted ? (
        <div className={styles.successCard}>
          <div className={styles.successIconWrapper}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className={styles.successTitle}>Check your inbox</h2>
          <p className={styles.successDescription}>
            We sent a secure password reset link to{' '}
            <strong style={{ color: '#0F172A' }}>{email}</strong>. Follow the instructions in the email to set a new password.
          </p>

          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              style={{
                height: '44px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9375rem',
              }}
            >
              Back to Sign In
            </Button>
          </Link>

          <div className={styles.resendRow}>
            Didn&apos;t receive the email?{' '}
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setErrorMsg(null);
              }}
              className={styles.linkBold}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleReset} noValidate className={styles.form}>
          {errorMsg && (
            <div className={`${styles.errorBanner} swallern-input-shake`} role="alert">
              <div className={styles.errorContent}>
                <svg
                  className={styles.errorIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (hasError) setHasError(false);
              }}
              placeholder="you@example.com"
              className={`${styles.input} ${hasError ? styles.inputError : ''}`}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={loading}
            style={{
              marginTop: '8px',
              height: '44px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9375rem',
            }}
          >
            {loading ? 'Sending link…' : 'Send Reset Link'}
          </Button>

          <div className={styles.switchRow} style={{ marginTop: '16px' }}>
            <Link href="/login" className={styles.linkBold}>
              ← Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
