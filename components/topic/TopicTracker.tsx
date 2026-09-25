'use client';

import React, { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TopicTrackerProps {
  topicId: string;
}

function generateSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const TopicTracker: React.FC<TopicTrackerProps> = ({ topicId }) => {
  const sessionId = useRef(generateSessionId());
  const mlsFired = useRef(false);

  useEffect(() => {
    const sid = sessionId.current;

    async function recordEvent(
      eventName: string,
      durationSeconds: number,
      mlsQualified: boolean,
      userId: string | null,
    ) {
      try {
        const supabase = createClient();
        await (supabase.from('learning_sessions') as any).insert({
          ...(userId ? { user_id: userId } : {}),
          topic_id: topicId,
          event_name: eventName,
          session_id: sid,
          duration_seconds: durationSeconds,
          mls_qualified: mlsQualified,
        });
      } catch {
        // Silently ignore
      }
    }

    async function init() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id ?? null;

        // Record topic open immediately
        await recordEvent('topic_open', 0, false, userId);

        // Record MLS qualification after 30 seconds of page presence
        const timer = setTimeout(async () => {
          if (!mlsFired.current) {
            mlsFired.current = true;
            await recordEvent('topic_mls', 30, true, userId);
          }
        }, 30000);

        return () => clearTimeout(timer);
      } catch {
        return undefined;
      }
    }

    let cleanup: (() => void) | undefined;
    init().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
  }, [topicId]);

  return null;
};
