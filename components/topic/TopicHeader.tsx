import React from 'react';
import { Badge } from '@/components/ui';
import { TopicContract } from '@/lib/content/contract';
import styles from './TopicHeader.module.css';

interface TopicHeaderProps {
  topic: TopicContract;
}

export const TopicHeader: React.FC<TopicHeaderProps> = ({ topic }) => {
  return (
    <div className={styles.header}>
      <div className={styles.meta}>
        <Badge variant="indigo" size="md">
          {topic.category.name}
        </Badge>
        {topic.difficulty && (
          <Badge
            variant={
              topic.difficulty === 'BEGINNER'
                ? 'success'
                : topic.difficulty === 'INTERMEDIATE'
                ? 'warning'
                : 'error'
            }
            size="sm"
          >
            {topic.difficulty}
          </Badge>
        )}
        {topic.last_reviewed_at && (
          <span className={styles.timestamp}>
            Reviewed {topic.last_reviewed_at}
          </span>
        )}
      </div>

      <h1 className={styles.title}>{topic.title}</h1>
      <p className={styles.summary}>{topic.summary}</p>
    </div>
  );
};
