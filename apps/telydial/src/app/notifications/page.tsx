'use client';
import { useState } from 'react';
import { Button, Card, PageHeader } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { NOTIFS, DEMO_NOTE, type DemoNotif } from '@/lib/demo';

const ICON: Record<DemoNotif['type'], string> = {
  success: '✅',
  warning: '⚠️',
  danger: '⛔',
  info: 'ℹ️',
};
const TINT: Record<DemoNotif['type'], string> = {
  success: 'var(--tly-success-dim)',
  warning: 'var(--tly-warning-dim)',
  danger: 'var(--tly-danger-dim)',
  info: 'var(--tly-info-dim)',
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<DemoNotif[]>(() => NOTIFS.map((n) => ({ ...n })));
  const unread = notifs.filter((n) => n.unread).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <PortalShell active="notifications">
      <PageHeader eyebrow="Operations" title="Notifications" desc="Campaign, wallet and product alerts." />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div className="tly-dim" style={{ fontSize: 13 }}>
          {unread} unread
        </div>
        <Button
          data-testid="mark-all-read"
          size="sm"
          variant="ghost"
          onClick={markAllRead}
          disabled={unread === 0}
        >
          Mark all as read
        </Button>
      </div>

      <div data-testid="notif-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifs.map((n, i) => (
          <Card key={`${n.title}-${i}`} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div
              style={{
                flex: '0 0 auto',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: TINT[n.type],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
              aria-hidden
            >
              {ICON[n.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>{n.title}</span>
                {n.unread && (
                  <span
                    aria-label="unread"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--tly-primary)',
                      flex: '0 0 auto',
                    }}
                  />
                )}
              </div>
              <div className="tly-dim" style={{ fontSize: 13, margin: '3px 0 6px' }}>
                {n.body}
              </div>
              <div className="tly-faint" style={{ fontSize: 11.5 }}>
                {n.time}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="tly-faint" style={{ fontSize: 11, marginTop: 16 }}>
        {DEMO_NOTE}
      </div>
    </PortalShell>
  );
}
