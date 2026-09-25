import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, TopicCard } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Trending Curiosity Topics',
  description: 'Discover what people are most curious about. Trending educational topics on Swallern.',
  robots: { index: false, follow: true },
};

export default async function TrendingPage() {
  let candidates: Array<{ id: string; query: string; educational_score: number; detected_entity?: string }> = [];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('trend_candidates')
      .select('id, query, educational_score, score_breakdown')
      .order('educational_score', { ascending: false })
      .limit(6);
    if (data) {
      candidates = data.map((c) => ({
        id: c.id,
        query: c.query,
        educational_score: c.educational_score,
        detected_entity: c.score_breakdown?.detected_entity,
      }));
    }
  } catch {
    // Graceful fallback
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
      <Header />

      <main style={{ flex: 1, padding: 'var(--space-8) 0' }}>
        <Container size="default">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Hero Banner */}
            <div className="glass-card" style={{ padding: 'var(--space-8)', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(238, 242, 255, 0.8) 100%)' }}>
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <Badge variant="purple" size="sm">Curiosity Signal Engine</Badge>
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--color-neutral-dark)', margin: 0, letterSpacing: '-0.02em' }}>
                Trending <span className="gradient-text">Curiosity Topics</span>
              </h1>
              <p style={{ color: 'var(--color-neutral-slate)', fontSize: 'var(--font-size-lg)', marginTop: 'var(--space-2)', marginBottom: 0, maxWidth: '640px' }}>
                Discover emerging educational search trends analyzed by Swallern’s automated entity resolution and opportunity scoring pipeline.
              </p>
            </div>

            {/* Trending Opportunities Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-neutral-dark)', margin: 0 }}>
                  High-Scoring Curiosity Opportunities
                </h2>
                <Badge variant="indigo" size="sm">Entity Verified</Badge>
              </div>

              {candidates.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                  {candidates.map((cand) => (
                    <div key={cand.id} className="glass-card card-hover-lift" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                          <Badge variant="indigo" size="sm">Opportunity</Badge>
                          <Badge variant="purple" size="sm">Score {cand.educational_score}/100</Badge>
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                          {cand.query}
                        </h3>
                        {cand.detected_entity && (
                          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-slate)', margin: 0 }}>
                            Entity: <em>{cand.detected_entity}</em>
                          </p>
                        )}
                      </div>
                      <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-neutral-light)' }}>
                        <Link href="/explore" style={{ textDecoration: 'none' }}>
                          <Button variant="ghost" size="sm" style={{ padding: 0, color: 'var(--color-brand-indigo)' }}>
                            Explore In Library →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="glass-card" style={{ padding: 'var(--space-6)' }}>
                  <CardHeader>
                    <CardTitle as="h2">Automated Ingestion Ready</CardTitle>
                    <CardDescription>
                      Explore published verified topics in our main library or search directly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <Link href="/explore" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" size="sm">
                          Explore All Topics →
                        </Button>
                      </Link>
                      <Link href="/search" style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" size="sm">
                          Search Library
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
