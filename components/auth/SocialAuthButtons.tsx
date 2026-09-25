'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SOCIAL_PROVIDERS_LIST, type SupportedSocialProvider } from '@/lib/auth/providers';
import { GoogleIcon, AppleIcon, GithubIcon } from './ProviderIcons';
import styles from './SocialAuthButtons.module.css';

interface SocialAuthButtonsProps {
  redirectPath?: string;
  onError?: (message: string) => void;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  redirectPath = '/account',
  onError,
}) => {
  const [activeProvider, setActiveProvider] = useState<SupportedSocialProvider | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: SupportedSocialProvider) => {
    setActiveProvider(provider);
    setLocalError(null);

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

        setLocalError(friendlyMessage);
        onError?.(friendlyMessage);
        setActiveProvider(null);
        return;
      }

      // If data.url is present, Supabase will redirect the browser
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const friendlyMessage = 'Unable to connect to authentication provider. Please check your connection and try again.';
      setLocalError(friendlyMessage);
      onError?.(friendlyMessage);
      setActiveProvider(null);
    }
  };

  const renderIcon = (id: SupportedSocialProvider) => {
    if (activeProvider === id) {
      return <div className={styles.spinner} aria-hidden="true" />;
    }

    switch (id) {
      case 'google':
        return <GoogleIcon size={18} />;
      case 'apple':
        return <AppleIcon size={18} />;
      case 'github':
        return <GithubIcon size={18} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {SOCIAL_PROVIDERS_LIST.map((provider) => {
        const isLoading = activeProvider === provider.id;
        const isDisabled = activeProvider !== null && !isLoading;

        return (
          <button
            key={provider.id}
            type="button"
            className={styles.button}
            disabled={isDisabled || isLoading}
            onClick={() => handleOAuthSignIn(provider.id)}
            aria-busy={isLoading}
            aria-label={isLoading ? provider.connectingLabel : provider.label}
          >
            <span className={styles.iconWrapper}>
              {renderIcon(provider.id)}
            </span>
            <span className={styles.label}>
              {isLoading ? provider.connectingLabel : provider.label}
            </span>
          </button>
        );
      })}

      {localError && (
        <div className={styles.errorBanner} role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{localError}</span>
        </div>
      )}
    </div>
  );
};
