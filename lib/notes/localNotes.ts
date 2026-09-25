'use client';
import { LearnerNote, NoteBlock, NoteTag, NoteCreateInput } from './types';

const LOCAL_KEY = 'swallern_notes_v1';

export function getLocalNotes(): LearnerNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveLocalNote(note: LearnerNote): void {
  if (typeof window === 'undefined') return;
  try {
    const notes = getLocalNotes();
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) notes[idx] = note;
    else notes.unshift(note);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(notes));
  } catch {}
}

export function getLocalNoteById(id: string): LearnerNote | null {
  return getLocalNotes().find((n) => n.id === id) ?? null;
}

export function removeLocalNote(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const notes = getLocalNotes().filter((n) => n.id !== id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(notes));
  } catch {}
}

export function createLocalNote(input: NoteCreateInput): LearnerNote {
  const now = new Date().toISOString();
  const note: LearnerNote = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    user_id: 'local',
    title: input.title ?? null,
    topic_id: input.topic_id ?? null,
    topic_slug: input.topic_slug ?? null,
    topic_title: input.topic_title ?? null,
    lesson_id: input.lesson_id ?? null,
    section_id: input.section_id ?? null,
    step_index: input.step_index ?? null,
    blocks: input.blocks ?? [],
    tags: input.tags ?? [],
    is_important: input.is_important ?? false,
    is_review: input.is_review ?? false,
    is_deleted: false,
    source_excerpt: input.source_excerpt ?? null,
    created_at: now,
    updated_at: now,
  };
  saveLocalNote(note);
  return note;
}

// Suppress unused import warning — types are re-exported for convenience
export type { LearnerNote, NoteBlock, NoteTag, NoteCreateInput };
