/**
 * Swallern client-side analytics event tracker.
 * Lightweight wrapper around Supabase learning_sessions.
 * Works for both anonymous and authenticated users.
 * No third-party libraries.
 */

import { createClient } from '@/lib/supabase/client';

export type SwallernEvent =
  | 'page_view'
  | 'search'
  | 'topic_open'
  | 'topic_mls'
  | 'topic_complete'
  | 'related_topic_click'
  | 'lesson_start'
  | 'lesson_complete'
  | 'quiz_start'
  | 'quiz_complete'
  | 'quiz_result'
  | 'topic_save'
  | 'topic_unsave'
  | 'sign_up'
  | 'sign_in'
  | 'sign_out';

interface TrackOptions {
  topicId: string;
  eventName: SwallernEvent;
  sessionId?: string;
  durationSeconds?: number;
  mlsQualified?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Track a Swallern learning analytics event.
 * Silent — never throws. Safe to call without awaiting.
 */
export async function trackEvent(opts: TrackOptions): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await (supabase.from('learning_sessions') as any).insert({
      user_id: user?.id ?? null,
      topic_id: opts.topicId,
      event_name: opts.eventName,
      session_id: opts.sessionId ?? null,
      duration_seconds: opts.durationSeconds ?? 0,
      mls_qualified: opts.mlsQualified ?? false,
      metadata: (opts.metadata ?? {}) as import('@/lib/supabase/types').Json,
    });
  } catch {
    // Never propagate analytics errors
  }
}
