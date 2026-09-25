/**
 * Swallern Multi-Provider AI Engine (OpenRouter, Google Gemini, OpenAI).
 * Server-side only. Uses native fetch (zero extra dependencies).
 * API keys are read strictly from process.env and never hardcoded or exposed.
 */

import {
  AIServiceConfig,
  AIProviderType,
  AISourceInput,
  AIDraftResult,
  AIGenerationResponse,
} from './interface';

/**
 * Returns current configuration status based on process.env.AI_PROVIDER.
 */
export function getAIServiceConfig(): AIServiceConfig {
  const providerType = (process.env.AI_PROVIDER || 'openrouter').toLowerCase().trim() as AIProviderType;

  if (providerType === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (!apiKey || apiKey.trim() === '') {
      return {
        configured: false,
        providerName: 'Google Gemini',
        providerType: 'gemini',
        modelName,
        error: 'GEMINI_API_KEY environment variable is missing on the server.',
      };
    }
    return {
      configured: true,
      providerName: 'Google Gemini',
      providerType: 'gemini',
      modelName,
    };
  }

  if (providerType === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_OPENAI_API_KEY') {
      return {
        configured: false,
        providerName: 'OpenAI',
        providerType: 'openai',
        modelName,
        error: 'OPENAI_API_KEY environment variable is missing on the server.',
      };
    }
    return {
      configured: true,
      providerName: 'OpenAI',
      providerType: 'openai',
      modelName,
    };
  }

  // Default: OpenRouter (Primary MVP Provider)
  const apiKey = process.env.OPENROUTER_API_KEY;
  const modelName = process.env.OPENROUTER_MODEL || 'openrouter/free';
  if (!apiKey || apiKey.trim() === '') {
    return {
      configured: false,
      providerName: 'OpenRouter',
      providerType: 'openrouter',
      modelName,
      error: 'OPENROUTER_API_KEY environment variable is missing on the server.',
    };
  }
  return {
    configured: true,
    providerName: 'OpenRouter',
    providerType: 'openrouter',
    modelName,
  };
}

import { ResearchBrief } from '../research/engine';

/**
 * Generates an AI-assisted research draft using the active configured provider.
 */
export async function generateTopicDraftWithAI(
  topicTitle: string,
  categoryName: string,
  sources: AISourceInput[],
  existingSummary?: string | null,
  brief?: ResearchBrief | null
): Promise<AIGenerationResponse> {
  const config = getAIServiceConfig();

  if (!config.configured) {
    const fallbackDraft = generateFallbackDraft(topicTitle, categoryName, sources, existingSummary, brief);
    return {
      success: true,
      configured: false,
      data: fallbackDraft,
      warnings: [
        `${config.providerName} API key is unconfigured. Generated draft using factual research brief synthesis mode.`,
        'Extracted claims initialized from verified research brief.',
      ],
    };
  }

  const { systemPrompt, userPrompt } = buildPrompts(topicTitle, categoryName, sources, existingSummary, brief);

  try {
    let contentText: string | null = null;

    if (config.providerType === 'openrouter') {
      contentText = await callOpenRouter(config.modelName, systemPrompt, userPrompt);
    } else if (config.providerType === 'gemini') {
      contentText = await callGemini(config.modelName, systemPrompt, userPrompt);
    } else if (config.providerType === 'openai') {
      contentText = await callOpenAI(config.modelName, systemPrompt, userPrompt);
    }

    if (!contentText) {
      const fallback = generateFallbackDraft(topicTitle, categoryName, sources, existingSummary, brief);
      return {
        success: true,
        configured: true,
        data: fallback,
        warnings: [`${config.providerName} returned an empty response. Used structured research fallback.`],
      };
    }

    const parsedDraft: AIDraftResult = JSON.parse(contentText);

    const warnings: string[] = [];
    if (!parsedDraft.claims || parsedDraft.claims.length === 0) {
      warnings.push('No factual claims were generated for verification.');
    } else {
      const unlinkedCount = parsedDraft.claims.filter(
        (c) => !c.supporting_source_urls || c.supporting_source_urls.length === 0
      ).length;
      if (unlinkedCount > 0) {
        warnings.push(
          `${unlinkedCount} of ${parsedDraft.claims.length} claims have no linked sources and remain UNVERIFIED.`
        );
      }
    }

    return {
      success: true,
      configured: true,
      data: parsedDraft,
      warnings,
    };
  } catch {
    const fallback = generateFallbackDraft(topicTitle, categoryName, sources, existingSummary, brief);
    return {
      success: true,
      configured: true,
      data: fallback,
      warnings: [`${config.providerName} request encountered an error. Used structured fallback.`],
    };
  }
}

// ── OpenRouter API Call (OpenAI-compatible) ──────────────────────────────────

async function callOpenRouter(model: string, systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY!;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://swallern.com',
      'X-Title': 'Swallern',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);
  if (!res.ok) return null;

  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

// ── Google Gemini REST API Call ──────────────────────────────────────────────

async function callGemini(model: string, systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);
  if (!res.ok) return null;

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// ── OpenAI API Call ──────────────────────────────────────────────────────────

async function callOpenAI(model: string, systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);
  if (!res.ok) return null;

  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

// ── Prompt Helper ────────────────────────────────────────────────────────────

function buildPrompts(
  topicTitle: string,
  categoryName: string,
  sources: AISourceInput[],
  existingSummary?: string | null,
  brief?: ResearchBrief | null
) {
  const sourcesListFormatted =
    sources.length > 0
      ? sources
          .map(
            (s, idx) =>
              `[Source ${idx + 1}] Title: "${s.title}" | Publisher: "${s.publisher || 'Unknown'}" | Type: "${s.source_type || 'GENERAL'}" | URL: ${s.url}`
          )
          .join('\n')
      : 'No pre-attached research sources available. Rely only on established, verified facts.';

  const briefFactsFormatted = brief?.key_facts && brief.key_facts.length > 0
    ? brief.key_facts.map((f) => `- ${f.claim} (Source: ${f.source_url || 'Verified Research'})`).join('\n')
    : 'No pre-extracted key facts available.';

  const currentFactsFormatted = brief?.current_information && brief.current_information.length > 0
    ? brief.current_information.map((c) => `- [Current Fact as of ${c.as_of || '2026'}] ${c.claim} (Source: ${c.source_url || 'Verified Research'})`).join('\n')
    : 'No time-sensitive facts detected.';

  const entityInfo = brief?.entity
    ? `Identified Entity: "${brief.entity.name}" (Type: ${brief.entity.type})\nDescription: ${brief.entity.description}`
    : `Topic Query: "${topicTitle}"`;

  const systemPrompt = `You are Swallern's AI Research Assistant.
Swallern produces highly trustworthy, source-first educational explanations for curious learners.

CRITICAL RULES:
1. STRICTLY PROHIBIT GENERIC FILLER PROSE such as "refers to an established educational concept studied within..." or "Researchers and educators analyze its structure...". You MUST state explicitly what the real-world topic/entity actually is.
2. Synthesize the content strictly based on the real-world facts provided in the Research Brief and attached sources.
3. DO NOT fabricate sources or URLs. Only map claims to the exact URLs provided in the SOURCES LIST if they support the statement.
4. If a claim has no matching source from the provided list, leave its "supporting_source_urls" array empty.
5. Content must be factual, engaging, objective, and clear.
6. Output MUST be valid JSON conforming strictly to the requested schema.

RESPONSE FORMAT (JSON ONLY):
{
  "title": "Topic title",
  "summary": "Concise 2-sentence summary explaining what this topic is and why it matters.",
  "quick_answer": "Direct 1-2 sentence answer stating exactly what the topic/entity actually is.",
  "explanation": "Clear detailed 3-4 paragraph explanation structured logically around the real facts.",
  "key_concepts": [
    { "title": "Concept Name", "description": "Brief concept explanation" }
  ],
  "claims": [
    {
      "claim_text": "Factual statement extracted from content",
      "supporting_source_urls": ["URL from provided sources if matching, otherwise empty array"]
    }
  ],
  "suggested_lesson": {
    "title": "Short Lesson Title",
    "summary": "Lesson overview",
    "estimated_minutes": 5,
    "sections": [
      {
        "title": "Section Title",
        "content": "Section content explaining the sub-concept.",
        "key_takeaway": "Key takeaway sentence"
      }
    ]
  },
  "suggested_quiz": {
    "title": "Knowledge Check Quiz",
    "passing_score": 80,
    "questions": [
      {
        "question": "Clear multiple choice question?",
        "explanation": "Explanation of why the correct answer is right.",
        "options": [
          { "option_text": "Option A text", "is_correct": true },
          { "option_text": "Option B text", "is_correct": false },
          { "option_text": "Option C text", "is_correct": false },
          { "option_text": "Option D text", "is_correct": false }
        ]
      }
    ]
  },
  "suggested_related_topics": ["Related Topic 1", "Related Topic 2"]
}`;

  const userPrompt = `TOPIC IDENTIFICATION & RESEARCH BRIEF:
${entityInfo}
Category: "${categoryName}"
${existingSummary ? `Existing Context: "${existingSummary}"` : ''}

VERIFIED KEY FACTS:
${briefFactsFormatted}

CURRENT / TIME-SENSITIVE FACTS:
${currentFactsFormatted}

AVAILABLE RESEARCH SOURCES:
${sourcesListFormatted}

Generate a comprehensive educational draft JSON for this topic adhering strictly to all rules. Ensure the quiz contains 5 questions.`;

  return { systemPrompt, userPrompt };
}

// ── Structured Research Fallback ─────────────────────────────────────────────

function generateFallbackDraft(
  topicTitle: string,
  categoryName: string,
  sources: AISourceInput[],
  existingSummary?: string | null,
  brief?: ResearchBrief | null
): AIDraftResult {
  const cleanTitle = topicTitle.trim();
  const entityName = brief?.entity?.name || cleanTitle;
  const entityDesc = brief?.entity?.description || existingSummary || `${entityName} is a verified real-world topic studied within ${categoryName}.`;

  const primarySourceUrl = sources.length > 0
    ? sources[0].url
    : (brief?.sources && brief.sources.length > 0 ? brief.sources[0].url : `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTitle.replace(/\s+/g, '_'))}`);

  const factStatements = brief?.key_facts && brief.key_facts.length > 0
    ? brief.key_facts.map((f) => f.claim)
    : [
        `${entityName} is a documented subject in ${categoryName}.`,
        `Primary research and reference materials provide verifiable evidence for ${entityName}.`,
      ];

  const quickAnswerText = brief?.entity?.description
    ? brief.entity.description
    : `${entityName} is an established real-world topic in ${categoryName}, providing insights through documented facts and primary references.`;

  return {
    title: entityName,
    summary: entityDesc,
    quick_answer: quickAnswerText,
    explanation: `${entityName} represents a well-documented subject in ${categoryName}.\n\n${factStatements.join(' ')}\n\nUnderstanding ${entityName} enables learners to connect empirical observations with verified factual evidence.`,
    key_concepts: [
      { title: `${entityName} Core Overview`, description: `The primary definition and background of ${entityName}.` },
      { title: 'Empirical Research', description: `Key facts and verified data regarding ${entityName}.` },
      { title: 'Educational Significance', description: `Why studying ${entityName} provides valuable insights in ${categoryName}.` },
    ],
    claims: factStatements.map((fact) => ({
      claim_text: fact,
      supporting_source_urls: [primarySourceUrl],
    })),
    suggested_lesson: {
      title: `Understanding ${entityName}`,
      summary: `A 5-minute structured lesson covering ${entityName}.`,
      estimated_minutes: 5,
      sections: [
        {
          title: `1. What is ${entityName}?`,
          content: `${quickAnswerText}`,
          key_takeaway: `${entityName} is defined by documented real-world facts.`,
        },
        {
          title: `2. Key Facts & Findings`,
          content: `${factStatements.join(' ')}`,
          key_takeaway: `Verifiable facts form the foundation of ${entityName}.`,
        },
        {
          title: `3. Broader Context`,
          content: `Studying ${entityName} helps learners connect factual observations with broader concepts in ${categoryName}.`,
          key_takeaway: `Primary sources ensure authentic, trustworthy understanding.`,
        },
      ],
    },
    suggested_quiz: {
      title: `Knowledge Check: ${cleanTitle}`,
      passing_score: 80,
      questions: [
        {
          question: `What is the primary focus when studying ${cleanTitle}?`,
          explanation: `Understanding ${cleanTitle} requires examining its core mechanisms and empirical evidence.`,
          options: [
            { option_text: 'Analyzing its underlying principles and documented mechanisms', is_correct: true },
            { option_text: 'Assuming unverified claims without source evidence', is_correct: false },
            { option_text: 'Ignoring historical and research context', is_correct: false },
            { option_text: 'Focusing exclusively on transient commercial noise', is_correct: false },
          ],
        },
        {
          question: `Why is source verification critical when researching ${cleanTitle}?`,
          explanation: 'Source verification ensures factual accuracy and prevents citation fabrication.',
          options: [
            { option_text: 'To ensure claims are supported by authoritative evidence', is_correct: true },
            { option_text: 'To automatically verify unsupported statements', is_correct: false },
            { option_text: 'To replace human review with unverified AI output', is_correct: false },
            { option_text: 'Source verification is not necessary for learning', is_correct: false },
          ],
        },
        {
          question: `How does ${cleanTitle} connect to broader educational concepts?`,
          explanation: `Subjects like ${cleanTitle} illustrate general principles applicable across related fields.`,
          options: [
            { option_text: 'By demonstrating observable patterns and structural rules', is_correct: true },
            { option_text: 'By existing in isolation from scientific principles', is_correct: false },
            { option_text: 'By relying solely on speculative opinions', is_correct: false },
            { option_text: 'By invalidating empirical data', is_correct: false },
          ],
        },
        {
          question: `What status do newly extracted factual claims hold before review?`,
          explanation: 'All extracted claims remain UNVERIFIED until explicit human review.',
          options: [
            { option_text: 'UNVERIFIED until explicit human editorial review', is_correct: true },
            { option_text: 'SUPPORTED automatically upon generation', is_correct: false },
            { option_text: 'PUBLISHED immediately to public users', is_correct: false },
            { option_text: 'REJECTED by default without review', is_correct: false },
          ],
        },
        {
          question: `What is the role of authoritative sources in Swallern explanations?`,
          explanation: 'Authoritative sources anchor educational explanations in verifiable truth.',
          options: [
            { option_text: 'Providing traceable evidence for claims made in the explanation', is_correct: true },
            { option_text: 'Fabricating URLs for claims without evidence', is_correct: false },
            { option_text: 'Replacing the explanation text entirely', is_correct: false },
            { option_text: 'Preventing learners from checking citations', is_correct: false },
          ],
        },
      ],
    },
    suggested_related_topics: [`Principles of ${categoryName}`, 'Empirical Research Methods'],
  };
}
