/**
 * Swallern Quality Audit & Citation Coverage Checker Engine
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface QualityReport {
  topic_id: string;
  total_claims: number;
  supported_claims: number;
  unverified_claims: number;
  disputed_claims: number;
  rejected_claims: number;
  citation_coverage_pct: number;
  sources_count: number;
  warnings: string[];
}

export async function runQualityCheck(
  topicId: string,
  supabaseAdmin: SupabaseClient
): Promise<QualityReport> {
  const warnings: string[] = [];

  // 1. Fetch topic & versions
  const { data: topic } = await supabaseAdmin
    .from('topics')
    .select('id, title, status, summary')
    .eq('id', topicId)
    .single();

  const { data: versions } = await supabaseAdmin
    .from('topic_versions')
    .select('*')
    .eq('topic_id', topicId)
    .order('version', { ascending: false });

  const latestVer = versions && versions.length > 0 ? versions[0] : null;

  // 2. Fetch claims
  const { data: claims } = await supabaseAdmin
    .from('claims')
    .select('id, status, claim_text')
    .eq('topic_id', topicId);

  const total_claims = claims ? claims.length : 0;
  const supported_claims = claims ? claims.filter((c) => c.status === 'SUPPORTED').length : 0;
  const unverified_claims = claims ? claims.filter((c) => c.status === 'UNVERIFIED').length : 0;
  const disputed_claims = claims ? claims.filter((c) => c.status === 'DISPUTED').length : 0;
  const rejected_claims = claims ? claims.filter((c) => c.status === 'REJECTED').length : 0;

  const citation_coverage_pct =
    total_claims > 0 ? Math.round((supported_claims / total_claims) * 100) : 0;

  // 3. Fetch sources
  const { data: topicSources } = await supabaseAdmin
    .from('topic_sources')
    .select('source_id')
    .eq('topic_id', topicId);

  const sources_count = topicSources ? topicSources.length : 0;

  // 4. Audit checks & warnings
  if (sources_count === 0) {
    warnings.push('Topic has 0 attached research sources.');
  }

  if (total_claims === 0) {
    warnings.push('No factual claims extracted for this topic.');
  }

  if (unverified_claims > 0) {
    warnings.push(`${unverified_claims} of ${total_claims} claims remain UNVERIFIED and require human review.`);
  }

  if (!latestVer || !latestVer.explanation || latestVer.explanation.trim() === '') {
    warnings.push('Draft explanation content is missing or empty.');
  }

  if (!latestVer || !latestVer.quick_answer || latestVer.quick_answer.trim() === '') {
    warnings.push('Quick answer is missing.');
  }

  // 5. Store Quality Report in DB
  try {
    await supabaseAdmin.from('quality_reports').insert({
      topic_id: topicId,
      version_id: latestVer?.id || null,
      total_claims,
      supported_claims,
      unverified_claims,
      citation_coverage_pct,
      warnings,
    });
  } catch {
    // Ignore report DB save errors
  }

  return {
    topic_id: topicId,
    total_claims,
    supported_claims,
    unverified_claims,
    disputed_claims,
    rejected_claims,
    citation_coverage_pct,
    sources_count,
    warnings,
  };
}
