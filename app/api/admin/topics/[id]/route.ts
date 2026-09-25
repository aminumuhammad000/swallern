import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch topic
    const { data: topic, error: topicErr } = await supabase
      .from('topics')
      .select('*, categories(id, name, slug)')
      .eq('id', id)
      .single();

    if (topicErr || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Fetch latest version
    const { data: versions } = await supabase
      .from('topic_versions')
      .select('*')
      .eq('topic_id', id)
      .order('version', { ascending: false });

    const latestVersion = versions && versions.length > 0 ? versions[0] : null;

    // Fetch sources linked
    const { data: topicSources } = await supabase
      .from('topic_sources')
      .select('source_id')
      .eq('topic_id', id);

    const sourceIds = (topicSources || []).map((ts) => ts.source_id);
    let sources: unknown[] = [];
    if (sourceIds.length > 0) {
      const { data: sourcesData } = await supabase
        .from('sources')
        .select('*')
        .in('id', sourceIds);
      sources = sourcesData || [];
    }

    // Fetch media
    const { data: media } = await supabase
      .from('media_items')
      .select('*')
      .eq('topic_id', id)
      .order('order_index', { ascending: true });

    // Fetch related topics
    const { data: rels } = await supabase
      .from('topic_relationships')
      .select('to_topic_id, relationship_type, weight')
      .eq('from_topic_id', id);

    const relTargetIds = (rels || []).map((r) => r.to_topic_id);
    let relatedTopics: unknown[] = [];
    if (relTargetIds.length > 0) {
      const { data: relTopicsData } = await supabase
        .from('topics')
        .select('id, title, slug, summary, status, categories(name)')
        .in('id', relTargetIds);
      relatedTopics = relTopicsData || [];
    }

    // Fetch lesson & sections
    const { data: lesson } = await supabase
      .from('lessons')
      .select('*')
      .eq('topic_id', id)
      .maybeSingle();

    let lessonSections: unknown[] = [];
    if (lesson) {
      const { data: sections } = await supabase
        .from('lesson_sections')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('order_index', { ascending: true });
      lessonSections = sections || [];
    }

    // Fetch quiz & questions & options
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('*')
      .eq('topic_id', id)
      .maybeSingle();

    let quizQuestions: unknown[] = [];
    if (quiz) {
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index', { ascending: true });

      if (questions) {
        for (const q of questions) {
          const { data: options } = await supabase
            .from('quiz_options')
            .select('*')
            .eq('question_id', q.id)
            .order('order_index', { ascending: true });

          quizQuestions.push({
            ...q,
            options: options || [],
          });
        }
      }
    }

    return NextResponse.json({
      topic,
      latestVersion,
      sources,
      media: media || [],
      relatedTopics,
      lesson: lesson ? { ...lesson, sections: lessonSections } : null,
      quiz: quiz ? { ...quiz, questions: quizQuestions } : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch topic details' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const {
      title,
      slug: rawSlug,
      summary,
      category_id,
      difficulty,
      status,
      quick_answer,
      explanation,
      key_concepts,
    } = body;

    const supabase = createAdminClient();

    // Verify topic exists
    const { data: existingTopic, error: findErr } = await supabase
      .from('topics')
      .select('id, slug, published_version')
      .eq('id', id)
      .single();

    if (findErr || !existingTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Slug check if changing
    let slug = existingTopic.slug;
    if (rawSlug && rawSlug !== existingTopic.slug) {
      slug = rawSlug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { data: slugCheck } = await supabase
        .from('topics')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .maybeSingle();

      if (slugCheck) {
        return NextResponse.json({ error: `Slug "${slug}" is already in use.` }, { status: 400 });
      }
    }

    // Update topic basic details
    const topicUpdates: Record<string, unknown> = {};
    if (title !== undefined) topicUpdates.title = title.trim();
    if (slug !== undefined) topicUpdates.slug = slug;
    if (summary !== undefined) topicUpdates.summary = summary?.trim() || null;
    if (category_id !== undefined) topicUpdates.category_id = category_id || null;
    if (difficulty !== undefined) topicUpdates.difficulty = difficulty;
    if (status !== undefined) {
      topicUpdates.status = status;
      if (['PUBLISHED', 'UPDATED'].includes(status) && !existingTopic.published_version) {
        topicUpdates.published_version = 1;
      }
    }

    const { data: updatedTopic, error: updateErr } = await supabase
      .from('topics')
      .update(topicUpdates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Update or Insert topic version content
    if (quick_answer !== undefined || explanation !== undefined || key_concepts !== undefined) {
      const { data: versions } = await supabase
        .from('topic_versions')
        .select('id, version')
        .eq('topic_id', id)
        .order('version', { ascending: false });

      if (versions && versions.length > 0) {
        const latestVerId = versions[0].id;
        await supabase
          .from('topic_versions')
          .update({
            quick_answer: quick_answer?.trim() || null,
            explanation: explanation?.trim() || null,
            key_concepts: Array.isArray(key_concepts) ? key_concepts : [],
          })
          .eq('id', latestVerId);
      } else {
        await supabase.from('topic_versions').insert({
          topic_id: id,
          version: 1,
          quick_answer: quick_answer?.trim() || null,
          explanation: explanation?.trim() || null,
          key_concepts: Array.isArray(key_concepts) ? key_concepts : [],
        });
      }
    }

    return NextResponse.json({ topic: updatedTopic });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update topic' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase.from('topics').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
