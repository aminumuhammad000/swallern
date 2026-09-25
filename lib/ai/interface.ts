/**
 * Swallern AI Content Generation Service Interfaces
 * Provides a provider-agnostic interface supporting OpenRouter, Gemini, and OpenAI.
 */

export type AIProviderType = 'openrouter' | 'gemini' | 'openai';

export interface AISourceInput {
  title: string;
  url: string;
  publisher?: string | null;
  source_type?: string | null;
}

export interface AICandidateClaim {
  claim_text: string;
  supporting_source_urls?: string[];
}

export interface AISuggestedLessonSection {
  title: string;
  content: string;
  key_takeaway?: string;
}

export interface AISuggestedLesson {
  title: string;
  summary: string;
  estimated_minutes: number;
  sections: AISuggestedLessonSection[];
}

export interface AISuggestedQuizOption {
  option_text: string;
  is_correct: boolean;
}

export interface AISuggestedQuizQuestion {
  question: string;
  explanation: string;
  options: AISuggestedQuizOption[];
}

export interface AISuggestedQuiz {
  title: string;
  passing_score: number;
  questions: AISuggestedQuizQuestion[];
}

export interface AIDraftResult {
  title: string;
  summary: string;
  quick_answer: string;
  explanation: string;
  key_concepts: Array<{ title: string; description: string }>;
  claims: AICandidateClaim[];
  suggested_lesson?: AISuggestedLesson;
  suggested_quiz?: AISuggestedQuiz;
  suggested_related_topics?: string[];
}

export interface AIServiceConfig {
  configured: boolean;
  providerName: string;
  providerType: AIProviderType;
  modelName: string;
  error?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  configured: boolean;
  data?: AIDraftResult;
  error?: string;
  warnings?: string[];
}
