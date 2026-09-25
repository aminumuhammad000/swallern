'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import styles from '@/components/auth/AuthForm.module.css';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: boolean; password?: boolean }>({});
  const [isExistingUser, setIsExistingUser] = useState(false);

  const validateForm = () => {
    const errors: { email?: boolean; password?: boolean } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email.trim())) {
      errors.email = true;
    }

    if (!password || password.length < 6) {
      errors.password = true;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsExistingUser(false);

    if (!validateForm()) {
      if (password && password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
      } else {
        setErrorMsg('Please enter a valid email address and password.');
      }
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || undefined,
          },
          emailRedirectTo,
        },
      });

      if (error) {
        const msg = error.message || 'Registration failed.';
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
          setIsExistingUser(true);
          setErrorMsg('This email is already associated with a Swallern account.');
        } else {
          setErrorMsg(msg);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Upsert user profile
        try {
          await (supabase.from('profiles') as any).upsert({
            id: data.user.id,
            display_name: fullName.trim() || email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch {
          // Non-fatal
        }

        router.push(redirectPath);
        router.refresh();
      } else {
        // Confirmation email required
        setErrorMsg('Account created! Please check your email to confirm your registration.');
        setLoading(false);
      }
    } catch {
      setErrorMsg('An unexpected registration error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. Social Authentication */}
      <SocialAuthButtons
        redirectPath={redirectPath}
        onError={(msg) => setErrorMsg(msg)}
      />

      {/* 2. Visual Divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
        <span
          style={{
            padding: '0 12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          or
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
      </div>

      {/* Error Banner */}
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
          {isExistingUser && (
            <div style={{ paddingLeft: '24px' }}>
              <Link
                href={`/login?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectPath)}`}
                className={styles.linkBold}
              >
                Log in instead →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 3. Credentials Form */}
      <form onSubmit={handleRegister} noValidate className={styles.form}>
        {/* Full Name */}
        <div className={styles.fieldGroup}>
          <label htmlFor="fullName" className={styles.label}>
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            className={styles.input}
          />
        </div>

        {/* Email Address */}
        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address
          </label>
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
            placeholder="you@example.com"
            className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
          />
        </div>

        {/* Password */}
        <div className={styles.fieldGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: false }));
            }}
            placeholder="Create a password"
            required
            hasError={fieldErrors.password}
            showRequirements={true}
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        {/* Primary Submit CTA */}
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
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className={styles.switchRow}>
        Already have an account?{' '}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className={styles.linkBold}
        >
          Log in
        </Link>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start learning something curious."
    >
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B' }}>Loading…</div>}>
        <RegisterFormContent />
      </Suspense>
    </AuthLayout>
  );
}
