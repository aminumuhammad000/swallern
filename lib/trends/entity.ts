/**
 * Swallern Trend Entity Resolution & Meaning Verification Module
 * 
 * Verifies the exact entity and meaning behind trending search keywords 
 * BEFORE topic creation or AI generation.
 */

export interface SupportingSourceInfo {
  title: string;
  url: string;
  publisher?: string;
  snippet?: string;
}

export interface EntityResolutionResult {
  query: string;
  detectedEntity: string;
  confidenceScore: number; // 0.0 to 1.0 (e.g. 0.95 high confidence, 0.45 ambiguous)
  alternativeMeanings: string[];
  supportingSources: SupportingSourceInfo[];
  isAmbiguous: boolean;
  reason: string;
}

/**
 * Knowledge base of ambiguous entity queries and their candidate interpretations.
 * Used for entity identification when keywords match multi-meaning patterns.
 */
interface EntityPattern {
  keywordPattern: RegExp;
  candidateEntities: Array<{
    entityName: string;
    domain: string;
    keywords: string[];
    defaultUrl: string;
    publisher: string;
  }>;
}

const KNOWN_ENTITY_PATTERNS: EntityPattern[] = [
  {
    keywordPattern: /opus\s*55/i,
    candidateEntities: [
      {
        entityName: 'Chopin Nocturnes, Op. 55 (Classical Music Composition)',
        domain: 'Music & Arts Education',
        keywords: ['chopin', 'nocturne', 'classical', 'piano', 'composition', 'music', 'op 55'],
        defaultUrl: 'https://en.wikipedia.org/wiki/Nocturnes,_Op._55_(Chopin)',
        publisher: 'Wikipedia / Music Reference',
      },
      {
        entityName: 'Beethoven Symphony No. 3 Eroica, Op. 55 (Classical Music)',
        domain: 'Music & Classical History',
        keywords: ['beethoven', 'eroica', 'symphony', 'orchestra', 'op 55'],
        defaultUrl: 'https://en.wikipedia.org/wiki/Symphony_No._3_(Beethoven)',
        publisher: 'Wikipedia / Music History',
      },
      {
        entityName: 'Anthropic Claude 3.5 Opus / AI Model Speculation',
        domain: 'Artificial Intelligence & Computer Science',
        keywords: ['ai', 'anthropic', 'claude', 'llm', 'model', 'opus 5.5', 'opus 55'],
        defaultUrl: 'https://www.anthropic.com/news',
        publisher: 'Tech / AI Industry News',
      },
      {
        entityName: 'Commercial Audio Equipment / Product Model',
        domain: 'Consumer Products',
        keywords: ['headphone', 'audio', 'brand', 'speaker', 'device'],
        defaultUrl: 'https://en.wikipedia.org/wiki/Opus',
        publisher: 'Reference Library',
      },
    ],
  },
  {
    keywordPattern: /fat\s*bear\s*week/i,
    candidateEntities: [
      {
        entityName: 'Katmai National Park Fat Bear Week (Wildlife & Ecology Competition)',
        domain: 'Wildlife & Environmental Science',
        keywords: ['fat bear', 'katmai', 'alaska', 'salmon', 'brown bear', 'voting', 'national park'],
        defaultUrl: 'https://www.nps.gov/katm/learn/fat-bear-week.htm',
        publisher: 'National Park Service (NPS)',
      },
    ],
  },
  {
    keywordPattern: /beats?\s*360/i,
    candidateEntities: [
      {
        entityName: 'Beats Audio / Consumer Headphones Model',
        domain: 'Consumer Tech Products',
        keywords: ['beats', 'headphones', 'apple', 'audio', '360'],
        defaultUrl: 'https://en.wikipedia.org/wiki/Beats_Electronics',
        publisher: 'Consumer Tech Index',
      },
    ],
  },
];

/**
 * Resolves entity meaning for a trend query.
 * Inspects candidate meanings, checks source evidence, calculates confidence score,
 * and flags ambiguous trends requiring admin verification.
 */
export async function resolveTrendEntity(
  query: string,
  existingSources?: Array<{ title: string; url: string; publisher?: string }>
): Promise<EntityResolutionResult> {
  const cleanQuery = query.trim();
  const lowerQuery = cleanQuery.toLowerCase();

  // 1. Check if query matches known pattern
  const matchedPattern = KNOWN_ENTITY_PATTERNS.find((p) => p.keywordPattern.test(cleanQuery));

  if (matchedPattern) {
    const candidates = matchedPattern.candidateEntities;

    // Check if existing external sources or extra keywords provide explicit evidence
    const sourceTexts = (existingSources || [])
      .map((s) => `${s.title} ${s.url} ${s.publisher || ''}`)
      .join(' ')
      .toLowerCase();

    // Score candidates against query context and source evidence
    const scoredCandidates = candidates.map((cand) => {
      let score = 0;

      // Match keywords in query string
      const matchedInQuery = cand.keywords.filter((kw) => lowerQuery.includes(kw));
      score += matchedInQuery.length * 20;

      // Match keywords in source evidence
      if (sourceTexts) {
        const matchedInSources = cand.keywords.filter((kw) => sourceTexts.includes(kw));
        score += matchedInSources.length * 15;
      }

      return { candidate: cand, score };
    });

    // Sort candidates by evidence score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    const topCandidate = scoredCandidates[0];
    const runnerUp = scoredCandidates[1];

    // Determine confidence & ambiguity
    // If only 1 candidate entity exists (e.g. Fat Bear Week), confidence is high
    if (candidates.length === 1) {
      return {
        query: cleanQuery,
        detectedEntity: candidates[0].entityName,
        confidenceScore: 0.95,
        alternativeMeanings: [],
        supportingSources: [
          {
            title: candidates[0].entityName,
            url: candidates[0].defaultUrl,
            publisher: candidates[0].publisher,
            snippet: `Verified educational topic in ${candidates[0].domain}`,
          },
        ],
        isAmbiguous: false,
        reason: `High confidence entity match: ${candidates[0].entityName}`,
      };
    }

    // If top candidate has decisive lead over runner-up
    if (topCandidate.score >= 30 && (!runnerUp || topCandidate.score - runnerUp.score >= 20)) {
      return {
        query: cleanQuery,
        detectedEntity: topCandidate.candidate.entityName,
        confidenceScore: 0.85,
        alternativeMeanings: candidates
          .filter((c) => c.entityName !== topCandidate.candidate.entityName)
          .map((c) => c.entityName),
        supportingSources: [
          {
            title: topCandidate.candidate.entityName,
            url: topCandidate.candidate.defaultUrl,
            publisher: topCandidate.candidate.publisher,
            snippet: `Source evidence matches ${topCandidate.candidate.domain}`,
          },
        ],
        isAmbiguous: false,
        reason: `Entity resolved with source evidence: ${topCandidate.candidate.entityName}`,
      };
    }

    // Multiple meanings exist without overwhelming evidence -> AMBIGUOUS
    return {
      query: cleanQuery,
      detectedEntity: `${cleanQuery} (Ambiguous Entity - Multiple Meanings)`,
      confidenceScore: 0.45,
      alternativeMeanings: candidates.map((c) => c.entityName),
      supportingSources: candidates.map((c) => ({
        title: c.entityName,
        url: c.defaultUrl,
        publisher: c.publisher,
        snippet: `Possible interpretation under ${c.domain}`,
      })),
      isAmbiguous: true,
      reason: `Ambiguous trend keyword: "${cleanQuery}" matches ${candidates.length} possible entity interpretations. Requires admin entity confirmation before AI topic generation.`,
    };
  }

  // 2. Generic Heuristic Resolution for queries without explicit patterns
  const words = cleanQuery.split(' ');
  const hasNumbers = /\d+/.test(cleanQuery);
  const isShortCode = words.length <= 2 && (cleanQuery.length <= 8 || hasNumbers);

  if (isShortCode && !cleanQuery.includes(' ')) {
    // Single word/code (e.g. "opus55", "beats360") -> Moderate ambiguity
    return {
      query: cleanQuery,
      detectedEntity: `${cleanQuery} (General / Code Keyword)`,
      confidenceScore: 0.60,
      alternativeMeanings: [
        `${cleanQuery} (Educational / Science Topic)`,
        `${cleanQuery} (Product / Brand)`,
        `${cleanQuery} (Cultural / Media Reference)`,
      ],
      supportingSources: [
        {
          title: `Reference Search: ${cleanQuery}`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanQuery)}`,
          publisher: 'Wikipedia / Reference Library',
        },
      ],
      isAmbiguous: true,
      reason: `Short keyword "${cleanQuery}" requires context to confirm specific educational entity.`,
    };
  }

  // Clear multi-word query (e.g., "james webb space telescope discoveries")
  return {
    query: cleanQuery,
    detectedEntity: cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1),
    confidenceScore: 0.90,
    alternativeMeanings: [],
    supportingSources: [
      {
        title: `${cleanQuery} — Educational Overview`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanQuery.replace(/\s+/g, '_'))}`,
        publisher: 'Wikipedia / Educational Reference',
      },
    ],
    isAmbiguous: false,
    reason: `Clear descriptive query: ${cleanQuery}`,
  };
}
