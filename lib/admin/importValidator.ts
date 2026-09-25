/**
 * Swallern Topic & Course JSON Importer & Validator (Schema 1.0 & 1.1)
 * Validates untrusted course/topic JSON documents against Swallern learning system rules,
 * word limits, required components, and media placeholders.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { validateSwallernCourse } from '@/lib/learning/validation';

export interface RequiredMediaPlaceholder {
  asset_key: string;
  media_type: 'IMAGE' | 'GIF';
  location: string;
  uploaded_url?: string;
}

export interface ValidatedImportPayload {
  schema_version: string;
  course?: {
    title: string;
    summary: string;
    learning_objective?: string;
    category?: string;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  };
  topic?: {
    title: string;
    slug?: string;
    summary?: string;
    category?: string;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    status?: string;
    featured?: boolean;
  };
  sections?: Array<{
    title: string;
    summary?: string;
    lessons: Array<{
      title: string;
      content: string;
      key_concept?: string;
      media?: Array<{
        type?: string;
        source?: 'url' | 'upload' | 'library';
        url?: string;
        asset_key?: string;
        credit?: string;
        source_url?: string;
      }>;
      knowledge_check?: {
        question: string;
        explanation?: string;
        options: Array<{
          text: string;
          is_correct: boolean;
        }>;
      };
    }>;
  }>;
  final_quiz?: {
    title?: string;
    passing_score?: number;
    questions: Array<{
      question: string;
      explanation?: string;
      options: Array<{
        text: string;
        is_correct: boolean;
      }>;
    }>;
  };
  research?: {
    status?: string;
    researched_at?: string;
    entity?: any;
    key_facts?: Array<{ claim: string; source_ids?: string[] }>;
    current_information?: Array<{ claim: string; as_of?: string; source_ids?: string[] }>;
  };
  sources?: Array<{
    id: string;
    title: string;
    url: string;
    publisher?: string;
    published_at?: string | null;
    accessed_at?: string;
  }>;
  version?: {
    quick_answer?: string;
    explanation?: string;
    key_concepts?: string[];
  };
  lesson?: {
    title: string;
    summary?: string;
    estimated_minutes?: number;
    sections: Array<{
      title: string;
      content: string;
      key_takeaway?: string;
    }>;
  };
  quiz?: {
    title?: string;
    passing_score?: number;
    questions: Array<{
      question: string;
      explanation?: string;
      options: Array<{
        option_text?: string;
        text?: string;
        is_correct: boolean;
      }>;
    }>;
  };
  media?: Array<{
    media_type?: string;
    url?: string;
    asset_key?: string;
    source?: string;
    title?: string;
  }>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  payload?: ValidatedImportPayload;
  requiredMediaUploads?: RequiredMediaPlaceholder[];
}

/**
 * Validates a course/topic JSON string against Swallern learning system rules & DB constraints.
 */
export async function validateTopicJSON(
  jsonText: string,
  supabaseAdmin: SupabaseClient
): Promise<ValidationResult> {
  const errors: string[] = [];

  // 1. JSON Syntax Validation
  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    return {
      valid: false,
      errors: [`Invalid JSON Syntax: ${err instanceof Error ? err.message : 'Parse error'}`],
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      valid: false,
      errors: ['JSON root must be a valid object.'],
    };
  }

  // 2. Schema Version Check
  const ver = parsed.schema_version;
  if (!ver || (ver !== '1.0' && ver !== '1.1')) {
    errors.push(`Missing or invalid property "schema_version" (expected "1.0" or "1.1", received "${ver || 'none'}").`);
  }

  // 3. Centralized Learning Rules & Bite-Sized Limits Validation
  const learningVal = validateSwallernCourse(parsed);
  if (!learningVal.valid) {
    learningVal.errors.forEach((e) => errors.push(e.error));
  }

  // Normalize title & slug check
  const title = parsed.course?.title || parsed.topic?.title || parsed.title;
  const slug = parsed.course?.slug || parsed.topic?.slug || (title ? title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') : undefined);

  if (slug && supabaseAdmin) {
    const { data: existing } = await supabaseAdmin
      .from('topics')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      errors.push(`Slug "${slug}" already exists in the database. Please specify a unique title or slug.`);
    }
  }

  // 4. Detect Media Upload Placeholders
  const requiredMediaUploads: RequiredMediaPlaceholder[] = [];
  const detectedKeys = new Set<string>();

  const checkMediaItem = (m: any, locationStr: string) => {
    if (!m || typeof m !== 'object') return;

    let key: string | null = null;
    if (m.asset_key && typeof m.asset_key === 'string') {
      key = m.asset_key;
    } else if (typeof m.url === 'string' && m.url.startsWith('SWALLERN_UPLOAD:')) {
      key = m.url.replace('SWALLERN_UPLOAD:', '');
    }

    const isUpload = m.source === 'upload' || !!key;

    if (isUpload && key) {
      if (!detectedKeys.has(key)) {
        detectedKeys.add(key);
        const typeStr = (m.type || m.media_type || 'image').toLowerCase();
        const mediaType: 'IMAGE' | 'GIF' = typeStr.includes('gif') ? 'GIF' : 'IMAGE';
        requiredMediaUploads.push({
          asset_key: key,
          media_type: mediaType,
          location: locationStr,
          uploaded_url: m.url && !m.url.startsWith('SWALLERN_UPLOAD:') ? m.url : undefined,
        });
      }
    }
  };

  // Inspect Root Media
  if (Array.isArray(parsed.media)) {
    parsed.media.forEach((m: any, idx: number) => checkMediaItem(m, `media[${idx}]`));
  }

  // Inspect Sections & Lessons Media
  if (Array.isArray(parsed.sections)) {
    parsed.sections.forEach((sec: any, sIdx: number) => {
      if (Array.isArray(sec.lessons)) {
        sec.lessons.forEach((les: any, lIdx: number) => {
          if (Array.isArray(les.media)) {
            les.media.forEach((m: any, mIdx: number) => checkMediaItem(m, `sections[${sIdx}].lessons[${lIdx}].media[${mIdx}]`));
          }
        });
      }
    });
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      requiredMediaUploads,
    };
  }

  return {
    valid: true,
    errors: [],
    payload: parsed as ValidatedImportPayload,
    requiredMediaUploads,
  };
}
