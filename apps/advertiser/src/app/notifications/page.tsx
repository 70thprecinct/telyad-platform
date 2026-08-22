'use client';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardHead, EmptyState, Field, PageHeader, Select } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api } from '@/lib/api';
import { DEMO_NOTE } from '@/lib/demo';

type Severity = 'info' | 'success' | 'warning' | 'danger';
interface NotifRow {
  id: string;
  severity: Severity;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
type Filter = 'all' | 'unread' | 'read';

// Fallback shown only when the API is unreachable or returns nothing.
const DEMO_NOTIFS: NotifRow[] = [
  {
    id: 'demo_1',
    severity: 'warning',
    title: 'Budget threshold reached',
    body: 'Total Goals SMS Acq. has consumed 78% of its allocated budget.',
    read: false,
    createdAt: '2026-08-20T08:15:00Z',
  },
  {
    id: 'demo_2',
    severity: 'success',
    title: 'Campaign approved',
    body: 'MTN Game Zone Q3 was approved by MTN Nigeria and is now live.',
    read: false,
    createdAt: '2026-08-19T16:40:00Z',
  },
  {
    id: 'demo_3',
    severity: 'info',
    title: 'New audience segment ready',
    body: 'High-intent sports gamblers — 280K subscribers identified.',
    read: true,
    createdAt: '2026-08-18T11:02:00Z',
  },
];

const SEV_TONE: Record<Severity, 'info' | 'success' | 'warning' | 'danger'> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotifRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  // Local override of read-state ("mark read" is client-side only for now).
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  function load() {
    setLoaded(false);
    setError(false);
    setIsDemo(false);
    api
      .listNotifications()
      .then((r) => {
        const rows: NotifRow[] = (r.notifications ?? []).map((n) => ({
          id: String(n.id),
          severity: n.severity,
          title: n.title,
          body: n.body,
          read: n.read,
          createdAt: n.createdAt,
        }));
        if (rows.length === 0) {
          setItems(DEMO_NOTIFS);
          setIsDemo(true);
        } else {
          setItems(rows);
        }
      })
      .catch(() => {
        // Graceful fallback to a small demo list when the API is unreachable.
        setItems(DEMO_NOTIFS);
        setIsDemo(true);
        setError(true);
      })
      .finally(() => setLoaded(true));
  }
  useEffect(load, []);

  function isRead(n: NotifRow): boolean {
    return n.read || readSet.has(n.id);
  }
  function markAllRead() {
    // Client-side only — server-side mark-read persistence lands in a later pass.
    setReadSet(new Set(items.map((n) => n.id)));
  }

  const visible = items.filter((n) => {
    if (filter === 'unread') return !isRead(n);
    if (filter === 'read') return isRead(n);
    return true;
  });
  const unreadCount = items.filter((n) => !isRead(n)).length;

  return (
    <PortalShell active="notifications">
      <PageHeader
        eyebrow="ACCOUNT · NOTIFICATIONS"
        title="Notifications"
        desc="Campaign, budget and account alerts."
      />

      <Card>
        <CardHead
          title={`${unreadCount} unread`}
          sub={loaded && !error ? undefined : undefined}
          action={
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <Field label="Show">
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as Filter)}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'unread', label: 'Unread' },
                    { value: 'read', label: 'Read' },
                  ]}
                />
              </Field>
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                Mark all read
              </Button>
            </div>
          }
        />

        {isDemo && (
          <div className="tly-faint" style={{ marginBottom: 12, fontSize: 12.5 }}>
            {DEMO_NOTE} Showing a demonstration fallback list.
          </div>
        )}

        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : error && !isDemo ? (
          <div className="tly-empty">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t reach the API</div>
            <Button variant="ghost" size="sm" onClick={load}>
              Retry
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState title="No notifications" desc="You’re all caught up." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visible.map((n) => {
              const read = isRead(n);
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--tly-border)',
                    borderLeft: read ? '1px solid var(--tly-border)' : '3px solid var(--tly-primary)',
                    background: read ? 'transparent' : 'var(--tly-surface, transparent)',
                  }}
                >
                  <Badge tone={SEV_TONE[n.severity]}>{n.severity}</Badge>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: read ? 500 : 700, fontSize: 13.5 }}>{n.title}</div>
                    <div className="tly-faint" style={{ fontSize: 12.5, marginTop: 2 }}>{n.body}</div>
                  </div>
                  <div className="tly-faint" style={{ fontSize: 11.5, whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {formatWhen(n.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PortalShell>
  );
}
