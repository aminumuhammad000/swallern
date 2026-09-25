import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AdminUser {
  id: string;
  email: string;
  display_name?: string;
}

/**
 * Checks server-side if the currently logged-in user is an authorized admin.
 * Never exposes service-role credentials to the client.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const email = user.email || '';
    const cleanEmail = email.trim().toLowerCase();
    const userMeta = user.user_metadata || {};
    const appMeta = user.app_metadata || {};

    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@swallern.com,admin@example.com,swallern@gmail.com')
      .split(',')
      .map((e) => e.trim().toLowerCase());

    const isExplicitAdmin =
      userMeta.is_admin === true ||
      appMeta.is_admin === true ||
      userMeta.role === 'admin' ||
      appMeta.role === 'admin' ||
      adminEmails.includes(cleanEmail) ||
      cleanEmail.startsWith('admin@');

    if (isExplicitAdmin) {
      return {
        id: user.id,
        email,
        display_name: userMeta.full_name || userMeta.display_name || email.split('@')[0],
      };
    }

    // Check database profile table for is_admin column if present
    try {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && ((profile as Record<string, unknown>).is_admin === true || (profile as Record<string, unknown>).role === 'admin')) {
        return {
          id: user.id,
          email,
          display_name: profile.display_name || email.split('@')[0],
        };
      }
    } catch {
      // Ignore schema column error if column does not exist
    }

    return null;
  } catch {
    return null;
  }
}
