import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateEducationalImage, getImageProviderConfig } from '@/lib/images/provider';
import { createEducationalPrompt, saveGeneratedAsset } from '@/lib/images/service';

/**
 * GET /api/admin/assets
 * Returns generated assets for a topic.
 */
export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topic_id');
    const supabase = createAdminClient();

    let query = (supabase.from('topic_assets') as any).select('*').order('created_at', { ascending: false });
    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    const { data: assets, error } = await query;
    if (error) throw error;

    const config = getImageProviderConfig();

    return NextResponse.json({ assets: assets || [], provider_config: config });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch topic assets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/assets
 * Actions: generate, approve, reject
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, topic_id, lesson_id, asset_id, custom_prompt } = body;
    const supabase = createAdminClient();

    // Action 1: Generate new image asset
    if (action === 'generate') {
      if (!topic_id) {
        return NextResponse.json({ error: 'topic_id is required for asset generation' }, { status: 400 });
      }

      const { data: topic, error: topicErr } = await supabase
        .from('topics')
        .select('id, title, summary')
        .eq('id', topic_id)
        .single();

      if (topicErr || !topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }

      const prompt = custom_prompt?.trim() || createEducationalPrompt(topic.title, topic.summary || undefined);

      const genResult = await generateEducationalImage({
        prompt,
        topicId: topic.id,
        lessonId: lesson_id || undefined,
        aspectRatio: '16:9',
        style: 'educational_illustration',
      });

      if (!genResult.success || !genResult.imageUrl) {
        return NextResponse.json(
          {
            error: genResult.error || 'Image generation failed',
            configured: genResult.configured,
            provider: genResult.provider,
          },
          { status: 400 }
        );
      }

      const saveRes = await saveGeneratedAsset(topic.id, lesson_id || null, genResult, supabase);
      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Failed to save generated asset record');
      }

      return NextResponse.json({
        success: true,
        asset_id: saveRes.assetId,
        imageUrl: genResult.imageUrl,
        approval_state: 'PENDING_REVIEW',
        provider: genResult.provider,
      });
    }

    // Action 2: Approve generated asset for public display
    if (action === 'approve') {
      if (!asset_id) {
        return NextResponse.json({ error: 'asset_id is required for approval' }, { status: 400 });
      }

      const { data: updated, error } = await (supabase.from('topic_assets') as any)
        .update({ approval_state: 'APPROVED', updated_at: new Date().toISOString() })
        .eq('id', asset_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, asset: updated });
    }

    // Action 3: Reject generated asset
    if (action === 'reject') {
      if (!asset_id) {
        return NextResponse.json({ error: 'asset_id is required for rejection' }, { status: 400 });
      }

      const { data: updated, error } = await (supabase.from('topic_assets') as any)
        .update({ approval_state: 'REJECTED', updated_at: new Date().toISOString() })
        .eq('id', asset_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, asset: updated });
    }

    return NextResponse.json({ error: 'Invalid asset action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Asset action failed' },
      { status: 500 }
    );
  }
}
