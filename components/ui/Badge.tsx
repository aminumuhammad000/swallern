import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'indigo' | 'neutral' | 'success' | 'warning' | 'error' | 'cyan' | 'purple' | 'yellow';
  size?: 'sm' | 'md';
  pill?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'indigo',
  size = 'md',
  pill = true,
  className = '',
  ...props
}) => {
  const variantClass = styles[variant] || styles.indigo;
  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const radiusClass = pill ? styles.radiusPill : styles.radiusRounded;

  const combinedClassName = [
    styles.badge,
    variantClass,
    sizeClass,
    radiusClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={combinedClassName} {...props}>
      {children}
    </span>
  );
};
