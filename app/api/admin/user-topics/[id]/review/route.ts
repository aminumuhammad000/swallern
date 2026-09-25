import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/user-topics/[id]/review
 * Admin moderation endpoint for user topics.
 * Actions: APPROVE, REJECT, REQUEST_CHANGES, UNPUBLISH, DISABLE_LINK
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, feedback } = body;

    const supabase = createAdminClient();

    const { data: topic } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    let updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    switch (action) {
      case 'APPROVE':
        updatePayload.approval_status = 'APPROVED';
        updatePayload.admin_feedback = feedback?.trim() || 'Approved by administrator.';
        break;

      case 'REJECT':
        updatePayload.approval_status = 'REJECTED';
        updatePayload.publication_status = 'UNPUBLISHED';
        updatePayload.status = 'REJECTED';
        updatePayload.admin_feedback = feedback?.trim() || 'Topic does not meet community guidelines.';
        break;

      case 'REQUEST_CHANGES':
        updatePayload.approval_status = 'CHANGES_REQUESTED';
        updatePayload.admin_feedback = feedback?.trim() || 'Please update content per reviewer notes.';
        break;

      case 'UNPUBLISH':
        updatePayload.publication_status = 'UNPUBLISHED';
        updatePayload.status = 'DRAFT';
        updatePayload.admin_feedback = feedback?.trim() || 'Topic unpublished by administrator.';
        break;

      case 'DISABLE_LINK':
        updatePayload.share_token = crypto.randomUUID();
        updatePayload.admin_feedback = 'Private share token revoked by administrator.';
        break;

      default:
        return NextResponse.json({ error: 'Invalid review action.' }, { status: 400 });
    }

    const { data: updatedTopic, error: updateErr } = await supabase
      .from('topics')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      action,
      message: `User topic review action "${action}" completed successfully.`,
      topic: updatedTopic,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Review action failed' },
      { status: 500 }
    );
  }
}
