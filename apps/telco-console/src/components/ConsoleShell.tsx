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
      footer={
        <div className="tly-sb-user-card">
          <div className="tly-sb-user-avatar">
            {initials}
            <span className="online-dot" />
          </div>
          <div className="tly-sb-user-details">
            <div className="tly-sb-user-name" title={user.name}>{user.name}</div>
            <div className="tly-sb-user-org" title="MTN Nigeria · Operator">MTN Nigeria</div>
          </div>
          <button
            type="button"
            className="tly-sb-logout-btn"
            title="Sign out"
            aria-label="Sign out"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
