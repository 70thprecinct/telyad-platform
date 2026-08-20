'use client';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHead,
  EmptyState,
  Kpi,
  KpiGrid,
  PageHeader,
  Select,
  Table,
} from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { DEMO_NOTE, REPORTS } from '@/lib/demo';

export default function ReportsPage() {
  const [cat, setCat] = useState<string>('All');

  const cats = Array.from(new Set(REPORTS.map((r) => r.cat)));
  const rows = REPORTS.filter((r) => cat === 'All' || r.cat === cat);

  const reportTypes = REPORTS.length;
  const categories = cats.length;
  const scheduled = REPORTS.filter((r) => r.freq !== '—').length;

  // Demonstration no-ops: no file is generated or scheduled by these controls.
  const noop = () => undefined;

  return (
    <ConsoleShell active="reports">
      <PageHeader
        eyebrow="INTELLIGENCE"
        title="Reports"
        desc="Generate and schedule reports across every area of MTN Nigeria's environment."
      />

      <KpiGrid>
        <Kpi label="Report types" value={reportTypes} />
        <Kpi label="Categories" value={categories} />
        <Kpi label="Scheduled" value={scheduled} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Report catalogue"
          sub="Generate on demand or set a recurring schedule across campaigns, finance, governance and system areas."
          action={
            <div style={{ minWidth: 180 }}>
              <Select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                options={[
                  { value: 'All', label: 'All categories' },
                  ...cats.map((c) => ({ value: c, label: c })),
                ]}
              />
            </div>
          }
        />

        {rows.length === 0 ? (
          <EmptyState title="No reports match this filter" desc="Adjust the category filter to see more." />
        ) : (
          <Table head={['Report', 'Category', 'Frequency', 'Last generated', 'Action']}>
            {rows.map((r) => (
              <tr key={r.name}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td>
                  <Badge tone="info">{r.cat}</Badge>
                </td>
                <td>{r.freq}</td>
                <td className="tly-mono tly-faint" style={{ textAlign: 'right' }}>
                  {r.last}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button size="sm" variant="ghost" onClick={noop}>
                      Generate
                    </Button>
                    <Button size="sm" variant="ghost" onClick={noop}>
                      Schedule
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}

        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          Generate and Schedule are demonstration controls — no file is produced and no schedule is registered. {DEMO_NOTE}
        </div>
      </Card>
    </ConsoleShell>
  );
}
