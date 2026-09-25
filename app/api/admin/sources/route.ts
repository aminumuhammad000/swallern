import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_SOURCE_TYPES = ['PRIMARY', 'GOVERNMENT', 'UNIVERSITY', 'SCIENTIFIC', 'REFERENCE', 'NEWS', 'VIDEO', 'OTHER'] as const;

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      action,
      topic_id,
      source_id,
      title,
      url,
      publisher,
      reliability_score,
      source_type,
      notes,
      published_at,
      accessed_at,
    } = body;

    if (!topic_id) {
      return NextResponse.json({ error: 'topic_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Validate source_type if provided
    const safeSourceType = VALID_SOURCE_TYPES.includes(source_type) ? source_type : undefined;

    if (action === 'add') {
      if (!title || !url) {
        return NextResponse.json({ error: 'Title and URL are required for new source' }, { status: 400 });
      }

      const insertPayload: Record<string, unknown> = {
        title: title.trim(),
        url: url.trim(),
        publisher: publisher?.trim() || null,
        reliability_score: typeof reliability_score === 'number' ? reliability_score : null,
      };
      if (safeSourceType) insertPayload.source_type = safeSourceType;
      if (notes !== undefined) insertPayload.notes = notes?.trim() || null;
      if (published_at) insertPayload.published_at = published_at;
      if (accessed_at) insertPayload.accessed_at = accessed_at;

      const { data: newSource, error: srcErr } = await supabase
        .from('sources')
        .insert(insertPayload)
        .select()
        .single();

      if (srcErr || !newSource) throw srcErr || new Error('Failed to create source');

      const { error: linkErr } = await supabase
        .from('topic_sources')
        .insert({ topic_id, source_id: newSource.id });
      if (linkErr) throw linkErr;

      return NextResponse.json({ source: newSource });
    }

    if (action === 'edit') {
      if (!source_id) {
        return NextResponse.json({ error: 'source_id is required for edit' }, { status: 400 });
      }

      const updates: Record<string, unknown> = {};
      if (title !== undefined) updates.title = title.trim();
      if (url !== undefined) updates.url = url.trim();
      if (publisher !== undefined) updates.publisher = publisher?.trim() || null;
      if (reliability_score !== undefined) updates.reliability_score = reliability_score;
      if (safeSourceType !== undefined) updates.source_type = safeSourceType;
      if (notes !== undefined) updates.notes = notes?.trim() || null;
      if (published_at !== undefined) updates.published_at = published_at || null;
      if (accessed_at !== undefined) updates.accessed_at = accessed_at || null;

      const { data: updatedSource, error: editErr } = await supabase
        .from('sources')
        .update(updates)
        .eq('id', source_id)
        .select()
        .single();

      if (editErr) throw editErr;

      return NextResponse.json({ source: updatedSource });
    }

    if (action === 'remove') {
      if (!source_id) {
        return NextResponse.json({ error: 'source_id is required for remove' }, { status: 400 });
      }

      const { error: relErr } = await supabase
        .from('topic_sources')
        .delete()
        .eq('topic_id', topic_id)
        .eq('source_id', source_id);

      if (relErr) throw relErr;

      return NextResponse.json({ success: true, removedSourceId: source_id });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed source operation' },
      { status: 500 }
    );
  }
}
