import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { KeyConcept } from '@/lib/content/contract';
import styles from './KeyConcepts.module.css';

interface KeyConceptsProps {
  concepts: KeyConcept[];
}

export const KeyConcepts: React.FC<KeyConceptsProps> = ({ concepts }) => {
  if (!concepts || concepts.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="key-concepts-heading">
      <h2 id="key-concepts-heading" className={styles.heading}>
        Key Concepts
      </h2>
      <div className={styles.grid}>
        {concepts.map((concept, index) => (
          <Card key={index} padded>
            <CardHeader>
              <CardTitle as="h3">{concept.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-slate)', margin: 0 }}>
                {concept.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
