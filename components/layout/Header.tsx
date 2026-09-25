'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Container, Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? { id: user.id, email: user.email } : null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className={styles.header}>
      <Container size="default">
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.brand} aria-label="Swallern Homepage">
            <Image
              src="/swallern-logo.svg"
              alt="Swallern"
              width={130}
              height={30}
              priority
              className={styles.logo}
            />
          </Link>

          {/* Core Navigation Model */}
          <nav
            className={`${styles.nav} ${mobileMenuOpen ? styles.navActive : ''}`}
            aria-label="Main Navigation"
          >
            <Link href="/explore" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
              Discover
            </Link>

            {user ? (
              <>
                <Link href="/dashboard" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                  My Learning
                </Link>
                <Link href="/dashboard?tab=my-topics" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                  Create Topic
                </Link>
              </>
            ) : (
              <Link href="/#how-it-works" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                How It Works
              </Link>
            )}

            <Link href="/search" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
              Search
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className={styles.actions}>
            {user ? (
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button
                  variant="primary"
                  size="sm"
                  style={{ height: '34px', padding: '0 14px', borderRadius: '17px', fontSize: '0.8125rem' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  My Account
                </Button>
              </Link>
            ) : (
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button
                  variant="primary"
                  size="sm"
                  style={{ height: '34px', padding: '0 16px', borderRadius: '17px', fontSize: '0.8125rem', fontWeight: 600 }}
                >
                  Sign In
                </Button>
              </Link>
            )}

            <button
              className={styles.mobileToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
};
