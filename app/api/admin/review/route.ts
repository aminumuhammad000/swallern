import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/review?topic_id=xxx
 * Returns full consolidated review payload for a single topic.
 * If topic_id is omitted, returns list of topics available for review.
 */
export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topic_id');
    const supabase = createAdminClient();

    // If no topicId provided, return topics pending review
    if (!topicId) {
      const { data: topics, error: topicsErr } = await supabase
        .from('topics')
        .select('id, title, slug, status, summary, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (topicsErr) throw topicsErr;

      return NextResponse.json({ topics: topics || [] });
    }

    // 1. Fetch Topic Core Details
    const { data: topic, error: topicErr } = await supabase
      .from('topics')
      .select('id, title, slug, status, summary, category_id, created_at, updated_at')
      .eq('id', topicId)
      .single();

    if (topicErr || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // 2. Fetch Entity Resolution Data from Matched Trend Candidate
    const { data: candidate } = await supabase
      .from('trend_candidates')
      .select('*')
      .eq('matched_topic_id', topic.id)
      .maybeSingle();

    const breakdown = candidate?.score_breakdown || {};
    const entityResolution = {
      query: candidate?.query || topic.title,
      detected_entity: candidate?.detected_entity || breakdown.detected_entity || topic.title,
      confidence_score: candidate?.confidence_score ?? breakdown.confidence_score ?? 1.0,
      alternative_meanings: candidate?.alternative_meanings || breakdown.alternative_meanings || [],
      duplicate_status: candidate?.duplicate_status || 'UNIQUE',
      is_ambiguous: breakdown.is_ambiguous || candidate?.duplicate_status === 'AMBIGUOUS' || (candidate?.confidence_score && candidate.confidence_score < 0.70),
    };

    // 3. Fetch Topic Version (Explanation, Quick Answer, Key Concepts)
    const { data: version } = await supabase
      .from('topic_versions')
      .select('*')
      .eq('topic_id', topic.id)
      .order('version', { ascending: false })
      .maybeSingle();

    // 4. Fetch Claims & Citation Coverage
    const { data: claimsData } = await supabase
      .from('claims')
      .select('*')
      .eq('topic_id', topic.id)
      .order('created_at', { ascending: true });

    const claimsList = claimsData || [];
    const claimIds = claimsList.map((c) => c.id);

    let claimSourceMap: Record<string, unknown[]> = {};
    if (claimIds.length > 0) {
      const { data: csRows } = await supabase
        .from('claim_sources')
        .select('claim_id, source_id')
        .in('claim_id', claimIds);

      const srcIds = [...new Set((csRows || []).map((r) => r.source_id))];
      let sourceDetails: Record<string, unknown> = {};
      if (srcIds.length > 0) {
        const { data: srcs } = await supabase.from('sources').select('*').in('id', srcIds);
        (srcs || []).forEach((s) => { sourceDetails[s.id] = s; });
      }
      (csRows || []).forEach((r) => {
        if (!claimSourceMap[r.claim_id]) claimSourceMap[r.claim_id] = [];
        if (sourceDetails[r.source_id]) claimSourceMap[r.claim_id].push(sourceDetails[r.source_id]);
      });
    }

    const claimsWithSources = claimsList.map((c) => ({
      ...c,
      sources: claimSourceMap[c.id] || [],
    }));

    // Fetch linked sources for topic
    const { data: topicSources } = await supabase
      .from('topic_sources')
      .select('source_id')
      .eq('topic_id', topic.id);

    let sourcesList: unknown[] = [];
    const topicSourceIds = (topicSources || []).map((ts) => ts.source_id);
    if (topicSourceIds.length > 0) {
      const { data: rawSources } = await supabase.from('sources').select('*').in('id', topicSourceIds);
      sourcesList = rawSources || [];
    }

    // 5. Fetch Lessons & Lesson Sections
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, summary, estimated_minutes, sort_order')
      .eq('topic_id', topic.id)
      .order('sort_order', { ascending: true });

    let lessonsWithSections: unknown[] = [];
    if (lessons && lessons.length > 0) {
      const lessonIds = lessons.map((l) => l.id);
      const { data: sections } = await supabase
        .from('lesson_sections')
        .select('*')
        .in('lesson_id', lessonIds)
        .order('sort_order', { ascending: true });

      const sectionMap: Record<string, unknown[]> = {};
      (sections || []).forEach((sec) => {
        if (!sectionMap[sec.lesson_id]) sectionMap[sec.lesson_id] = [];
        sectionMap[sec.lesson_id].push(sec);
      });

      lessonsWithSections = lessons.map((l) => ({
        ...l,
        sections: sectionMap[l.id] || [],
      }));
    }

    // 6. Fetch Quizzes & Questions
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id, title, passing_score')
      .eq('topic_id', topic.id);

    let quizzesWithQuestions: unknown[] = [];
    if (quizzes && quizzes.length > 0) {
      const quizIds = quizzes.map((q) => q.id);
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('*')
        .in('quiz_id', quizIds)
        .order('sort_order', { ascending: true });

      const questionIds = (questions || []).map((q) => q.id);
      let optionMap: Record<string, unknown[]> = {};
      if (questionIds.length > 0) {
        const { data: options } = await supabase
          .from('quiz_options')
          .select('*')
          .in('question_id', questionIds)
          .order('sort_order', { ascending: true });

        (options || []).forEach((opt) => {
          if (!optionMap[opt.question_id]) optionMap[opt.question_id] = [];
          optionMap[opt.question_id].push(opt);
        });
      }

      const questionMap: Record<string, unknown[]> = {};
      (questions || []).forEach((q) => {
        if (!questionMap[q.quiz_id]) questionMap[q.quiz_id] = [];
        questionMap[q.quiz_id].push({
          ...q,
          options: optionMap[q.id] || [],
        });
      });

      quizzesWithQuestions = quizzes.map((q) => ({
        ...q,
        questions: questionMap[q.id] || [],
      }));
    }

    // 7. Fetch Related Topics
    const { data: related } = await (supabase.from('related_topics') as any)
      .select('related_topic_id, topics!related_topics_related_topic_id_fkey(id, title, slug)')
      .eq('topic_id', topic.id);

    // 8. Fetch Generated Assets & Visual Briefs
    const { data: assets } = await (supabase.from('topic_assets') as any)
      .select('*')
      .eq('topic_id', topic.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      topic,
      entityResolution,
      version: version || null,
      claims: claimsWithSources,
      sources: sourcesList,
      lessons: lessonsWithSections,
      quizzes: quizzesWithQuestions,
      related: related || [],
      assets: assets || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch topic review data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/review
 * Actions: approve_topic, reject_topic, request_revision, update_claim_status, update_asset_approval
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, topic_id, claim_id, claim_status, asset_id, asset_approval } = body;
    const supabase = createAdminClient();

    // 1. Approve Topic & Publish Live
    if (action === 'approve_topic') {
      if (!topic_id) return NextResponse.json({ error: 'topic_id required' }, { status: 400 });

      const { data: updated, error } = await supabase
        .from('topics')
        .update({ status: 'PUBLISHED', updated_at: new Date().toISOString() })
        .eq('id', topic_id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, topic: updated });
    }

    // 2. Reject Topic
    if (action === 'reject_topic') {
      if (!topic_id) return NextResponse.json({ error: 'topic_id required' }, { status: 400 });

      const { data: updated, error } = await supabase
        .from('topics')
        .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
        .eq('id', topic_id)
        .select()
        .single();

      if (error) throw error;

      // Update candidate status to REJECTED
      await supabase.from('trend_candidates').update({ status: 'REJECTED' }).eq('matched_topic_id', topic_id);

      return NextResponse.json({ success: true, topic: updated });
    }

    // 3. Request Revision
    if (action === 'request_revision') {
      if (!topic_id) return NextResponse.json({ error: 'topic_id required' }, { status: 400 });

      const { data: updated, error } = await supabase
        .from('topics')
        .update({ status: 'DRAFT', updated_at: new Date().toISOString() })
        .eq('id', topic_id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, topic: updated });
    }

    // 4. Update Claim Verification Status
    if (action === 'update_claim_status') {
      if (!claim_id || !claim_status) {
        return NextResponse.json({ error: 'claim_id and claim_status are required' }, { status: 400 });
      }

      const { data: updated, error } = await supabase
        .from('claims')
        .update({ status: claim_status })
        .eq('id', claim_id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, claim: updated });
    }

    // 5. Update Asset Approval State
    if (action === 'update_asset_approval') {
      if (!asset_id || !asset_approval) {
        return NextResponse.json({ error: 'asset_id and asset_approval are required' }, { status: 400 });
      }

      const { data: updated, error } = await (supabase.from('topic_assets') as any)
        .update({ approval_state: asset_approval, updated_at: new Date().toISOString() })
        .eq('id', asset_id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, asset: updated });
    }

    return NextResponse.json({ error: 'Invalid review action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Review action failed' },
      { status: 500 }
    );
  }
}
