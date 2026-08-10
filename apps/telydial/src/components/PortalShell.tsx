'use client';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button } from '@telyad/ui';
import { useAuth, useRequireAuth } from '@/lib/auth';
import { NAV } from '@/lib/nav';

export function PortalShell({ active, children }: { active: string; children: ReactNode }) {
  const user = useRequireAuth();
  const { logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div style={{ padding: 40, color: 'var(--tly-text-dim)' }}>Loading…</div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell
      brandMark="T"
      brandName="TelyDial"
      netBadge={{ label: 'MVAS Module', value: 'MTN Nigeria' }}
      nav={NAV}
      activeId={active}
      onNavigate={(id) => router.push(`/${id}`)}
      title="TelyDial"
      user={{ name: user.name, role: user.role, initials }}
      envLabel="TelyDial — MVAS acquisition module. Demonstration data."
      topbarRight={
        <>
          <Button size="sm" onClick={() => router.push('/campaigns/new')}>
            + New Campaign
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { logout(); router.replace('/login'); }}>
            Sign out
          </Button>
        </>
      }
    >
      {children}
    </AppShell>
  );
}
