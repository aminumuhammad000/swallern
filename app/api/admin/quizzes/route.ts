import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      action,
      topic_id,
      quiz_id,
      question_id,
      title,
      passing_score,
      question,
      explanation,
      options,
      questions,
    } = body;

    const supabase = createAdminClient();

    if (action === 'save_quiz') {
      if (!topic_id || !title) {
        return NextResponse.json({ error: 'topic_id and title are required for quiz' }, { status: 400 });
      }

      const quizPayload = {
        topic_id,
        title: title.trim(),
        passing_score: typeof passing_score === 'number' ? passing_score : 80,
      };

      let quizData;
      if (quiz_id) {
        const { data, error } = await supabase
          .from('quizzes')
          .update(quizPayload)
          .eq('id', quiz_id)
          .select()
          .single();
        if (error) throw error;
        quizData = data;
      } else {
        const { data, error } = await supabase
          .from('quizzes')
          .insert(quizPayload)
          .select()
          .single();
        if (error) throw error;
        quizData = data;
      }

      return NextResponse.json({ quiz: quizData });
    }

    if (action === 'save_question') {
      if (!quiz_id || !question || !Array.isArray(options)) {
        return NextResponse.json({ error: 'quiz_id, question, and options array are required' }, { status: 400 });
      }

      let qId = question_id;
      if (qId) {
        const { error: qErr } = await supabase
          .from('quiz_questions')
          .update({
            question: question.trim(),
            explanation: explanation?.trim() || '',
          })
          .eq('id', qId);
        if (qErr) throw qErr;

        // Replace options
        await supabase.from('quiz_options').delete().eq('question_id', qId);
      } else {
        const { data: newQ, error: qErr } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id,
            question: question.trim(),
            explanation: explanation?.trim() || '',
            order_index: typeof body.order_index === 'number' ? body.order_index : 0,
          })
          .select()
          .single();
        if (qErr || !newQ) throw qErr || new Error('Failed to create question');
        qId = newQ.id;
      }

      // Insert options
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        if (opt.option_text && opt.option_text.trim()) {
          await supabase.from('quiz_options').insert({
            question_id: qId,
            option_text: opt.option_text.trim(),
            is_correct: !!opt.is_correct,
            order_index: i,
          });
        }
      }

      return NextResponse.json({ success: true, question_id: qId });
    }

    if (action === 'reorder_questions') {
      if (!Array.isArray(questions)) {
        return NextResponse.json({ error: 'questions array is required' }, { status: 400 });
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (q.id) {
          await supabase
            .from('quiz_questions')
            .update({ order_index: i })
            .eq('id', q.id);
        }
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'delete_question') {
      if (!question_id) {
        return NextResponse.json({ error: 'question_id is required' }, { status: 400 });
      }

      const { error } = await supabase.from('quiz_questions').delete().eq('id', question_id);
      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    if (action === 'delete_quiz') {
      if (!quiz_id) {
        return NextResponse.json({ error: 'quiz_id is required' }, { status: 400 });
      }

      const { error } = await supabase.from('quizzes').delete().eq('id', quiz_id);
      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed quiz operation' },
      { status: 500 }
    );
  }
}
