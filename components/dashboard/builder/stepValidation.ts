import { BuilderCourseData, BuilderLessonData, BuilderStep } from './types';
import { countWords, validateFieldWordCount, validateSwallernCourse } from '@/lib/learning/validation';

export interface DetailedStepError {
  id: string;
  field?: string;
  sectionIndex?: number;
  lessonIndex?: number;
  label: string;
  message: string;
  hint?: string;
}

export interface StepValidationResult {
  isValid: boolean;
  errors: string[];
  detailedErrors: DetailedStepError[];
}

/**
 * Validates a single lesson against Swallern bite-sized learning rules.
 * Used for live validation in Step 3 and for showing status pills in the lesson list.
 */
export function getLessonValidation(
  les: BuilderLessonData,
  sectionIndex: number = 0,
  lessonIndex: number = 0
): DetailedStepError[] {
  const errors: DetailedStepError[] = [];
  const lesLabel = `Lesson ${lessonIndex + 1}${les.title ? ` ("${les.title}")` : ''}`;

  // 1. Lesson Title
  if (!les.title || !les.title.trim()) {
    errors.push({
      id: `sec_${sectionIndex}_les_${lessonIndex}_title`,
      field: 'title',
      sectionIndex,
      lessonIndex,
      label: `${lesLabel} Title`,
      message: 'Lesson title is required.',
      hint: 'Add a concise title between 2 and 12 words.',
    });
  } else {
    const lesTitleVal = validateFieldWordCount(les.title, 'lessonTitle');
    if (!lesTitleVal.valid) {
      errors.push({
        id: `sec_${sectionIndex}_les_${lessonIndex}_title`,
        field: 'title',
        sectionIndex,
        lessonIndex,
        label: `${lesLabel} Title`,
        message: lesTitleVal.message,
        hint: 'Aim for 2 to 12 words.',
      });
    } else if (les.title.trim().length < 3) {
      errors.push({
        id: `sec_${sectionIndex}_les_${lessonIndex}_title`,
        field: 'title',
        sectionIndex,
        lessonIndex,
        label: `${lesLabel} Title`,
        message: 'Title must be at least 3 characters.',
      });
    }
  }

  // 2. Lesson Explanation (30-120 words)
  const expWords = countWords(les.content);
  if (!les.content || !les.content.trim()) {
    errors.push({
      id: `sec_${sectionIndex}_les_${lessonIndex}_content`,
      field: 'content',
      sectionIndex,
      lessonIndex,
      label: `${lesLabel} Explanation`,
      message: 'Lesson explanation is empty.',
      hint: 'Write between 30 and 120 words (currently 0 words). Needs at least 30 words.',
    });
  } else {
    const expVal = validateFieldWordCount(les.content, 'lessonExplanation');
    if (!expVal.valid) {
      let hint = '';
      if (expWords < 30) {
        hint = `Currently has ${expWords} words. Add ${30 - expWords} more words to meet the 30-word minimum.`;
      } else if (expWords > 120) {
        hint = `Currently has ${expWords} words. Trim ${expWords - 120} words to stay under the 120-word maximum.`;
      }
      errors.push({
        id: `sec_${sectionIndex}_les_${lessonIndex}_content`,
        field: 'content',
        sectionIndex,
        lessonIndex,
        label: `${lesLabel} Explanation`,
        message: expVal.message,
        hint,
      });
    }
  }

  // 3. Knowledge Check Question
  const qText = les.knowledge_check?.question;
  const qWords = countWords(qText);
  if (!qText || !qText.trim()) {
    errors.push({
      id: `sec_${sectionIndex}_les_${lessonIndex}_question`,
      field: 'question',
      sectionIndex,
      lessonIndex,
      label: `${lesLabel} Question`,
      message: 'Knowledge check question is required.',
      hint: 'Formulate a 5 to 25 word question testing the lesson takeaway.',
    });
  } else {
    const qVal = validateFieldWordCount(qText, 'quizQuestion');
    if (!qVal.valid) {
      errors.push({
        id: `sec_${sectionIndex}_les_${lessonIndex}_question`,
        field: 'question',
        sectionIndex,
        lessonIndex,
        label: `${lesLabel} Question`,
        message: qVal.message,
        hint: `Currently ${qWords} words. Must be between 5 and 25 words.`,
      });
    }
  }

  // 4. Knowledge Check Options
  const opts = les.knowledge_check?.options || [];
  if (opts.length < 2) {
    errors.push({
      id: `sec_${sectionIndex}_les_${lessonIndex}_options`,
      field: 'options',
      sectionIndex,
      lessonIndex,
      label: `${lesLabel} Options`,
      message: 'Knowledge check must have at least 2 options.',
      hint: 'Provide at least one correct option and one distractor.',
    });
  } else {
    const hasEmpty = opts.some((o) => !o.text || !o.text.trim());
    if (hasEmpty) {
      errors.push({
        id: `sec_${sectionIndex}_les_${lessonIndex}_options`,
        field: 'options',
        sectionIndex,
        lessonIndex,
        label: `${lesLabel} Options`,
        message: 'All options must contain answer text.',
        hint: 'Fill in the text for both Option A and Option B.',
      });
    }
    const hasCorrect = opts.some((o) => o.is_correct);
    if (!hasCorrect) {
      errors.push({
        id: `sec_${sectionIndex}_les_${lessonIndex}_options_correct`,
        field: 'options',
        sectionIndex,
        lessonIndex,
        label: `${lesLabel} Correct Answer`,
        message: 'At least one option must be marked as correct.',
      });
    }
  }

  return errors;
}

/**
 * Validates whether the creator can proceed from the current builder step.
 * Returns comprehensive errors and detailed step descriptors with field targeting and actionable hints.
 */
export function getStepValidation(step: BuilderStep, data: BuilderCourseData): StepValidationResult {
  const errors: string[] = [];
  const detailedErrors: DetailedStepError[] = [];

  const addError = (err: DetailedStepError) => {
    errors.push(`${err.label}: ${err.message}${err.hint ? ` (${err.hint})` : ''}`);
    detailedErrors.push(err);
  };

  if (step === 'basics') {
    // Title validation
    const titleWords = countWords(data.title);
    if (!data.title || !data.title.trim()) {
      addError({
        id: 'course_title',
        field: 'title',
        label: 'Course Title',
        message: 'Course title is required.',
        hint: 'Enter a title between 2 and 12 words.',
      });
    } else {
      const titleVal = validateFieldWordCount(data.title, 'courseTitle');
      if (!titleVal.valid) {
        addError({
          id: 'course_title',
          field: 'title',
          label: 'Course Title',
          message: titleVal.message,
          hint: `Currently ${titleWords} words (must be 2-12 words).`,
        });
      } else if (data.title.trim().length < 5) {
        addError({
          id: 'course_title',
          field: 'title',
          label: 'Course Title',
          message: 'Must be at least 5 characters long.',
        });
      }
    }

    // Summary validation
    const summaryWords = countWords(data.summary);
    if (!data.summary || !data.summary.trim()) {
      addError({
        id: 'course_summary',
        field: 'summary',
        label: 'Course Summary',
        message: 'Course summary is required.',
        hint: 'Enter an overview between 15 and 50 words.',
      });
    } else {
      const summaryVal = validateFieldWordCount(data.summary, 'courseSummary');
      if (!summaryVal.valid) {
        addError({
          id: 'course_summary',
          field: 'summary',
          label: 'Course Summary',
          message: summaryVal.message,
          hint: summaryWords < 15
            ? `Currently has ${summaryWords} words. Needs at least 15 words (${15 - summaryWords} more).`
            : `Currently has ${summaryWords} words. Maximum allowed is 50 words (${summaryWords - 50} to remove).`,
        });
      } else if (data.summary.trim().length < 20) {
        addError({
          id: 'course_summary',
          field: 'summary',
          label: 'Course Summary',
          message: 'Summary must be at least 20 characters long.',
        });
      }
    }

    // Category
    if (!data.category || !data.category.trim()) {
      addError({
        id: 'course_category',
        field: 'category',
        label: 'Subject Category',
        message: 'Category selection is required.',
      });
    }

    // Difficulty
    if (!data.difficulty) {
      addError({
        id: 'course_difficulty',
        field: 'difficulty',
        label: 'Difficulty Level',
        message: 'Difficulty level selection is required.',
      });
    }
  } else if (step === 'structure') {
    const sections = data.sections || [];
    if (sections.length === 0) {
      addError({
        id: 'structure_modules',
        label: 'Course Modules',
        message: 'Course must have at least 1 module.',
        hint: 'Click "Add Module" to create the first section.',
      });
    } else {
      sections.forEach((sec, sIdx) => {
        const secLabel = `Module ${sIdx + 1}`;
        if (!sec.title || !sec.title.trim()) {
          addError({
            id: `sec_${sIdx}_title`,
            field: 'title',
            sectionIndex: sIdx,
            label: `${secLabel} Title`,
            message: 'Module title is required.',
            hint: 'Give this module a clear title (2 to 10 words).',
          });
        } else {
          const secTitleVal = validateFieldWordCount(sec.title, 'sectionTitle');
          if (!secTitleVal.valid) {
            addError({
              id: `sec_${sIdx}_title`,
              field: 'title',
              sectionIndex: sIdx,
              label: `${secLabel} Title`,
              message: secTitleVal.message,
            });
          } else if (sec.title.trim().length < 3) {
            addError({
              id: `sec_${sIdx}_title`,
              field: 'title',
              sectionIndex: sIdx,
              label: `${secLabel} Title`,
              message: 'Module title must be at least 3 characters.',
            });
          }
        }

        if (!sec.lessons || sec.lessons.length === 0) {
          addError({
            id: `sec_${sIdx}_lessons`,
            sectionIndex: sIdx,
            label: `${secLabel} Lessons`,
            message: 'Module must contain at least 1 lesson.',
            hint: 'Click "+ Add Lesson" inside this module.',
          });
        }
      });
    }
  } else if (step === 'lessons') {
    const sections = data.sections || [];
    if (sections.length === 0) {
      addError({
        id: 'no_sections',
        label: 'Outline Modules',
        message: 'No modules defined. Please return to Step 2 (Structure).',
      });
    } else {
      sections.forEach((sec, sIdx) => {
        (sec.lessons || []).forEach((les, lIdx) => {
          const lesErrors = getLessonValidation(les, sIdx, lIdx);
          lesErrors.forEach(addError);
        });
      });
    }
  } else if (step === 'visuals') {
    // Visuals are optional / auto-assisted
  } else if (step === 'review' || step === 'publish') {
    const fullVal = validateSwallernCourse(data);
    if (!fullVal.valid) {
      fullVal.errors.forEach((e) => {
        addError({
          id: `full_val_${e.field}`,
          field: e.field,
          label: e.field,
          message: e.error,
        });
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    detailedErrors,
  };
}
