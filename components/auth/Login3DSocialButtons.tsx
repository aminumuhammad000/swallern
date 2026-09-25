'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SupportedSocialProvider } from '@/lib/auth/providers';
import { GoogleIcon, AppleIcon, GithubIcon } from './ProviderIcons';

interface Login3DSocialButtonsProps {
  redirectPath?: string;
  onError?: (message: string) => void;
}

/**
 * 3D Reference-Matched Circular Social Authentication Buttons
 * Recreates the 3 soft 3D circular buttons from 3d.png:
 * [Google] [Apple] [GitHub]
 * Fully connected to real Supabase OAuth.
 */
export const Login3DSocialButtons: React.FC<Login3DSocialButtonsProps> = ({
  redirectPath = '/account',
  onError,
}) => {
  const [activeProvider, setActiveProvider] = useState<SupportedSocialProvider | null>(null);

  const handleOAuthSignIn = async (provider: SupportedSocialProvider) => {
    setActiveProvider(provider);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        let friendlyMessage = `We couldn't complete ${provider === 'github' ? 'GitHub' : provider === 'google' ? 'Google' : 'Apple'} sign-in. Please try again.`;

        if (error.message.toLowerCase().includes('not enabled') || error.message.toLowerCase().includes('unsupported')) {
          friendlyMessage = `${provider === 'github' ? 'GitHub' : provider === 'google' ? 'Google' : 'Apple'} authentication is currently not enabled on this deployment. Please use email sign-in.`;
        }

        onError?.(friendlyMessage);
        setActiveProvider(null);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      const friendlyMessage = 'Unable to connect to authentication provider. Please check your connection and try again.';
      onError?.(friendlyMessage);
      setActiveProvider(null);
    }
  };

  const providers: { id: SupportedSocialProvider; label: string; icon: React.ReactNode }[] = [
    {
      id: 'google',
      label: 'Sign in with Google',
      icon: <GoogleIcon size={18} />,
    },
    {
      id: 'apple',
      label: 'Sign in with Apple',
      icon: <AppleIcon size={18} />,
    },
    {
      id: 'github',
      label: 'Sign in with GitHub',
      icon: <GithubIcon size={18} />,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
      }}
    >
      {providers.map((p) => {
        const isLoading = activeProvider === p.id;
        const isDisabled = activeProvider !== null && !isLoading;

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => handleOAuthSignIn(p.id)}
            disabled={isDisabled || isLoading}
            aria-label={p.label}
            title={p.label}
            className="swallern-press login-3d-social-btn"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #EDE6F8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.5 : 1,
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow:
                '0 6px 14px -3px rgba(110, 80, 170, 0.16), 0 2px 4px -1px rgba(110, 80, 170, 0.08), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(120, 90, 180, 0.06)',
              color: '#1E1B4B',
              padding: 0,
              outline: 'none',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!isDisabled && !isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 10px 20px -3px rgba(110, 80, 170, 0.24), 0 3px 6px -1px rgba(110, 80, 170, 0.12), inset 0 2px 3px rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.borderColor = '#DDD0F5';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDisabled && !isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 6px 14px -3px rgba(110, 80, 170, 0.16), 0 2px 4px -1px rgba(110, 80, 170, 0.08), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(120, 90, 180, 0.06)';
                e.currentTarget.style.borderColor = '#EDE6F8';
              }
            }}
          >
            {isLoading ? (
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  borderTopColor: '#8B5CF6',
                  borderRadius: '50%',
                  animation: 'swallernRotate 1s linear infinite',
                }}
                aria-hidden="true"
              />
            ) : (
              p.icon
            )}
          </button>
        );
      })}
    </div>
  );
};
