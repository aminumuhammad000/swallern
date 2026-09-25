'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { NotesView } from '@/components/dashboard/NotesView';

export default function NotesPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Learner');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('Learner');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserEmail(user.email || null);
      setUserName(
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Learner'
      );
      setUserRole(user.app_metadata?.role || 'Learner');
    }
    loadUser();
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        display: 'flex',
        fontFamily: 'var(--font-plus-jakarta), sans-serif',
      }}
    >
      <DashboardSidebar
        activeTab="notes"
        onSelectTab={(tab) => {
          if (tab !== 'notes') router.push(`/dashboard?tab=${tab}`);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((c) => !c)}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: isSidebarCollapsed ? '64px' : '240px',
          transition: 'margin-left 200ms ease',
        }}
      >
        <DashboardHeader
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          onSignOut={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/');
          }}
        />

        <main style={{ flex: 1, padding: '2rem 2rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Link
              href="/dashboard"
              style={{ fontSize: '0.82rem', color: '#64748B', textDecoration: 'none', fontWeight: 500 }}
            >
              ← Dashboard
            </Link>
          </div>

          <NotesView />
        </main>
      </div>
    </div>
  );
}
