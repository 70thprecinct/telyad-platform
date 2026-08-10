'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

export default function IndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getToken() ? '/dashboard' : '/login');
  }, [router]);
  return <div style={{ padding: 40, color: 'var(--tly-text-dim)' }}>Loading…</div>;
}
