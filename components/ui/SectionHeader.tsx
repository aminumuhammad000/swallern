import React from 'react';
import { Badge } from './Badge';

export interface SectionHeaderProps {
  badge?: string;
  badgeVariant?: 'indigo' | 'cyan' | 'purple' | 'neutral' | 'success' | 'warning' | 'error' | 'yellow';
  title: string;
  gradientText?: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeVariant = 'indigo',
  title,
  gradientText,
  description,
  align = 'center',
  className = '',
}) => {
  const alignStyle = align === 'center' ? { textAlign: 'center' as const, alignItems: 'center' as const } : { textAlign: 'left' as const, alignItems: 'flex-start' as const };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-10)',
        ...alignStyle,
      }}
      className={className}
    >
      {badge && (
        <Badge variant={badgeVariant} size="sm">
          {badge}
        </Badge>
      )}

      <h2
        style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 800,
          color: 'var(--color-neutral-dark)',
          lineHeight: 1.2,
          margin: 0,
        }}
      >
        {title}{' '}
        {gradientText && (
          <span className="gradient-text">{gradientText}</span>
        )}
      </h2>

      {description && (
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-neutral-slate)',
            maxWidth: '640px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};
