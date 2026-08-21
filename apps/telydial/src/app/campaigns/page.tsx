'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { compactNumber, formatMoney, type Campaign } from '@telyad/types';
import { Badge, Button, Card, CardHead, EmptyState, Input, PageHeader, StatusBadge, Table } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api } from '@/lib/api';
import { DEMO_CAMPAIGNS, DEMO_NOTE, type DemoCampaign } from '@/lib/demo';

type FilterKey = 'All' | 'Active' | 'Pending' | 'Paused' | 'Rejected';
const FILTERS: FilterKey[] = ['All', 'Active', 'Pending', 'Paused', 'Rejected'];
const FILTER_STATUS: Record<Exclude<FilterKey, 'All'>, DemoCampaign['status']> = {
  Active: 'Active',
  Pending: 'Pending approval',
  Paused: 'Paused',
  Rejected: 'Rejected',
};

const DEMO_TONE: Record<DemoCampaign['status'], 'success' | 'warning' | 'neutral' | 'danger'> = {
  Active: 'success',
  'Pending approval': 'warning',
  Paused: 'neutral',
  Rejected: 'danger',
};

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .listCampaigns()
      .then((r) => setCampaigns(r.campaigns))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const demoRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_CAMPAIGNS.filter((c) => {
      if (filter !== 'All' && c.status !== FILTER_STATUS[filter]) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.product.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  return (
    <PortalShell active="campaigns">
      <PageHeader
        eyebrow="Acquisition · campaigns"
        title="Campaigns"
        desc="Every MVAS acquisition campaign on MTN Nigeria. Existing subscribers are always suppressed by Product ID."
      />

      {/* ── Section A — REAL persisted platform data ─────────────────────── */}
      <Card>
        <CardHead
          title="Your campaigns (live)"
          sub="Persisted platform data."
          action={
            <Button size="sm" onClick={() => router.push('/campaigns/new')}>
              + New Campaign
            </Button>
          }
        />
        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="No campaigns yet"
            desc="Create your first MVAS acquisition campaign to see it here."
          />
        ) : (
          <Table head={['Campaign', 'Objective', 'Format', 'Est. reach', 'Budget', 'Status', 'Approval']}>
            {campaigns.map((c) => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/campaigns/${c.id}`)}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td className="tly-faint">{c.objective}</td>
                <td className="tly-faint">{c.formatId.toUpperCase()}</td>
                <td className="tly-mono">{compactNumber(c.estimatedReach)}</td>
                <td className="tly-mono">{formatMoney(c.budget.total, { compact: true })}</td>
                <td>
                  <StatusBadge status={c.status} />
                </td>
                <td className="tly-faint">{c.approvedByTelcoName ? `✓ ${c.approvedByTelcoName}` : '—'}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* ── Section B — DEMONSTRATION management table ────────────────────── */}
      <Card>
        <CardHead title="Acquisition campaigns" sub="Demonstration data." />

        <div
          data-testid="campaign-filters"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="tly-btn tly-btn-sm"
                style={{
                  background: active ? 'var(--tly-primary)' : 'var(--tly-surface-2)',
                  color: active ? '#fff' : 'var(--tly-text)',
                  border: '1px solid var(--tly-border)',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 12, maxWidth: 320 }}>
          <Input
            data-testid="campaign-search"
            placeholder="Search by name, ID, or product…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div data-testid="campaign-table" style={{ overflowX: 'auto' }}>
          {demoRows.length === 0 ? (
            <EmptyState title="No campaigns match" desc="Adjust the filter or search terms." />
          ) : (
            <Table
              head={[
                'Campaign',
                'Status',
                'Product',
                'Audience',
                'Model',
                'Daily',
                'Total',
                'Opt-ins',
                'CPA',
                'Conv %',
                'Dates',
              ]}
            >
              {demoRows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div className="tly-mono tly-faint" style={{ fontSize: 11 }}>
                      {c.id}
                    </div>
                  </td>
                  <td>
                    <Badge tone={DEMO_TONE[c.status]}>{c.status}</Badge>
                  </td>
                  <td>{c.product}</td>
                  <td className="tly-faint">{c.audience}</td>
                  <td>
                    <Badge tone={c.pricing === 'CPA' ? 'info' : 'neutral'}>{c.pricing}</Badge>
                  </td>
                  <td className="tly-mono">₦{c.daily.toLocaleString()}</td>
                  <td className="tly-mono">₦{c.total.toLocaleString()}</td>
                  <td
                    className="tly-mono"
                    style={c.optins > 0 ? { color: 'var(--tly-success)' } : undefined}
                  >
                    {c.optins > 0 ? c.optins.toLocaleString() : '—'}
                  </td>
                  <td className="tly-mono">{c.cpa ? `₦${c.cpa}` : '—'}</td>
                  <td className="tly-mono">{c.conv ? `${c.conv}%` : '—'}</td>
                  <td className="tly-faint" style={{ whiteSpace: 'nowrap' }}>
                    {c.start} → {c.end}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </Card>

      <div className="tly-faint" style={{ fontSize: 11 }}>
        {DEMO_NOTE}
      </div>
    </PortalShell>
  );
}
