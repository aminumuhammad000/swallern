import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isDeletionAuthorized, clearDeletionChallenge } from '@/lib/auth/accountSecurity';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user went through the full verified security challenge
    if (!isDeletionAuthorized(user.id)) {
      return NextResponse.json(
        { error: 'Account deletion was not authorized. Please complete password and email verification first.' },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Delete user-owned database records (cascade / explicit cleanup)
    try {
      await adminClient.from('saved_topics').delete().eq('user_id', user.id);
      await adminClient.from('lesson_progress').delete().eq('user_id', user.id);
      await adminClient.from('user_quiz_attempts').delete().eq('user_id', user.id);
      await adminClient.from('learning_sessions').delete().eq('user_id', user.id);
      await adminClient.from('profiles').delete().eq('id', user.id);
    } catch (cleanupErr) {
      console.warn('[AccountDelete] Non-fatal cleanup notice:', cleanupErr);
    }

    // 2. Permanently delete user from Supabase Auth
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteAuthError) {
      console.error('[AccountDelete] Admin deleteUser error:', deleteAuthError);
      return NextResponse.json({ error: 'Failed to permanently delete account from authentication provider.' }, { status: 500 });
    }

    // 3. Clear deletion challenge
    clearDeletionChallenge(user.id);

    // 4. Invalidate user session
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Account and associated learning data have been permanently deleted.',
    });
  } catch (error) {
    console.error('Account deletion execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
