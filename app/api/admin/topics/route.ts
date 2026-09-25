import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();
    const categoryId = searchParams.get('category_id')?.trim();

    const supabase = createAdminClient();
    let query = supabase
      .from('topics')
      .select('*, categories(id, name, slug)')
      .order('updated_at', { ascending: false });

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    if (categoryId && categoryId !== 'ALL') {
      query = query.eq('category_id', categoryId);
    }

    if (search) {
      const pattern = `%${search}%`;
      query = query.or(`title.ilike.${pattern},slug.ilike.${pattern},summary.ilike.${pattern}`);
    }

    const { data: topics, error } = await query;
    if (error) throw error;

    return NextResponse.json({ topics: topics || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      slug: rawSlug,
      summary,
      category_id,
      difficulty = 'BEGINNER',
      status = 'DRAFT',
      quick_answer = '',
      explanation = '',
      key_concepts = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const slug = (rawSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const supabase = createAdminClient();

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('topics')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: `Topic slug "${slug}" already exists.` }, { status: 400 });
    }

    // Insert Topic
    const { data: newTopic, error: topicErr } = await supabase
      .from('topics')
      .insert({
        title: title.trim(),
        slug,
        summary: summary?.trim() || null,
        category_id: category_id || null,
        difficulty,
        status,
        published_version: ['PUBLISHED', 'UPDATED'].includes(status) ? 1 : null,
      })
      .select()
      .single();

    if (topicErr || !newTopic) {
      throw topicErr || new Error('Failed to create topic');
    }

    // Insert Version 1
    const { error: verErr } = await supabase.from('topic_versions').insert({
      topic_id: newTopic.id,
      version: 1,
      quick_answer: quick_answer?.trim() || null,
      explanation: explanation?.trim() || null,
      key_concepts: Array.isArray(key_concepts) ? key_concepts : [],
    });

    if (verErr) {
      console.error('Failed to create initial version:', verErr.message);
    }

    return NextResponse.json({ topic: newTopic }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create topic' },
      { status: 500 }
    );
  }
}
