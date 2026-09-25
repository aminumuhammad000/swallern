/**
 * Swallern Learning Notes — Core Type Definitions
 */

export type NoteTag = 'important' | 'question' | 'remember' | 'example' | 'review' | 'idea';

export type NoteBlockType =
  | 'text'
  | 'heading'
  | 'bullet'
  | 'numbered'
  | 'checklist'
  | 'quote'
  | 'callout'
  | 'code'
  | 'divider'
  | 'link'
  | 'image';

export interface NoteBlock {
  id: string;
  type: NoteBlockType;
  content: string;
  /** For checklist: whether the item is checked */
  checked?: boolean;
  /** For heading: level 1 or 2 */
  level?: 1 | 2;
  /** For code: programming language hint */
  language?: string;
  /** For link: url */
  url?: string;
  /** For image: alt text */
  alt?: string;
}

export interface LearnerNote {
  id: string;
  user_id: string;
  title: string | null;
  topic_id: string | null;
  topic_slug: string | null;
  topic_title: string | null;
  lesson_id: string | null;
  section_id: string | null;
  step_index: number | null;
  blocks: NoteBlock[];
  tags: NoteTag[];
  is_important: boolean;
  is_review: boolean;
  is_deleted: boolean;
  source_excerpt: string | null;
  created_at: string;
  updated_at: string;
}

/** For creating a new note from a lesson context */
export interface NoteCreateInput {
  title?: string;
  topic_id?: string;
  topic_slug?: string;
  topic_title?: string;
  lesson_id?: string;
  section_id?: string;
  step_index?: number;
  blocks?: NoteBlock[];
  tags?: NoteTag[];
  is_important?: boolean;
  is_review?: boolean;
  source_excerpt?: string;
}

/** Autosave save state */
export type NoteSaveState = 'idle' | 'typing' | 'saving' | 'saved' | 'error';

/** NoteBlock with a generated client id */
export function makeBlock(type: NoteBlockType, content = ''): NoteBlock {
  return {
    id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    content,
  };
}

export const NOTE_TAG_LABELS: Record<NoteTag, string> = {
  important: 'Important',
  question: 'Question',
  remember: 'Remember',
  example: 'Example',
  review: 'Review',
  idea: 'Idea',
};

export const NOTE_TAG_COLORS: Record<NoteTag, { bg: string; text: string; border: string }> = {
  important: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  question: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  remember: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  example: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  review: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  idea: { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
};

export const BLOCK_TYPE_LABELS: Record<NoteBlockType, string> = {
  text: 'Text',
  heading: 'Heading',
  bullet: 'Bullet list',
  numbered: 'Numbered list',
  checklist: 'Checklist',
  quote: 'Quote',
  callout: 'Callout',
  code: 'Code',
  divider: 'Divider',
  link: 'Link',
  image: 'Image',
};

export const SLASH_COMMANDS: Array<{ cmd: string; type: NoteBlockType; description: string; icon: string }> = [
  { cmd: 'text', type: 'text', description: 'Plain text paragraph', icon: 'T' },
  { cmd: 'heading', type: 'heading', description: 'Section heading', icon: 'H' },
  { cmd: 'bullet', type: 'bullet', description: 'Bullet list item', icon: '•' },
  { cmd: 'number', type: 'numbered', description: 'Numbered list', icon: '1.' },
  { cmd: 'todo', type: 'checklist', description: 'Checklist item', icon: '☐' },
  { cmd: 'quote', type: 'quote', description: 'Blockquote', icon: '"' },
  { cmd: 'callout', type: 'callout', description: 'Important callout box', icon: '!' },
  { cmd: 'code', type: 'code', description: 'Code block', icon: '</>' },
  { cmd: 'divider', type: 'divider', description: 'Horizontal divider', icon: '—' },
  { cmd: 'link', type: 'link', description: 'Link', icon: '↗' },
];
