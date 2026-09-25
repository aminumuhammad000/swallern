/**
 * Swallern JSON Diagnostics & Error Analyzer
 * Pinpoints line numbers, column numbers, code snippets, and structural schema violations
 * with actionable human-readable explanations.
 */

import { validateSwallernCourse, CourseValidationResult, countWords } from './validation';

export interface JsonSyntaxDiagnostic {
  isSyntaxError: boolean;
  message: string;
  lineNumber?: number;
  columnNumber?: number;
  snippet?: string;
  hint?: string;
}

export interface JsonCourseDiagnostic {
  isValid: boolean;
  syntaxError: JsonSyntaxDiagnostic | null;
  validationResult: CourseValidationResult | null;
  parsedData: any | null;
  categorizedErrors: Array<{
    category: string;
    location: string;
    jsonPath: string;
    message: string;
    hint?: string;
  }>;
}

/**
 * Parses raw JSON text with precise syntax error line and column localization.
 */
export function analyzeJsonSyntax(jsonText: string): { parsed: any; error: JsonSyntaxDiagnostic | null } {
  if (!jsonText || !jsonText.trim()) {
    return {
      parsed: null,
      error: {
        isSyntaxError: true,
        message: 'JSON input is empty. Please paste or drop a course JSON document.',
        hint: 'Click "Load Template in Editor" or "Download Sample JSON" to get started.',
      },
    };
  }

  try {
    const parsed = JSON.parse(jsonText);
    return { parsed, error: null };
  } catch (err: any) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const lines = jsonText.split(/\r?\n/);

    let lineNum: number | undefined;
    let colNum: number | undefined;

    // Pattern 1: "... at position 1234 (line 12 column 5)"
    const lineColMatch = rawMsg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    if (lineColMatch) {
      lineNum = parseInt(lineColMatch[1], 10);
      colNum = parseInt(lineColMatch[2], 10);
    }

    // Pattern 2: "... at line 12 column 5 ..."
    if (!lineNum) {
      const lineOnlyMatch = rawMsg.match(/line\s+(\d+)/i);
      if (lineOnlyMatch) {
        lineNum = parseInt(lineOnlyMatch[1], 10);
      }
    }

    // Pattern 3: "... at position 1234"
    if (!lineNum) {
      const posMatch = rawMsg.match(/position\s+(\d+)/i);
      if (posMatch) {
        const charPos = parseInt(posMatch[1], 10);
        let currentChars = 0;
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length + 1; // +1 for newline
          if (currentChars + lineLength >= charPos) {
            lineNum = i + 1;
            colNum = Math.max(1, charPos - currentChars);
            break;
          }
          currentChars += lineLength;
        }
      }
    }

    // Fallback if line wasn't extracted
    if (!lineNum) lineNum = 1;
    if (!colNum) colNum = 1;

    // Generate code context snippet around the error line
    const snippetLines: string[] = [];
    const startLine = Math.max(1, lineNum - 2);
    const endLine = Math.min(lines.length, lineNum + 2);

    for (let i = startLine; i <= endLine; i++) {
      const isErrorLine = i === lineNum;
      const lineContent = lines[i - 1] || '';
      const prefix = isErrorLine ? `> ${i.toString().padStart(3, ' ')} | ` : `  ${i.toString().padStart(3, ' ')} | `;
      snippetLines.push(prefix + lineContent);
      if (isErrorLine && colNum && colNum <= lineContent.length + 5) {
        const markerIndent = ' '.repeat(prefix.length + Math.max(0, colNum - 1));
        snippetLines.push(`${markerIndent}^-- Error detected around here`);
      }
    }

    // Heuristics for common JSON syntax mistakes
    let specificHint = 'Ensure all keys and strings use double quotes ("key": "value"), commas separate items, and all brackets match.';
    const errorLineText = lines[lineNum - 1] || '';

    if (/,\s*[}\]]/.test(errorLineText) || (lines[lineNum] && /^\s*[}\]]/.test(lines[lineNum]) && /,\s*$/.test(errorLineText))) {
      specificHint = 'Trailing comma detected! In JSON, the last item in an object or array must not have a trailing comma before } or ].';
    } else if (/'/.test(errorLineText) && !/"/.test(errorLineText)) {
      specificHint = 'Single quotes (\') detected. Standard JSON requires double quotes (") for all strings and property names.';
    } else if (/[a-zA-Z0-9_]+\s*:/.test(errorLineText) && !/"[a-zA-Z0-9_]+"\s*:/.test(errorLineText)) {
      specificHint = 'Unquoted property key detected. All keys in JSON must be wrapped in double quotes (e.g. "title": ...).';
    } else if (rawMsg.toLowerCase().includes('unexpected end') || rawMsg.toLowerCase().includes('end of data')) {
      specificHint = 'Unexpected end of JSON. A closing brace } or bracket ] is missing at the end of the document.';
    }

    return {
      parsed: null,
      error: {
        isSyntaxError: true,
        message: `Syntax Error at Line ${lineNum}, Column ${colNum}: ${rawMsg.replace(/in JSON at position \d+.*$/i, '').trim()}`,
        lineNumber: lineNum,
        columnNumber: colNum,
        snippet: snippetLines.join('\n'),
        hint: specificHint,
      },
    };
  }
}

/**
 * Runs full comprehensive analysis on a course JSON string:
 * 1. Syntax check with line/column localization.
 * 2. Swallern Schema 1.1 structure and word-limit compliance check.
 * 3. Human-readable categorizations and clickable paths.
 */
export function analyzeCourseJson(jsonText: string): JsonCourseDiagnostic {
  const { parsed, error: syntaxError } = analyzeJsonSyntax(jsonText);

  if (syntaxError) {
    return {
      isValid: false,
      syntaxError,
      validationResult: null,
      parsedData: null,
      categorizedErrors: [
        {
          category: 'Syntax Error',
          location: `Line ${syntaxError.lineNumber || 1}, Column ${syntaxError.columnNumber || 1}`,
          jsonPath: 'syntax',
          message: syntaxError.message,
          hint: syntaxError.hint,
        },
      ],
    };
  }

  const validationResult = validateSwallernCourse(parsed);
  const categorizedErrors: JsonCourseDiagnostic['categorizedErrors'] = [];

  if (!validationResult.valid) {
    validationResult.errors.forEach((err) => {
      let category = 'Course Overview';
      let location = 'Top Level';
      let hint: string | undefined;

      if (err.path.startsWith('course.') || err.path === 'course') {
        category = 'Course Basics';
        if (err.field === 'title') {
          location = 'Course Title';
          hint = 'Title must be between 2 and 12 words.';
        } else if (err.field === 'summary') {
          location = 'Course Summary';
          hint = 'Summary must be a 15-50 word overview.';
        }
      } else if (err.path.startsWith('sections[')) {
        category = 'Modules & Lessons';
        const match = err.path.match(/sections\[(\d+)\](\.lessons\[(\d+)\])?/);
        const sIdx = match ? parseInt(match[1], 10) : 0;
        const lIdx = match && match[3] ? parseInt(match[3], 10) : undefined;

        const secTitle = parsed.sections?.[sIdx]?.title || `Module ${sIdx + 1}`;
        if (lIdx !== undefined) {
          const lesTitle = parsed.sections?.[sIdx]?.lessons?.[lIdx]?.title || `Lesson ${lIdx + 1}`;
          location = `Module ${sIdx + 1} ("${secTitle}") → Lesson ${lIdx + 1} ("${lesTitle}")`;

          if (err.field === 'explanation') {
            const expText = parsed.sections?.[sIdx]?.lessons?.[lIdx]?.content || parsed.sections?.[sIdx]?.lessons?.[lIdx]?.explanation || '';
            const wCount = countWords(expText);
            hint = `Current word count: ${wCount} words. Swallern requires 30 to 120 bite-sized words.`;
          } else if (err.field === 'question') {
            hint = 'Knowledge check question must be between 5 and 25 words.';
          } else if (err.field === 'options') {
            hint = 'Must provide at least 2 options and mark one with "is_correct": true.';
          }
        } else {
          location = `Module ${sIdx + 1} ("${secTitle}")`;
          if (err.field === 'title') hint = 'Module title must be between 2 and 10 words.';
          if (err.field === 'lessons') hint = 'Each module must contain at least 1 lesson object.';
        }
      } else if (err.path.startsWith('quiz') || err.path.startsWith('final_quiz')) {
        category = 'Final Quiz';
        const qMatch = err.path.match(/questions\[(\d+)\]/);
        const qIdx = qMatch ? parseInt(qMatch[1], 10) : undefined;
        if (qIdx !== undefined) {
          location = `Quiz Question ${qIdx + 1}`;
          if (err.field === 'question') hint = 'Question text must be between 5 and 25 words.';
          if (err.field === 'options') hint = 'Provide at least 2 options and mark one as correct.';
        } else {
          location = 'Final Quiz Review';
          hint = 'Course requires a final quiz with at least one question.';
        }
      }

      categorizedErrors.push({
        category,
        location,
        jsonPath: err.path,
        message: err.error,
        hint,
      });
    });
  }

  return {
    isValid: validationResult.valid,
    syntaxError: null,
    validationResult,
    parsedData: parsed,
    categorizedErrors,
  };
}
