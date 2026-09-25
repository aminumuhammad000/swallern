import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui';
import { RelatedTopicRef } from '@/lib/content/contract';
import styles from './RelatedTopics.module.css';

interface RelatedTopicsProps {
  topics: RelatedTopicRef[];
}

export const RelatedTopics: React.FC<RelatedTopicsProps> = ({ topics }) => {
  if (!topics || topics.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="related-topics-heading">
      <h2 id="related-topics-heading" className={styles.heading}>
        Explore Related Topics
      </h2>
      <div className={styles.grid}>
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className={styles.link}
          >
            <Card interactive style={{ height: '100%' }}>
              <CardHeader>
                {topic.category && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <Badge variant="indigo" size="sm">
                      {topic.category}
                    </Badge>
                  </div>
                )}
                <CardTitle as="h3">{topic.title}</CardTitle>
                {topic.summary && (
                  <CardDescription>{topic.summary}</CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};
