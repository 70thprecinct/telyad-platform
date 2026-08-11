'use client';
import { useEffect, useState } from 'react';
import type { AuditEvent } from '@telyad/types';
import { Card, CardHead, PageHeader, Table } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { api } from '@/lib/api';

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .audit()
      .then((r) => setEvents(r.events))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  return (
    <ConsoleShell active="audit">
      <PageHeader
        eyebrow="Access & System"
        title="Audit Logs"
        desc="Every sensitive action on MTN Nigeria's environment, with before/after state and actor."
      />
      <Card>
        <CardHead title={`${events.length} events`} sub="Most recent first" />
        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : events.length === 0 ? (
          <div className="tly-empty">No audit events yet. Approve or reject a campaign to generate one.</div>
        ) : (
          <Table head={['When', 'Actor', 'Role', 'Action', 'Target', 'Change']}>
            {events.map((e) => (
              <tr key={e.id}>
                <td className="tly-mono tly-faint" style={{ whiteSpace: 'nowrap' }}>
                  {new Date(e.createdAt).toLocaleString()}
                </td>
                <td>{e.userName}</td>
                <td className="tly-faint">{e.role}</td>
                <td style={{ fontWeight: 600 }}>{e.action}</td>
                <td className="tly-faint">{e.target}</td>
                <td className="tly-mono tly-faint">
                  {e.before ?? '—'} → {e.after ?? '—'}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </ConsoleShell>
  );
}
