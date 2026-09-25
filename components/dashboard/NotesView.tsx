'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LearnerNote, NoteTag, NOTE_TAG_LABELS, NOTE_TAG_COLORS } from '@/lib/notes/types';
import { NoteSaveState } from '@/lib/notes/types';
import { NoteEditor } from '@/components/notes/NoteEditor';

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

type FilterType = 'all' | 'important' | 'question' | 'review' | 'idea' | 'remember' | 'example';

export const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<LearnerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNote, setActiveNote] = useState<LearnerNote | null>(null);
  const [saveState, setSaveState] = useState<NoteSaveState>('idle');

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filter === 'important') params.set('is_important', 'true');
      else if (filter === 'review') params.set('is_review', 'true');
      else if (filter !== 'all') params.set('tag', filter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/user/notes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load notes');
      const data = await res.json();
      setNotes(data.notes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load notes');
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleNewNote = useCallback(async () => {
    try {
      const res = await fetch('/api/user/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: [], tags: [] }),
      });
      if (res.ok) {
        const data = await res.json();
        const note: LearnerNote = data.note;
        setNotes((prev) => [note, ...prev]);
        setActiveNote(note);
      }
    } catch {
      // silent
    }
  }, []);

  const handleNoteUpdate = useCallback((updated: LearnerNote) => {
    setActiveNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  }, []);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    try {
      await fetch(`/api/user/notes/${noteId}`, { method: 'DELETE' });
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (activeNote?.id === noteId) setActiveNote(null);
    } catch {
      // silent
    }
  }, [activeNote]);

  const FILTERS: { label: string; value: FilterType }[] = [
    { label: 'All Notes', value: 'all' },
    { label: '⭐ Important', value: 'important' },
    { label: '❓ Question', value: 'question' },
    { label: '🔁 Review', value: 'review' },
    { label: '💡 Idea', value: 'idea' },
    { label: '📌 Remember', value: 'remember' },
    { label: '📋 Example', value: 'example' },
  ];

  /* ---- If a note is open, show editor ---- */
  if (activeNote) {
    return (
      <div>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setActiveNote(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#2563EB',
              fontWeight: 700,
              padding: 0,
            }}
            aria-label="Back to notes list"
          >
            ← Back to notes
          </button>
          <button
            onClick={() => handleDeleteNote(activeNote.id)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '4px 12px',
              cursor: 'pointer',
            }}
            aria-label="Delete this note"
          >
            Delete
          </button>
        </div>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            minHeight: '500px',
            overflow: 'hidden',
          }}
        >
          <NoteEditor
            note={activeNote}
            onUpdate={handleNoteUpdate}
            onSaveStateChange={setSaveState}
            saveState={saveState}
            dark={false}
            compact={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Study Notes
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
              All your notes across lessons, captured in one place.
            </p>
          </div>
          <button
            onClick={handleNewNote}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
            aria-label="Create new note"
          >
            + New Note
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          aria-label="Search notes"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1.5px solid #E2E8F0',
            fontSize: '0.88rem',
            outline: 'none',
            background: '#FFFFFF',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            style={{
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1.5px solid',
              borderColor: filter === f.value ? '#2563EB' : '#E2E8F0',
              background: filter === f.value ? '#EFF6FF' : '#FFFFFF',
              color: filter === f.value ? '#2563EB' : '#64748B',
              transition: 'all 150ms ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', fontSize: '0.88rem' }}>
          Loading notes…
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#DC2626',
          fontSize: '0.85rem',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      {!loading && !error && notes.length === 0 && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1.5px dashed #CBD5E1',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
            {filter === 'all' ? 'No notes yet' : `No ${filter} notes`}
          </h3>
          <p style={{ color: '#64748B', fontWeight: 500, fontSize: '0.88rem', margin: '0 0 18px 0', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
            {filter === 'all'
              ? 'Click "+ New Note" above or take notes while in the classroom.'
              : 'Try a different filter or create a new note.'}
          </p>
          <button
            onClick={handleNewNote}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.65rem 1.3rem',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            + New Note
          </button>
        </div>
      )}

      {!loading && !error && notes.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}>
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => setActiveNote(note)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Note card                                                           */
/* ------------------------------------------------------------------ */

interface NoteCardProps {
  note: LearnerNote;
  onClick: () => void;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, onDelete }) => {
  const preview = note.blocks.find((b) => b.content)?.content ?? '';
  const truncated = preview.length > 120 ? preview.slice(0, 120) + '…' : preview;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1.5px solid #E2E8F0',
        padding: '16px',
        cursor: 'pointer',
        transition: 'box-shadow 150ms ease, border-color 150ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Open note: ${note.title || 'Untitled'}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
    >
      {/* Title */}
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
        {note.title || 'Untitled note'}
      </div>

      {/* Preview */}
      {truncated && (
        <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
          {truncated}
        </div>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {note.tags.map((tag) => {
            const colors = NOTE_TAG_COLORS[tag as NoteTag];
            return (
              <span
                key={tag}
                style={{
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  background: colors?.bg ?? '#F1F5F9',
                  color: colors?.text ?? '#64748B',
                  border: `1px solid ${colors?.border ?? '#E2E8F0'}`,
                }}
              >
                {NOTE_TAG_LABELS[tag as NoteTag] ?? tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
          {note.topic_title && (
            <span style={{ marginRight: '6px', fontWeight: 500 }}>{note.topic_title}</span>
          )}
          {formatRelativeTime(note.updated_at)}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Delete note"
          title="Delete"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#CBD5E1',
            fontSize: '14px',
            padding: '2px 4px',
            borderRadius: '4px',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotesView;
