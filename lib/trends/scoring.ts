/**
 * Swallern Educational Opportunity Scoring System
 * Calculates an evidence-based internal prioritization score (0-100) for incoming trends.
 * Incorporates Entity Resolution & Ambiguity Penalties.
 */

import { NormalizedTrend, EducationalScoreResult, ScoreBreakdown } from './types';
import { EntityResolutionResult } from './entity';

// Explicit curiosity phrasing signals
const FULL_QUESTION_PREFIXES = ['how', 'why', 'what is', 'what are', 'explained', 'science behind', 'causes of', 'history of', 'meaning of'];
const IMPLICIT_CURIOSITY_SIGNALS = ['mechanism', 'voting', 'adaptation', 'theory', 'paradox', 'framework', 'architecture', 'evolution', 'origin', 'process', 'opus', 'phenomenon'];

// Domain topics & subjects
const CORE_SCIENCE_TECH_TERMS = [
  'ai', 'quantum', 'physics', 'space', 'fusion', 'biology', 'gene', 'crispr',
  'virus', 'vaccine', 'economy', 'inflation', 'algorithm', 'neural', 'black hole',
  'climate', 'energy', 'brain', 'memory', 'atom', 'molecule', 'geology', 'ecology', 'nature',
];
const BROAD_CULTURAL_EDUCATIONAL_TERMS = [
  'opus', 'symphony', 'classical', 'philosophy', 'history', 'literature', 'bear', 'wildlife', 'astronomy', 'archaeology',
];

// Transient / Non-educational penalties
const PENALTY_TERMS = [
  'lottery', 'lotto', 'powerball', 'yankees', 'mets', 'espn', 'nfl', 'nba',
  'high school', 'beats', 'sneaker', 'shoe', 'game', 'release', 'betting', 'odds',
];

export function calculateEducationalScore(
  trend: NormalizedTrend,
  entityResult?: EntityResolutionResult
): EducationalScoreResult {
  const lower = trend.cleanQuery.toLowerCase();
  const words = lower.split(' ');

  // 1. Evidence-Based Curiosity Scoring (0 to 35)
  let curiosity = 0;
  if (FULL_QUESTION_PREFIXES.some((prefix) => lower.startsWith(prefix) || lower.includes(prefix))) {
    curiosity = 35;
  } else if (IMPLICIT_CURIOSITY_SIGNALS.some((sig) => lower.includes(sig))) {
    curiosity = 20;
  }

  // 2. Evidence-Based Educational Domain Scoring (0 to 35)
  let educational_domain = 0;
  const matchedCore = CORE_SCIENCE_TECH_TERMS.filter((kw) => lower.includes(kw) || words.includes(kw));
  const matchedBroad = BROAD_CULTURAL_EDUCATIONAL_TERMS.filter((kw) => lower.includes(kw) || words.includes(kw));

  if (matchedCore.length > 0) {
    educational_domain = Math.min(35, 20 + matchedCore.length * 8);
  } else if (matchedBroad.length > 0) {
    educational_domain = 18;
  }

  // 3. Search Momentum (0 to 25 based on trend signal)
  const momentum = Math.min(25, Math.max(5, Math.round(trend.popularityScore * 0.25)));

  // 4. Topic Clarity & Boundedness (0 to 20)
  let clarity = 10;
  if (words.length >= 3 && trend.cleanQuery.length >= 8) {
    clarity = 20;
  } else if (words.length === 2 && trend.cleanQuery.length >= 6) {
    clarity = 12;
  }

  // 5. Safety & Non-Educational Penalty Filter
  let safety = 20;
  let penalty = 0;

  const hasPenaltyTerm = PENALTY_TERMS.some((term) => lower.includes(term) || words.includes(term));
  const isAmbiguousName = words.length <= 2 && curiosity === 0 && educational_domain === 0;

  if (hasPenaltyTerm) {
    penalty += 45;
    safety = 5;
  }

  if (isAmbiguousName) {
    penalty += 30;
    safety = 5;
  }

  if (!trend.isEducational) {
    penalty += 50;
    safety = 0;
    educational_domain = 0;
  }

  // 6. Ambiguity Penalty from Entity Resolution
  let ambiguity_penalty = 0;
  if (entityResult) {
    if (entityResult.isAmbiguous || entityResult.confidenceScore < 0.70) {
      ambiguity_penalty = Math.round((1 - entityResult.confidenceScore) * 50);
      penalty += ambiguity_penalty;
      clarity = Math.min(clarity, 5);
    }
  }

  const breakdown: ScoreBreakdown = {
    curiosity,
    educational_domain,
    momentum,
    clarity,
    safety,
    ambiguity_penalty,
    ...(entityResult && {
      detected_entity: entityResult.detectedEntity,
      confidence_score: entityResult.confidenceScore,
      alternative_meanings: entityResult.alternativeMeanings,
      supporting_sources: entityResult.supportingSources,
      is_ambiguous: entityResult.isAmbiguous,
    }),
  };

  const rawTotal = curiosity + educational_domain + momentum + clarity + safety - penalty;
  const totalScore = Math.max(0, Math.min(100, rawTotal));

  let reason = 'Low educational signal or non-educational search';
  if (entityResult && entityResult.isAmbiguous) {
    reason = entityResult.reason;
  } else if (totalScore >= 60) {
    const domainName = matchedCore[0] || matchedBroad[0] || 'educational query';
    reason = `Strong educational opportunity in ${domainName}`;
  } else if (hasPenaltyTerm) {
    reason = 'Filtered out: transient sports, lottery, product, or celebrity search';
  } else if (isAmbiguousName) {
    reason = 'Filtered out: ambiguous name or directory search without curiosity context';
  }

  return {
    totalScore,
    breakdown,
    reason,
  };
}
