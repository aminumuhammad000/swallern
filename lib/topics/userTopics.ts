import { createAdminClient } from '@/lib/supabase/admin';
import { ValidatedImportPayload } from '@/lib/admin/importValidator';

export interface QualityEvaluationResult {
  pass: boolean;
  reasons: string[];
}

/**
 * Evaluates a user topic for auto-approval.
 * Verifies that the topic contains real structured lesson content, valid quiz questions,
 * sources, and no low-quality filler phrases.
 */
export async function evaluateTopicAutoApproval(topicId: string): Promise<QualityEvaluationResult> {
  const supabase = createAdminClient();
  const reasons: string[] = [];

  try {
    // 1. Fetch topic record
    const { data: topic } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (!topic) {
      return { pass: false, reasons: ['Topic not found.'] };
    }

    if (!topic.title || topic.title.trim().length < 3) {
      reasons.push('Title must be at least 3 characters long.');
    }
    if (!topic.summary || topic.summary.trim().length < 10) {
      reasons.push('Summary must be at least 10 characters long.');
    }

    // Check prohibited generic filler phrases
    const fillerPatterns = [
      /refers to an established educational concept/i,
      /studied within Educational Curiosity/i,
      /analyzed by researchers and educators/i,
      /lorem ipsum/i,
    ];

    const fullTextToCheck = `${topic.title} ${topic.summary || ''}`;
    for (const pattern of fillerPatterns) {
      if (pattern.test(fullTextToCheck)) {
        reasons.push('Topic contains generic filler text instead of concrete educational material.');
        break;
      }
    }

    // 2. Fetch Version (Explanation & Key Concepts)
    const { data: version } = await supabase
      .from('topic_versions')
      .select('*')
      .eq('topic_id', topicId)
      .order('version', { ascending: false })
      .maybeSingle();

    if (!version || !version.explanation || version.explanation.trim().length < 20) {
      reasons.push('Topic explanation must contain substantive educational detail.');
    }

    // 3. Fetch Lesson & Sections
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('topic_id', topicId)
      .maybeSingle();

    if (!lesson) {
      reasons.push('Topic must include a lesson module.');
    } else {
      const { data: sections } = await supabase
        .from('lesson_sections')
        .select('id, content')
        .eq('lesson_id', lesson.id);

      if (!sections || sections.length === 0) {
        reasons.push('Lesson must contain at least one section.');
      } else {
        const totalContentLength = sections.reduce((acc, sec) => acc + (sec.content?.length || 0), 0);
        if (totalContentLength < 50) {
          reasons.push('Lesson content is too brief to meet quality standards.');
        }
      }
    }

    // 4. Fetch Quiz & Questions
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('topic_id', topicId)
      .maybeSingle();

    if (!quiz) {
      reasons.push('Topic must include a quiz module.');
    } else {
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quiz.id);

      if (!questions || questions.length === 0) {
        reasons.push('Quiz must contain at least one question.');
      }
    }

    // 5. Fetch Linked Sources
    const { data: topicSources } = await supabase
      .from('topic_sources')
      .select('source_id')
      .eq('topic_id', topicId);

    if (!topicSources || topicSources.length === 0) {
      reasons.push('Topic must include at least one verified source URL.');
    }

    return {
      pass: reasons.length === 0,
      reasons,
    };
  } catch (err) {
    return {
      pass: false,
      reasons: [`Quality evaluation failed: ${err instanceof Error ? err.message : 'Unknown error'}`],
    };
  }
}

/**
 * Fetches a shared topic by private share token.
 * Only returns topic if approval_status = 'APPROVED', publication_status = 'PUBLISHED', visibility = 'LINK_ONLY',
 * and share_token matches.
 */
export async function getSharedTopicByToken(token: string) {
  if (!token || typeof token !== 'string') return null;

  try {
    const supabase = createAdminClient();

    const { data: topic } = await supabase
      .from('topics')
      .select('*')
      .eq('share_token', token.trim())
      .eq('approval_status', 'APPROVED')
      .eq('publication_status', 'PUBLISHED')
      .eq('visibility', 'LINK_ONLY')
      .maybeSingle();

    if (!topic) return null;

    // Load full topic content
    const topicId = topic.id;

    // Fetch Version
    const { data: version } = await supabase
      .from('topic_versions')
      .select('*')
      .eq('topic_id', topicId)
      .order('version', { ascending: false })
      .maybeSingle();

    // Fetch Category
    let categoryObj = { name: 'General', slug: 'general' };
    if (topic.category_id) {
      const { data: cat } = await supabase
        .from('categories')
        .select('name, slug')
        .eq('id', topic.category_id)
        .maybeSingle();
      if (cat) categoryObj = cat;
    }

    // Fetch Sources
    const { data: topicSources } = await supabase
      .from('topic_sources')
      .select('source_id')
      .eq('topic_id', topicId);

    let sourcesList: any[] = [];
    if (topicSources && topicSources.length > 0) {
      const sourceIds = topicSources.map((ts) => ts.source_id);
      const { data: srcs } = await supabase.from('sources').select('*').in('id', sourceIds);
      sourcesList = (srcs || []).map((s) => ({
        id: s.id,
        title: s.title,
        publisher: s.publisher || undefined,
        url: s.url,
        published_at: s.published_at || undefined,
        reliability_score: s.reliability_score || undefined,
      }));
    }

    // Fetch Media
    const { data: rawMedia } = await supabase
      .from('media_items')
      .select('*')
      .eq('topic_id', topicId)
      .order('order_index', { ascending: true });

    const mediaList = (rawMedia || []).map((m) => ({
      id: m.id,
      type: m.media_type,
      url: m.url,
      title: m.title || undefined,
      channel_or_creator: m.channel_or_creator || undefined,
    }));

    // Fetch Lesson
    let lessonData: any = undefined;
    const { data: rawLesson } = await supabase
      .from('lessons')
      .select('*')
      .eq('topic_id', topicId)
      .maybeSingle();

    if (rawLesson) {
      const { data: rawSections } = await supabase
        .from('lesson_sections')
        .select('*')
        .eq('lesson_id', rawLesson.id)
        .order('order_index', { ascending: true });

      lessonData = {
        id: rawLesson.id,
        topic_id: topicId,
        title: rawLesson.title,
        summary: rawLesson.summary || undefined,
        estimated_minutes: rawLesson.estimated_minutes || 3,
        sections: rawSections || [],
      };
    }

    // Fetch Quiz
    let quizData: any = undefined;
    const { data: rawQuiz } = await supabase
      .from('quizzes')
      .select('*')
      .eq('topic_id', topicId)
      .maybeSingle();

    if (rawQuiz) {
      const { data: rawQuestions } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', rawQuiz.id)
        .order('order_index', { ascending: true });

      const questions: any[] = [];
      if (rawQuestions) {
        for (const q of rawQuestions) {
          const { data: rawOpts } = await supabase
            .from('quiz_options')
            .select('*')
            .eq('question_id', q.id)
            .order('order_index', { ascending: true });

          questions.push({
            id: q.id,
            question: q.question,
            explanation: q.explanation,
            order_index: q.order_index,
            options: rawOpts || [],
          });
        }
      }

      quizData = {
        id: rawQuiz.id,
        topic_id: topicId,
        title: rawQuiz.title,
        passing_score: rawQuiz.passing_score || 80,
        questions,
      };
    }

    return {
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      summary: topic.summary || '',
      category: categoryObj,
      difficulty: topic.difficulty || 'BEGINNER',
      quick_answer: version?.quick_answer || topic.summary || '',
      key_concepts: version?.key_concepts || [],
      explanation: version?.explanation || '',
      sources: sourcesList,
      media: mediaList,
      related_topics: [],
      has_lesson: !!lessonData && lessonData.sections.length > 0,
      has_quiz: !!quizData && quizData.questions.length > 0,
      lesson: lessonData,
      quiz: quizData,
      visibility: 'LINK_ONLY',
      approval_status: topic.approval_status,
      publication_status: topic.publication_status,
    };
  } catch (err) {
    return null;
  }
}
