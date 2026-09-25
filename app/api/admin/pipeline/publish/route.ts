import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/admin/pipeline/publish
 * Human Admin Approval endpoint: Publishes an approved topic draft.
 * Automatically updates published version and makes it accessible publicly.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { topic_id } = body;

    if (!topic_id) {
      return NextResponse.json({ error: 'topic_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Verify topic exists
    const { data: topic, error: topicErr } = await supabase
      .from('topics')
      .select('id, title, slug, status, published_version')
      .eq('id', topic_id)
      .single();

    if (topicErr || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // 2. Transition topic status to PUBLISHED
    const newPublishedVersion = (topic.published_version || 0) + 1;

    const { data: updatedTopic, error: updateErr } = await supabase
      .from('topics')
      .update({
        status: 'PUBLISHED',
        published_version: newPublishedVersion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', topic_id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: `Topic "${updatedTopic.title}" published successfully!`,
      topic: updatedTopic,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Publish operation failed' },
      { status: 500 }
    );
  }
}
