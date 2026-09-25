import React from 'react';
import { Button, Badge } from '@/components/ui';
import styles from './LearningPlaceholders.module.css';

interface LearningPlaceholdersProps {
  hasLesson?: boolean;
  hasQuiz?: boolean;
}

export const LearningPlaceholders: React.FC<LearningPlaceholdersProps> = ({
  hasLesson = true,
  hasQuiz = true,
}) => {
  return (
    <aside className={styles.bar} aria-label="Topic Learning Modules">
      <div className={styles.left}>
        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-slate)' }}>
          Next Steps:
        </span>
        {hasLesson && <Badge variant="neutral">3-min Lesson</Badge>}
        {hasQuiz && <Badge variant="neutral">5-question Quiz</Badge>}
      </div>

      <div className={styles.right}>
        <Button variant="secondary" size="sm" disabled aria-label="Interactive Lesson (Coming soon)">
          Start Lesson (Soon)
        </Button>
        <Button variant="secondary" size="sm" disabled aria-label="Take Quiz (Coming soon)">
          Take Quiz (Soon)
        </Button>
      </div>
    </aside>
  );
};
