import React from 'react';
import styles from './ExplanationSection.module.css';

interface ExplanationSectionProps {
  explanation: string;
}

export const ExplanationSection: React.FC<ExplanationSectionProps> = ({ explanation }) => {
  if (!explanation) return null;

  const paragraphs = explanation
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  return (
    <section className={styles.section} aria-labelledby="explanation-heading">
      <h2 id="explanation-heading" className={styles.heading}>
        Detailed Explanation
      </h2>
      <div className={styles.body}>
        {paragraphs.map((paragraph, idx) => (
          <p key={idx} style={{ marginBottom: 'var(--space-4)' }}>
            {paragraph.trim()}
          </p>
        ))}
      </div>
    </section>
  );
};
