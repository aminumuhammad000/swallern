import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/topics/[id]/export
 * Admin endpoint: Exports a full topic graph into a 1.0 Swallern JSON Document.
 */
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

    // 1. Fetch Topic
    const { data: topic, error: topicErr } = await supabase
      .from('topics')
      .select('id, title, slug, summary, difficulty, status, featured, category_id, categories(name)')
      .eq('id', id)
      .single();

    if (topicErr || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const categoryName = (topic.categories as unknown as { name: string })?.name || 'General';

    // 2. Fetch Latest Version
    const { data: versions } = await supabase
      .from('topic_versions')
      .select('quick_answer, explanation, key_concepts')
      .eq('topic_id', id)
      .order('version', { ascending: false })
      .limit(1);

    const latestVer = versions?.[0];

    // 3. Fetch Sources
    const { data: topicSources } = await supabase
      .from('topic_sources')
      .select('source_id')
      .eq('topic_id', id);

    const sourceIds = (topicSources || []).map((ts) => ts.source_id);
    let sourcesList: any[] = [];
    if (sourceIds.length > 0) {
      const { data: rawSources } = await supabase
        .from('sources')
        .select('id, title, url, publisher, published_at, accessed_at, reliability_score')
        .in('id', sourceIds);
      sourcesList = rawSources || [];
    }

    // Map DB sources to import schema
    const formattedSources = sourcesList.map((s, idx) => ({
      id: `source-${idx + 1}`,
      db_id: s.id,
      title: s.title,
      url: s.url,
      publisher: s.publisher || 'Reference Source',
      published_at: s.published_at,
      accessed_at: s.accessed_at,
    }));

    const dbSourceIdToImportId = new Map<string, string>();
    formattedSources.forEach((s) => dbSourceIdToImportId.set(s.db_id, s.id));

    // 4. Fetch Claims
    const { data: claimsList } = await supabase
      .from('claims')
      .select('id, claim_text, status, notes')
      .eq('topic_id', id);

    const keyFacts: any[] = [];
    if (claimsList && claimsList.length > 0) {
      for (const claim of claimsList) {
        const { data: claimSources } = await supabase
          .from('claim_sources')
          .select('source_id')
          .eq('claim_id', claim.id);

        const linkedImportIds = (claimSources || [])
          .map((cs) => dbSourceIdToImportId.get(cs.source_id))
          .filter(Boolean);

        keyFacts.push({
          claim: claim.claim_text,
          source_ids: linkedImportIds,
        });
      }
    }

    // 5. Fetch Lesson & Sections
    const { data: lessonsList } = await supabase
      .from('lessons')
      .select('id, title, summary, estimated_minutes')
      .eq('topic_id', id)
      .limit(1);

    const lessonObj = lessonsList?.[0];
    let formattedLesson: any = null;

    if (lessonObj) {
      const { data: sections } = await supabase
        .from('lesson_sections')
        .select('title, content, key_takeaway')
        .eq('lesson_id', lessonObj.id)
        .order('order_index', { ascending: true });

      formattedLesson = {
        title: lessonObj.title,
        summary: lessonObj.summary || '',
        estimated_minutes: lessonObj.estimated_minutes || 5,
        sections: (sections || []).map((sec) => ({
          title: sec.title,
          content: sec.content,
          key_takeaway: sec.key_takeaway || '',
        })),
      };
    }

    // 6. Fetch Quiz, Questions & Options
    const { data: quizzesList } = await supabase
      .from('quizzes')
      .select('id, title, passing_score')
      .eq('topic_id', id)
      .limit(1);

    const quizObj = quizzesList?.[0];
    let formattedQuiz: any = null;

    if (quizObj) {
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id, question, explanation')
        .eq('quiz_id', quizObj.id)
        .order('order_index', { ascending: true });

      const formattedQuestions: any[] = [];
      if (questions) {
        for (const q of questions) {
          const { data: options } = await supabase
            .from('quiz_options')
            .select('option_text, is_correct')
            .eq('question_id', q.id)
            .order('order_index', { ascending: true });

          formattedQuestions.push({
            question: q.question,
            explanation: q.explanation,
            options: (options || []).map((opt) => ({
              option_text: opt.option_text,
              is_correct: opt.is_correct,
            })),
          });
        }
      }

      formattedQuiz = {
        title: quizObj.title,
        passing_score: quizObj.passing_score,
        questions: formattedQuestions,
      };
    }

    // 7. Fetch Media
    const { data: mediaItems } = await supabase
      .from('media_items')
      .select('media_type, url, title, channel_or_creator')
      .eq('topic_id', id);

    const formattedMedia = (mediaItems || []).map((m) => ({
      media_type: m.media_type,
      url: m.url,
      title: m.title || '',
      channel_or_creator: m.channel_or_creator || '',
    }));

    // Clean sources array (remove internal db_id)
    const cleanSources = formattedSources.map(({ db_id, ...rest }) => rest);

    // Assemble final export JSON payload
    const exportDocument = {
      schema_version: '1.0',
      topic: {
        title: topic.title,
        slug: topic.slug,
        summary: topic.summary || '',
        category: categoryName,
        difficulty: topic.difficulty || 'BEGINNER',
        status: topic.status,
        featured: topic.featured || false,
      },
      research: {
        status: 'verified',
        researched_at: new Date().toISOString(),
        entity: {
          name: topic.title,
          type: 'topic',
          description: topic.summary || '',
        },
        key_facts: keyFacts,
      },
      sources: cleanSources,
      version: {
        quick_answer: latestVer?.quick_answer || '',
        explanation: latestVer?.explanation || '',
        key_concepts: Array.isArray(latestVer?.key_concepts)
          ? latestVer.key_concepts.map((kc: any) => (typeof kc === 'string' ? kc : kc.title))
          : [],
      },
      lesson: formattedLesson,
      quiz: formattedQuiz,
      media: formattedMedia,
    };

    return NextResponse.json(exportDocument);
  } catch (error) {
    console.error('[Export API Error]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}
