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
      <ul className={styles.list}>
        {sources.map((source, idx) => (
          <li key={source.id || idx} className={styles.item}>
            <svg
              className={styles.icon}
              width="18"
              height="18"
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
            <div className={styles.content}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {source.title} ↗
                </a>
                {source.source_type && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      background: '#eff6ff',
                      color: '#1e40af',
                      border: '1px solid #bfdbfe',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                    aria-label={`Source type: ${SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type}`}
                  >
                    {SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type}
                  </span>
                )}
              </div>
              <span className={styles.meta}>
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
