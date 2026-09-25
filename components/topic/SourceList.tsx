import React from 'react';
import { TopicSource } from '@/lib/content/contract';
import styles from './SourceList.module.css';

interface SourceListProps {
  sources: TopicSource[];
}

/**
 * Human-readable labels for source types shown publicly.
 * Helps users understand what kind of evidence supports the content.
 */
const SOURCE_TYPE_LABELS: Record<string, string> = {
  PRIMARY:    'Primary Source',
  GOVERNMENT: 'Government',
  UNIVERSITY: 'University / Academic',
  SCIENTIFIC: 'Peer-Reviewed / Scientific',
  REFERENCE:  'Reference',
  NEWS:       'News',
  VIDEO:      'Video',
  OTHER:      'Source',
};

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="sources-heading">
      <h2 id="sources-heading" className={styles.heading}>
        Sources &amp; Verification
      </h2>
      <ul
        className={styles.list}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {sources.map((source, idx) => (
          <li
            key={source.id || idx}
            className={styles.item}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 18px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              transition: 'transform 0.2s ease',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: '#EFF6FF',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div className={styles.content} style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                  style={{
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                  }}
                >
                  {source.title} ↗
                </a>
                {source.source_type && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: '#EFF6FF',
                      color: '#1E40AF',
                      border: '1px solid #BFDBFE',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                    aria-label={`Source type: ${SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type}`}
                  >
                    {SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type}
                  </span>
                )}
              </div>
              <span className={styles.meta} style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                {source.publisher && `${source.publisher}`}
                {source.publisher && source.published_at && ` • `}
                {source.published_at && `Published ${source.published_at}`}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
