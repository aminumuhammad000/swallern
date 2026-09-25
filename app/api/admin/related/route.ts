import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, from_topic_id, to_topic_id } = body;

    if (!from_topic_id || !to_topic_id) {
      return NextResponse.json({ error: 'Both from_topic_id and to_topic_id are required' }, { status: 400 });
    }

    if (from_topic_id === to_topic_id) {
      return NextResponse.json({ error: 'Cannot link a topic to itself.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (action === 'add') {
      const { data, error } = await supabase
        .from('topic_relationships')
        .upsert({
          from_topic_id,
          to_topic_id,
          relationship_type: 'RELATED',
          weight: 1.0,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ relationship: data });
    }

    if (action === 'remove') {
      const { error } = await supabase
        .from('topic_relationships')
        .delete()
        .eq('from_topic_id', from_topic_id)
        .eq('to_topic_id', to_topic_id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed related topic operation' },
      { status: 500 }
    );
  }
}
