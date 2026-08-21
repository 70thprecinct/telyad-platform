'use client';
import { Button, Card, PageHeader } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { REPORTS, DEMO_CAMPAIGNS, DEMO_NOTE } from '@/lib/demo';

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCampaignPerformanceCsv(): void {
  const header = ['id', 'name', 'status', 'product', 'pricing', 'daily', 'total', 'optins', 'cpa', 'conv'];
  const lines = [header.join(',')];
  for (const c of DEMO_CAMPAIGNS) {
    lines.push(
      [c.id, c.name, c.status, c.product, c.pricing, c.daily, c.total, c.optins, c.cpa, c.conv]
        .map(csvCell)
        .join(','),
    );
  }
  const csv = lines.join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'campaign-performance.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  return (
    <PortalShell active="reports">
      <PageHeader
        eyebrow="Operations"
        title="Reports"
        desc="Generate and export acquisition, spend and performance reports."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}
      >
        {REPORTS.map((r, i) => {
          const isCsv = i === 0;
          return (
            <Card key={r.title}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.title}</div>
              <div className="tly-faint" style={{ fontSize: 12.5, marginBottom: 12 }}>
                {r.desc}
              </div>

              {isCsv ? (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Button
                      data-testid="export-csv"
                      size="sm"
                      onClick={exportCampaignPerformanceCsv}
                    >
                      Export CSV
                    </Button>
                  </div>
                  <div className="tly-faint" style={{ fontSize: 11, marginTop: 8 }}>
                    Working local export — builds a CSV from the demonstration campaign data in your browser.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Button size="sm" variant="ghost" disabled>
                      PDF
                    </Button>
                    <Button size="sm" variant="ghost" disabled>
                      Excel
                    </Button>
                    <Button size="sm" variant="ghost" disabled>
                      CSV
                    </Button>
                  </div>
                  <div className="tly-faint" style={{ fontSize: 11, marginTop: 8 }}>
                    Demonstration export — not implemented.
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>

      <div className="tly-faint" style={{ fontSize: 11, marginTop: 16 }}>
        {DEMO_NOTE} Campaign performance offers a genuine local CSV download; the other exports are
        demonstration placeholders only.
      </div>
    </PortalShell>
  );
}
