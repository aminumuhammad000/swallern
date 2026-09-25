import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAIServiceConfig, generateTopicDraftWithAI } from '@/lib/ai/provider';
import { AISourceInput } from '@/lib/ai/interface';
import { runAutomatedResearch } from '@/lib/research/engine';

interface SourceRow {
  id: string;
  url: string;
  title: string;
  publisher: string | null;
  source_type: string | null;
}

/**
 * GET /api/admin/topics/[id]/generate
 * Returns AI engine configuration status.
 */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  const config = getAIServiceConfig();
  return NextResponse.json({ config });
}

/**
 * POST /api/admin/topics/[id]/generate
 * Triggers AI-assisted content generation & research draft for the topic.
 */
export async function POST(
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

    // 1. Fetch topic basic info
    const { data: topic, error: topicErr } = await supabase
      .from('topics')
      .select('id, title, slug, summary, status, category_id, categories(name)')
      .eq('id', id)
      .single();

    if (topicErr || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // 2. Run real-world research discovery
    const researchResult = await runAutomatedResearch(id, topic.title, supabase);

    if (!researchResult.success || researchResult.brief.research_status === 'incomplete') {
      return NextResponse.json({
        success: false,
        configured: true,
        error: researchResult.brief.failure_reason || `Research failed for "${topic.title}". Unable to verify real-world entity.`,
        research_failed: true,
      }, { status: 400 });
    }

    // 3. Fetch attached research sources (including newly discovered sources)
    const { data: topicSources } = await supabase
      .from('topic_sources')
      .select('source_id')
      .eq('topic_id', id);

    const sourceIds = (topicSources || []).map((ts) => ts.source_id);
    let sourcesList: SourceRow[] = [];
    if (sourceIds.length > 0) {
      const { data: rawSources } = await supabase
        .from('sources')
        .select('id, url, title, publisher, source_type')
        .in('id', sourceIds);
      sourcesList = (rawSources as SourceRow[]) || [];
    }

    const aiSourceInputs: AISourceInput[] = sourcesList.map((s) => ({
      title: s.title,
      url: s.url,
      publisher: s.publisher,
      source_type: s.source_type,
    }));

    const categoryName = (topic.categories as unknown as { name: string })?.name || 'General';

    // 4. Call AI Service Provider with structured Research Brief
    const aiResponse = await generateTopicDraftWithAI(
      topic.title,
      categoryName,
      aiSourceInputs,
      topic.summary,
      researchResult.brief
    );

    if (!aiResponse.success || !aiResponse.data) {
      return NextResponse.json({
        success: false,
        configured: aiResponse.configured,
        error: aiResponse.error || 'AI content generation failed.',
      });
    }

    const draft = aiResponse.data;
    const warnings = aiResponse.warnings || [];

    // 4. Draft Storage: Save / Update topic_versions draft content
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
          quick_answer: draft.quick_answer?.trim() || null,
          explanation: draft.explanation?.trim() || null,
          key_concepts: Array.isArray(draft.key_concepts) ? draft.key_concepts : [],
        })
        .eq('id', latestVerId);
    } else {
      await supabase.from('topic_versions').insert({
        topic_id: id,
        version: 1,
        quick_answer: draft.quick_answer?.trim() || null,
        explanation: draft.explanation?.trim() || null,
        key_concepts: Array.isArray(draft.key_concepts) ? draft.key_concepts : [],
      });
    }

    // Update topic summary if empty
    if (draft.summary && (!topic.summary || topic.summary.trim() === '')) {
      await supabase.from('topics').update({ summary: draft.summary.trim() }).eq('id', id);
    }

    // If status is DISCOVERED, advance to DRAFT (never auto-publish!)
    if (topic.status === 'DISCOVERED') {
      await supabase.from('topics').update({ status: 'DRAFT' }).eq('id', id);
    }

    // 5. Claims Extraction & Citation Mapping
    let claimsInsertedCount = 0;
    let mappedSourcesCount = 0;

    if (Array.isArray(draft.claims) && draft.claims.length > 0) {
      for (const candidateClaim of draft.claims) {
        if (!candidateClaim.claim_text || candidateClaim.claim_text.trim() === '') continue;

        // Insert claim into DB with status = 'UNVERIFIED' (never auto-promote!)
        const { data: newClaim, error: claimErr } = await supabase
          .from('claims')
          .insert({
            topic_id: id,
            claim_text: candidateClaim.claim_text.trim(),
            status: 'UNVERIFIED',
            notes: 'Extracted by AI draft generation engine',
          })
          .select()
          .single();

        if (!claimErr && newClaim) {
          claimsInsertedCount++;

          // Citation Mapping: check if candidate matching URLs match attached topic sources
          if (
            Array.isArray(candidateClaim.supporting_source_urls) &&
            candidateClaim.supporting_source_urls.length > 0
          ) {
            for (const claimUrl of candidateClaim.supporting_source_urls) {
              const matchedSource = sourcesList.find(
                (s) =>
                  s.url === claimUrl ||
                  claimUrl.includes(s.url) ||
                  s.url.includes(claimUrl)
              );
              if (matchedSource) {
                await supabase
                  .from('claim_sources')
                  .upsert({ claim_id: newClaim.id, source_id: matchedSource.id });
                mappedSourcesCount++;
              }
            }
          }
        }
      }
    }

    // 6. Lesson Generation (Draft)
    let lessonCreated = false;
    if (draft.suggested_lesson && draft.suggested_lesson.title) {
      const { data: existingLesson } = await supabase
        .from('lessons')
        .select('id')
        .eq('topic_id', id)
        .maybeSingle();

      let lessonId: string;
      if (existingLesson) {
        lessonId = existingLesson.id;
        await supabase
          .from('lessons')
          .update({
            title: draft.suggested_lesson.title,
            summary: draft.suggested_lesson.summary || null,
            estimated_minutes: draft.suggested_lesson.estimated_minutes || 5,
          })
          .eq('id', lessonId);
      } else {
        const { data: newLesson } = await supabase
          .from('lessons')
          .insert({
            topic_id: id,
            title: draft.suggested_lesson.title,
            summary: draft.suggested_lesson.summary || null,
            estimated_minutes: draft.suggested_lesson.estimated_minutes || 5,
          })
          .select()
          .single();
        lessonId = newLesson?.id;
      }

      if (lessonId && Array.isArray(draft.suggested_lesson.sections)) {
        // Delete old sections and insert generated sections as draft
        await supabase.from('lesson_sections').delete().eq('lesson_id', lessonId);
        const sectionInserts = draft.suggested_lesson.sections.map((sec, idx) => ({
          lesson_id: lessonId,
          title: sec.title || `Section ${idx + 1}`,
          content: sec.content || '',
          key_takeaway: sec.key_takeaway || null,
          order_index: idx + 1,
        }));
        await supabase.from('lesson_sections').insert(sectionInserts);
        lessonCreated = true;
      }
    }

    // 7. Quiz Generation (Draft)
    let quizCreated = false;
    if (draft.suggested_quiz && Array.isArray(draft.suggested_quiz.questions)) {
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('topic_id', id)
        .maybeSingle();

      let quizId: string;
      if (existingQuiz) {
        quizId = existingQuiz.id;
        await supabase
          .from('quizzes')
          .update({
            title: draft.suggested_quiz.title || 'Knowledge Check Quiz',
            passing_score: draft.suggested_quiz.passing_score || 80,
          })
          .eq('id', quizId);
      } else {
        const { data: newQuiz } = await supabase
          .from('quizzes')
          .insert({
            topic_id: id,
            title: draft.suggested_quiz.title || 'Knowledge Check Quiz',
            passing_score: draft.suggested_quiz.passing_score || 80,
          })
          .select()
          .single();
        quizId = newQuiz?.id;
      }

      if (quizId) {
        // Delete existing questions and recreate from AI draft
        await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);

        for (let qIdx = 0; qIdx < draft.suggested_quiz.questions.length; qIdx++) {
          const qData = draft.suggested_quiz.questions[qIdx];
          const { data: newQ } = await supabase
            .from('quiz_questions')
            .insert({
              quiz_id: quizId,
              question: qData.question,
              explanation: qData.explanation || '',
              order_index: qIdx + 1,
            })
            .select()
            .single();

          if (newQ && Array.isArray(qData.options)) {
            const optInserts = qData.options.map((opt, oIdx) => ({
              question_id: newQ.id,
              option_text: opt.option_text,
              is_correct: !!opt.is_correct,
              order_index: oIdx + 1,
            }));
            await supabase.from('quiz_options').insert(optInserts);
          }
        }
        quizCreated = true;
      }
    }

    return NextResponse.json({
      success: true,
      configured: true,
      draft,
      warnings,
      claimsInsertedCount,
      mappedSourcesCount,
      lessonCreated,
      quizCreated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'AI generation route failed',
      },
      { status: 500 }
    );
  }
}
