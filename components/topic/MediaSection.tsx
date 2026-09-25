import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui';
import { TopicMedia } from '@/lib/content/contract';
import styles from './MediaSection.module.css';

interface MediaSectionProps {
  media?: TopicMedia[];
}

export const MediaSection: React.FC<MediaSectionProps> = ({ media }) => {
  if (!media || media.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="media-heading">
      <h2 id="media-heading" className={styles.heading}>
        Recommended Media
      </h2>
      <div className={styles.grid}>
        {media.map((item, idx) => (
          <Card key={idx} interactive>
            <CardHeader>
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <Badge variant="cyan" size="sm">
                  {item.type}
                </Badge>
              </div>
              <CardTitle as="h3">{item.title || 'Educational Resource'}</CardTitle>
              {item.channel_or_creator && (
                <CardDescription>By {item.channel_or_creator}</CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
};
