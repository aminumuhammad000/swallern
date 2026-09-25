import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service — Swallern',
  description: 'Terms of Service and conditions of use for the Swallern educational platform.',
};

export default function TermsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
      <Header />
      <main style={{ flex: 1, padding: '48px 0 64px 0' }}>
        <Container size="narrow">
          <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Terms of Service
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '32px' }}>
              Last updated: September 2026
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#334155', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  1. Welcome to Swallern
                </h2>
                <p>
                  Swallern is an educational exploration and learning platform designed to turn curiosity into structured knowledge through verified explanations and interactive lessons. By creating an account or using Swallern, you agree to these Terms.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  2. User Accounts & Authenticity
                </h2>
                <p>
                  When you register for an account using email or a supported third-party identity provider (such as Google, Apple, or GitHub), you agree to maintain the security of your credentials. You are responsible for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  3. Educational Content & Intellectual Property
                </h2>
                <p>
                  Explanations, curricula, and learning materials on Swallern are compiled, reviewed, and published for educational purposes. Users retain rights to custom topics they author and submit for review.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  4. Termination
                </h2>
                <p>
                  You may close your account at any time from your account settings. Swallern reserves the right to suspend or terminate accounts that violate platform integrity or abuse educational resources.
                </p>
              </section>

              <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
                <Link href="/" style={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>
                  ← Back to Swallern Homepage
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
