'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ClassroomTheme } from '@/lib/learning/themes';
import { LearnerNote, NoteCreateInput, NoteSaveState, makeBlock } from '@/lib/notes/types';
import { createLocalNote, saveLocalNote } from '@/lib/notes/localNotes';
import { NoteEditor } from './NoteEditor';

interface ClassroomNotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  topicSlug: string;
  topicTitle: string;
  stepIndex: number;
  stepTitle: string;
  theme: ClassroomTheme;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

export const ClassroomNotesPanel: React.FC<ClassroomNotesPanelProps> = ({
  isOpen,
  onClose,
  topicSlug,
  topicTitle,
  stepIndex,
  stepTitle,
  theme,
}) => {
  const dark = theme.id === 'space_observatory';
  const [notes, setNotes] = useState<LearnerNote[]>([]);
  const [activeNote, setActiveNote] = useState<LearnerNote | null>(null);
  const [saveState, setSaveState] = useState<NoteSaveState>('idle');
  const [loading, setLoading] = useState(false);

  const bg = dark ? '#1E293B' : '#FFFFFF';
  const borderColor = dark ? 'rgba(255,255,255,0.1)' : '#E2E8F0';
  const textPrimary = dark ? '#F1F5F9' : '#0F172A';
  const textSecondary = dark ? '#94A3B8' : '#64748B';

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/notes?topic_slug=${encodeURIComponent(topicSlug)}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes ?? []);
      }
    } catch {
      // silent — local notes are still available
    } finally {
      setLoading(false);
    }
  }, [topicSlug]);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, fetchNotes]);

  const handleNewNote = useCallback(async () => {
    const input: NoteCreateInput = {
      topic_slug: topicSlug,
      topic_title: topicTitle,
      step_index: stepIndex,
      blocks: [makeBlock('text', '')],
      tags: [],
    };

    // Create locally first
    const local = createLocalNote(input);
    setActiveNote(local);

    // Try to persist to server
    try {
      const res = await fetch('/api/user/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const data = await res.json();
        const serverNote: LearnerNote = data.note;
        // Replace local note with server note
        setActiveNote(serverNote);
        setNotes((prev) => [serverNote, ...prev]);
      } else {
        setNotes((prev) => [local, ...prev]);
      }
    } catch {
      setNotes((prev) => [local, ...prev]);
    }
  }, [topicSlug, topicTitle, stepIndex]);

  const handleNoteUpdate = useCallback((updated: LearnerNote) => {
    setActiveNote(updated);
    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    );
    saveLocalNote(updated);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 80,
          background: 'rgba(15,23,42,0.25)',
        }}
      />

      {/* Panel */}
      <div
        className="notes-panel"
        role="complementary"
        aria-label="My notes"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '340px',
          maxWidth: '100vw',
          zIndex: 85,
          background: bg,
          borderLeft: `1px solid ${borderColor}`,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: '12px 14px',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: textPrimary }}>
              My Notes
            </div>
            <div style={{ fontSize: '0.7rem', color: textSecondary, marginTop: '1px' }}>
              Step {stepIndex + 1} — {stepTitle || topicTitle}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={handleNewNote}
              aria-label="New note"
              title="New note"
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                background: theme.accent,
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + New
            </button>
            <button
              onClick={onClose}
              aria-label="Close notes panel"
              title="Close"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                border: `1px solid ${borderColor}`,
                color: textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Active note editor */}
        {activeNote ? (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Back button */}
            <div style={{ padding: '8px 12px 0', flexShrink: 0 }}>
              <button
                onClick={() => setActiveNote(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: theme.accent,
                  fontWeight: 600,
                  padding: 0,
                }}
                aria-label="Back to notes list"
              >
                ← All notes
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <NoteEditor
                note={activeNote}
                onUpdate={handleNoteUpdate}
                onSaveStateChange={setSaveState}
                saveState={saveState}
                dark={dark}
                compact
              />
            </div>
          </div>
        ) : (
          /* Notes list */
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {loading && (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.78rem', color: textSecondary }}>
                Loading notes…
              </div>
            )}

            {!loading && notes.length === 0 && (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📝</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: textPrimary, marginBottom: '4px' }}>
                  No notes yet
                </div>
                <div style={{ fontSize: '0.74rem', color: textSecondary }}>
                  Click &ldquo;+ New&rdquo; to start capturing ideas
                </div>
              </div>
            )}

            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveNote(n)}
                aria-label={`Open note: ${n.title || 'Untitled'}`}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: `1px solid ${borderColor}`,
                  cursor: 'pointer',
                  marginBottom: '6px',
                  transition: 'background 150ms ease',
                }}
              >
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: textPrimary,
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {n.title || 'Untitled note'}
                </div>
                {n.blocks.length > 0 && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: textSecondary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '4px',
                    }}
                  >
                    {n.blocks[0].content || '—'}
                  </div>
                )}
                <div style={{ fontSize: '0.68rem', color: textSecondary }}>
                  {formatRelativeTime(n.updated_at)}
                  {n.step_index !== null && ` · Step ${n.step_index + 1}`}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ClassroomNotesPanel;
