import type { Provider } from '@supabase/supabase-js';

export type SupportedSocialProvider = 'google' | 'apple' | 'github';

export interface SocialAuthProvider {
  id: SupportedSocialProvider;
  name: string;
  label: string;
  connectingLabel: string;
  supabaseProvider: Provider;
  enabled: boolean;
}

/**
 * Registry of social authentication providers for Swallern.
 * Configured to work seamlessly with Supabase Auth OAuth flow.
 */
export const AUTH_PROVIDERS: Record<SupportedSocialProvider, SocialAuthProvider> = {
  google: {
    id: 'google',
    name: 'Google',
    label: 'Continue with Google',
    connectingLabel: 'Connecting to Google…',
    supabaseProvider: 'google',
    enabled: true,
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    label: 'Continue with Apple',
    connectingLabel: 'Connecting to Apple…',
    supabaseProvider: 'apple',
    enabled: true,
  },
  github: {
    id: 'github',
    name: 'GitHub',
    label: 'Continue with GitHub',
    connectingLabel: 'Connecting to GitHub…',
    supabaseProvider: 'github',
    enabled: true,
  },
};

export const SOCIAL_PROVIDERS_LIST = [
  AUTH_PROVIDERS.google,
  AUTH_PROVIDERS.apple,
  AUTH_PROVIDERS.github,
];
