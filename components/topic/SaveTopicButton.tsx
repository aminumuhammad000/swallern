'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface SaveTopicButtonProps {
  topicId: string;
  topicSlug: string;
}

export const SaveTopicButton: React.FC<SaveTopicButtonProps> = ({ topicId, topicSlug }) => {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    async function checkSavedState() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await (supabase
          .from('saved_topics') as any)
          .select('topic_id')
          .eq('user_id', user.id)
          .eq('topic_id', topicId)
          .maybeSingle();

        if (data) {
          setIsSaved(true);
        }
      } catch {
        // Ignore auth check error
      } finally {
        setLoading(false);
      }
    }

    checkSavedState();
  }, [topicId]);

  const handleToggleSave = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowPrompt(true);
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        await (supabase
          .from('saved_topics') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('topic_id', topicId);
        setIsSaved(false);
      } else {
        await (supabase
          .from('saved_topics') as any)
          .insert({ user_id: user.id, topic_id: topicId });
        setIsSaved(true);
      }
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        variant={isSaved ? 'primary' : 'ghost'}
        size="sm"
        onClick={handleToggleSave}
        disabled={loading}
        style={{ border: isSaved ? undefined : '1px solid var(--color-neutral-border)' }}
      >
        {isSaved ? '★ Saved' : '☆ Save Topic'}
      </Button>

      {/* Anonymous prompt modal / tooltip */}
      {showPrompt && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '260px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-neutral-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: 'var(--space-3)',
            zIndex: 100,
          }}
        >
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-dark)', fontWeight: 600 }}>
            Sign in required to save topics
          </p>
          <p style={{ margin: 'var(--space-1) 0 var(--space-3) 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-slate)' }}>
            Create a free account to keep track of topics you are curious about.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push(`/login?redirect=/topics/${topicSlug}`)}
              style={{ flex: 1, fontSize: 'var(--font-size-xs)' }}
            >
              Sign In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrompt(false)}
              style={{ fontSize: 'var(--font-size-xs)' }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
