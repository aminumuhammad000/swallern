/**
 * Swallern Topic Content Contract
 * Matches approved Swallern_Pre_Implementation_Package/content/topic-content-contract.json
 */

export interface KeyConcept {
  title: string;
  description: string;
}

export type SourceType =
  | 'PRIMARY'
  | 'GOVERNMENT'
  | 'UNIVERSITY'
  | 'SCIENTIFIC'
  | 'REFERENCE'
  | 'NEWS'
  | 'VIDEO'
  | 'OTHER';

export interface TopicSource {
  id?: string;
  title: string;
  publisher?: string;
  url: string;
  published_at?: string;
  reliability_score?: number;
  source_type?: SourceType;
  notes?: string;
  accessed_at?: string;
}

export type ClaimStatus = 'UNVERIFIED' | 'SUPPORTED' | 'DISPUTED' | 'REJECTED';

export interface ClaimData {
  id: string;
  topic_id: string;
  claim_text: string;
  status: ClaimStatus;
  notes?: string;
  sources?: TopicSource[];
  created_at?: string;
  updated_at?: string;
}

export interface TopicMedia {
  id?: string;
  type: 'YOUTUBE' | 'PODCAST' | 'ARTICLE' | 'INFOGRAPHIC';
  url: string;
  title?: string;
  channel_or_creator?: string;
  duration_seconds?: number;
  thumbnail_url?: string;
}

export interface RelatedTopicRef {
  slug: string;
  title: string;
  summary?: string;
  category?: string;
}

export interface TopicCategoryRef {
  name: string;
  slug: string;
}

export interface LessonSectionData {
  id: string;
  title: string;
  content: string;
  key_takeaway?: string;
  order_index: number;
}

export interface LessonData {
  id: string;
  topic_id: string;
  title: string;
  summary?: string;
  estimated_minutes: number;
  sections: LessonSectionData[];
}

export interface QuizOptionData {
  id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizQuestionData {
  id: string;
  question: string;
  explanation: string;
  order_index: number;
  options: QuizOptionData[];
}

export interface QuizData {
  id: string;
  topic_id: string;
  title: string;
  passing_score: number;
  questions: QuizQuestionData[];
}

export interface TopicContract {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  category: TopicCategoryRef;
  quick_answer: string;
  key_concepts: KeyConcept[];
  explanation: string;
  sources: TopicSource[];
  related_topics: RelatedTopicRef[];
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  media?: TopicMedia[];
  has_lesson?: boolean;
  has_quiz?: boolean;
  lesson?: LessonData;
  quiz?: QuizData;
  claims?: ClaimData[];
  last_reviewed_at?: string;
}
