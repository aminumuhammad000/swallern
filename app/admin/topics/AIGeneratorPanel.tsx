'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AIDraftResult, AIServiceConfig } from '@/lib/ai/interface';

interface AIGeneratorPanelProps {
  topicId: string;
  topicTitle: string;
  topicSourcesCount: number;
  onDraftAccepted?: () => void;
}

export function AIGeneratorPanel({
  topicId,
  topicTitle,
  topicSourcesCount,
  onDraftAccepted,
}: AIGeneratorPanelProps) {
  const [config, setConfig] = useState<AIServiceConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [lastGeneratedDraft, setLastGeneratedDraft] = useState<AIDraftResult | null>(null);
  const [stats, setStats] = useState<{ claimsInserted: number; mappedSources: number } | null>(null);

  // Check server AI service status
  const checkConfig = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch(`/api/admin/topics/${topicId}/generate`);
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
      }
    } catch {
      setConfig({
        configured: false,
        providerType: 'openai',
        providerName: 'OpenAI',
        modelName: 'gpt-4o-mini',
        error: 'Failed to verify AI server configuration.',
      });
    } finally {
      setLoadingConfig(false);
    }
  }, [topicId]);

  useEffect(() => {
    checkConfig();
  }, [checkConfig]);

  const handleGenerate = async () => {
    if (generating) return;
    setError(null);
    setWarnings([]);
    setGenerating(true);

    try {
      const res = await fetch(`/api/admin/topics/${topicId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'AI content generation failed.');
      }

      setLastGeneratedDraft(data.draft);
      setWarnings(data.warnings || []);
      setStats({
        claimsInserted: data.claimsInsertedCount || 0,
        mappedSources: data.mappedSourcesCount || 0,
      });

      if (onDraftAccepted) {
        onDraftAccepted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI Generation Error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header & Engine Configuration Banner */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#111827',
                margin: 0,
              }}
            >
              🤖 AI Research & Draft Engine
            </h3>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#6b7280',
                margin: '0.25rem 0 0 0',
              }}
            >
              Generate source-backed draft explanations, claims, lessons, and quizzes for &ldquo;{topicTitle}&rdquo;.
            </p>
          </div>

          {!loadingConfig && config && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                background: config.configured ? '#dcfce7' : '#fee2e2',
                color: config.configured ? '#166534' : '#991b1b',
                border: `1px solid ${config.configured ? '#86efac' : '#fca5a5'}`,
              }}
            >
              {config.configured
                ? `${config.providerName} (${config.modelName}) Ready`
                : 'OPENAI_API_KEY Missing'}
            </span>
          )}
        </div>

        {/* Configuration Error Banner if OPENAI_API_KEY is missing */}
        {!loadingConfig && config && !config.configured && (
          <div
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              marginTop: '0.5rem',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#9f1239' }}>
              Server Configuration Required
            </div>
            <div style={{ fontSize: '0.8rem', color: '#be123c', marginTop: '0.25rem' }}>
              The <code>OPENAI_API_KEY</code> environment variable is missing on the server. To enable AI generation, add <code>OPENAI_API_KEY=your_key</code> to your environment or <code>.env</code> file.
            </div>
          </div>
        )}

        {/* Info on Attached Research Sources */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px dashed #e5e7eb',
            fontSize: '0.8rem',
            color: '#4b5563',
          }}
        >
          <span>
            Attached Research Sources: <strong>{topicSourcesCount}</strong>
          </span>
          {topicSourcesCount === 0 && (
            <span style={{ color: '#d97706', fontStyle: 'italic' }}>
              (Tip: Attach sources in the &ldquo;Sources&rdquo; tab first for best source-first citation mapping.)
            </span>
          )}
        </div>

        {/* Primary Generation Button */}
        <div style={{ marginTop: '1rem' }}>
          <button
            disabled={generating || (config ? !config.configured : false)}
            onClick={handleGenerate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: generating
                ? '#9ca3af'
                : config && !config.configured
                ? '#9ca3af'
                : '#4f46e5',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.875rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: generating || (config && !config.configured) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            {generating ? (
              <>Generating AI Draft & Extracting Claims...</>
            ) : (
              <>Generate AI Research Draft</>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.85rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
          }}
        >
          <strong>Generation Failed:</strong> {error}
        </div>
      )}

      {/* Quality Guard Warnings */}
      {warnings.length > 0 && (
        <div
          style={{
            background: '#fffbe5',
            border: '1px solid #fde68a',
            color: '#92400e',
            padding: '0.85rem 1rem',
            borderRadius: '6px',
            fontSize: '0.82rem',
          }}
        >
          <strong>Quality Guard Audit Flags:</strong>
          <ul style={{ margin: '0.35rem 0 0 1.2rem', padding: 0 }}>
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Generation Results Summary */}
      {stats && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.85rem 1rem',
            borderRadius: '6px',
            fontSize: '0.82rem',
          }}
        >
          <strong>AI Generation Completed Successfully!</strong>
          <div style={{ marginTop: '0.35rem' }}>
            • Extracted <strong>{stats.claimsInserted}</strong> factual claims (all initialized as <code>UNVERIFIED</code>).<br />
            • Mapped <strong>{stats.mappedSources}</strong> claim citations to existing topic research sources.<br />
            • Draft version, lesson, and quiz sections updated for human review.
          </div>
        </div>
      )}

      {/* Review Generated Draft Data */}
      {lastGeneratedDraft && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f3f4f6',
              paddingBottom: '0.75rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#111827', fontWeight: 700 }}>
              Draft Content Preview (Requires Human Approval)
            </h4>
            <span
              style={{
                fontSize: '0.72rem',
                background: '#fef3c7',
                color: '#92400e',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              UNAPPROVED DRAFT
            </span>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
              Draft Title & Summary
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginTop: '0.2rem' }}>
              {lastGeneratedDraft.title}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#374151', marginTop: '0.2rem' }}>
              {lastGeneratedDraft.summary}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
              Quick Answer
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: '#1e1b4b',
                background: '#f5f3ff',
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                marginTop: '0.25rem',
              }}
            >
              {lastGeneratedDraft.quick_answer}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
              Extracted Factual Claims ({lastGeneratedDraft.claims?.length || 0})
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                marginTop: '0.35rem',
              }}
            >
              {(lastGeneratedDraft.claims || []).map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #f3f4f6',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#1f2937' }}>{c.claim_text}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: '#d97706',
                      background: '#fef3c7',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      flexShrink: 0,
                      marginLeft: '0.5rem',
                    }}
                  >
                    UNVERIFIED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
