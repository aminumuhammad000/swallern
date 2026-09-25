import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — Swallern',
  description: 'How Swallern collects, uses, and protects your personal and educational learning data.',
};

export default function PrivacyPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
      <Header />
      <main style={{ flex: 1, padding: '48px 0 64px 0' }}>
        <Container size="narrow">
          <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Privacy Policy
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '32px' }}>
              Last updated: September 2026
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#334155', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  1. Information We Collect
                </h2>
                <p>
                  When you authenticate with Swallern via email, Google, Apple, or GitHub, we receive basic identity information such as your name, email address, and avatar image. We also store your course progress, completed topics, and quiz responses to personalize your learning experience.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  2. How We Use Information
                </h2>
                <p>
                  Your information is used solely to maintain your account, deliver educational content, track your learning journey, and ensure platform security. We never sell your personal data or learning history to third parties.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  3. Authentication & Security
                </h2>
                <p>
                  Authentication is handled with industry-standard protocols and cryptographic session tokens. Third-party OAuth tokens and secrets are processed securely and never exposed to client-side bundles.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  4. Your Rights
                </h2>
                <p>
                  You have the right to access, export, or delete your account and associated learning records at any time through your dashboard or by contacting support.
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
