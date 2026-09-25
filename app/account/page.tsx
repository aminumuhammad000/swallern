'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=settings');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
      <div style={{ textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
        Loading account settings…
      </div>
    </div>
  );
}
