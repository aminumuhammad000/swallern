import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { GoogleTrendsProvider } from '@/lib/trends/provider';
import { normalizeTrend, checkDuplicateCandidate } from '@/lib/trends/normalization';
import { calculateEducationalScore } from '@/lib/trends/scoring';
import { resolveTrendEntity } from '@/lib/trends/entity';
import { createContentJob, executeJob } from '@/lib/jobs/runner';
import { sendIngestionSummaryNotification, getNotificationConfigStatus } from '@/lib/notifications/service';

/**
 * GET /api/admin/pipeline/candidates
 * Returns candidate trend opportunities ordered by educational score.
 */
export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'DISCOVERED';
    const supabase = createAdminClient();

    const { data: candidates, error } = await supabase
      .from('trend_candidates')
      .select('*')
      .eq('status', status)
      .order('educational_score', { ascending: false })
      .limit(50);

    if (error) throw error;

    const notificationConfig = getNotificationConfigStatus();

    return NextResponse.json({ candidates: candidates || [], notification_config: notificationConfig });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pipeline/candidates
 * Manages trend candidate pipeline actions: ingest, approve, reject, merge.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, candidate_id, target_topic_id, confirmed_entity } = body;
    const supabase = createAdminClient();

    // Action 1: Ingest fresh trends from provider with Entity Resolution & Notification
    if (action === 'ingest') {
      const provider = new GoogleTrendsProvider();
      const rawTrends = await provider.fetchLatestTrends('US');

      let acceptedCount = 0;
      let rejectedCount = 0;
      let ambiguousCount = 0;
      const topCandidates: Array<{ query: string; score: number; entity?: string }> = [];

      for (const raw of rawTrends) {
        const normalized = normalizeTrend(raw);
        if (!normalized.isEducational) {
          rejectedCount++;
          continue;
        }

        const { duplicateStatus, matchedTopicId } = await checkDuplicateCandidate(
          normalized.cleanQuery,
          normalized.slug,
          supabase
        );

        // Stage 2 & 3: Entity Resolution & Meaning Verification
        const entityResult = await resolveTrendEntity(normalized.cleanQuery);

        // Stage 4: Educational Opportunity Check with Ambiguity Penalty
        const scoreResult = calculateEducationalScore(normalized, entityResult);

        const finalDupStatus = entityResult.isAmbiguous ? 'AMBIGUOUS' : duplicateStatus;

        if (entityResult.isAmbiguous) {
          ambiguousCount++;
        }

        if (scoreResult.totalScore < 60) {
          rejectedCount++;
        } else {
          acceptedCount++;
          if (topCandidates.length < 5) {
            topCandidates.push({
              query: normalized.cleanQuery,
              score: scoreResult.totalScore,
              entity: entityResult.detectedEntity,
            });
          }
        }

        const insertData: Record<string, unknown> = {
          query: normalized.cleanQuery,
          slug: normalized.slug,
          source: normalized.source,
          popularity_score: normalized.popularityScore,
          educational_score: scoreResult.totalScore,
          score_breakdown: scoreResult.breakdown,
          duplicate_status: finalDupStatus,
          matched_topic_id: matchedTopicId,
          status: 'DISCOVERED',
        };

        try {
          insertData.detected_entity = entityResult.detectedEntity;
          insertData.confidence_score = entityResult.confidenceScore;
          insertData.alternative_meanings = entityResult.alternativeMeanings;
          insertData.supporting_sources = entityResult.supportingSources;
        } catch {
          // Ignore if top-level columns do not exist
        }

        await supabase.from('trend_candidates').insert(insertData);
      }

      // Send ONE summary email notification after trend ingestion finishes
      await sendIngestionSummaryNotification({
        status: 'COMPLETED',
        totalFetched: rawTrends.length,
        acceptedCount,
        rejectedCount,
        ambiguousCount,
        topCandidates,
      });

      return NextResponse.json({ success: true, ingestedCount: acceptedCount });
    }

    // Action 2: Approve candidate for research & AI generation
    if (action === 'approve') {
      if (!candidate_id) {
        return NextResponse.json({ error: 'candidate_id is required' }, { status: 400 });
      }

      const { data: cand, error: candErr } = await supabase
        .from('trend_candidates')
        .select('*')
        .eq('id', candidate_id)
        .single();

      if (candErr || !cand) {
        return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }

      const breakdown = cand.score_breakdown || {};
      const isAmbiguous = breakdown.is_ambiguous || cand.duplicate_status === 'AMBIGUOUS' || (cand.confidence_score && cand.confidence_score < 0.70);

      // Requirement 4: If candidate is ambiguous and no confirmed entity provided, ask admin review
      if (isAmbiguous && !confirmed_entity) {
        return NextResponse.json(
          {
            error: `Candidate entity is ambiguous. Please confirm entity choice before approving.`,
            requires_entity_confirmation: true,
            detected_entity: cand.detected_entity || breakdown.detected_entity,
            alternative_meanings: cand.alternative_meanings || breakdown.alternative_meanings || [],
          },
          { status: 400 }
        );
      }

      const selectedEntity = confirmed_entity || cand.detected_entity || breakdown.detected_entity || cand.query;
      const topicTitle = cand.query;
      const topicSummary = `Explaining ${selectedEntity}`;

      // 1. Create or retrieve Topic safely without duplicate key violation
      let topic: { id: string; slug: string; title: string } | null = null;

      const { data: existingTopic } = await supabase
        .from('topics')
        .select('id, slug, title')
        .eq('slug', cand.slug)
        .maybeSingle();

      if (existingTopic) {
        topic = existingTopic;
      } else {
        let uniqueSlug = cand.slug;
        let counter = 1;
        while (true) {
          const { data: checkSlug } = await supabase
            .from('topics')
            .select('id')
            .eq('slug', uniqueSlug)
            .maybeSingle();
          if (!checkSlug) break;
          counter++;
          uniqueSlug = `${cand.slug}-${counter}`;
        }

        const { data: newTopic, error: topicErr } = await supabase
          .from('topics')
          .insert({
            title: topicTitle,
            slug: uniqueSlug,
            status: 'DRAFT',
            summary: topicSummary,
          })
          .select()
          .single();

        if (topicErr || !newTopic) {
          throw new Error(topicErr?.message || 'Failed to create topic from candidate');
        }
        topic = newTopic;
      }

      if (!topic) {
        throw new Error('Failed to create or resolve topic for approval.');
      }


      // Update candidate status
      await supabase
        .from('trend_candidates')
        .update({ status: 'APPROVED', matched_topic_id: topic.id })
        .eq('id', candidate_id);

      // 2. Trigger automated research job
      const researchJobRes = await createContentJob('RESEARCH', {}, candidate_id, topic.id);
      if (researchJobRes.jobId) {
        await executeJob(researchJobRes.jobId);
      }

      // 3. Trigger AI generation job
      const aiJobRes = await createContentJob('AI_GENERATION', {}, candidate_id, topic.id);
      if (aiJobRes.jobId) {
        await executeJob(aiJobRes.jobId);
      }

      return NextResponse.json({ success: true, topic_id: topic.id, confirmed_entity: selectedEntity });
    }

    // Action 3: Reject candidate
    if (action === 'reject') {
      if (!candidate_id) {
        return NextResponse.json({ error: 'candidate_id is required' }, { status: 400 });
      }

      await supabase
        .from('trend_candidates')
        .update({ status: 'REJECTED' })
        .eq('id', candidate_id);

      return NextResponse.json({ success: true });
    }

    // Action 4: Merge candidate with existing topic
    if (action === 'merge') {
      if (!candidate_id || !target_topic_id) {
        return NextResponse.json(
          { error: 'candidate_id and target_topic_id are required' },
          { status: 400 }
        );
      }

      await supabase
        .from('trend_candidates')
        .update({ status: 'MERGED', matched_topic_id: target_topic_id })
        .eq('id', candidate_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Candidates POST handler failed' },
      { status: 500 }
    );
  }
}
