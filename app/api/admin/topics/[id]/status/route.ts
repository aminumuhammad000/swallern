import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_STATUSES = [
  'DISCOVERED',
  'RESEARCHING',
  'DRAFT',
  'REVIEW',
  'APPROVED',
  'PUBLISHED',
  'UPDATED',
  'REJECTED',
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status "${status}". Allowed values: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch existing topic
    const { data: topic, error: findErr } = await supabase
      .from('topics')
      .select('id, published_version')
      .eq('id', id)
      .single();

    if (findErr || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const updatePayload: Record<string, unknown> = {
      status,
    };

    // If publishing, ensure published_version is set
    if (['PUBLISHED', 'UPDATED'].includes(status) && !topic.published_version) {
      updatePayload.published_version = 1;
    }

    const { data: updatedTopic, error: updateErr } = await supabase
      .from('topics')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({ topic: updatedTopic });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update status' },
      { status: 500 }
    );
  }
}
