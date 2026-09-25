import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateTopicJSON, ValidatedImportPayload } from '@/lib/admin/importValidator';

/**
 * POST /api/admin/topics/import
 * Admin endpoint: Validates and imports a complete Swallern topic JSON document.
 * Safely creates topic, version, sources, claims, lesson, quiz, and media in DRAFT status.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  const supabase = createAdminClient();

  try {
    const body = await req.json();
    const jsonText = typeof body.json === 'string' ? body.json : JSON.stringify(body.payload || body);

    // 1. Run Validation
    const valResult = await validateTopicJSON(jsonText, supabase);
    if (!valResult.valid || !valResult.payload) {
      return NextResponse.json(
        {
          error: 'JSON Validation Failed',
          errors: valResult.errors,
        },
        { status: 400 }
      );
    }

    const payload: ValidatedImportPayload = valResult.payload;
    const { topic, course, research, sources, version, lesson, quiz, media } = payload as any;

    const courseMeta = course || topic || payload;
    const courseTitle = courseMeta.title || 'Untitled Course';
    const courseSlug = courseMeta.slug || courseTitle;

    // Generate clean slug
    const cleanSlug = courseSlug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check duplicate slug again to prevent race condition
    const { data: existingTopic } = await supabase
      .from('topics')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existingTopic) {
      return NextResponse.json(
        {
          error: `A topic with slug "${cleanSlug}" already exists. Please choose a unique slug or title.`,
        },
        { status: 400 }
      );
    }

    // Resolve category_id if category name provided
    let categoryId: string | null = null;
    if (courseMeta.category) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', courseMeta.category)
        .maybeSingle();
      if (catData) categoryId = catData.id;
    }

    // 2. Perform Transactional DB Creation (tracked created IDs for rollback)
    const createdIds: {
      topicId?: string;
      sourceIds: string[];
      claimIds: string[];
      lessonId?: string;
      quizId?: string;
    } = { sourceIds: [], claimIds: [] };

    try {
      // 2a. Insert Topic (Status strictly DRAFT)
      const { data: newTopic, error: topicErr } = await supabase
        .from('topics')
        .insert({
          title: courseTitle.trim(),
          slug: cleanSlug,
          summary: courseMeta.summary?.trim() || null,
          category_id: categoryId,
          difficulty: courseMeta.difficulty || 'BEGINNER',
          status: 'DRAFT',
          featured: topic?.featured || false,
        })
        .select()
        .single();

      if (topicErr || !newTopic) {
        throw new Error(topicErr?.message || 'Failed to create topic record');
      }
      createdIds.topicId = newTopic.id;

      // 2b. Insert Topic Version 1
      const keyConcepts = version?.key_concepts
        ? version.key_concepts.map((kc: any) => (typeof kc === 'string' ? { title: kc, description: '' } : kc))
        : [];

      const { error: verErr } = await supabase.from('topic_versions').insert({
        topic_id: newTopic.id,
        version: 1,
        quick_answer: version?.quick_answer?.trim() || null,
        explanation: version?.explanation?.trim() || null,
        key_concepts: keyConcepts,
      });

      if (verErr) throw verErr;

      // 2c. Insert Sources & Link Topic Sources
      const sourceIdMap = new Map<string, string>(); // import JSON source id -> DB source id

      if (sources && sources.length > 0) {
        for (const src of sources) {
          const { data: existingSrc } = await supabase
            .from('sources')
            .select('id')
            .eq('url', src.url)
            .maybeSingle();

          let dbSourceId: string;
          if (existingSrc) {
            dbSourceId = existingSrc.id;
          } else {
            const { data: newSrc, error: srcErr } = await supabase
              .from('sources')
              .insert({
                title: src.title,
                url: src.url,
                publisher: src.publisher || 'Imported Source',
                published_at: src.published_at || null,
                accessed_at: src.accessed_at || new Date().toISOString(),
                reliability_score: 5,
              })
              .select()
              .single();

            if (srcErr || !newSrc) throw srcErr || new Error(`Failed inserting source ${src.url}`);
            dbSourceId = newSrc.id;
            createdIds.sourceIds.push(dbSourceId);
          }

          sourceIdMap.set(src.id, dbSourceId);

          // Link topic source
          await supabase.from('topic_sources').upsert({
            topic_id: newTopic.id,
            source_id: dbSourceId,
          });
        }
      }

      // 2d. Insert Research Claims
      if (research && (research.key_facts || research.current_information)) {
        const allFacts = [
          ...(research.key_facts || []),
          ...(research.current_information || []),
        ];

        for (const fact of allFacts) {
          const { data: newClaim, error: claimErr } = await supabase
            .from('claims')
            .insert({
              topic_id: newTopic.id,
              claim_text: fact.claim,
              status: 'SUPPORTED',
              notes: 'Imported via JSON Brief',
            })
            .select()
            .single();

          if (claimErr || !newClaim) throw claimErr || new Error('Failed inserting claim');
          createdIds.claimIds.push(newClaim.id);

          // Link claim sources if source_ids provided
          if (fact.source_ids && fact.source_ids.length > 0) {
            for (const importSrcId of fact.source_ids) {
              const dbSrcId = sourceIdMap.get(importSrcId);
              if (dbSrcId) {
                await supabase.from('claim_sources').upsert({
                  claim_id: newClaim.id,
                  source_id: dbSrcId,
                });
              }
            }
          }
        }
      }

      // 2e. Insert Lesson & Lesson Sections
      if (lesson && lesson.sections && lesson.sections.length > 0) {
        const { data: newLesson, error: lessonErr } = await supabase
          .from('lessons')
          .insert({
            topic_id: newTopic.id,
            title: lesson.title,
            summary: lesson.summary || null,
            estimated_minutes: lesson.estimated_minutes || 5,
          })
          .select()
          .single();

        if (lessonErr || !newLesson) throw lessonErr || new Error('Failed inserting lesson');
        createdIds.lessonId = newLesson.id;

        const sectionInserts = lesson.sections.map((sec: any, idx: number) => ({
          lesson_id: newLesson.id,
          title: sec.title,
          content: sec.content,
          key_takeaway: sec.key_takeaway || null,
          order_index: idx + 1,
        }));

        const { error: secErr } = await supabase.from('lesson_sections').insert(sectionInserts);
        if (secErr) throw secErr;
      }

      // 2f. Insert Quiz, Questions & Options
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        const { data: newQuiz, error: quizErr } = await supabase
          .from('quizzes')
          .insert({
            topic_id: newTopic.id,
            title: quiz.title || `${newTopic.title} Quiz`,
            passing_score: quiz.passing_score || 80,
          })
          .select()
          .single();

        if (quizErr || !newQuiz) throw quizErr || new Error('Failed inserting quiz');
        createdIds.quizId = newQuiz.id;

        for (let qIdx = 0; qIdx < quiz.questions.length; qIdx++) {
          const q = quiz.questions[qIdx];
          const { data: newQuestion, error: qErr } = await supabase
            .from('quiz_questions')
            .insert({
              quiz_id: newQuiz.id,
              question: q.question,
              explanation: q.explanation || 'Review the lesson content for details.',
              order_index: qIdx + 1,
            })
            .select()
            .single();

          if (qErr || !newQuestion) throw qErr || new Error(`Failed inserting question ${qIdx + 1}`);

          const optionInserts = q.options.map((opt: any, oIdx: number) => ({
            question_id: newQuestion.id,
            option_text: opt.option_text || opt.text || '',
            is_correct: opt.is_correct || false,
            order_index: oIdx + 1,
          }));

          const { error: optErr } = await supabase.from('quiz_options').insert(optionInserts);
          if (optErr) throw optErr;
        }
      }

      // 2g. Insert Media Items
      if (media && media.length > 0) {
        const mediaInserts = media.map((m: any, mIdx: number) => ({
          topic_id: newTopic.id,
          media_type: (m.media_type || m.type as any) || 'ARTICLE',
          url: m.url,
          title: m.title || null,
          channel_or_creator: m.channel_or_creator || m.credit || null,
          order_index: mIdx + 1,
        }));

        await supabase.from('media_items').insert(mediaInserts);
      }

      return NextResponse.json({
        success: true,
        message: `Topic "${newTopic.title}" imported successfully in DRAFT status.`,
        topic_id: newTopic.id,
        slug: newTopic.slug,
        stats: {
          sources_created: sourceIdMap.size,
          claims_created: createdIds.claimIds.length,
          lesson_sections_created: lesson?.sections?.length || 0,
          quiz_questions_created: quiz?.questions?.length || 0,
          media_created: media?.length || 0,
        },
      });
    } catch (dbErr) {
      // Rollback created topic record on failure
      if (createdIds.topicId) {
        await supabase.from('topics').delete().eq('id', createdIds.topicId);
      }
      throw dbErr;
    }
  } catch (error) {
    console.error('[JSON Import API Error]:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'JSON import operation failed',
      },
      { status: 500 }
    );
  }
}
