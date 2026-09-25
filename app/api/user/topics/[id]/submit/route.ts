import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlatformSetting } from '@/lib/settings';
import { evaluateTopicAutoApproval } from '@/lib/topics/userTopics';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/user/topics/[id]/submit
 * Submits user topic for review.
 * Evaluates auto-approval setting and quality engine checks.
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

    if (topic.approval_status === 'APPROVED') {
      return NextResponse.json({ message: 'Topic is already approved.', topic });
    }

    const autoApproveEnabled = await getPlatformSetting<boolean>('auto_approve_user_topics', false);

    let newApprovalStatus: 'APPROVED' | 'PENDING_REVIEW' = 'PENDING_REVIEW';
    let isAutoApproved = false;
    let feedbackNote: string | null = null;

    if (autoApproveEnabled) {
      const evalResult = await evaluateTopicAutoApproval(id);
      if (evalResult.pass) {
        newApprovalStatus = 'APPROVED';
        isAutoApproved = true;
        feedbackNote = 'Auto-approved by platform quality engine.';
      } else {
        newApprovalStatus = 'PENDING_REVIEW';
        isAutoApproved = false;
        feedbackNote = `Submitted for admin review (Automated quality notes: ${evalResult.reasons.join('; ')})`;
      }
    } else {
      newApprovalStatus = 'PENDING_REVIEW';
      isAutoApproved = false;
      feedbackNote = null;
    }

    const { data: updatedTopic, error: updateErr } = await adminClient
      .from('topics')
      .update({
        approval_status: newApprovalStatus,
        auto_approved: isAutoApproved,
        admin_feedback: feedbackNote,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      auto_approved: isAutoApproved,
      approval_status: newApprovalStatus,
      message: isAutoApproved
        ? 'Your topic passed automated quality checks and has been APPROVED!'
        : 'Your topic has been submitted for admin review.',
      topic: updatedTopic,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed submitting topic for review' },
      { status: 500 }
    );
  }
}
