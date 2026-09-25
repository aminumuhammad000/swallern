import React from 'react';
import styles from './Container.module.css';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'default' | 'narrow' | 'full';
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'default',
  as = 'div',
  className = '',
  ...props
}) => {
  const Component = as;

  const sizeClass =
    size === 'narrow'
      ? styles.sizeNarrow
      : size === 'full'
      ? styles.sizeFull
      : styles.sizeDefault;

  const combinedClass = [styles.container, sizeClass, className].filter(Boolean).join(' ');

  return (
    <Component className={combinedClass} {...props}>
      {children}
    </Component>
  );
};
