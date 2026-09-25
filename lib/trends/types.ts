/**
 * Swallern Trend Provider & Pipeline Architecture Types
 */

import { SupportingSourceInfo } from './entity';

export interface RawTrendItem {
  query: string;
  source: string; // e.g. 'GOOGLE_TRENDS'
  timestamp: string;
  popularity_score?: number;
  geo?: string;
  related_queries?: string[];
  raw_metadata?: Record<string, unknown>;
}

export interface ScoreBreakdown {
  curiosity: number;
  educational_domain: number;
  momentum: number;
  clarity: number;
  safety: number;
  ambiguity_penalty?: number;
  detected_entity?: string;
  confidence_score?: number;
  alternative_meanings?: string[];
  supporting_sources?: SupportingSourceInfo[];
  is_ambiguous?: boolean;
}

export interface EducationalScoreResult {
  totalScore: number; // 0 to 100
  breakdown: ScoreBreakdown;
  reason: string;
}

export interface NormalizedTrend {
  rawQuery: string;
  cleanQuery: string;
  slug: string;
  source: string;
  popularityScore: number;
  isEducational: boolean;
  noiseReason?: string;
  geo: string;
  relatedQueries: string[];
}

export type DuplicateStatus =
  | 'UNIQUE'
  | 'DUPLICATE_SLUG'
  | 'SIMILAR_EXISTING'
  | 'PREVIOUSLY_REJECTED'
  | 'AMBIGUOUS';

export interface TrendCandidateRecord {
  id: string;
  query: string;
  slug: string;
  source: string;
  trend_signal?: string | null;
  popularity_score: number;
  educational_score: number;
  score_breakdown: ScoreBreakdown;
  duplicate_status: DuplicateStatus;
  matched_topic_id?: string | null;
  status: 'DISCOVERED' | 'APPROVED' | 'REJECTED' | 'MERGED' | 'PROCESSED';
  created_at: string;
  detected_entity?: string;
  confidence_score?: number;
  alternative_meanings?: string[];
  supporting_sources?: SupportingSourceInfo[];
}

export interface TrendProvider {
  providerName: string;
  fetchLatestTrends(geo?: string): Promise<RawTrendItem[]>;
}
