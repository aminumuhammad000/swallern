import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateTopicJSON, ValidatedImportPayload } from '@/lib/admin/importValidator';

/**
 * POST /api/user/topics/import
 * Authenticated user JSON import workflow.
 * Validates Swallern Topic JSON 1.0 schema and creates topic in DRAFT status.
 * Strictly forces server-side ownership (user_id = auth.uid()) and draft status.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to import topics.' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const body = await req.json();
    const jsonText = typeof body.json === 'string' ? body.json : JSON.stringify(body.payload || body);

    // 1. Run canonical JSON Validation
    const valResult = await validateTopicJSON(jsonText, adminClient);
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

    const cleanSlug = courseSlug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Duplicate slug check
    const { data: existingTopic } = await adminClient
      .from('topics')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    const finalSlug = existingTopic ? `${cleanSlug}-${Date.now().toString(36)}` : cleanSlug;

    // Resolve category_id if name provided
    let categoryId: string | null = null;
    if (courseMeta.category) {
      const { data: catData } = await adminClient
        .from('categories')
        .select('id')
        .ilike('name', courseMeta.category)
        .maybeSingle();
      if (catData) categoryId = catData.id;
    }

    const createdIds: {
      topicId?: string;
      sourceIds: string[];
      claimIds: string[];
    } = { sourceIds: [], claimIds: [] };

    const shareToken = crypto.randomUUID();

    try {
      // Insert Topic (Server-enforced user ownership & draft status)
      const { data: newTopic, error: topicErr } = await adminClient
        .from('topics')
        .insert({
          title: courseTitle.trim(),
          slug: finalSlug,
          summary: courseMeta.summary?.trim() || null,
          category_id: categoryId,
          difficulty: courseMeta.difficulty || 'BEGINNER',
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
      createdIds.topicId = newTopic.id;

      // Insert Topic Version 1
      const keyConcepts = version?.key_concepts
        ? version.key_concepts.map((kc: any) => (typeof kc === 'string' ? { title: kc, description: '' } : kc))
        : [];

      await adminClient.from('topic_versions').insert({
        topic_id: newTopic.id,
        version: 1,
        quick_answer: version?.quick_answer?.trim() || null,
        explanation: version?.explanation?.trim() || null,
        key_concepts: keyConcepts,
      });

      // Insert Sources & Link Topic Sources
      const sourceIdMap = new Map<string, string>();
      if (sources && sources.length > 0) {
        for (const src of sources) {
          const { data: existingSrc } = await adminClient
            .from('sources')
            .select('id')
            .eq('url', src.url)
            .maybeSingle();

          let dbSourceId: string;
          if (existingSrc) {
            dbSourceId = existingSrc.id;
          } else {
            const { data: newSrc, error: srcErr } = await adminClient
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
          await adminClient.from('topic_sources').upsert({
            topic_id: newTopic.id,
            source_id: dbSourceId,
          });
        }
      }

      // Insert Research Claims
      if (research && (research.key_facts || research.current_information)) {
        const allFacts = [
          ...(research.key_facts || []),
          ...(research.current_information || []),
        ];

        for (const fact of allFacts) {
          const { data: newClaim } = await adminClient
            .from('claims')
            .insert({
              topic_id: newTopic.id,
              claim_text: fact.claim,
              status: 'SUPPORTED',
              notes: 'Imported via JSON Brief',
            })
            .select()
            .single();

          if (newClaim) {
            createdIds.claimIds.push(newClaim.id);
            if (fact.source_ids && fact.source_ids.length > 0) {
              for (const importSrcId of fact.source_ids) {
                const dbSrcId = sourceIdMap.get(importSrcId);
                if (dbSrcId) {
                  await adminClient.from('claim_sources').upsert({
                    claim_id: newClaim.id,
                    source_id: dbSrcId,
                  });
                }
              }
            }
          }
        }
      }

      // Insert Lesson & Lesson Sections
      if (lesson && lesson.sections && lesson.sections.length > 0) {
        const { data: newLesson } = await adminClient
          .from('lessons')
          .insert({
            topic_id: newTopic.id,
            title: lesson.title,
            summary: lesson.summary || null,
            estimated_minutes: lesson.estimated_minutes || 5,
          })
          .select()
          .single();

        if (newLesson) {
          const sectionInserts = lesson.sections.map((sec: any, idx: number) => ({
            lesson_id: newLesson.id,
            title: sec.title,
            content: sec.content,
            key_takeaway: sec.key_takeaway || null,
            order_index: idx + 1,
          }));
          await adminClient.from('lesson_sections').insert(sectionInserts);
        }
      }

      // Insert Quiz & Questions
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        const { data: newQuiz } = await adminClient
          .from('quizzes')
          .insert({
            topic_id: newTopic.id,
            title: quiz.title || `${newTopic.title} Quiz`,
            passing_score: quiz.passing_score || 80,
          })
          .select()
          .single();

        if (newQuiz) {
          for (let qIdx = 0; qIdx < quiz.questions.length; qIdx++) {
            const q = quiz.questions[qIdx];
            const { data: newQuestion } = await adminClient
              .from('quiz_questions')
              .insert({
                quiz_id: newQuiz.id,
                question: q.question,
                explanation: q.explanation || 'Review the lesson content for details.',
                order_index: qIdx + 1,
              })
              .select()
              .single();

            if (newQuestion) {
              const optionInserts = q.options.map((opt: any, oIdx: number) => ({
                question_id: newQuestion.id,
                option_text: opt.option_text || opt.text || '',
                is_correct: opt.is_correct || false,
                order_index: oIdx + 1,
              }));
              await adminClient.from('quiz_options').insert(optionInserts);
            }
          }
        }
      }

      // Insert Media Items
      if (media && media.length > 0) {
        const mediaInserts = media.map((m: any, mIdx: number) => ({
          topic_id: newTopic.id,
          media_type: (m.media_type || m.type as any) || 'ARTICLE',
          url: m.url,
          title: m.title || null,
          channel_or_creator: m.channel_or_creator || m.credit || null,
          order_index: mIdx + 1,
        }));
        await adminClient.from('media_items').insert(mediaInserts);
      }

      return NextResponse.json({
        success: true,
        message: `Topic "${newTopic.title}" imported successfully into your drafts.`,
        topic: newTopic,
      });
    } catch (dbErr) {
      if (createdIds.topicId) {
        await adminClient.from('topics').delete().eq('id', createdIds.topicId);
      }
      throw dbErr;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'User topic JSON import failed' },
      { status: 500 }
    );
  }
}
