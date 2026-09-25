import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth callback handler for Supabase social login.
 *
 * Flow:
 *   Provider → redirects here with ?code=...&next=/intended-path
 *   → exchangeCodeForSession() writes the session cookie
 *   → redirect to intended destination (or /account)
 *
 * Security: next= is validated to be a same-origin relative path,
 * preventing open-redirect attacks.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Validate and sanitise the intended redirect path
  const rawNext = searchParams.get('next') ?? '/account';
  // Only allow relative paths starting with /  (no //evil.com)
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/account';

  // Provider returned an error (e.g. user cancelled)
  if (error) {
    const label = encodeURIComponent(
      errorDescription ?? 'Sign-in was cancelled or failed. Please try again.'
    );
    return NextResponse.redirect(`${origin}/login?error=${label}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('No authorisation code received.')}`);
  }

  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    console.error('[auth/callback] exchangeCodeForSession error:', sessionError.message);
    const label = encodeURIComponent('We could not complete sign-in. Please try again.');
    return NextResponse.redirect(`${origin}/login?error=${label}`);
  }

  // Upsert the profile row so new OAuth users are always in public.profiles
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase.from('profiles') as any).upsert(
        {
          id: user.id,
          display_name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split('@')[0] ??
            'Swallern User',
          avatar_url: user.user_metadata?.avatar_url ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id', ignoreDuplicates: false }
      );
    }
  } catch {
    // Non-fatal: profile upsert failure should not block sign-in
  }

  return NextResponse.redirect(`${origin}${next}`);
}
