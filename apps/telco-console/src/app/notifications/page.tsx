'use client';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardHead, EmptyState, PageHeader, Select } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { api } from '@/lib/api';
import { DEMO_NOTE } from '@/lib/demo';

type Severity = 'info' | 'success' | 'warning' | 'danger';

interface Notif {
  id: string;
  severity: Severity;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

type FilterValue = 'all' | 'unread' | 'read';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

// Demonstration fallback when the notifications API returns nothing / errors.
const DEMO_NOTIFICATIONS: Notif[] = [
  {
    id: 'demo-1',
    severity: 'warning',
    title: 'Campaign approval required',
    body: 'Access Bank Acquisition (USSD) is pending operator decision before it can go live.',
    read: false,
    createdAt: '2026-08-20T08:40:00.000Z',
  },
  {
    id: 'demo-2',
    severity: 'danger',
    title: 'Compliance alert',
    body: 'QuickCash NG "Loan blast" flagged: DND missing and consent gating absent.',
    read: false,
    createdAt: '2026-08-20T07:15:00.000Z',
  },
  {
    id: 'demo-3',
    severity: 'info',
    title: 'Low wallet balance',
    body: 'FairMoney wallet is exposed — reserved amount exceeds available balance.',
    read: true,
    createdAt: '2026-08-19T18:05:00.000Z',
  },
  {
    id: 'demo-4',
    severity: 'success',
    title: 'Integration issue resolved',
    body: 'USSD gateway probe recovered; queued deliveries have drained.',
    read: true,
    createdAt: '2026-08-19T12:20:00.000Z',
  },
];

function severityTone(s: Severity): Severity {
  return s;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  function load() {
    setLoading(true);
    setError(false);
    api
      .listNotifications()
      .then((r) => {
        if (r.notifications && r.notifications.length > 0) {
          setNotifs(r.notifications);
          setIsDemo(false);
        } else {
          setNotifs(DEMO_NOTIFICATIONS);
          setIsDemo(true);
        }
      })
      .catch(() => {
        setNotifs(DEMO_NOTIFICATIONS);
        setIsDemo(true);
        setError(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const isRead = (n: Notif) => n.read || readSet.has(n.id);

  const visible = useMemo(() => {
    return notifs.filter((n) => {
      if (filter === 'unread') return !isRead(n);
      if (filter === 'read') return isRead(n);
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifs, filter, readSet]);

  function markAllRead() {
    setReadSet(new Set(notifs.map((n) => n.id)));
  }

  const unreadCount = notifs.filter((n) => !isRead(n)).length;

  return (
    <ConsoleShell active="notifications">
      <PageHeader
        eyebrow="ACCESS & SYSTEM"
        title="Notifications"
        desc="Operational alerts and platform notices for MTN Nigeria operators."
      />

      <Card>
        <CardHead
          title={`Notifications${unreadCount ? ` — ${unreadCount} unread` : ''}`}
          sub="Most recent first"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 160 }}>
                <Select
                  options={FILTER_OPTIONS}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterValue)}
                  data-testid="notifications-filter"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                Mark all read
              </Button>
            </div>
          }
        />

        {loading ? (
          <div className="tly-faint">Loading notifications…</div>
        ) : error ? (
          <div>
            <div className="tly-empty" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Could not reach the notifications service.</div>
              <Button variant="ghost" size="sm" onClick={load}>
                Retry
              </Button>
            </div>
            {renderList(visible, isRead)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState title="Nothing here" desc="No notifications match the current filter." />
        ) : (
          renderList(visible, isRead)
        )}

        {isDemo && (
          <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
            {DEMO_NOTE}
          </div>
        )}
      </Card>
    </ConsoleShell>
  );
}

function renderList(items: Notif[], isRead: (n: Notif) => boolean) {
  if (items.length === 0) {
    return <EmptyState title="Nothing here" desc="No notifications match the current filter." />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((n) => {
        const read = isRead(n);
        return (
          <div
            key={n.id}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid var(--tly-border)',
              borderLeft: read ? '3px solid var(--tly-border)' : '3px solid var(--tly-primary)',
              background: read ? 'transparent' : 'var(--tly-primary-dim)',
            }}
          >
            <Badge tone={severityTone(n.severity)}>{n.severity}</Badge>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: read ? 500 : 700 }}>{n.title}</div>
              <div className="tly-faint" style={{ fontSize: 12.5, marginTop: 2 }}>
                {n.body}
              </div>
            </div>
            <div className="tly-mono tly-faint" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
              {new Date(n.createdAt).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
