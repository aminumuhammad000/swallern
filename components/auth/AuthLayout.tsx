'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className={styles.pageWrapper}>
      {/* Brand Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.brandLink} aria-label="Swallern Homepage">
          <Image
            src="/swallern-logo.svg"
            alt="Swallern"
            width={132}
            height={30}
            priority
          />
        </Link>
      </header>

      {/* Main Form Centerpiece */}
      <main className={styles.mainContent}>
        <div className={styles.card}>
          <div className={styles.headerSection}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          {children}
        </div>
      </main>

      {/* Minimal Auth / Legal Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          By continuing, you agree to Swallern&apos;s{' '}
          <Link href="/terms" className={styles.footerLink}>
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className={styles.footerLink}>
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </div>
  );
};
