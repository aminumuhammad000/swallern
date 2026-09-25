import React from 'react';
import Link from 'next/link';
import { Container, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge } from '@/components/ui';

export default function DesignSystemTestPage() {
  return (
    <main style={{ padding: 'var(--space-10) 0', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Container size="default">
        {/* Header section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <Link href="/" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-brand-indigo)', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Swallern
          </Link>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            Design System Foundation Primitives
          </h1>
          <p style={{ color: 'var(--color-neutral-gray)', fontSize: 'var(--font-size-lg)' }}>
            Internal verification for Container, Button, Card, and Badge primitives.
          </p>
        </div>

        {/* Badges test section */}
        <Card style={{ marginBottom: 'var(--space-8)' }}>
          <CardHeader>
            <CardTitle as="h2">1. Badge Primitive</CardTitle>
            <CardDescription>Supporting categories, difficulty ratings, and lifecycle states</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
              <Badge variant="indigo">Science</Badge>
              <Badge variant="cyan">Technology</Badge>
              <Badge variant="purple">Space</Badge>
              <Badge variant="success">Beginner</Badge>
              <Badge variant="warning">Intermediate</Badge>
              <Badge variant="error">Advanced</Badge>
              <Badge variant="neutral">Published</Badge>
              <Badge variant="indigo" pill={false} size="sm">Tag (Square)</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Buttons test section */}
        <Card style={{ marginBottom: 'var(--space-8)' }}>
          <CardHeader>
            <CardTitle as="h2">2. Button Primitive</CardTitle>
            <CardDescription>Interactive buttons with hover, active, focus-visible, and disabled states</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
              <Button variant="primary" size="sm">Primary Sm</Button>
              <Button variant="primary" size="md">Primary Md</Button>
              <Button variant="primary" size="lg">Primary Lg</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards test section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)' }}>
            3. Card & Container Primitives
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            <Card interactive>
              <CardHeader>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <Badge variant="indigo">Science</Badge>
                  <Badge variant="success">Beginner</Badge>
                </div>
                <CardTitle as="h3">Why is the sky blue?</CardTitle>
                <CardDescription>
                  Sunlight scatters through atmospheric gases via Rayleigh scattering.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-slate)' }}>
                  Blue light travels in smaller, shorter waves, causing it to scatter more than other visible spectrum colors.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" style={{ paddingLeft: 0 }}>
                  Explore topic →
                </Button>
              </CardFooter>
            </Card>

            <Card interactive>
              <CardHeader>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <Badge variant="cyan">Technology</Badge>
                  <Badge variant="warning">Intermediate</Badge>
                </div>
                <CardTitle as="h3">How does the internet work?</CardTitle>
                <CardDescription>
                  Global packet switching across interconnected TCP/IP networks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-slate)' }}>
                  Information is broken into small data packets routed across optical backbones, routers, and local access nodes.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" style={{ paddingLeft: 0 }}>
                  Explore topic →
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Narrow container verification */}
        <Container size="narrow" style={{ marginTop: 'var(--space-10)' }}>
          <Card>
            <CardHeader>
              <CardTitle as="h3">Narrow Container Verification (760px)</CardTitle>
              <CardDescription>Ensures optimal reading line length for topic explanations and lessons.</CardDescription>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'var(--color-neutral-slate)' }}>
                This card sits inside a narrow Container layout boundary, guaranteeing a maximum reading width of 760px and responsive gutters.
              </p>
            </CardContent>
          </Card>
        </Container>
      </Container>
    </main>
  );
}
