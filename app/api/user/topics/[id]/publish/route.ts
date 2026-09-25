import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/user/topics/[id]/publish
 * Toggles publication status (PUBLISHED / UNPUBLISHED) and visibility (PUBLIC / LINK_ONLY).
 * Strictly requires approval_status === 'APPROVED' to publish.
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

    const body = await req.json();
    const { publication_status, visibility } = body;

    // Check approval status requirement for publishing
    if (publication_status === 'PUBLISHED' && topic.approval_status !== 'APPROVED') {
      return NextResponse.json(
        {
          error: `Cannot publish topic while in "${topic.approval_status}" status. Topic must be APPROVED by an administrator before it can be published.`,
        },
        { status: 400 }
      );
    }

    const targetPubStatus = publication_status || topic.publication_status || 'UNPUBLISHED';
    const targetVisibility = visibility || topic.visibility || 'PUBLIC';

    // Ensure share token exists if link_only
    let shareToken = topic.share_token;
    if (!shareToken) {
      shareToken = crypto.randomUUID();
    }

    const { data: updatedTopic, error: updateErr } = await adminClient
      .from('topics')
      .update({
        publication_status: targetPubStatus,
        visibility: targetVisibility,
        status: targetPubStatus === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        share_token: shareToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: `Topic is now ${targetPubStatus === 'PUBLISHED' ? 'PUBLISHED (' + targetVisibility + ')' : 'UNPUBLISHED'}.`,
      topic: updatedTopic,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed updating publication status' },
      { status: 500 }
    );
  }
}
