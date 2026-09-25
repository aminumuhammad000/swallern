'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LearnerNote,
  NoteBlock,
  NoteBlockType,
  NoteSaveState,
  makeBlock,
  SLASH_COMMANDS,
  NOTE_TAG_LABELS,
  NOTE_TAG_COLORS,
  NoteTag,
} from '@/lib/notes/types';
import { saveLocalNote } from '@/lib/notes/localNotes';

interface NoteEditorProps {
  note: LearnerNote;
  onUpdate: (updated: LearnerNote) => void;
  onSaveStateChange: (state: NoteSaveState) => void;
  saveState: NoteSaveState;
  dark?: boolean;
  compact?: boolean;
}

/* ------------------------------------------------------------------ */
/* Slash command menu                                                   */
/* ------------------------------------------------------------------ */

interface SlashMenuProps {
  query: string;
  onSelect: (type: NoteBlockType) => void;
  dark: boolean;
}

const SlashMenu: React.FC<SlashMenuProps> = ({ query, onSelect, dark }) => {
  const filtered = SLASH_COMMANDS.filter(
    (c) =>
      !query ||
      c.cmd.startsWith(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <div
      className="notes-slash-menu"
      role="listbox"
      aria-label="Block type menu"
      style={{
        position: 'absolute',
        zIndex: 200,
        background: dark ? '#1E293B' : '#FFFFFF',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`,
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
        padding: '6px',
        minWidth: '220px',
        top: '100%',
        left: 0,
        marginTop: '4px',
      }}
    >
      {filtered.map((cmd) => (
        <button
          key={cmd.cmd}
          role="option"
          aria-selected={false}
          onMouseDown={(e) => { e.preventDefault(); onSelect(cmd.type); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '7px 10px',
            borderRadius: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              background: dark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: dark ? '#94A3B8' : '#475569',
              flexShrink: 0,
            }}
          >
            {cmd.icon}
          </span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: dark ? '#F1F5F9' : '#0F172A' }}>
              {cmd.description}
            </div>
            <div style={{ fontSize: '0.7rem', color: dark ? '#64748B' : '#94A3B8' }}>/{cmd.cmd}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Single block renderer                                               */
/* ------------------------------------------------------------------ */

interface BlockEditorProps {
  block: NoteBlock;
  index: number;
  total: number;
  dark: boolean;
  compact: boolean;
  onChange: (id: string, partial: Partial<NoteBlock>) => void;
  onEnter: (id: string) => void;
  onBackspace: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  onSlashCommand: (id: string, type: NoteBlockType) => void;
  focusId: string | null;
  onFocus: (id: string) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  index,
  total,
  dark,
  compact,
  onChange,
  onEnter,
  onBackspace,
  onMoveUp,
  onMoveDown,
  onDelete,
  onSlashCommand,
  focusId,
  onFocus,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (focusId === block.id && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [focusId, block.id]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  useEffect(() => { autoResize(); }, [block.content, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const val = e.currentTarget.value;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setSlashQuery(null);
      onEnter(block.id);
      return;
    }

    if (e.key === 'Backspace' && val === '') {
      e.preventDefault();
      setSlashQuery(null);
      onBackspace(block.id);
      return;
    }

    if (e.key === 'Escape') {
      setSlashQuery(null);
      return;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    // Detect slash command trigger
    if (val === '/') {
      setSlashQuery('');
    } else if (slashQuery !== null) {
      if (val.startsWith('/')) {
        setSlashQuery(val.slice(1));
      } else {
        setSlashQuery(null);
      }
    }

    onChange(block.id, { content: val });
    autoResize();
  };

  const handleSlashSelect = (type: NoteBlockType) => {
    setSlashQuery(null);
    onSlashCommand(block.id, type);
  };

  // Divider block - no textarea
  if (block.type === 'divider') {
    return (
      <div
        style={{ position: 'relative', padding: '4px 0' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <hr style={{ border: 'none', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : '#E2E8F0'}`, margin: 0 }} />
        {hovered && (
          <BlockActions dark={dark} onMoveUp={() => onMoveUp(block.id)} onMoveDown={() => onMoveDown(block.id)} onDelete={() => onDelete(block.id)} first={index === 0} last={index === total - 1} />
        )}
      </div>
    );
  }

  const blockStyles = getBlockTextareaStyles(block, dark, compact);

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checklist checkbox */}
      {block.type === 'checklist' && (
        <div style={{ position: 'absolute', left: 0, top: '8px' }}>
          <input
            type="checkbox"
            checked={block.checked ?? false}
            onChange={(e) => onChange(block.id, { checked: e.target.checked })}
            aria-label="Toggle checklist item"
            style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#2563EB' }}
          />
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          className="note-block-textarea"
          value={block.content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => onFocus(block.id)}
          placeholder={getBlockPlaceholder(block.type)}
          rows={1}
          aria-label={`${block.type} block`}
          style={blockStyles}
        />

        {/* Slash command menu */}
        {slashQuery !== null && (
          <SlashMenu query={slashQuery} onSelect={handleSlashSelect} dark={dark} />
        )}
      </div>

      {/* Link URL input */}
      {block.type === 'link' && (
        <input
          type="url"
          value={block.url ?? ''}
          onChange={(e) => onChange(block.id, { url: e.target.value })}
          placeholder="https://..."
          aria-label="Link URL"
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: '8px',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : '#E2E8F0'}`,
            background: 'transparent',
            color: dark ? '#93C5FD' : '#2563EB',
            fontSize: '0.78rem',
            outline: 'none',
            marginTop: '4px',
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* Block action buttons on hover */}
      {hovered && (
        <BlockActions
          dark={dark}
          onMoveUp={() => onMoveUp(block.id)}
          onMoveDown={() => onMoveDown(block.id)}
          onDelete={() => onDelete(block.id)}
          first={index === 0}
          last={index === total - 1}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Block action buttons                                                */
/* ------------------------------------------------------------------ */

interface BlockActionsProps {
  dark: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  first: boolean;
  last: boolean;
}

const BlockActions: React.FC<BlockActionsProps> = ({ dark, onMoveUp, onMoveDown, onDelete, first, last }) => (
  <div
    style={{
      position: 'absolute',
      right: '-2px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      gap: '2px',
      zIndex: 10,
    }}
  >
    {!first && (
      <button
        onMouseDown={(e) => { e.preventDefault(); onMoveUp(); }}
        aria-label="Move block up"
        title="Move up"
        style={actionBtnStyle(dark)}
      >↑</button>
    )}
    {!last && (
      <button
        onMouseDown={(e) => { e.preventDefault(); onMoveDown(); }}
        aria-label="Move block down"
        title="Move down"
        style={actionBtnStyle(dark)}
      >↓</button>
    )}
    <button
      onMouseDown={(e) => { e.preventDefault(); onDelete(); }}
      aria-label="Delete block"
      title="Delete block"
      style={{ ...actionBtnStyle(dark), color: '#EF4444' }}
    >×</button>
  </div>
);

const actionBtnStyle = (dark: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: '5px',
  background: dark ? 'rgba(255,255,255,0.1)' : '#F1F5F9',
  border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`,
  fontSize: '11px',
  cursor: 'pointer',
  color: dark ? '#94A3B8' : '#64748B',
  padding: 0,
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getBlockPlaceholder(type: NoteBlockType): string {
  switch (type) {
    case 'heading': return 'Heading...';
    case 'bullet': return 'List item...';
    case 'numbered': return 'Numbered item...';
    case 'checklist': return 'To-do item...';
    case 'quote': return 'Quote...';
    case 'callout': return 'Callout...';
    case 'code': return 'Code...';
    case 'link': return 'Link label...';
    case 'image': return 'Image URL...';
    default: return "Type '/' for commands...";
  }
}

function getBlockTextareaStyles(
  block: NoteBlock,
  dark: boolean,
  compact: boolean
): React.CSSProperties {
  const base: React.CSSProperties = {
    width: '100%',
    resize: 'none',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    lineHeight: 1.6,
    overflow: 'hidden',
    boxSizing: 'border-box',
    display: 'block',
  };

  switch (block.type) {
    case 'heading':
      return {
        ...base,
        fontSize: compact ? '1rem' : '1.15rem',
        fontWeight: 700,
        color: dark ? '#F1F5F9' : '#0F172A',
        padding: '2px 0',
      };
    case 'bullet':
      return {
        ...base,
        fontSize: compact ? '0.82rem' : '0.88rem',
        color: dark ? '#CBD5E1' : '#334155',
        paddingLeft: '16px',
      };
    case 'numbered':
      return {
        ...base,
        fontSize: compact ? '0.82rem' : '0.88rem',
        color: dark ? '#CBD5E1' : '#334155',
        paddingLeft: '20px',
      };
    case 'checklist':
      return {
        ...base,
        fontSize: compact ? '0.82rem' : '0.88rem',
        color: block.checked ? (dark ? '#64748B' : '#94A3B8') : (dark ? '#CBD5E1' : '#334155'),
        textDecoration: block.checked ? 'line-through' : 'none',
        paddingLeft: '20px',
      };
    case 'quote':
      return {
        ...base,
        fontSize: compact ? '0.82rem' : '0.88rem',
        fontStyle: 'italic',
        color: dark ? '#94A3B8' : '#475569',
        borderLeft: `3px solid ${dark ? '#475569' : '#CBD5E1'}`,
        paddingLeft: '12px',
      };
    case 'callout':
      return {
        ...base,
        fontSize: compact ? '0.82rem' : '0.88rem',
        color: dark ? '#FEF3C7' : '#92400E',
        background: dark ? 'rgba(245,158,11,0.12)' : '#FFFBEB',
        borderRadius: '8px',
        padding: '8px 12px',
        border: `1px solid ${dark ? 'rgba(245,158,11,0.25)' : '#FDE68A'}`,
      };
    case 'code':
      return {
        ...base,
        fontSize: '0.78rem',
        fontFamily: '"Fira Mono", "Courier New", monospace',
        color: dark ? '#7DD3FC' : '#0F172A',
        background: dark ? 'rgba(15,23,42,0.6)' : '#F8FAFC',
        borderRadius: '8px',
        padding: '8px 12px',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
      };
    default:
      return {
        ...base,
        fontSize: compact ? '0.82rem' : '0.88rem',
        color: dark ? '#CBD5E1' : '#334155',
        padding: '2px 0',
      };
  }
}

/* ------------------------------------------------------------------ */
/* Save state indicator                                               */
/* ------------------------------------------------------------------ */

const SaveIndicator: React.FC<{ state: NoteSaveState; dark: boolean }> = ({ state, dark }) => {
  const label = state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : state === 'error' ? 'Save failed' : '';
  const color = state === 'error' ? '#EF4444' : state === 'saved' ? '#059669' : dark ? '#64748B' : '#94A3B8';

  if (!label) return null;

  return (
    <div
      className="notes-save-indicator"
      aria-live="polite"
      style={{ fontSize: '0.7rem', color, fontWeight: 500, transition: 'opacity 300ms' }}
    >
      {label}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main NoteEditor component                                          */
/* ------------------------------------------------------------------ */

const DEBOUNCE_MS = 800;

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdate,
  onSaveStateChange,
  saveState,
  dark = false,
  compact = false,
}) => {
  const [blocks, setBlocks] = useState<NoteBlock[]>(
    note.blocks.length > 0 ? note.blocks : [makeBlock('text')]
  );
  const [title, setTitle] = useState(note.title ?? '');
  const [focusId, setFocusId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Sync when note changes from outside
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setTitle(note.title ?? '');
    setBlocks(note.blocks.length > 0 ? note.blocks : [makeBlock('text')]);
  }, [note.id]);

  const scheduleAutosave = useCallback((updatedNote: LearnerNote) => {
    onSaveStateChange('typing');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      onSaveStateChange('saving');
      try {
        // Save locally first
        saveLocalNote(updatedNote);

        // Then sync to server (skip local-only notes)
        if (!updatedNote.id.startsWith('local_')) {
          const res = await fetch(`/api/user/notes/${updatedNote.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: updatedNote.title,
              blocks: updatedNote.blocks,
              tags: updatedNote.tags,
              is_important: updatedNote.is_important,
              is_review: updatedNote.is_review,
            }),
          });
          if (!res.ok) throw new Error('Save failed');
        }
        onSaveStateChange('saved');
      } catch {
        onSaveStateChange('error');
      }
    }, DEBOUNCE_MS);
  }, [onSaveStateChange]);

  const emitUpdate = useCallback((newBlocks: NoteBlock[], newTitle: string) => {
    const updated: LearnerNote = {
      ...note,
      title: newTitle || null,
      blocks: newBlocks,
      updated_at: new Date().toISOString(),
    };
    onUpdate(updated);
    scheduleAutosave(updated);
  }, [note, onUpdate, scheduleAutosave]);

  /* ---- block operations ---- */

  const handleBlockChange = useCallback((id: string, partial: Partial<NoteBlock>) => {
    setBlocks((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...partial } : b));
      emitUpdate(next, title);
      return next;
    });
  }, [emitUpdate, title]);

  const handleEnter = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      const newBlock = makeBlock('text');
      const next = [...prev.slice(0, idx + 1), newBlock, ...prev.slice(idx + 1)];
      setFocusId(newBlock.id);
      emitUpdate(next, title);
      return next;
    });
  }, [emitUpdate, title]);

  const handleBackspace = useCallback((id: string) => {
    setBlocks((prev) => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex((b) => b.id === id);
      const next = prev.filter((b) => b.id !== id);
      const focusIdx = Math.max(0, idx - 1);
      setFocusId(next[focusIdx]?.id ?? null);
      emitUpdate(next, title);
      return next;
    });
  }, [emitUpdate, title]);

  const handleMoveUp = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      emitUpdate(next, title);
      return next;
    });
  }, [emitUpdate, title]);

  const handleMoveDown = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      emitUpdate(next, title);
      return next;
    });
  }, [emitUpdate, title]);

  const handleDelete = useCallback((id: string) => {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      const result = next.length > 0 ? next : [makeBlock('text')];
      emitUpdate(result, title);
      return result;
    });
  }, [emitUpdate, title]);

  const handleSlashCommand = useCallback((id: string, type: NoteBlockType) => {
    setBlocks((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, type, content: '' } : b));
      emitUpdate(next, title);
      return next;
    });
    setFocusId(id);
  }, [emitUpdate, title]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    emitUpdate(blocks, newTitle);
  }, [emitUpdate, blocks]);

  const handleTagToggle = useCallback((tag: NoteTag) => {
    const updated: LearnerNote = {
      ...note,
      tags: note.tags.includes(tag)
        ? note.tags.filter((t) => t !== tag)
        : [...note.tags, tag],
      updated_at: new Date().toISOString(),
    };
    onUpdate(updated);
    scheduleAutosave(updated);
  }, [note, onUpdate, scheduleAutosave]);

  const textPrimary = dark ? '#F1F5F9' : '#0F172A';
  const textSecondary = dark ? '#94A3B8' : '#64748B';
  const borderColor = dark ? 'rgba(255,255,255,0.1)' : '#E2E8F0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
      {/* Header: title + save indicator */}
      <div
        style={{
          padding: compact ? '10px 12px 6px' : '14px 16px 8px',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Note title..."
            aria-label="Note title"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: compact ? '0.9rem' : '1rem',
              fontWeight: 700,
              color: textPrimary,
              fontFamily: 'inherit',
              minWidth: 0,
            }}
          />
          <SaveIndicator state={saveState} dark={dark} />
        </div>

        {/* Tags row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {(Object.keys(NOTE_TAG_LABELS) as NoteTag[]).map((tag) => {
            const isActive = note.tags.includes(tag);
            const colors = NOTE_TAG_COLORS[tag];
            return (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                aria-label={`${isActive ? 'Remove' : 'Add'} tag: ${NOTE_TAG_LABELS[tag]}`}
                aria-pressed={isActive}
                style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1px solid ${isActive ? colors.border : (dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0')}`,
                  background: isActive ? colors.bg : 'transparent',
                  color: isActive ? colors.text : textSecondary,
                  transition: 'all 150ms ease',
                }}
              >
                {NOTE_TAG_LABELS[tag]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Block list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: compact ? '8px 12px' : '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {blocks.map((block, idx) => (
          <BlockEditor
            key={block.id}
            block={block}
            index={idx}
            total={blocks.length}
            dark={dark}
            compact={compact}
            onChange={handleBlockChange}
            onEnter={handleEnter}
            onBackspace={handleBackspace}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDelete={handleDelete}
            onSlashCommand={handleSlashCommand}
            focusId={focusId}
            onFocus={setFocusId}
          />
        ))}

        {/* Click-to-add-block area */}
        <div
          onClick={() => {
            const newBlock = makeBlock('text');
            setBlocks((prev) => {
              const next = [...prev, newBlock];
              emitUpdate(next, title);
              return next;
            });
            setFocusId(newBlock.id);
          }}
          role="button"
          aria-label="Add new block"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
          style={{
            minHeight: '32px',
            cursor: 'text',
            borderRadius: '6px',
          }}
        />
      </div>
    </div>
  );
};

export default NoteEditor;
