import { createAdminClient } from '@/lib/supabase/admin';
import { TopicContract, KeyConcept, TopicSource, TopicMedia, RelatedTopicRef, LessonData, LessonSectionData, QuizData, QuizQuestionData, QuizOptionData } from './contract';

interface DBTopic {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category_id: string | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  status: string;
  published_version: number | null;
}

interface DBTopicVersion {
  quick_answer: string | null;
  explanation: string | null;
  key_concepts: unknown;
}

interface DBCategory {
  name: string;
  slug: string;
}

interface DBSource {
  id: string;
  title: string;
  publisher: string | null;
  url: string;
  published_at: string | null;
  reliability_score: number | null;
}

interface DBMediaItem {
  id: string;
  media_type: TopicMedia['type'];
  url: string;
  title: string | null;
  channel_or_creator: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
}

/**
 * Static seed topics meeting the Swallern Topic Content Contract
 * Source: Swallern Pre-Implementation Package
 */
export const SEED_TOPICS: Record<string, TopicContract> = {
  'why-is-the-sky-blue': {
    slug: 'why-is-the-sky-blue',
    title: 'Why is the sky blue?',
    summary: 'Sunlight scatters through atmospheric gases via Rayleigh scattering, dispersing shorter blue wavelengths more than other colors.',
    category: {
      name: 'Science',
      slug: 'science',
    },
    difficulty: 'BEGINNER',
    quick_answer: 'The sky is blue because gases in Earth’s atmosphere scatter sunlight in all directions. Blue light is scattered more than other colors because it travels in smaller, shorter waves.',
    key_concepts: [
      {
        title: 'Rayleigh Scattering',
        description: 'The scattering of light by particles much smaller than the wavelength of the light, which affects shorter blue wavelengths most strongly.',
      },
      {
        title: 'Light Spectrum',
        description: 'Visible sunlight is composed of all colors of the rainbow, each traveling at different wavelengths.',
      },
      {
        title: 'Atmospheric Gases',
        description: 'Nitrogen and oxygen in Earth’s atmosphere act as the scattering medium for incoming solar radiation.',
      },
    ],
    explanation: `Sunlight reaches Earth's atmosphere and is scattered in all directions by all the gases and particles in the air. 

Light travels in waves. Some light travels in short, choppy waves, while other light travels in long, lazy waves. Blue light waves are shorter and smaller than red light waves.

Because blue light travels as shorter, smaller waves, it collides with gas molecules in the atmosphere and scatters in every direction more easily than red, yellow, or green light. When we look up at the sky during the day, we see this scattered blue light filling the atmosphere.

At sunset, sunlight passes through a thicker layer of atmosphere. The blue light gets scattered away from our line of sight, allowing longer red and yellow wavelengths to pass directly to our eyes.`,
    sources: [
      {
        id: 's1',
        title: 'Why is the Sky Blue?',
        publisher: 'NASA Space Place',
        url: 'https://spaceplace.nasa.gov/blue-sky/en/',
        reliability_score: 5,
      },
      {
        id: 's2',
        title: 'Rayleigh Scattering and Atmospheric Physics',
        publisher: 'National Oceanic and Atmospheric Administration (NOAA)',
        url: 'https://www.noaa.gov/jetstream/atmosphere',
        reliability_score: 5,
      },
    ],
    related_topics: [
      {
        slug: 'why-do-we-have-seasons',
        title: 'Why do we have seasons?',
        summary: 'Earth’s axial tilt affects solar angle and radiation throughout the year.',
        category: 'Science',
      },
      {
        slug: 'how-do-black-holes-work',
        title: 'How do black holes work?',
        summary: 'Gravitational attraction so dense that light cannot escape the event horizon.',
        category: 'Space',
      },
    ],
    has_lesson: true,
    has_quiz: true,
    last_reviewed_at: '2026-09-21',
  },
  'how-does-the-internet-work': {
    slug: 'how-does-the-internet-work',
    title: 'How does the internet work?',
    summary: 'The internet is a global network of computers connected through standardized TCP/IP protocols that route data in packets across fiber optic cables and routers.',
    category: {
      name: 'Technology',
      slug: 'technology',
    },
    difficulty: 'BEGINNER',
    quick_answer: 'The internet works by breaking digital information into small data packets, addressing them with IP addresses, and routing them across global interconnected networks using standardized TCP/IP protocols.',
    key_concepts: [
      {
        title: 'Packet Switching',
        description: 'Breaking large messages into small data chunks that travel independently through network routes before reassembling at the destination.',
      },
      {
        title: 'IP Addressing & DNS',
        description: 'The Domain Name System translates human-readable names (like swallern.com) into numerical IP addresses that direct network traffic.',
      },
      {
        title: 'TCP/IP Protocol Suite',
        description: 'The standard set of communication protocols that establish connections, verify data integrity, and route internet traffic globally.',
      },
    ],
    explanation: `The internet is not a single physical entity, but a global network of networks. When you request a webpage or send a message, your device communicates with a local server, which forwards your request through a chain of interconnected networks.

Data sent across the internet is divided into small pieces called packets. Each packet contains a payload (the data being sent) and a header containing destination and source IP addresses. Routers along the path inspect packet headers and determine the fastest available path across fiber-optic cables, satellite links, and wireless towers.

When all packets arrive at their destination, the receiving device uses the Transmission Control Protocol (TCP) to reassemble them in the correct order, requesting any missing packets to ensure complete delivery.`,
    sources: [
      {
        id: 's1',
        title: 'How the Internet Works',
        publisher: 'Mozilla Developer Network (MDN)',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work',
        reliability_score: 5,
      },
      {
        id: 's2',
        title: 'Internet Protocol Suite (RFC 1122)',
        publisher: 'Internet Engineering Task Force (IETF)',
        url: 'https://www.ietf.org/rfc/rfc1122.txt',
        reliability_score: 5,
      },
    ],
    related_topics: [
      {
        slug: 'what-is-artificial-intelligence',
        title: 'What is artificial intelligence?',
        summary: 'Simulation of human intelligence processes by computer systems.',
        category: 'Technology',
      },
      {
        slug: 'how-does-gps-work',
        title: 'How does GPS work?',
        summary: 'Trilateration signals broadcast from satellite constellations.',
        category: 'Technology',
      },
    ],
    has_lesson: true,
    has_quiz: true,
    last_reviewed_at: '2026-09-21',
  },
  'fat-bear-week-voting': {
    slug: 'fat-bear-week-voting',
    title: 'Fat Bear Week & Ecosystem Ecology',
    summary: 'How Katmai brown bears undergo hyperphagia to survive winter hibernation, and why ecological conservation matters.',
    category: {
      name: 'Nature',
      slug: 'nature',
    },
    difficulty: 'BEGINNER',
    quick_answer: 'Fat Bear Week is an annual event celebrating Katmai National Park brown bears undergoing hyperphagia to build fat stores necessary for winter hibernation.',
    key_concepts: [
      {
        title: 'Hyperphagia',
        description: 'A physiological state of extreme eating that allows bears to pack on hundreds of pounds of fat for hibernation.',
      },
      {
        title: 'Ecosystem Keystone Species',
        description: 'Brown bears transfer oceanic nitrogen into terrestrial forest ecosystems through sockeye salmon consumption.',
      },
    ],
    explanation: `Fat Bear Week celebrates the resilience and survival biology of brown bears at Brooks River in Katmai National Park, Alaska.
    
During late summer and autumn, bears experience hyperphagia, an insatiable drive to feed almost constantly. They consume tens of thousands of calories daily from sockeye salmon to accumulate critical fat reserves. Without sufficient fat, bears cannot survive several months of winter torpor.`,
    sources: [
      {
        id: 's1',
        title: 'Katmai National Park: Brown Bears',
        publisher: 'National Park Service',
        url: 'https://www.nps.gov/katm/learn/nature/brown-bears.htm',
        reliability_score: 5,
      },
    ],
    related_topics: [
      {
        slug: 'why-do-we-have-seasons',
        title: 'Why do we have seasons?',
        summary: 'Earth’s axial tilt affects solar angle and hibernation triggers.',
        category: 'Science',
      },
    ],
    has_lesson: true,
    has_quiz: true,
    last_reviewed_at: '2026-09-21',
  },
  'quantum-computing-explained': {
    slug: 'quantum-computing-explained',
    title: 'Quantum Computing Fundamentals',
    summary: 'Understanding qubits, superposition, and quantum entanglement in modern physics and computational theory.',
    category: {
      name: 'Technology',
      slug: 'technology',
    },
    difficulty: 'INTERMEDIATE',
    quick_answer: 'Quantum computers use quantum bits (qubits) that can exist in superpositions of 0 and 1, enabling exponential processing capability for complex algorithms.',
    key_concepts: [
      {
        title: 'Qubits & Superposition',
        description: 'Unlike classical bits that are strictly 0 or 1, qubits can represent linear combinations of states simultaneously.',
      },
      {
        title: 'Quantum Entanglement',
        description: 'A phenomenon where the quantum state of pairs or groups of particles cannot be described independently.',
      },
    ],
    explanation: `Classical computers manipulate electrical voltages representing definite binary 0s or 1s. Quantum computers harness quantum mechanics to process information fundamentally differently.
    
Through superposition, a quantum algorithm evaluates vast spaces of possible solutions at once. When coupled with quantum interference and entanglement, quantum computers can solve specific classes of problems in chemistry, materials science, and cryptography exponentially faster than classical supercomputers.`,
    sources: [
      {
        id: 's1',
        title: 'Quantum Computation and Quantum Information',
        publisher: 'Cambridge University Press',
        url: 'https://www.cambridge.org',
        reliability_score: 5,
      },
    ],
    related_topics: [
      {
        slug: 'how-does-the-internet-work',
        title: 'How does the internet work?',
        summary: 'Global networks and classical communication protocols.',
        category: 'Technology',
      },
    ],
    has_lesson: true,
    has_quiz: true,
    last_reviewed_at: '2026-09-21',
  },
  'black-hole-physics': {
    slug: 'black-hole-physics',
    title: 'How Black Holes Form',
    summary: 'When massive stars exhaust nuclear fuel, gravitational collapse crushes matter past the event horizon.',
    category: {
      name: 'Space',
      slug: 'space',
    },
    difficulty: 'BEGINNER',
    quick_answer: 'Black holes form when massive stars run out of nuclear fuel and collapse under their own intense gravity, concentrating mass into an inescapable gravitational singularity.',
    key_concepts: [
      {
        title: 'Gravitational Collapse',
        description: 'When radiation pressure ceases to counteract inward gravitational pull, core collapse becomes catastrophic.',
      },
      {
        title: 'Event Horizon',
        description: 'The boundary around a black hole beyond which the escape velocity exceeds the speed of light.',
      },
    ],
    explanation: `Throughout a star's lifecycle, the outward explosive pressure of nuclear fusion balances the inward compressive force of its own gravity.
    
When a star with at least 8 to 20 times the mass of the Sun exhausts its nuclear fuel, fusion stops. Gravity instantly wins. The core collapses in fractions of a second, causing a supernova explosion while leaving behind a stellar-mass black hole.`,
    sources: [
      {
        id: 's1',
        title: 'Black Holes Overview',
        publisher: 'NASA Astrophysics',
        url: 'https://science.nasa.gov/astrophysics/focus-areas/black-holes',
        reliability_score: 5,
      },
    ],
    related_topics: [
      {
        slug: 'why-is-the-sky-blue',
        title: 'Why is the sky blue?',
        summary: 'How light waves travel through spacetime and matter.',
        category: 'Science',
      },
    ],
    has_lesson: true,
    has_quiz: true,
    last_reviewed_at: '2026-09-21',
  },
  'neuroscience-of-memory': {
    slug: 'neuroscience-of-memory',
    title: 'The Neuroscience of Memory',
    summary: 'How the hippocampus encodes experiences into long-term memory through synaptic consolidation and neuroplasticity.',
    category: {
      name: 'Psychology',
      slug: 'psychology',
    },
    difficulty: 'BEGINNER',
    quick_answer: 'Memories are encoded when synaptic connections between neurons strengthen in the hippocampus and are later consolidated into neocortical circuits.',
    key_concepts: [
      {
        title: 'Long-Term Potentiation (LTP)',
        description: 'The persistent strengthening of synapses based on recent patterns of neural activity.',
      },
      {
        title: 'Hippocampal Consolidation',
        description: 'The transfer of short-term representations from the hippocampus into distributed neocortical storage networks.',
      },
    ],
    explanation: `Human memory is not stored like files in a computer directory, but as distributed patterns of interconnected neuron firing across the brain.
    
When you experience something memorable, sensory inputs activate specific neural circuits. The hippocampus coordinates this activity, inducing long-term potentiation to strengthen synaptic connections. During sleep, memories are replayed and consolidated into the cerebral cortex for durable recall.`,
    sources: [
      {
        id: 's1',
        title: 'Principles of Neural Science',
        publisher: 'McGraw-Hill Medical',
        url: 'https://accessmedicine.mhmedical.com',
        reliability_score: 5,
      },
    ],
    related_topics: [
      {
        slug: 'fat-bear-week-voting',
        title: 'Fat Bear Week & Ecosystem Ecology',
        summary: 'Instinct and animal memory in natural environments.',
        category: 'Nature',
      },
    ],
    has_lesson: true,
    has_quiz: true,
    last_reviewed_at: '2026-09-21',
  },
  'why-do-we-have-seasons': {
    slug: 'why-do-we-have-seasons',
    title: 'Why do we have seasons?',
    summary: 'Earth’s 23.5 degree axial tilt alters solar angle and daylight duration throughout the annual orbit.',
    category: {
      name: 'Science',
      slug: 'science',
    },
    difficulty: 'BEGINNER',
    quick_answer: 'We have seasons because Earth is tilted on its axis by 23.5 degrees as it orbits the Sun, varying the concentration and duration of sunlight hitting each hemisphere.',
    key_concepts: [
      {
        title: 'Axial Tilt',
        description: 'Earth rotates on an axis tilted approximately 23.5 degrees relative to its orbital plane around the Sun.',
      },
      {
        title: 'Solar Angle of Incidence',
        description: 'Steeper angles concentrate sunlight onto smaller surface areas, producing warmer summer temperatures.',
      },
    ],
    explanation: `Many people mistakenly assume Earth is closer to the Sun in summer and farther in winter. In reality, Earth’s distance from the Sun changes very little.
    
Seasons are caused entirely by Earth's 23.5-degree axial tilt. When the Northern Hemisphere tilts toward the Sun, solar rays hit the surface directly at a high angle, and days are longer, creating summer. Six months later, as Earth orbits to the opposite side of the Sun, the Northern Hemisphere tilts away, receiving indirect rays and shorter daylight hours, producing winter.`,
    sources: [
      {
        id: 's1',
        title: 'What Causes the Seasons?',
        publisher: 'NASA Space Place',
        url: 'https://spaceplace.nasa.gov/seasons/en/',
        reliability_score: 5,
      },
    ],
    related_topics: [
      {
        slug: 'why-is-the-sky-blue',
        title: 'Why is the sky blue?',
        summary: 'Solar radiation scattering in Earth’s atmosphere.',
        category: 'Science',
      },
    ],
    has_lesson: true,
    has_quiz: true,
    last_reviewed_at: '2026-09-21',
  },
};

function getStaticFallbackTopic(slug: string): TopicContract | null {
  return SEED_TOPICS[slug] || null;
}

/**
 * Retrieves a published topic from Supabase database by slug.
 * Filters strictly for PUBLISHED or UPDATED status.
 * Falls back safely to verified static seed topic if database query returns no published record.
 */
export async function getPublishedTopicBySlug(slug: string): Promise<TopicContract | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  try {
    const supabase = createAdminClient();

    // Query published topic
    const { data: rawTopic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', normalizedSlug)
      .in('status', ['PUBLISHED', 'UPDATED'])
      .maybeSingle();

    if (topicError || !rawTopic) {
      return getStaticFallbackTopic(normalizedSlug);
    }

    // Server Security Check for User-Created Topics:
    // User topics are accessible via /topics/[slug] ONLY if approved, published, and public.
    if (rawTopic.user_id) {
      const isApproved = rawTopic.approval_status === 'APPROVED';
      const isPublished = rawTopic.publication_status === 'PUBLISHED';
      const isPublic = rawTopic.visibility === 'PUBLIC' || !rawTopic.visibility;

      if (!isApproved || !isPublished || !isPublic) {
        return getStaticFallbackTopic(normalizedSlug);
      }
    }

    const topicData = rawTopic as unknown as DBTopic;
    const topicId = topicData.id;
    const publishedVer = topicData.published_version || 1;

    // Fetch category
    let categoryName = 'General';
    let categorySlug = 'general';

    if (topicData.category_id) {
      const { data: rawCat } = await supabase
        .from('categories')
        .select('name, slug')
        .eq('id', topicData.category_id)
        .maybeSingle();

      if (rawCat) {
        const cat = rawCat as unknown as DBCategory;
        categoryName = cat.name;
        categorySlug = cat.slug;
      }
    }

    // Fetch published version content
    const { data: rawVer } = await supabase
      .from('topic_versions')
      .select('quick_answer, explanation, key_concepts')
      .eq('topic_id', topicId)
      .eq('version', publishedVer)
      .maybeSingle();

    const versionData = rawVer as unknown as DBTopicVersion | null;

    // Fetch topic sources
    const { data: rawTopicSources } = await supabase
      .from('topic_sources')
      .select('source_id')
      .eq('topic_id', topicId);

    const sources: TopicSource[] = [];
    const topicSources = (rawTopicSources || []) as unknown as { source_id: string }[];

    if (topicSources.length > 0) {
      const sourceIds = topicSources.map((ts) => ts.source_id);
      const { data: rawSources } = await supabase
        .from('sources')
        .select('id, title, publisher, url, published_at, reliability_score, source_type, accessed_at')
        .in('id', sourceIds);

      if (rawSources) {
        (rawSources as unknown as (DBSource & { source_type: string | null; accessed_at: string | null })[]).forEach((s) => {
          sources.push({
            id: s.id,
            title: s.title,
            publisher: s.publisher || undefined,
            url: s.url,
            published_at: s.published_at || undefined,
            reliability_score: s.reliability_score || undefined,
            source_type: (s.source_type as TopicSource['source_type']) || undefined,
            accessed_at: s.accessed_at || undefined,
          });
        });
      }
    }

    // Fetch media items
    const { data: rawMedia } = await supabase
      .from('media_items')
      .select('id, media_type, url, title, channel_or_creator, duration_seconds, thumbnail_url')
      .eq('topic_id', topicId)
      .order('order_index', { ascending: true });

    const media: TopicMedia[] = ((rawMedia || []) as unknown as DBMediaItem[]).map((m) => ({
      id: m.id,
      type: m.media_type,
      url: m.url,
      title: m.title || undefined,
      channel_or_creator: m.channel_or_creator || undefined,
      duration_seconds: m.duration_seconds || undefined,
      thumbnail_url: m.thumbnail_url || undefined,
    }));

    // Fetch related topics (only published ones)
    const { data: rawRels } = await supabase
      .from('topic_relationships')
      .select('to_topic_id')
      .eq('from_topic_id', topicId);

    const relatedTopics: RelatedTopicRef[] = [];
    const rels = (rawRels || []) as unknown as { to_topic_id: string }[];

    if (rels.length > 0) {
      const targetIds = rels.map((r) => r.to_topic_id);
      const { data: rawRelTopics } = await supabase
        .from('topics')
        .select('slug, title, summary, category_id, status')
        .in('id', targetIds)
        .in('status', ['PUBLISHED', 'UPDATED']);

      if (rawRelTopics) {
        for (const rt of rawRelTopics as unknown as DBTopic[]) {
          let rtCategoryName = undefined;
          if (rt.category_id) {
            const { data: rtCat } = await supabase
              .from('categories')
              .select('name')
              .eq('id', rt.category_id)
              .maybeSingle();
            if (rtCat) rtCategoryName = (rtCat as unknown as DBCategory).name;
          }
          relatedTopics.push({
            slug: rt.slug,
            title: rt.title,
            summary: rt.summary || undefined,
            category: rtCategoryName,
          });
        }
      }
    }

    // Fetch lesson & sections if available
    let lessonData: LessonData | undefined = undefined;
    const { data: rawLesson } = await supabase
      .from('lessons')
      .select('id, title, summary, estimated_minutes')
      .eq('topic_id', topicId)
      .maybeSingle();

    if (rawLesson) {
      const { data: rawSections } = await supabase
        .from('lesson_sections')
        .select('id, title, content, key_takeaway, order_index')
        .eq('lesson_id', rawLesson.id)
        .order('order_index', { ascending: true });

      lessonData = {
        id: rawLesson.id,
        topic_id: topicId,
        title: rawLesson.title,
        summary: rawLesson.summary || undefined,
        estimated_minutes: rawLesson.estimated_minutes || 3,
        sections: (rawSections || []) as unknown as LessonSectionData[],
      };
    }

    // Fetch quiz & questions & options if available
    let quizData: QuizData | undefined = undefined;
    const { data: rawQuiz } = await supabase
      .from('quizzes')
      .select('id, title, passing_score')
      .eq('topic_id', topicId)
      .maybeSingle();

    if (rawQuiz) {
      const { data: rawQuestions } = await supabase
        .from('quiz_questions')
        .select('id, question, explanation, order_index')
        .eq('quiz_id', rawQuiz.id)
        .order('order_index', { ascending: true });

      const questions: QuizQuestionData[] = [];
      if (rawQuestions) {
        for (const q of rawQuestions) {
          const { data: rawOpts } = await supabase
            .from('quiz_options')
            .select('id, option_text, is_correct, order_index')
            .eq('question_id', q.id)
            .order('order_index', { ascending: true });

          questions.push({
            id: q.id,
            question: q.question,
            explanation: q.explanation,
            order_index: q.order_index,
            options: (rawOpts || []) as unknown as QuizOptionData[],
          });
        }
      }

      quizData = {
        id: rawQuiz.id,
        topic_id: topicId,
        title: rawQuiz.title,
        passing_score: rawQuiz.passing_score || 80,
        questions,
      };
    }

    return {
      id: topicData.id,
      slug: topicData.slug,
      title: topicData.title,
      summary: topicData.summary || '',
      category: {
        name: categoryName,
        slug: categorySlug,
      },
      difficulty: (topicData.difficulty as TopicContract['difficulty']) || 'BEGINNER',
      quick_answer: versionData?.quick_answer || topicData.summary || '',
      key_concepts: (versionData?.key_concepts as unknown as KeyConcept[]) || [],
      explanation: versionData?.explanation || '',
      sources,
      media,
      related_topics: relatedTopics,
      has_lesson: !!lessonData && lessonData.sections.length > 0,
      has_quiz: !!quizData && quizData.questions.length > 0,
      lesson: lessonData,
      quiz: quizData,
    };
  } catch {
    // Fail gracefully without leaking internal database errors
    return getStaticFallbackTopic(normalizedSlug);
  }
}

/**
 * Backward compatible alias for getPublishedTopicBySlug
 */
export async function getTopicBySlug(slug: string): Promise<TopicContract | null> {
  return getPublishedTopicBySlug(slug);
}

export interface TopicSearchResult {
  slug: string;
  title: string;
  summary: string;
  category: {
    name: string;
    slug: string;
  };
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

/**
 * Searches published topics in Supabase database by query string.
 * Strictly filters for status IN ('PUBLISHED', 'UPDATED').
 * Returns structured search results with graceful error handling.
 */
export async function searchPublishedTopics(query: string): Promise<{
  results: TopicSearchResult[];
  error?: string;
}> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { results: [] };
  }

  try {
    const supabase = createAdminClient();
    const searchPattern = `%${cleanQuery}%`;

    // Primary search across title, summary, slug
    const { data: rawTopics, error: searchError } = await supabase
      .from('topics')
      .select('id, slug, title, summary, difficulty, category_id, status')
      .in('status', ['PUBLISHED', 'UPDATED'])
      .or(`title.ilike.${searchPattern},summary.ilike.${searchPattern},slug.ilike.${searchPattern}`);

    if (searchError) {
      console.error('Supabase search error:', searchError.message);
      return { results: [], error: 'Unable to perform search due to a database error.' };
    }

    let matchedTopics = rawTopics || [];

    // Fallback: If exact phrase match returned 0 results and query is multi-word, search key terms
    if (matchedTopics.length === 0 && cleanQuery.includes(' ')) {
      const words = cleanQuery
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !['the', 'how', 'what', 'why', 'does', 'work', 'with', 'from', 'have', 'need'].includes(w));

      if (words.length > 0) {
        const wordOrClause = words
          .flatMap((w) => [`title.ilike.%${w}%`, `summary.ilike.%${w}%`])
          .join(',');

        const { data: keywordTopics, error: kwError } = await supabase
          .from('topics')
          .select('id, slug, title, summary, difficulty, category_id, status')
          .in('status', ['PUBLISHED', 'UPDATED'])
          .or(wordOrClause);

        if (!kwError && keywordTopics) {
          matchedTopics = keywordTopics;
        }
      }
    }

    if (matchedTopics.length === 0) {
      // Check static fallback topics if DB search returned 0
      const lowerQ = cleanQuery.toLowerCase();
      const staticMatches = Object.values(SEED_TOPICS).filter((t) => {
        return (
          t.title.toLowerCase().includes(lowerQ) ||
          t.summary.toLowerCase().includes(lowerQ) ||
          t.slug.toLowerCase().includes(lowerQ)
        );
      });

      if (staticMatches.length > 0) {
        return {
          results: staticMatches.map((t) => ({
            slug: t.slug,
            title: t.title,
            summary: t.summary,
            category: t.category,
            difficulty: t.difficulty,
          })),
        };
      }

      return { results: [] };
    }

    // Map matched topics to search result contract
    const results: TopicSearchResult[] = [];
    for (const t of matchedTopics) {
      let categoryName = 'General';
      let categorySlug = 'general';

      if (t.category_id) {
        const { data: catData } = await supabase
          .from('categories')
          .select('name, slug')
          .eq('id', t.category_id)
          .maybeSingle();

        if (catData) {
          categoryName = (catData as unknown as DBCategory).name;
          categorySlug = (catData as unknown as DBCategory).slug;
        }
      }

      results.push({
        slug: t.slug,
        title: t.title,
        summary: t.summary || '',
        category: {
          name: categoryName,
          slug: categorySlug,
        },
        difficulty: (t.difficulty as TopicSearchResult['difficulty']) || 'BEGINNER',
      });
    }

    return { results };
  } catch {
    return { results: [], error: 'An unexpected error occurred while processing your search request.' };
  }
}

export interface CategoryInfo {
  id?: string;
  name: string;
  slug: string;
  description?: string;
}

/**
 * Retrieves all categories from Supabase database.
 */
export async function getPublishedCategories(): Promise<CategoryInfo[]> {
  try {
    const supabase = createAdminClient();
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, description')
      .order('name', { ascending: true });

    if (error || !categories) {
      return [
        { name: 'Science', slug: 'science', description: 'Explore natural phenomena, physics, chemistry, and scientific discoveries.' },
        { name: 'Technology', slug: 'technology', description: 'Computing, artificial intelligence, networks, and engineering.' },
        { name: 'Space', slug: 'space', description: 'Cosmology, stars, black holes, astrophysics, and space exploration.' },
        { name: 'History', slug: 'history', description: 'Pivotal events, ancient civilizations, revolutions, and world history.' },
        { name: 'Mathematics', slug: 'mathematics', description: 'Numbers, logic, geometry, patterns, and mathematical concepts.' },
        { name: 'Psychology', slug: 'psychology', description: 'Human cognition, memory, behavior, habits, and perception.' },
        { name: 'Economics', slug: 'economics', description: 'Markets, financial systems, money, trade, and economic principles.' },
        { name: 'Nature', slug: 'nature', description: 'Ecosystems, animal behavior, botany, and biodiversity.' },
        { name: 'Health & Biology', slug: 'health-biology', description: 'Human physiology, genetics, immunology, and medicine.' },
        { name: 'Culture & Society', slug: 'culture-society', description: 'Languages, traditions, human societies, and social structures.' },
      ];
    }

    return categories as CategoryInfo[];
  } catch {
    return [];
  }
}

export interface ExploreTopicsResult {
  topics: TopicSearchResult[];
  activeCategory?: CategoryInfo;
  isUnknownCategory?: boolean;
}

/**
 * Retrieves published topics for the Explore page, optionally filtered by category slug.
 */
export async function getExploreTopics(
  categorySlug?: string,
  searchQuery?: string
): Promise<ExploreTopicsResult> {
  const cleanCatSlug = categorySlug?.trim().toLowerCase();
  const cleanSearchQuery = searchQuery?.trim();

  try {
    const supabase = createAdminClient();

    let targetCategoryId: string | undefined = undefined;
    let activeCategory: CategoryInfo | undefined = undefined;

    if (cleanCatSlug) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .eq('slug', cleanCatSlug)
        .maybeSingle();

      if (!catData) {
        return {
          topics: [],
          isUnknownCategory: true,
        };
      }

      targetCategoryId = catData.id;
      activeCategory = catData as CategoryInfo;
    }

    // Build query for published topics
    let query = supabase
      .from('topics')
      .select('id, slug, title, summary, difficulty, category_id, status')
      .in('status', ['PUBLISHED', 'UPDATED']);

    if (targetCategoryId) {
      query = query.eq('category_id', targetCategoryId);
    }

    if (cleanSearchQuery) {
      const searchPattern = `%${cleanSearchQuery}%`;
      query = query.or(`title.ilike.${searchPattern},summary.ilike.${searchPattern},slug.ilike.${searchPattern}`);
    }

    const { data: rawTopics, error } = await query;

    const topics: TopicSearchResult[] = [];

    if (!error && rawTopics && rawTopics.length > 0) {
      for (const t of rawTopics as DBTopic[]) {
        let catName = activeCategory?.name || 'General';
        let catSlug = activeCategory?.slug || 'general';

        if (!activeCategory && t.category_id) {
          const { data: catData } = await supabase
            .from('categories')
            .select('name, slug')
            .eq('id', t.category_id)
            .maybeSingle();

          if (catData) {
            catName = (catData as unknown as DBCategory).name;
            catSlug = (catData as unknown as DBCategory).slug;
          }
        }

        topics.push({
          slug: t.slug,
          title: t.title,
          summary: t.summary || '',
          category: {
            name: catName,
            slug: catSlug,
          },
          difficulty: (t.difficulty as TopicSearchResult['difficulty']) || 'BEGINNER',
        });
      }
    }

    // Fallback: If DB returned 0 topics, check static SEED_TOPICS
    if (topics.length === 0) {
      const lowerQ = cleanSearchQuery?.toLowerCase();
      const fallbackList = Object.values(SEED_TOPICS).filter((t) => {
        const matchesCategory = !cleanCatSlug || t.category.slug.toLowerCase() === cleanCatSlug;
        const matchesSearch =
          !lowerQ ||
          t.title.toLowerCase().includes(lowerQ) ||
          t.summary.toLowerCase().includes(lowerQ) ||
          t.slug.toLowerCase().includes(lowerQ);
        return matchesCategory && matchesSearch;
      });

      if (fallbackList.length > 0) {
        return {
          topics: fallbackList.map((t) => ({
            slug: t.slug,
            title: t.title,
            summary: t.summary,
            category: t.category,
            difficulty: t.difficulty,
          })),
          activeCategory,
        };
      }
    }

    return { topics, activeCategory };
  } catch {
    // Error fallback to SEED_TOPICS
    const lowerQ = cleanSearchQuery?.toLowerCase();
    const fallbackList = Object.values(SEED_TOPICS).filter((t) => {
      const matchesCategory = !cleanCatSlug || t.category.slug.toLowerCase() === cleanCatSlug;
      const matchesSearch =
        !lowerQ ||
        t.title.toLowerCase().includes(lowerQ) ||
        t.summary.toLowerCase().includes(lowerQ) ||
        t.slug.toLowerCase().includes(lowerQ);
      return matchesCategory && matchesSearch;
    });

    return {
      topics: fallbackList.map((t) => ({
        slug: t.slug,
        title: t.title,
        summary: t.summary,
        category: t.category,
        difficulty: t.difficulty,
      })),
    };
  }
}


