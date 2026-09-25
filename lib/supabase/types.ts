export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TopicStatus =
  | 'DISCOVERED'
  | 'RESEARCHING'
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'UPDATED'
  | 'REJECTED';

export type UserApprovalStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'REJECTED';

export type UserPublicationStatus = 'UNPUBLISHED' | 'PUBLISHED';
export type UserVisibility = 'PUBLIC' | 'LINK_ONLY';

export type MediaType = 'YOUTUBE' | 'PODCAST' | 'ARTICLE' | 'INFOGRAPHIC';

export interface Database {
  public: {
    Tables: {
      platform_settings: {
        Row: {
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
      };
      topics: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string | null;
          category_id: string | null;
          difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
          status: TopicStatus;
          user_id: string | null;
          approval_status: UserApprovalStatus | null;
          publication_status: UserPublicationStatus | null;
          visibility: UserVisibility | null;
          share_token: string | null;
          admin_feedback: string | null;
          auto_approved: boolean | null;
          published_version: number | null;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          summary?: string | null;
          category_id?: string | null;
          difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
          status?: TopicStatus;
          user_id?: string | null;
          approval_status?: UserApprovalStatus | null;
          publication_status?: UserPublicationStatus | null;
          visibility?: UserVisibility | null;
          share_token?: string | null;
          admin_feedback?: string | null;
          auto_approved?: boolean | null;
          published_version?: number | null;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          summary?: string | null;
          category_id?: string | null;
          difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
          status?: TopicStatus;
          user_id?: string | null;
          approval_status?: UserApprovalStatus | null;
          publication_status?: UserPublicationStatus | null;
          visibility?: UserVisibility | null;
          share_token?: string | null;
          admin_feedback?: string | null;
          auto_approved?: boolean | null;
          published_version?: number | null;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      topic_versions: {
        Row: {
          id: string;
          topic_id: string;
          version: number;
          quick_answer: string | null;
          explanation: string | null;
          key_concepts: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          version: number;
          quick_answer?: string | null;
          explanation?: string | null;
          key_concepts?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          version?: number;
          quick_answer?: string | null;
          explanation?: string | null;
          key_concepts?: Json;
          created_at?: string;
        };
      };
      sources: {
        Row: {
          id: string;
          url: string;
          title: string;
          publisher: string | null;
          published_at: string | null;
          accessed_at: string;
          reliability_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          title: string;
          publisher?: string | null;
          published_at?: string | null;
          accessed_at?: string;
          reliability_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          title?: string;
          publisher?: string | null;
          published_at?: string | null;
          accessed_at?: string;
          reliability_score?: number | null;
          created_at?: string;
        };
      };
      topic_sources: {
        Row: {
          topic_id: string;
          source_id: string;
        };
        Insert: {
          topic_id: string;
          source_id: string;
        };
        Update: {
          topic_id?: string;
          source_id?: string;
        };
      };
      topic_relationships: {
        Row: {
          from_topic_id: string;
          to_topic_id: string;
          relationship_type: string;
          weight: number | null;
        };
        Insert: {
          from_topic_id: string;
          to_topic_id: string;
          relationship_type?: string;
          weight?: number | null;
        };
        Update: {
          from_topic_id?: string;
          to_topic_id?: string;
          relationship_type?: string;
          weight?: number | null;
        };
      };
      saved_topics: {
        Row: {
          user_id: string;
          topic_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          topic_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          topic_id?: string;
          created_at?: string;
        };
      };
      media_items: {
        Row: {
          id: string;
          topic_id: string;
          media_type: MediaType;
          url: string;
          title: string | null;
          channel_or_creator: string | null;
          duration_seconds: number | null;
          thumbnail_url: string | null;
          transcript: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          media_type?: MediaType;
          url: string;
          title?: string | null;
          channel_or_creator?: string | null;
          duration_seconds?: number | null;
          thumbnail_url?: string | null;
          transcript?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          media_type?: MediaType;
          url?: string;
          title?: string | null;
          channel_or_creator?: string | null;
          duration_seconds?: number | null;
          thumbnail_url?: string | null;
          transcript?: string | null;
          order_index?: number;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          topic_id: string;
          title: string;
          summary: string | null;
          estimated_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          title: string;
          summary?: string | null;
          estimated_minutes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          title?: string;
          summary?: string | null;
          estimated_minutes?: number;
          created_at?: string;
        };
      };
      lesson_sections: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          content: string;
          key_takeaway: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          content: string;
          key_takeaway?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
          content?: string;
          key_takeaway?: string | null;
          order_index?: number;
          created_at?: string;
        };
      };
      lesson_progress: {
        Row: {
          user_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          lesson_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          topic_id: string;
          title: string;
          passing_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          title?: string;
          passing_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          title?: string;
          passing_score?: number;
          created_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question: string;
          explanation: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question: string;
          explanation: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question?: string;
          explanation?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      quiz_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
          order_index: number;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          is_correct?: boolean;
          order_index?: number;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_text?: string;
          is_correct?: boolean;
          order_index?: number;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string | null;
          quiz_id: string;
          score: number;
          total_questions: number;
          passed: boolean;
          answers: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          quiz_id: string;
          score: number;
          total_questions: number;
          passed?: boolean;
          answers?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          quiz_id?: string;
          score?: number;
          total_questions?: number;
          passed?: boolean;
          answers?: Json;
          created_at?: string;
        };
      };
      learning_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          topic_id: string;
          event_name: string;
          session_id: string | null;
          duration_seconds: number;
          mls_qualified: boolean;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          topic_id: string;
          event_name: string;
          session_id?: string | null;
          duration_seconds?: number;
          mls_qualified?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          topic_id?: string;
          event_name?: string;
          session_id?: string | null;
          duration_seconds?: number;
          mls_qualified?: boolean;
          metadata?: Json;
          created_at?: string;
        };
      };
      claims: {
        Row: {
          id: string;
          topic_id: string;
          claim_text: string;
          status: 'UNVERIFIED' | 'SUPPORTED' | 'DISPUTED' | 'REJECTED';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          claim_text: string;
          status?: 'UNVERIFIED' | 'SUPPORTED' | 'DISPUTED' | 'REJECTED';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          claim_text?: string;
          status?: 'UNVERIFIED' | 'SUPPORTED' | 'DISPUTED' | 'REJECTED';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      claim_sources: {
        Row: {
          claim_id: string;
          source_id: string;
        };
        Insert: {
          claim_id: string;
          source_id: string;
        };
        Update: {
          claim_id?: string;
          source_id?: string;
        };
      };
      learner_notes: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          topic_id: string | null;
          topic_slug: string | null;
          topic_title: string | null;
          lesson_id: string | null;
          section_id: string | null;
          step_index: number | null;
          blocks: Json; // NoteBlock[]
          tags: string[];
          is_important: boolean;
          is_review: boolean;
          is_deleted: boolean;
          source_excerpt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          topic_id?: string | null;
          topic_slug?: string | null;
          topic_title?: string | null;
          lesson_id?: string | null;
          section_id?: string | null;
          step_index?: number | null;
          blocks?: Json;
          tags?: string[];
          is_important?: boolean;
          is_review?: boolean;
          is_deleted?: boolean;
          source_excerpt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          topic_id?: string | null;
          topic_slug?: string | null;
          topic_title?: string | null;
          lesson_id?: string | null;
          section_id?: string | null;
          step_index?: number | null;
          blocks?: Json;
          tags?: string[];
          is_important?: boolean;
          is_review?: boolean;
          is_deleted?: boolean;
          source_excerpt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
