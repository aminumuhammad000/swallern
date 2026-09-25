'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AIGeneratorPanel } from './AIGeneratorPanel';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Source {
  id: string;
  url: string;
  title: string;
  publisher: string | null;
  reliability_score: number | null;
  source_type: string | null;
  notes: string | null;
  published_at: string | null;
  accessed_at: string | null;
}

interface Claim {
  id: string;
  topic_id: string;
  claim_text: string;
  status: 'UNVERIFIED' | 'SUPPORTED' | 'DISPUTED' | 'REJECTED';
  notes: string | null;
  sources: Source[];
}

interface Coverage {
  total: number;
  supported: number;
  unverified: number;
  disputed: number;
  rejected: number;
  coveragePct: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SOURCE_TYPES = ['PRIMARY','GOVERNMENT','UNIVERSITY','SCIENTIFIC','REFERENCE','NEWS','VIDEO','OTHER'];

const CLAIM_STATUS_COLORS: Record<string, string> = {
  UNVERIFIED: '#d97706',
  SUPPORTED:  '#16a34a',
  DISPUTED:   '#2563eb',
  REJECTED:   '#dc2626',
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  PRIMARY: '🏛 Primary',
  GOVERNMENT: '🏢 Government',
  UNIVERSITY: '🎓 University',
  SCIENTIFIC: '🔬 Scientific',
  REFERENCE: '📚 Reference',
  NEWS: '📰 News',
  VIDEO: '🎥 Video',
  OTHER: '🔗 Other',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function CoverageBar({ coverage }: { coverage: Coverage }) {
  const { total, supported, unverified, disputed, rejected, coveragePct } = coverage;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
          Citation Coverage: <span style={{ color: coveragePct >= 80 ? '#16a34a' : coveragePct >= 50 ? '#d97706' : '#dc2626' }}>{coveragePct}%</span>
        </span>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{total} claim{total !== 1 ? 's' : ''}</span>
      </div>
      <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: '#f3f4f6' }}>
        {total > 0 && <>
          <div style={{ width: `${(supported / total) * 100}%`, background: '#16a34a' }} />
          <div style={{ width: `${(disputed / total) * 100}%`, background: '#2563eb' }} />
          <div style={{ width: `${(unverified / total) * 100}%`, background: '#d97706' }} />
          <div style={{ width: `${(rejected / total) * 100}%`, background: '#dc2626' }} />
        </>}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Supported', n: supported, color: '#16a34a' },
          { label: 'Unverified', n: unverified, color: '#d97706' },
          { label: 'Disputed', n: disputed, color: '#2563eb' },
          { label: 'Rejected', n: rejected, color: '#dc2626' },
        ].map(({ label, n, color }) => (
          <span key={label} style={{ fontSize: '0.72rem', color }}>
            <strong>{n}</strong> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main ResearchTab ──────────────────────────────────────────────────────────

export function ResearchTab({ topicId, topicSources }: {
  topicId: string;
  topicSources: Source[];
}) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Claim form state
  const [addingClaim, setAddingClaim] = useState(false);
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [claimForm, setClaimForm] = useState({ claim_text: '', status: 'UNVERIFIED', notes: '' });
  const [saving, setSaving] = useState(false);

  // Source-link modal state
  const [linkingClaimId, setLinkingClaimId] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const loadResearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/claims?topic_id=${topicId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setClaims(data.claims || []);
      setCoverage(data.coverage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load research data');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => { loadResearch(); }, [loadResearch]);

  // ── Claim CRUD ──────────────────────────────────────────────────────────────

  const saveClaim = async () => {
    if (!claimForm.claim_text.trim()) { setError('Claim text is required'); return; }
    setSaving(true); setError(null);
    try {
      const action = editingClaimId ? 'update_claim' : 'create_claim';
      const payload: Record<string, unknown> = {
        action,
        topic_id: topicId,
        claim_text: claimForm.claim_text,
        status: claimForm.status,
        notes: claimForm.notes || null,
      };
      if (editingClaimId) payload.claim_id = editingClaimId;
      const res = await fetch('/api/admin/claims', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showSuccess(editingClaimId ? 'Claim updated.' : 'Claim created.');
      setAddingClaim(false); setEditingClaimId(null);
      setClaimForm({ claim_text: '', status: 'UNVERIFIED', notes: '' });
      loadResearch();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save claim'); }
    finally { setSaving(false); }
  };

  const deleteClaim = async (claimId: string) => {
    if (!confirm('Delete this claim? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/claims', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_claim', topic_id: topicId, claim_id: claimId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showSuccess('Claim deleted.');
      loadResearch();
    } catch (e) { alert(e instanceof Error ? e.message : 'Delete failed'); }
  };

  const startEditClaim = (c: Claim) => {
    setEditingClaimId(c.id);
    setAddingClaim(false);
    setClaimForm({ claim_text: c.claim_text, status: c.status, notes: c.notes || '' });
  };

  // ── Source-link actions ─────────────────────────────────────────────────────

  const linkSource = async (claimId: string, sourceId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/claims', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'link_source', topic_id: topicId, claim_id: claimId, source_id: sourceId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showSuccess('Source linked to claim.');
      setLinkingClaimId(null);
      loadResearch();
    } catch (e) { alert(e instanceof Error ? e.message : 'Link failed'); }
    finally { setSaving(false); }
  };

  const unlinkSource = async (claimId: string, sourceId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/claims', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlink_source', topic_id: topicId, claim_id: claimId, source_id: sourceId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showSuccess('Source unlinked.');
      loadResearch();
    } catch (e) { alert(e instanceof Error ? e.message : 'Unlink failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Alerts */}
      {error && <div style={alertStyle('#fef2f2', '#fecaca', '#dc2626')}>{error}</div>}
      {successMsg && <div style={alertStyle('#f0fdf4', '#bbf7d0', '#16a34a')}>{successMsg}</div>}

      {/* Coverage bar */}
      {coverage && <CoverageBar coverage={coverage} />}

      {loading && <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading research data…</div>}

      {/* Source inventory (read from topicSources prop) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={sectionTitle}>Topic Sources ({topicSources.length})</h3>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Manage in Sources tab</span>
        </div>
        {topicSources.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No sources attached yet. Add them in the Sources tab.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {topicSources.map((s) => (
              <div key={s.id} style={{ ...itemRow, padding: '0.5rem 0.75rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 500, fontSize: '0.82rem', color: '#111827' }}>{s.title}</span>
                  {s.source_type && (
                    <span style={{
                      marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.1rem 0.4rem',
                      borderRadius: '4px', background: '#f3f4f6', color: '#6b7280',
                    }}>
                      {SOURCE_TYPE_LABELS[s.source_type] || s.source_type}
                    </span>
                  )}
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.url}
                  </a>
                </div>
                {typeof s.reliability_score === 'number' && (
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                    Rel: {s.reliability_score}/5
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claims section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={sectionTitle}>Claims ({claims.length})</h3>
          {!addingClaim && !editingClaimId && (
            <button
              onClick={() => { setAddingClaim(true); setEditingClaimId(null); setClaimForm({ claim_text: '', status: 'UNVERIFIED', notes: '' }); }}
              style={secondaryBtn}
            >
              + Add Claim
            </button>
          )}
        </div>

        {/* Claim form */}
        {(addingClaim || editingClaimId) && (
          <div style={{ ...inlineFormStyle, marginBottom: '0.75rem' }}>
            <ClaimForm
              form={claimForm}
              setForm={setClaimForm}
              saving={saving}
              onSave={saveClaim}
              onCancel={() => { setAddingClaim(false); setEditingClaimId(null); }}
              isEdit={!!editingClaimId}
            />
          </div>
        )}

        {claims.length === 0 && !addingClaim ? (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            No claims yet. Add factual claims that this topic makes, then link sources to support them.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {claims.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                topicSources={topicSources}
                onEdit={() => startEditClaim(claim)}
                onDelete={() => deleteClaim(claim.id)}
                onLinkSource={() => setLinkingClaimId(linkingClaimId === claim.id ? null : claim.id)}
                onUnlinkSource={(sourceId) => unlinkSource(claim.id, sourceId)}
                onDoLink={(sourceId) => linkSource(claim.id, sourceId)}
                showLinkPanel={linkingClaimId === claim.id}
                saving={saving}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Content Generation Panel */}
      <AIGeneratorPanel
        topicId={topicId}
        topicTitle=""
        topicSourcesCount={topicSources.length}
        onDraftAccepted={loadResearch}
      />
    </div>
  );
}

// ── Claim form ────────────────────────────────────────────────────────────────

function ClaimForm({
  form, setForm, saving, onSave, onCancel, isEdit,
}: {
  form: { claim_text: string; status: string; notes: string };
  setForm: React.Dispatch<React.SetStateAction<{ claim_text: string; status: string; notes: string }>>;
  saving: boolean; onSave: () => void; onCancel: () => void; isEdit: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        <label style={labelStyle}>Claim Text *</label>
        <textarea
          value={form.claim_text}
          onChange={(e) => setForm({ ...form, claim_text: e.target.value })}
          style={{ ...inputFull, minHeight: '70px', marginTop: '0.3rem' }}
          placeholder="A factual statement this topic makes. E.g. 'Rayleigh scattering causes blue light to scatter more than red.'"
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ ...inputFull, marginTop: '0.3rem' }}>
            <option value="UNVERIFIED">UNVERIFIED</option>
            <option value="SUPPORTED">SUPPORTED</option>
            <option value="DISPUTED">DISPUTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Editorial Notes</label>
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...inputFull, marginTop: '0.3rem' }} placeholder="Internal notes (not public)" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button disabled={saving} onClick={onSave} style={primaryBtn}>
          {saving ? 'Saving…' : (isEdit ? 'Update Claim' : 'Add Claim')}
        </button>
        <button onClick={onCancel} style={ghostBtn}>Cancel</button>
      </div>
    </div>
  );
}

// ── ClaimCard ─────────────────────────────────────────────────────────────────

function ClaimCard({
  claim, topicSources, onEdit, onDelete,
  onLinkSource, onUnlinkSource, onDoLink, showLinkPanel, saving,
}: {
  claim: Claim;
  topicSources: Source[];
  onEdit: () => void;
  onDelete: () => void;
  onLinkSource: () => void;
  onUnlinkSource: (sourceId: string) => void;
  onDoLink: (sourceId: string) => void;
  showLinkPanel: boolean;
  saving: boolean;
}) {
  const linkedIds = new Set(claim.sources.map((s) => s.id));
  const available = topicSources.filter((s) => !linkedIds.has(s.id));
  const color = CLAIM_STATUS_COLORS[claim.status] || '#6b7280';

  return (
    <div style={{ border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`, borderRadius: '6px', background: '#fafafa', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '0.1rem 0.45rem', borderRadius: '9999px',
              background: `${color}15`, color,
            }}>
              {claim.status}
            </span>
            {claim.sources.length > 0 && (
              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                {claim.sources.length} source{claim.sources.length !== 1 ? 's' : ''}
              </span>
            )}
            {claim.status === 'UNVERIFIED' && claim.sources.length === 0 && (
              <span style={{ fontSize: '0.7rem', color: '#d97706', fontStyle: 'italic' }}>⚠ No source support</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#111827', lineHeight: 1.5 }}>{claim.claim_text}</p>
          {claim.notes && (
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>
              Note: {claim.notes}
            </p>
          )}
          {/* Linked sources */}
          {claim.sources.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
              {claim.sources.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '0.15rem 0.4rem', fontSize: '0.72rem' }}>
                  <span style={{ color: '#065f46', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title}
                  </span>
                  <button
                    onClick={() => onUnlinkSource(s.id)}
                    disabled={saving}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.7rem', padding: 0, lineHeight: 1 }}
                    title="Unlink source"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
          <button onClick={onLinkSource} style={editMiniBtn} title="Attach source">
            {showLinkPanel ? '↑ Close' : '＋ Source'}
          </button>
          <button onClick={onEdit} style={editMiniBtn}>Edit</button>
          <button onClick={onDelete} style={deleteMiniBtn}>Del</button>
        </div>
      </div>
      {/* Link source panel */}
      {showLinkPanel && (
        <div style={{ borderTop: '1px dashed #c7d2fe', padding: '0.65rem 0.75rem', background: '#f5f3ff' }}>
          {available.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>
              All topic sources are already linked, or no sources added. Add sources in the Sources tab first.
            </p>
          ) : (
            <>
              <div style={{ fontSize: '0.78rem', color: '#374151', marginBottom: '0.4rem', fontWeight: 500 }}>
                Link a source to this claim:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {available.map((s) => (
                  <button
                    key={s.id}
                    disabled={saving}
                    onClick={() => onDoLink(s.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                      textAlign: 'left', background: '#fff', border: '1px solid #e5e7eb',
                      borderRadius: '5px', padding: '0.4rem 0.65rem', cursor: 'pointer', fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ flex: 1, color: '#111827' }}>{s.title}</span>
                    {s.source_type && <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{s.source_type}</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151',
  textTransform: 'uppercase', letterSpacing: '0.03em',
};
const inputFull: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '0.45rem 0.75rem', border: '1px solid #d1d5db',
  borderRadius: '6px', fontSize: '0.875rem', outline: 'none',
};
const primaryBtn: React.CSSProperties = {
  padding: '0.45rem 1rem', borderRadius: '6px',
  background: '#4f46e5', color: '#fff',
  border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
};
const secondaryBtn: React.CSSProperties = {
  padding: '0.4rem 0.85rem', borderRadius: '6px',
  background: '#fff', color: '#374151',
  border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
};
const ghostBtn: React.CSSProperties = {
  padding: '0.45rem 0.9rem', borderRadius: '6px',
  background: 'transparent', color: '#6b7280',
  border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '0.875rem',
};
const editMiniBtn: React.CSSProperties = {
  fontSize: '0.72rem', padding: '0.18rem 0.5rem', borderRadius: '4px',
  border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4f46e5', cursor: 'pointer', fontWeight: 500,
};
const deleteMiniBtn: React.CSSProperties = {
  fontSize: '0.72rem', padding: '0.18rem 0.5rem', borderRadius: '4px',
  border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontWeight: 500,
};
const sectionTitle: React.CSSProperties = { margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#374151' };
const itemRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.75rem', border: '1px solid #f3f4f6', borderRadius: '6px', background: '#fafafa',
};
const inlineFormStyle: React.CSSProperties = {
  padding: '1rem', border: '1px dashed #c7d2fe', borderRadius: '6px', background: '#f5f3ff',
};
function alertStyle(bg: string, border: string, text: string): React.CSSProperties {
  return { background: bg, border: `1px solid ${border}`, borderRadius: '6px', padding: '0.65rem 1rem', color: text, fontSize: '0.875rem' };
}
