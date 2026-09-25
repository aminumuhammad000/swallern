/**
 * Swallern Content Job Runner & Background Execution Engine
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { GoogleTrendsProvider } from '@/lib/trends/provider';
import { normalizeTrend, checkDuplicateCandidate } from '@/lib/trends/normalization';
import { calculateEducationalScore } from '@/lib/trends/scoring';
import { resolveTrendEntity } from '@/lib/trends/entity';
import { runAutomatedResearch } from '@/lib/research/engine';
import { generateTopicDraftWithAI } from '@/lib/ai/provider';
import { runQualityCheck } from '@/lib/quality/checker';
import { generateEducationalImage } from '@/lib/images/provider';
import { generateEducationalVisualBrief, saveGeneratedAsset } from '@/lib/images/service';
import { sendIngestionSummaryNotification, sendPipelineFailureNotification } from '@/lib/notifications/service';

export interface JobRecord {
  id: string;
  candidate_id?: string | null;
  topic_id?: string | null;
  job_type: 'INGEST_TRENDS' | 'RESEARCH' | 'AI_GENERATION' | 'QUALITY_CHECK' | 'REFRESH' | 'IMAGE_GENERATION';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  attempts: number;
  max_attempts: number;
  error_message?: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

/**
 * Creates a background job record in DB.
 */
export async function createContentJob(
  jobType: JobRecord['job_type'],
  payload: Record<string, unknown> = {},
  candidateId?: string | null,
  topicId?: string | null
): Promise<{ success: boolean; jobId?: string }> {
  try {
    const supabase = createAdminClient();
    const { data: job, error } = await supabase
      .from('content_jobs')
      .insert({
        job_type: jobType,
        payload,
        candidate_id: candidateId || null,
        topic_id: topicId || null,
        status: 'PENDING',
        attempts: 0,
        max_attempts: 3,
      })
      .select('id')
      .single();

    if (error || !job) {
      return { success: false };
    }
    return { success: true, jobId: job.id };
  } catch {
    return { success: false };
  }
}

/**
 * Executes a single pipeline job.
 */
export async function executeJob(jobId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // 1. Fetch & lock job
  const { data: job, error: fetchErr } = await supabase
    .from('content_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (fetchErr || !job) {
    return { success: false, error: 'Job not found' };
  }

  if (job.attempts >= job.max_attempts) {
    await supabase.from('content_jobs').update({ status: 'FAILED', error_message: 'Max retry attempts exceeded' }).eq('id', jobId);
    await sendPipelineFailureNotification(job.job_type, 'Max retry attempts exceeded');
    return { success: false, error: 'Max retries exceeded' };
  }

  // Update status to IN_PROGRESS
  await supabase
    .from('content_jobs')
    .update({ status: 'IN_PROGRESS', attempts: job.attempts + 1, updated_at: new Date().toISOString() })
    .eq('id', jobId);

  try {
    // 2. Dispatch by job_type
    if (job.job_type === 'INGEST_TRENDS') {
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

        // Save candidate record
        const insertPayload: Record<string, unknown> = {
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
          insertPayload.detected_entity = entityResult.detectedEntity;
          insertPayload.confidence_score = entityResult.confidenceScore;
          insertPayload.alternative_meanings = entityResult.alternativeMeanings;
          insertPayload.supporting_sources = entityResult.supportingSources;
        } catch {
          // Fall back gracefully to score_breakdown storage
        }

        await supabase.from('trend_candidates').insert(insertPayload);
      }

      await supabase
        .from('content_jobs')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', jobId);

      // Send ONE summary email notification after trend ingestion finishes
      await sendIngestionSummaryNotification({
        status: 'COMPLETED',
        totalFetched: rawTrends.length,
        acceptedCount,
        rejectedCount,
        ambiguousCount,
        topCandidates,
      });

      return { success: true };
    }

    if (job.job_type === 'RESEARCH') {
      if (!job.topic_id) throw new Error('topic_id required for RESEARCH job');

      const { data: topic } = await supabase.from('topics').select('id, title').eq('id', job.topic_id).single();
      if (!topic) throw new Error('Topic not found for research job');

      await runAutomatedResearch(topic.id, topic.title, supabase);

      await supabase
        .from('content_jobs')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', jobId);

      return { success: true };
    }

    if (job.job_type === 'AI_GENERATION') {
      if (!job.topic_id) throw new Error('topic_id required for AI_GENERATION job');

      const { data: topic } = await supabase
        .from('topics')
        .select('id, title, summary, category_id, categories(name)')
        .eq('id', job.topic_id)
        .single();

      if (!topic) throw new Error('Topic not found for AI generation job');

      const { data: topicSources } = await supabase.from('topic_sources').select('source_id').eq('topic_id', topic.id);
      const sourceIds = (topicSources || []).map((ts) => ts.source_id);

      let sourcesList: Array<{ title: string; url: string; publisher?: string | null; source_type?: string | null }> = [];
      if (sourceIds.length > 0) {
        const { data: rawSources } = await supabase.from('sources').select('title, url, publisher, source_type').in('id', sourceIds);
        sourcesList = rawSources || [];
      }

      const categoryName = (topic.categories as unknown as { name: string })?.name || 'General';

      const aiRes = await generateTopicDraftWithAI(topic.title, categoryName, sourcesList, topic.summary);
      if (!aiRes.success || !aiRes.data) {
        throw new Error(aiRes.error || 'AI generation returned failure');
      }

      // Save draft into topic_versions
      const { data: versions } = await supabase.from('topic_versions').select('id').eq('topic_id', topic.id);
      if (versions && versions.length > 0) {
        await supabase
          .from('topic_versions')
          .update({
            quick_answer: aiRes.data.quick_answer,
            explanation: aiRes.data.explanation,
            key_concepts: aiRes.data.key_concepts || [],
          })
          .eq('id', versions[0].id);
      } else {
        await supabase.from('topic_versions').insert({
          topic_id: topic.id,
          version: 1,
          quick_answer: aiRes.data.quick_answer,
          explanation: aiRes.data.explanation,
          key_concepts: aiRes.data.key_concepts || [],
        });
      }

      // Insert claims as UNVERIFIED
      if (Array.isArray(aiRes.data.claims)) {
        for (const candidateClaim of aiRes.data.claims) {
          if (!candidateClaim.claim_text) continue;
          await supabase.from('claims').insert({
            topic_id: topic.id,
            claim_text: candidateClaim.claim_text,
            status: 'UNVERIFIED',
            notes: 'Extracted by automated job runner',
          });
        }
      }

      // Automatically enqueue QUALITY_CHECK and IMAGE_GENERATION
      await createContentJob('QUALITY_CHECK', {}, job.candidate_id, topic.id);
      await createContentJob('IMAGE_GENERATION', {}, job.candidate_id, topic.id);

      await supabase
        .from('content_jobs')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', jobId);

      return { success: true };
    }

    if (job.job_type === 'IMAGE_GENERATION') {
      if (!job.topic_id) throw new Error('topic_id required for IMAGE_GENERATION job');

      const { data: topic } = await supabase
        .from('topics')
        .select('id, title, summary, status')
        .eq('id', job.topic_id)
        .single();

      if (!topic) throw new Error('Topic not found for IMAGE_GENERATION job');

      // Rule: Do not generate images for rejected topics
      if (topic.status === 'REJECTED') {
        await supabase
          .from('content_jobs')
          .update({ status: 'COMPLETED', error_message: 'Skipped: Topic is rejected', updated_at: new Date().toISOString() })
          .eq('id', jobId);
        return { success: true };
      }

      // 1. Visual Brief Generation Stage
      const visualBrief = generateEducationalVisualBrief(topic.title, topic.summary || undefined);

      // 2. Image Generation Stage using Visual Brief formatted prompt
      const imageResult = await generateEducationalImage({
        prompt: visualBrief.formattedPrompt,
        topicId: topic.id,
        aspectRatio: '16:9',
        style: 'educational_illustration',
        visualBrief,
      });

      if (imageResult.success && imageResult.imageUrl) {
        // 3. Store visual brief along with asset record (approval_state = PENDING_REVIEW)
        await saveGeneratedAsset(topic.id, null, imageResult, supabase, visualBrief);
      } else {
        console.log('[Runner] Image generation unconfigured or failed:', imageResult.error);
      }

      await supabase
        .from('content_jobs')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', jobId);

      return { success: true };
    }

    if (job.job_type === 'QUALITY_CHECK') {
      if (!job.topic_id) throw new Error('topic_id required for QUALITY_CHECK job');
      await runQualityCheck(job.topic_id, supabase);

      await supabase
        .from('content_jobs')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', jobId);

      return { success: true };
    }

    throw new Error(`Unsupported job_type: ${job.job_type}`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Job execution failed';
    await supabase
      .from('content_jobs')
      .update({
        status: 'FAILED',
        error_message: errMsg,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    // Send error notification if trend ingestion or pipeline job fails
    if (job.job_type === 'INGEST_TRENDS') {
      await sendIngestionSummaryNotification({
        status: 'FAILED',
        totalFetched: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        ambiguousCount: 0,
        topCandidates: [],
        errors: [errMsg],
      });
    } else {
      await sendPipelineFailureNotification(job.job_type, errMsg);
    }

    return { success: false, error: errMsg };
  }
}
