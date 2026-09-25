'use client';

import { createClient } from '@/lib/supabase/client';

export interface TopicProgressState {
  slug: string;
  topicId?: string;
  title: string;
  summary?: string;
  category?: string;
  currentStep: number;
  totalSteps: number;
  completedStepIndexes: number[];
  isCompleted: boolean;
  estimatedMinutes?: number;
  updatedAt: string;
}

const LOCAL_STORAGE_KEY = 'swallern_learner_progress_v1';

/**
 * Helper to get all saved local progress records
 */
export function getLocalProgressStore(): Record<string, TopicProgressState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Get progress for a specific topic slug
 */
export function getTopicProgress(slug: string): TopicProgressState | null {
  const store = getLocalProgressStore();
  return store[slug] || null;
}

/**
 * Save progress for a specific step in a topic
 */
export async function saveTopicProgress(data: {
  slug: string;
  topicId?: string;
  title: string;
  summary?: string;
  category?: string;
  currentStep: number;
  totalSteps: number;
  completedStepIndexes: number[];
  isCompleted?: boolean;
  estimatedMinutes?: number;
}): Promise<TopicProgressState> {
  const now = new Date().toISOString();
  const store = getLocalProgressStore();

  const prev = store[data.slug] || {
    slug: data.slug,
    topicId: data.topicId,
    title: data.title,
    summary: data.summary,
    category: data.category,
    currentStep: 0,
    totalSteps: data.totalSteps,
    completedStepIndexes: [],
    isCompleted: false,
    estimatedMinutes: data.estimatedMinutes || 5,
    updatedAt: now,
  };

  const updatedIndexes = Array.from(
    new Set([...prev.completedStepIndexes, ...data.completedStepIndexes])
  );

  const isAllFinished =
    data.isCompleted || (data.totalSteps > 0 && updatedIndexes.length >= data.totalSteps);

  const newState: TopicProgressState = {
    ...prev,
    slug: data.slug,
    topicId: data.topicId || prev.topicId,
    title: data.title || prev.title,
    summary: data.summary || prev.summary,
    category: data.category || prev.category,
    currentStep: data.currentStep,
    totalSteps: Math.max(data.totalSteps, prev.totalSteps),
    completedStepIndexes: updatedIndexes,
    isCompleted: isAllFinished,
    estimatedMinutes: data.estimatedMinutes || prev.estimatedMinutes,
    updatedAt: now,
  };

  if (typeof window !== 'undefined') {
    try {
      store[data.slug] = newState;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Handle quota or disabled localStorage
    }
  }

  // Also sync with Supabase if logged in and topicId is available
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && (data.topicId || prev.topicId)) {
      await (supabase.from('lesson_progress') as any).upsert(
        {
          user_id: user.id,
          lesson_id: data.topicId || prev.topicId,
          completed: isAllFinished,
          completed_at: isAllFinished ? now : null,
          updated_at: now,
        },
        { onConflict: 'user_id,lesson_id' }
      );
    }
  } catch {
    // Ignore DB sync errors gracefully
  }

  return newState;
}

/**
 * Retrieves all topics currently in progress (not completed, or recently active)
 */
export function getInProgressTopics(): TopicProgressState[] {
  const store = getLocalProgressStore();
  return Object.values(store)
    .filter((item) => item.totalSteps > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Retrieves all topics that the user has completely finished
 */
export function getCompletedTopics(): TopicProgressState[] {
  const store = getLocalProgressStore();
  return Object.values(store)
    .filter((item) => item.isCompleted)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Retrieves the slugs of all completed topics from local session
 */
export function getCompletedTopicSlugs(): string[] {
  const store = getLocalProgressStore();
  return Object.values(store)
    .filter((item) => item.isCompleted)
    .map((item) => item.slug);
}

/**
 * Checks if a specific topic is completed
 */
export function isTopicCompleted(slug: string): boolean {
  const store = getLocalProgressStore();
  return Boolean(store[slug]?.isCompleted);
}

/**
 * Fetches all completed topic slugs by checking both local storage session
 * and Supabase user session (if signed in).
 */
export async function fetchUserCompletedTopicSlugs(): Promise<string[]> {
  const localSlugs = getCompletedTopicSlugs();

  if (typeof window === 'undefined') {
    return localSlugs;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return localSlugs;
    }

    const { data } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', user.id)
      .eq('completed', true);

    if (data && data.length > 0) {
      const ids = (data as any[]).map((d) => d.lesson_id).filter(Boolean);
      if (ids.length > 0) {
        const { data: topicData } = await supabase
          .from('topics')
          .select('slug')
          .in('id', ids);

        if (topicData) {
          const remoteSlugs = (topicData as any[]).map((t) => t.slug);
          return Array.from(new Set([...localSlugs, ...remoteSlugs]));
        }
      }
    }

    return localSlugs;
  } catch {
    return localSlugs;
  }
}

/**
 * Calculates percentage integer (0 to 100) for a topic progress
 */
export function getProgressPercentage(progress: TopicProgressState | null): number {
  if (!progress || progress.totalSteps === 0) return 0;
  if (progress.isCompleted) return 100;
  const count = progress.completedStepIndexes.length;
  return Math.min(100, Math.round((count / progress.totalSteps) * 100));
}
