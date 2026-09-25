'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SettingsViewProps {
  userName: string;
  userEmail: string | null;
  userRole: string;
  onSignOut: () => void;
}

type DeletionStep = 'idle' | 'password' | 'otp' | 'confirm' | 'deleting' | 'success';

export const SettingsView: React.FC<SettingsViewProps> = ({
  userName,
  userEmail,
  userRole,
  onSignOut,
}) => {
  const router = useRouter();

  // Notification Preferences
  const [emailDigest, setEmailDigest] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Account Deletion Multi-Step State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletionStep, setDeletionStep] = useState<DeletionStep>('idle');
  const [passwordInput, setPasswordInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeError, setShakeError] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const triggerErrorShake = (msg: string) => {
    setErrorMessage(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleStartDeleteFlow = () => {
    setDeletionStep('password');
    setPasswordInput('');
    setOtpInput('');
    setErrorMessage(null);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletionStep('idle');
    setPasswordInput('');
    setOtpInput('');
    setErrorMessage(null);
  };

  // Step 1: Verify Password
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      triggerErrorShake('Please enter your account password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/user/account/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Password verification failed.');
      }

      // Step 2: Request OTP dispatch
      const otpRes = await fetch('/api/user/account/send-otp', { method: 'POST' });
      const otpData = await otpRes.json();

      if (!otpRes.ok || otpData.error) {
        throw new Error(otpData.error || 'Failed to dispatch verification code.');
      }

      setMaskedEmail(otpData.maskedEmail || userEmail || 'your email');
      setResendCountdown(60);
      setDeletionStep('otp');
    } catch (err) {
      triggerErrorShake(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/user/account/send-otp', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to resend code.');
      }
      setResendCountdown(60);
      setOtpInput('');
    } catch (err) {
      triggerErrorShake(err instanceof Error ? err.message : 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim().length !== 6) {
      triggerErrorShake('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/user/account/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      setDeletionStep('confirm');
    } catch (err) {
      triggerErrorShake(err instanceof Error ? err.message : 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Final Destructive Deletion
  const handleFinalDelete = async () => {
    setLoading(true);
    setErrorMessage(null);
    setDeletionStep('deleting');

    try {
      const res = await fetch('/api/user/account/delete', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to delete account.');
      }

      // Clear local storage progress
      if (typeof window !== 'undefined') {
        localStorage.removeItem('swallern_learner_progress_v1');
        localStorage.removeItem('swallern_sidebar_collapsed');
      }

      setDeletionStep('success');

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (err) {
      setDeletionStep('confirm');
      triggerErrorShake(err instanceof Error ? err.message : 'Deletion failed.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
          Account & Profile Settings
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
          Manage your authenticated identity, learning preferences, and security.
        </p>
      </div>

      {/* 1. Profile Information Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
          Profile Information
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Display Name
            </label>
            <input
              type="text"
              value={userName}
              readOnly
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                fontWeight: 600,
                color: '#0F172A',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Learner Role
            </label>
            <input
              type="text"
              value={userRole}
              readOnly
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                fontWeight: 600,
                color: '#0F172A',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
            Registered Email Address
          </label>
          <input
            type="email"
            value={userEmail || ''}
            readOnly
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontWeight: 600,
              color: '#0F172A',
              fontSize: '0.85rem',
            }}
          />
        </div>
      </div>

      {/* 2. Learning & App Preferences */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem 0' }}>
          Learning Preferences
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Daily Streak Reminders</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Receive in-app alerts to keep your curiosity streak active.</div>
            </div>
            <input
              type="checkbox"
              checked={streakReminders}
              onChange={(e) => setStreakReminders(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#2563EB', cursor: 'pointer' }}
            />
          </label>

          <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Classroom Sound Effects</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Audio feedback when completing lessons and quiz answers.</div>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#2563EB', cursor: 'pointer' }}
            />
          </label>

          <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Weekly Curiosity Digest</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Curated summary of new visual courses delivered to your inbox.</div>
            </div>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={(e) => setEmailDigest(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#2563EB', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>

      {/* 3. Session & Sign Out */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>Active Session</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Sign out of Swallern on this device.</div>
        </div>
        <button
          onClick={onSignOut}
          style={{
            backgroundColor: '#F8FAFC',
            color: '#475569',
            border: '1px solid #E2E8F0',
            padding: '0.55rem 1rem',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>

      {/* 4. Danger Zone: Deliberately Protected Account Deletion */}
      <div
        style={{
          backgroundColor: '#FEF2F2',
          borderRadius: '20px',
          border: '1.5px solid #FECACA',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#DC2626', margin: '0 0 4px 0' }}>
              Delete Account
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#991B1B', margin: 0, lineHeight: 1.45 }}>
              Permanently delete your account, learning history, quiz results, and saved notes. This action requires password confirmation and email OTP verification.
            </p>
          </div>

          <button
            onClick={handleStartDeleteFlow}
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.6rem 1.1rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECURED MULTI-STEP ACCOUNT DELETION MODAL                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isDeleteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
        >
          <div
            className={`swallern-toast-enter ${shakeError ? 'swallern-incorrect-shake' : ''}`}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Step 1: Password Confirmation */}
            {deletionStep === 'password' && (
              <form onSubmit={handleVerifyPassword}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Security Confirmation
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 1.25rem 0', lineHeight: 1.45 }}>
                  Please enter your current account password to begin the deletion verification process.
                </p>

                {errorMessage && (
                  <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '12px' }}>
                    {errorMessage}
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Account Password
                  </label>
                  <input
                    type="password"
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    disabled={loading}
                    style={{
                      padding: '0.65rem 1.1rem',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    {loading ? 'Verifying...' : 'Continue to OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Email OTP Verification */}
            {deletionStep === 'otp' && (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Enter Verification Code
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 1.25rem 0', lineHeight: 1.45 }}>
                  We sent a 6-digit one-time code to <strong>{maskedEmail}</strong>. Code expires in 10 minutes.
                </p>

                {errorMessage && (
                  <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '12px' }}>
                    {errorMessage}
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <input
                    type="text"
                    autoFocus
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      textAlign: 'center',
                      borderRadius: '12px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      letterSpacing: '0.3em',
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendCountdown > 0 ? '#94A3B8' : '#2563EB',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: resendCountdown > 0 ? 'default' : 'pointer',
                      padding: 0,
                    }}
                  >
                    {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend code'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    disabled={loading}
                    style={{
                      padding: '0.65rem 1.1rem',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otpInput.length !== 6}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    {loading ? 'Verifying code...' : 'Confirm Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Final Destructive Confirmation */}
            {deletionStep === 'confirm' && (
              <div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#DC2626', margin: '0 0 6px 0' }}>
                  Permanently Delete Account?
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                  This is the final step. Deleting your account is <strong>permanent and irreversible</strong>. All your completed courses, interactive quiz scores, and saved bookmarks will be deleted immediately.
                </p>

                {errorMessage && (
                  <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '12px' }}>
                    {errorMessage}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    disabled={loading}
                    style={{
                      padding: '0.65rem 1.1rem',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    Keep Account
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalDelete}
                    disabled={loading}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
                    }}
                  >
                    {loading ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Deleting Progress / Success */}
            {(deletionStep === 'deleting' || deletionStep === 'success') && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #FECACA',
                    borderTopColor: '#DC2626',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 16px',
                  }}
                />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                  {deletionStep === 'success' ? 'Account Deleted' : 'Deleting Account...'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  {deletionStep === 'success' ? 'Redirecting you to the home page...' : 'Securely removing your records and invalidating sessions...'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
