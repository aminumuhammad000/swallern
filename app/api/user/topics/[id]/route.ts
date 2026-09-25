import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/user/topics/[id]
 * Fetch user's own topic by ID.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: topic, error: topicErr } = await adminClient
      .from('topics')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (topicErr || !topic) {
      return NextResponse.json({ error: 'Topic not found or access denied.' }, { status: 404 });
    }

    // Fetch Version, Lesson, Quiz, Sources, Media
    const { data: version } = await adminClient
      .from('topic_versions')
      .select('*')
      .eq('topic_id', id)
      .order('version', { ascending: false })
      .maybeSingle();

    const { data: lesson } = await adminClient
      .from('lessons')
      .select('*')
      .eq('topic_id', id)
      .maybeSingle();

    let sections: any[] = [];
    if (lesson) {
      const { data: secs } = await adminClient
        .from('lesson_sections')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('order_index', { ascending: true });
      sections = secs || [];
    }

    const { data: quiz } = await adminClient
      .from('quizzes')
      .select('*')
      .eq('topic_id', id)
      .maybeSingle();

    let questions: any[] = [];
    if (quiz) {
      const { data: qs } = await adminClient
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index', { ascending: true });

      if (qs) {
        for (const q of qs) {
          const { data: opts } = await adminClient
            .from('quiz_options')
            .select('*')
            .eq('question_id', q.id)
            .order('order_index', { ascending: true });
          questions.push({ ...q, options: opts || [] });
        }
      }
    }

    const { data: topicSources } = await adminClient
      .from('topic_sources')
      .select('source_id')
      .eq('topic_id', id);

    let sources: any[] = [];
    if (topicSources && topicSources.length > 0) {
      const { data: srcs } = await adminClient
        .from('sources')
        .select('*')
        .in('id', topicSources.map((ts) => ts.source_id));
      sources = srcs || [];
    }

    const { data: media } = await adminClient
      .from('media_items')
      .select('*')
      .eq('topic_id', id)
      .order('order_index', { ascending: true });

    return NextResponse.json({
      topic,
      version: version || null,
      lesson: lesson ? { ...lesson, sections } : null,
      quiz: quiz ? { ...quiz, questions } : null,
      sources,
      media: media || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed fetching topic' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/topics/[id]
 * Updates user topic content (allowed when in DRAFT or CHANGES_REQUESTED status).
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
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

    // Only allow editing if DRAFT or CHANGES_REQUESTED
    if (topic.approval_status !== 'DRAFT' && topic.approval_status !== 'CHANGES_REQUESTED') {
      return NextResponse.json(
        { error: `Cannot edit topic while in "${topic.approval_status}" status. Withdraw or request admin review first.` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      summary,
      category,
      difficulty,
      explanation,
      quick_answer,
      key_concepts,
      lesson_sections,
      quiz_questions,
      sources,
    } = body;

    // Resolve category_id
    let categoryId: string | null = topic.category_id;
    if (category) {
      const { data: catData } = await adminClient
        .from('categories')
        .select('id')
        .ilike('name', category)
        .maybeSingle();
      if (catData) categoryId = catData.id;
    }

    // Update topic core record
    const { data: updatedTopic, error: updateErr } = await adminClient
      .from('topics')
      .update({
        title: title ? title.trim() : topic.title,
        summary: summary !== undefined ? summary.trim() : topic.summary,
        category_id: categoryId,
        difficulty: difficulty || topic.difficulty,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Update version 1
    if (explanation !== undefined || quick_answer !== undefined || key_concepts !== undefined) {
      const keyConceptsList = Array.isArray(key_concepts)
        ? key_concepts.map((kc: any) => (typeof kc === 'string' ? { title: kc, description: '' } : kc))
        : undefined;

      await adminClient
        .from('topic_versions')
        .upsert({
          topic_id: id,
          version: 1,
          quick_answer: quick_answer?.trim() || topic.summary || null,
          explanation: explanation?.trim() || null,
          key_concepts: keyConceptsList as any,
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Topic updated successfully.',
      topic: updatedTopic,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed updating topic' },
      { status: 500 }
    );
  }
}
