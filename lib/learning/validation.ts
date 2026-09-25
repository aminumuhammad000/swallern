/**
 * Swallern Centralized Learning Rules & Word Count Validation Engine
 * Authoritative validator used by:
 * - Manual Course Builder
 * - JSON Course Importer
 * - Server API Route handlers
 * - AI Content Generator
 * - Admin Moderation Review
 */

export interface WordLimitConfig {
  minWords: number;
  maxWords: number;
  label: string;
}

export const SWALLERN_CONTENT_LIMITS: Record<string, WordLimitConfig> = {
  courseTitle: {
    minWords: 2,
    maxWords: 12,
    label: 'Course Title',
  },
  courseSummary: {
    minWords: 15,
    maxWords: 50,
    label: 'Course Summary',
  },
  sectionTitle: {
    minWords: 2,
    maxWords: 10,
    label: 'Section Title',
  },
  sectionSummary: {
    minWords: 10,
    maxWords: 45,
    label: 'Section Intro / Summary',
  },
  lessonTitle: {
    minWords: 2,
    maxWords: 12,
    label: 'Lesson Title',
  },
  lessonExplanation: {
    minWords: 30,
    maxWords: 120,
    label: 'Bite-Sized Lesson Explanation',
  },
  keyConcept: {
    minWords: 5,
    maxWords: 30,
    label: 'Key Concept',
  },
  quickAnswer: {
    minWords: 10,
    maxWords: 40,
    label: 'Quick Answer',
  },
  quizQuestion: {
    minWords: 5,
    maxWords: 25,
    label: 'Knowledge Check Question',
  },
  quizExplanation: {
    minWords: 5,
    maxWords: 35,
    label: 'Knowledge Check Explanation',
  },
};

/**
 * Reliable word count calculation.
 * Handles multiline breaks, multiple spaces, punctuation, unicode, empty strings.
 */
export function countWords(text: string | null | undefined): number {
  if (!text || typeof text !== 'string') return 0;

  const trimmed = text.trim();
  if (!trimmed) return 0;

  // Replace newlines/tabs with space and split by whitespace
  const words = trimmed
    .replace(/[\r\n\t]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length > 0);

  return words.length;
}

export interface FieldValidationInfo {
  count: number;
  min: number;
  max: number;
  valid: boolean;
  status: 'below_min' | 'within_range' | 'above_max';
  message: string;
}

/**
 * Validates a text string against a specific field limit configuration.
 */
export function validateFieldWordCount(
  text: string | null | undefined,
  fieldKey: keyof typeof SWALLERN_CONTENT_LIMITS
): FieldValidationInfo {
  const config = SWALLERN_CONTENT_LIMITS[fieldKey];
  const count = countWords(text);

  if (count < config.minWords) {
    const diff = config.minWords - count;
    return {
      count,
      min: config.minWords,
      max: config.maxWords,
      valid: false,
      status: 'below_min',
      message: `${config.label} is too short (${count}/${config.maxWords} words). Please add at least ${diff} more word${diff === 1 ? '' : 's'}.`,
    };
  }

  if (count > config.maxWords) {
    const excess = count - config.maxWords;
    return {
      count,
      min: config.minWords,
      max: config.maxWords,
      valid: false,
      status: 'above_max',
      message: `${config.label} exceeds bite-sized limit (${count}/${config.maxWords} words). Please reduce by ${excess} word${excess === 1 ? '' : 's'}.`,
    };
  }

  return {
    count,
    min: config.minWords,
    max: config.maxWords,
    valid: true,
    status: 'within_range',
    message: `✓ Within Swallern bite-size limit (${count}/${config.maxWords} words)`,
  };
}

export interface StructuralValidationError {
  path: string;
  field: string;
  error: string;
}

export interface CourseValidationResult {
  valid: boolean;
  errors: StructuralValidationError[];
  countsSummary: {
    sections: number;
    lessons: number;
    knowledgeChecks: number;
    quizzes: number;
    mediaItems: number;
  };
}

/**
 * Authoritative course structure and bite-sized limit validator.
 */
export function validateSwallernCourse(courseDoc: any): CourseValidationResult {
  const errors: StructuralValidationError[] = [];
  let sectionsCount = 0;
  let lessonsCount = 0;
  let knowledgeChecksCount = 0;
  let quizzesCount = 0;
  let mediaItemsCount = 0;

  if (!courseDoc || typeof courseDoc !== 'object') {
    return {
      valid: false,
      errors: [{ path: 'root', field: 'root', error: 'Course document must be an object.' }],
      countsSummary: { sections: 0, lessons: 0, knowledgeChecks: 0, quizzes: 0, mediaItems: 0 },
    };
  }

  // 1. Course Metadata Validation
  const courseMeta = courseDoc.course || courseDoc.topic || courseDoc;
  if (!courseMeta || typeof courseMeta !== 'object') {
    errors.push({ path: 'course', field: 'course', error: 'Missing course metadata object.' });
  } else {
    // Title
    const titleVal = validateFieldWordCount(courseMeta.title, 'courseTitle');
    if (!titleVal.valid) {
      errors.push({ path: 'course.title', field: 'title', error: titleVal.message });
    }

    // Summary
    const summaryVal = validateFieldWordCount(courseMeta.summary, 'courseSummary');
    if (!summaryVal.valid) {
      errors.push({ path: 'course.summary', field: 'summary', error: summaryVal.message });
    }
  }

  // 2. Sections & Lessons Validation
  const sectionsList = courseDoc.sections || (courseDoc.lesson?.sections ? [{ title: courseDoc.lesson.title || 'Main Section', lessons: [courseDoc.lesson] }] : []);

  if (!Array.isArray(sectionsList) || sectionsList.length === 0) {
    errors.push({
      path: 'sections',
      field: 'sections',
      error: 'Swallern course requires at least 1 section module.',
    });
  } else {
    sectionsCount = sectionsList.length;

    sectionsList.forEach((sec: any, secIdx: number) => {
      const secPath = `sections[${secIdx}]`;
      if (!sec.title || typeof sec.title !== 'string') {
        errors.push({ path: `${secPath}.title`, field: 'title', error: `Section ${secIdx + 1} title is required.` });
      } else {
        const secTitleVal = validateFieldWordCount(sec.title, 'sectionTitle');
        if (!secTitleVal.valid) {
          errors.push({ path: `${secPath}.title`, field: 'title', error: secTitleVal.message });
        }
      }

      // Lessons inside section
      const lessonsList = sec.lessons || (sec.content ? [{ title: sec.title, content: sec.content, key_concept: sec.key_takeaway }] : []);

      if (!Array.isArray(lessonsList) || lessonsList.length === 0) {
        errors.push({
          path: `${secPath}.lessons`,
          field: 'lessons',
          error: `Section ${secIdx + 1} must contain at least 1 lesson.`,
        });
      } else {
        lessonsCount += lessonsList.length;

        lessonsList.forEach((les: any, lesIdx: number) => {
          const lesPath = `${secPath}.lessons[${lesIdx}]`;

          // Lesson Title
          const lesTitleVal = validateFieldWordCount(les.title, 'lessonTitle');
          if (!lesTitleVal.valid) {
            errors.push({ path: `${lesPath}.title`, field: 'title', error: lesTitleVal.message });
          }

          // Lesson Explanation / Content
          const expText = les.content || les.explanation;
          const expVal = validateFieldWordCount(expText, 'lessonExplanation');
          if (!expVal.valid) {
            errors.push({ path: `${lesPath}.explanation`, field: 'explanation', error: expVal.message });
          }

          // Key Concept
          if (les.key_concept || les.key_takeaway) {
            const kcVal = validateFieldWordCount(les.key_concept || les.key_takeaway, 'keyConcept');
            if (!kcVal.valid) {
              errors.push({ path: `${lesPath}.key_concept`, field: 'key_concept', error: kcVal.message });
            }
          }

          // Knowledge Check Validation
          const kc = les.knowledge_check || les.quiz_question;
          if (!kc) {
            errors.push({
              path: `${lesPath}.knowledge_check`,
              field: 'knowledge_check',
              error: `Lesson "${les.title || lesIdx + 1}" requires an interactive knowledge check question.`,
            });
          } else {
            knowledgeChecksCount++;
            const qVal = validateFieldWordCount(kc.question, 'quizQuestion');
            if (!qVal.valid) {
              errors.push({ path: `${lesPath}.knowledge_check.question`, field: 'question', error: qVal.message });
            }

            if (!kc.options || !Array.isArray(kc.options) || kc.options.length < 2) {
              errors.push({
                path: `${lesPath}.knowledge_check.options`,
                field: 'options',
                error: `Knowledge check in lesson "${les.title || lesIdx + 1}" must contain at least 2 options.`,
              });
            } else {
              const hasCorrect = kc.options.some((o: any) => (typeof o === 'object' ? o.is_correct === true : false));
              if (!hasCorrect) {
                errors.push({
                  path: `${lesPath}.knowledge_check.options`,
                  field: 'options',
                  error: `Knowledge check in lesson "${les.title || lesIdx + 1}" must have at least one correct option.`,
                });
              }
            }

            if (kc.explanation) {
              const kcExpVal = validateFieldWordCount(kc.explanation, 'quizExplanation');
              if (!kcExpVal.valid) {
                errors.push({ path: `${lesPath}.knowledge_check.explanation`, field: 'explanation', error: kcExpVal.message });
              }
            }
          }

          // Media Items inside lesson
          if (les.media && Array.isArray(les.media)) {
            mediaItemsCount += les.media.length;
          }

          // Visual requirement validation (Section 14 of visual system spec)
          const visObj = les.visual || les.visual_requirement;
          if (visObj && typeof visObj === 'object') {
            const validModes = [
              'auto',
              'A_ILLUSTRATION',
              'B_DIAGRAM',
              'C_REAL_WORLD',
              'D_MAP',
              'E_ANIMATION',
              'illustration',
              'diagram',
              'photo',
              'map',
              'animation',
            ];
            const modeVal = (visObj.mode || visObj.type || '').toString();
            if (modeVal && !validModes.includes(modeVal)) {
              errors.push({
                path: `${lesPath}.visual.mode`,
                field: 'visual.mode',
                error: `Invalid visual mode "${modeVal}". Must be one of: ${validModes.join(', ')}.`,
              });
            }

            if (visObj.character && visObj.character !== 'swallern_bear_v1') {
              errors.push({
                path: `${lesPath}.visual.character`,
                field: 'visual.character',
                error: `Invalid character ID "${visObj.character}". Canonical mascot is "swallern_bear_v1".`,
              });
            }
          }
        });
      }
    });
  }

  // 3. Final Quiz Validation
  const quiz = courseDoc.final_quiz || courseDoc.quiz;
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    errors.push({
      path: 'quiz',
      field: 'quiz',
      error: 'Swallern course requires a final review quiz with at least one question.',
    });
  } else {
    quizzesCount++;
    quiz.questions.forEach((q: any, qIdx: number) => {
      const qPath = `quiz.questions[${qIdx}]`;
      const qVal = validateFieldWordCount(q.question, 'quizQuestion');
      if (!qVal.valid) {
        errors.push({ path: `${qPath}.question`, field: 'question', error: qVal.message });
      }

      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        errors.push({
          path: `${qPath}.options`,
          field: 'options',
          error: `Final quiz question ${qIdx + 1} must contain at least 2 options.`,
        });
      } else {
        const hasCorrect = q.options.some((o: any) => (typeof o === 'object' ? o.is_correct === true : false));
        if (!hasCorrect) {
          errors.push({
            path: `${qPath}.options`,
            field: 'options',
            error: `Final quiz question ${qIdx + 1} must have at least one correct option.`,
          });
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    countsSummary: {
      sections: sectionsCount,
      lessons: lessonsCount,
      knowledgeChecks: knowledgeChecksCount,
      quizzes: quizzesCount,
      mediaItems: mediaItemsCount,
    },
  };
}
