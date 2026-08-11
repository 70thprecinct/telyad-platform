'use client';
import { useEffect, useState } from 'react';
import type { Advertiser } from '@telyad/types';
import { Badge, Card, CardHead, PageHeader, Table } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { api } from '@/lib/api';

export default function AdvertisersPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .advertisers()
      .then((r) => setAdvertisers(r.advertisers))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  return (
    <ConsoleShell active="advertisers">
      <PageHeader
        eyebrow="Advertisers & Campaigns"
        title="Advertiser Management"
        desc="Every advertiser holding or requesting access to MTN Nigeria's subscriber base."
      />
      <Card>
        <CardHead title={`${advertisers.length} advertisers`} />
        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : (
          <Table head={['Advertiser', 'Industry', 'Risk', 'Account manager', 'Status']}>
            {advertisers.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td className="tly-faint">{a.industry}</td>
                <td>
                  <Badge tone={a.risk === 'Low' ? 'success' : a.risk === 'High' ? 'danger' : 'warning'}>
                    {a.risk}
                  </Badge>
                </td>
                <td className="tly-faint">{a.accountManager ?? 'Unassigned'}</td>
                <td>
                  <Badge tone={a.status === 'Active' ? 'success' : a.status === 'Pending' ? 'warning' : 'danger'}>
                    {a.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </ConsoleShell>
  );
}
