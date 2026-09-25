import React from 'react';
import styles from './QuickAnswer.module.css';

interface QuickAnswerProps {
  answer: string;
}

export const QuickAnswer: React.FC<QuickAnswerProps> = ({ answer }) => {
  if (!answer) return null;

  return (
    <section className={styles.quickAnswerCard} aria-labelledby="quick-answer-title">
      <div id="quick-answer-title" className={styles.label}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        Quick Answer
      </div>
      <p className={styles.text}>{answer}</p>
    </section>
  );
};
