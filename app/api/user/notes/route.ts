import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NoteCreateInput, LearnerNote } from '@/lib/notes/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topic_slug = searchParams.get('topic_slug');
    const is_important = searchParams.get('is_important');
    const is_review = searchParams.get('is_review');
    const tag = searchParams.get('tag');
    const q = searchParams.get('q');
    const deleted = searchParams.get('deleted');

    let query = supabase
      .from('learner_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', deleted === 'true')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (topic_slug) query = query.eq('topic_slug', topic_slug);
    if (is_important === 'true') query = query.eq('is_important', true);
    if (is_review === 'true') query = query.eq('is_review', true);
    if (tag) query = query.contains('tags', [tag]);
    if (q) query = query.textSearch('title', q, { type: 'websearch' });

    const { data, error, count } = await query;

    if (error) {
      console.error('Notes fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notes: data ?? [], total: count ?? (data?.length ?? 0) });
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: NoteCreateInput = await request.json();

    const { data, error } = await (supabase
      .from('learner_notes') as any)
      .insert({
        user_id: user.id,
        title: body.title ?? null,
        topic_id: body.topic_id ?? null,
        topic_slug: body.topic_slug ?? null,
        topic_title: body.topic_title ?? null,
        lesson_id: body.lesson_id ?? null,
        section_id: body.section_id ?? null,
        step_index: body.step_index ?? null,
        blocks: (body.blocks ?? []) as any,
        tags: body.tags ?? [],
        is_important: body.is_important ?? false,
        is_review: body.is_review ?? false,
        source_excerpt: body.source_excerpt ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Note create error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: data as LearnerNote }, { status: 201 });
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
