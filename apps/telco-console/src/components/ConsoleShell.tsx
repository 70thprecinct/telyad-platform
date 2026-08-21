'use client';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button } from '@telyad/ui';
import { useAuth, useRequireAuth } from '@/lib/auth';
import { NAV } from '@/lib/nav';

export function ConsoleShell({ active, children }: { active: string; children: ReactNode }) {
  const user = useRequireAuth();
  const { logout } = useAuth();
  const router = useRouter();

  if (!user) return <div style={{ padding: 40, color: 'var(--tly-text-dim)' }}>Loading…</div>;

  const initials = user.name
    .split(/[\s.]+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell
      brandLogo="/images/logo.png"
      brandName="Telco Operations"
      netBadge={{ label: 'Environment', value: 'MTN Nigeria' }}
      nav={NAV}
      activeId={active}
      onNavigate={(id) => router.push(`/${id}`)}
      title="MTN Nigeria — Operations"
      user={{ name: user.name, role: user.role, initials }}
      envLabel="You are viewing MTN Nigeria's isolated environment only. Demonstration data. Powered by Tely."
      topbarRight={
        <Button size="sm" variant="ghost" onClick={() => { logout(); router.replace('/login'); }}>
          Sign out
        </Button>
      }
    >
      {children}
    </AppShell>
  );
}
