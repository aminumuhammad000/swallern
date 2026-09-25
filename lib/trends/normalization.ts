/**
 * Swallern Trend Normalization & Deduplication Library
 */

import { RawTrendItem, NormalizedTrend, DuplicateStatus } from './types';
import { SupabaseClient } from '@supabase/supabase-js';

// Commercial, transient, lottery, sports score, and noise indicators
const COMMERCIAL_NOISE_TERMS = [
  'buy', 'cheap', 'discount', 'coupon', 'promo', 'sale', 'price',
  'deal', 'store', 'shop', 'order', 'vs', 'nfl', 'nba', 'mlb', 'nhl',
  'betting', 'odds', 'lottery', 'lotto', 'powerball', 'mega millions',
  'jackpot', 'winning numbers', 'drawing', 'score', 'highlights', 'roster',
  'schedule', 'tickets', 'shoe', 'sneakers', 'unboxing', 'specs',
];

/**
 * Normalizes an incoming raw trend query into Swallern internal format.
 */
export function normalizeTrend(raw: RawTrendItem): NormalizedTrend {
  const cleanQuery = raw.query
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s-]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const slug = cleanQuery
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const lower = cleanQuery.toLowerCase();
  const words = lower.split(' ');

  // Filter transient / commercial / lottery / sports score noise
  const hasCommercialNoise = COMMERCIAL_NOISE_TERMS.some((term) =>
    lower.includes(term) || words.includes(term)
  );

  const isEducational = !hasCommercialNoise && cleanQuery.length >= 3;

  return {
    rawQuery: raw.query,
    cleanQuery,
    slug,
    source: raw.source || 'GOOGLE_TRENDS',
    popularityScore: raw.popularity_score || 50,
    isEducational,
    noiseReason: hasCommercialNoise ? 'Transient/Commercial/Sports/Lottery noise query filtered' : undefined,
    geo: raw.geo || 'US',
    relatedQueries: raw.related_queries || [],
  };
}

/**
 * Checks if a candidate topic is a duplicate of an existing topic or candidate.
 */
export async function checkDuplicateCandidate(
  cleanQuery: string,
  slug: string,
  supabaseAdmin: SupabaseClient
): Promise<{ duplicateStatus: DuplicateStatus; matchedTopicId: string | null }> {
  try {
    const { data: topicBySlug } = await supabaseAdmin
      .from('topics')
      .select('id, title, slug, status')
      .or(`slug.eq.${slug},title.ilike.${cleanQuery}`)
      .maybeSingle();

    if (topicBySlug) {
      if (topicBySlug.status === 'REJECTED') {
        return { duplicateStatus: 'PREVIOUSLY_REJECTED', matchedTopicId: topicBySlug.id };
      }
      return { duplicateStatus: 'DUPLICATE_SLUG', matchedTopicId: topicBySlug.id };
    }

    const { data: candBySlug } = await supabaseAdmin
      .from('trend_candidates')
      .select('id, status')
      .eq('slug', slug)
      .maybeSingle();

    if (candBySlug) {
      if (candBySlug.status === 'REJECTED') {
        return { duplicateStatus: 'PREVIOUSLY_REJECTED', matchedTopicId: null };
      }
      return { duplicateStatus: 'SIMILAR_EXISTING', matchedTopicId: null };
    }
  } catch {
    // Fallback if DB check fails
  }

  return { duplicateStatus: 'UNIQUE', matchedTopicId: null };
}
