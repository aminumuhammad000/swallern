import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/user/topics
 * Returns list of topics created by the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to view your topics.' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: topics, error: topicsErr } = await adminClient
      .from('topics')
      .select('*, categories(name, slug)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (topicsErr) {
      throw topicsErr;
    }

    return NextResponse.json({ topics: topics || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed fetching user topics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/topics
 * Creates a new user topic manually in DRAFT status owned by the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to create topics.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      summary,
      category,
      difficulty,
      explanation,
      quick_answer,
      key_concepts,
      lesson_title,
      lesson_sections,
      quiz_questions,
      sources,
      media,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Topic title is required.' }, { status: 400 });
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const adminClient = createAdminClient();

    // Ensure slug uniqueness
    const { data: existing } = await adminClient
      .from('topics')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    const finalSlug = existing ? `${cleanSlug}-${Date.now().toString(36)}` : cleanSlug;

    // Resolve category_id if provided
    let categoryId: string | null = null;
    if (category) {
      const { data: catData } = await adminClient
        .from('categories')
        .select('id')
        .ilike('name', category)
        .maybeSingle();
      if (catData) categoryId = catData.id;
    }

    const shareToken = crypto.randomUUID();

    // Insert topic with forced server-controlled ownership & status attributes
    const { data: newTopic, error: topicErr } = await adminClient
      .from('topics')
      .insert({
        title: title.trim(),
        slug: finalSlug,
        summary: summary?.trim() || null,
        category_id: categoryId,
        difficulty: difficulty || 'BEGINNER',
        status: 'DRAFT',
        user_id: user.id,
        approval_status: 'DRAFT',
        publication_status: 'UNPUBLISHED',
        visibility: 'PUBLIC',
        share_token: shareToken,
        admin_feedback: null,
        auto_approved: false,
      })
      .select()
      .single();

    if (topicErr || !newTopic) {
      throw new Error(topicErr?.message || 'Failed creating topic record');
    }

    // Insert Version 1
    const keyConceptsList = Array.isArray(key_concepts)
      ? key_concepts.map((kc: any) => (typeof kc === 'string' ? { title: kc, description: '' } : kc))
      : [];

    await adminClient.from('topic_versions').insert({
      topic_id: newTopic.id,
      version: 1,
      quick_answer: quick_answer?.trim() || summary?.trim() || null,
      explanation: explanation?.trim() || null,
      key_concepts: keyConceptsList,
    });

    // Insert Sources if provided
    if (Array.isArray(sources) && sources.length > 0) {
      for (const src of sources) {
        if (!src.url || !src.title) continue;
        const { data: newSrc } = await adminClient
          .from('sources')
          .insert({
            title: src.title.trim(),
            url: src.url.trim(),
            publisher: src.publisher || 'User Provided Source',
            accessed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (newSrc) {
          await adminClient.from('topic_sources').upsert({
            topic_id: newTopic.id,
            source_id: newSrc.id,
          });
        }
      }
    }

    // Insert Lesson & Lesson Sections if provided
    if (Array.isArray(lesson_sections) && lesson_sections.length > 0) {
      const { data: newLesson } = await adminClient
        .from('lessons')
        .insert({
          topic_id: newTopic.id,
          title: lesson_title?.trim() || `${newTopic.title} Lesson`,
          summary: summary?.trim() || null,
          estimated_minutes: 5,
        })
        .select()
        .single();

      if (newLesson) {
        const secInserts = lesson_sections.map((sec: any, idx: number) => ({
          lesson_id: newLesson.id,
          title: sec.title || `Section ${idx + 1}`,
          content: sec.content || '',
          key_takeaway: sec.key_takeaway || null,
          order_index: idx + 1,
        }));
        await adminClient.from('lesson_sections').insert(secInserts);
      }
    }

    // Insert Quiz & Questions if provided
    if (Array.isArray(quiz_questions) && quiz_questions.length > 0) {
      const { data: newQuiz } = await adminClient
        .from('quizzes')
        .insert({
          topic_id: newTopic.id,
          title: `${newTopic.title} Knowledge Quiz`,
          passing_score: 80,
        })
        .select()
        .single();

      if (newQuiz) {
        for (let qIdx = 0; qIdx < quiz_questions.length; qIdx++) {
          const q = quiz_questions[qIdx];
          const { data: newQ } = await adminClient
            .from('quiz_questions')
            .insert({
              quiz_id: newQuiz.id,
              question: q.question,
              explanation: q.explanation || 'Review the lesson content.',
              order_index: qIdx + 1,
            })
            .select()
            .single();

          if (newQ && Array.isArray(q.options)) {
            const optInserts = q.options.map((opt: any, oIdx: number) => ({
              question_id: newQ.id,
              option_text: typeof opt === 'string' ? opt : opt.option_text,
              is_correct: typeof opt === 'object' ? opt.is_correct || false : oIdx === 0,
              order_index: oIdx + 1,
            }));
            await adminClient.from('quiz_options').insert(optInserts);
          }
        }
      }
    }

    // Insert Media if provided
    if (Array.isArray(media) && media.length > 0) {
      const mediaInserts = media.map((m: any, mIdx: number) => ({
        topic_id: newTopic.id,
        media_type: m.media_type || 'ARTICLE',
        url: m.url,
        title: m.title || null,
        channel_or_creator: m.channel_or_creator || null,
        order_index: mIdx + 1,
      }));
      await adminClient.from('media_items').insert(mediaInserts);
    }

    return NextResponse.json({
      success: true,
      message: 'Topic created successfully in DRAFT status.',
      topic: newTopic,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user topic' },
      { status: 500 }
    );
  }
}
