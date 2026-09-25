import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/user/topics/[id]/regenerate-link
 * Regenerates a new private share token for a user topic.
 * Immediately revokes access via any previously shared link.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: topic } = await adminClient
      .from('topics')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found or access denied.' }, { status: 404 });
    }

    const newShareToken = crypto.randomUUID();

    const { data: updatedTopic, error: updateErr } = await adminClient
      .from('topics')
      .update({
        share_token: newShareToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: 'Private share link regenerated. The previous link has been revoked.',
      share_token: newShareToken,
      share_url: `/shared/${newShareToken}`,
      topic: updatedTopic,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed regenerating share link' },
      { status: 500 }
    );
  }
}
