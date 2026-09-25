import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <Container size="default">
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <Link href="/" aria-label="Swallern Homepage">
              <Image
                src="/swallern-logo.svg"
                alt="Swallern"
                width={140}
                height={32}
                className={styles.logo}
              />
            </Link>
            <p className={styles.tagline}>
              Swallern turns curiosity into learning. Discover verified explanations, explore connected ideas, and build deep understanding.
            </p>
            <div className={styles.trustBadge}>
              ✓ Sourced & Expert-Reviewed Content
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h4 className={styles.colTitle}>Explore</h4>
            <ul className={styles.linkList}>
              <li><Link href="/explore" className={styles.link}>All Topics</Link></li>
              <li><Link href="/explore?category=science" className={styles.link}>Nature & Biology</Link></li>
              <li><Link href="/explore?category=technology" className={styles.link}>Computer Science</Link></li>
              <li><Link href="/explore?category=space" className={styles.link}>Space & Astronomy</Link></li>
              <li><Link href="/explore?category=psychology" className={styles.link}>Psychology & Mind</Link></li>
            </ul>
          </div>

          {/* Platform Column */}
          <div>
            <h4 className={styles.colTitle}>Platform</h4>
            <ul className={styles.linkList}>
              <li><Link href="/trending" className={styles.link}>Trending Opportunities</Link></li>
              <li><Link href="/search" className={styles.link}>Search Library</Link></li>
              <li><Link href="/#how-it-works" className={styles.link}>How Swallern Works</Link></li>
              <li><Link href="/#trust" className={styles.link}>Quality & Sources</Link></li>
              <li><Link href="/#preview" className={styles.link}>Interactive Preview</Link></li>
            </ul>
          </div>

          {/* Account & Legal Column */}
          <div>
            <h4 className={styles.colTitle}>Account & Legal</h4>
            <ul className={styles.linkList}>
              <li><Link href="/login" className={styles.link}>Sign In</Link></li>
              <li><Link href="/register" className={styles.link}>Create Account</Link></li>
              <li><Link href="/account" className={styles.link}>My Dashboard</Link></li>
              <li><Link href="/privacy" className={styles.link}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={styles.link}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p>© {new Date().getFullYear()} Swallern Inc. All rights reserved.</p>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
            Fun enough to explore, trustworthy enough to believe.
          </p>
        </div>
      </Container>
    </footer>
  );
};
