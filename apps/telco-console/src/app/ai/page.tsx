'use client';
import { useCallback, useEffect, useState } from 'react';
import { type RevenueIntelligenceReport } from '@telyad/types';
import { Badge, Button, Card, CardHead, PageHeader } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { fmtMinor } from '@/components/commercial';
import { api, type AiInsight } from '@/lib/api';

const KIND_TONE: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  opportunity: 'success',
  growth: 'success',
  risk: 'danger',
  warning: 'warning',
  compliance: 'warning',
  trend: 'info',
  insight: 'info',
};

function toneFor(kind: string) {
  return KIND_TONE[kind.toLowerCase()] ?? 'neutral';
}

export default function AiIntelligencePage() {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [report, setReport] = useState<RevenueIntelligenceReport | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const refresh = useCallback(() => {
    setState('loading');
    api
      .aiIntelligence()
      .then((r) => {
        setInsights(r.insights);
        setReport(r.report);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);
  useEffect(refresh, [refresh]);

  return (
    <ConsoleShell active="ai">
      <PageHeader
        eyebrow="Intelligence"
        title="AI Intelligence"
        desc="Operational and commercial signals surfaced across MTN Nigeria's advertising activity. Demonstration intelligence — deterministic, rule-based, not production ML."
      />

      {state === 'loading' ? (
        <div className="tly-faint" data-testid="ai-loading">
          Analysing network activity…
        </div>
      ) : state === 'error' ? (
        <Card>
          <div className="tly-empty" data-testid="ai-error">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t load intelligence</div>
            <div style={{ fontSize: 12.5, marginBottom: 12 }}>The API may be unavailable.</div>
            <Button variant="ghost" onClick={refresh}>
              Retry
            </Button>
          </div>
        </Card>
      ) : (
        <div data-testid="ai-intelligence">
          <Card>
            <CardHead
              title="Signals & insights"
              sub="Demonstration intelligence — deterministic"
              action={<Badge tone="info">{insights.length} signals</Badge>}
            />
            {insights.length === 0 ? (
              <div className="tly-empty">No insights available.</div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: 12,
                }}
              >
                {insights.map((ins, i) => (
                  <div
                    key={i}
                    style={{ border: '1px solid var(--tly-border)', borderRadius: 8, padding: 14 }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Badge tone={toneFor(ins.kind)}>{ins.kind}</Badge>
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{ins.title}</div>
                    <div className="tly-faint" style={{ fontSize: 12, lineHeight: 1.55 }}>
                      {ins.detail}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {report && report.opportunities.length > 0 && (
            <Card>
              <CardHead
                title="Revenue opportunities"
                sub="Deterministic demonstration recommendations"
                action={<Badge tone="success">{report.opportunities.length}</Badge>}
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 12,
                }}
              >
                {report.opportunities.map((o, i) => (
                  <div
                    key={i}
                    style={{ border: '1px solid var(--tly-border)', borderRadius: 8, padding: 14 }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{o.title}</div>
                    <div
                      className="tly-faint"
                      style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 10 }}
                    >
                      {o.detail}
                    </div>
                    <div
                      className="tly-mono"
                      style={{ fontSize: 13, color: 'var(--tly-primary)', fontWeight: 600 }}
                    >
                      +{fmtMinor(o.estimatedUpsideMinor, report.currency, true)} est. upside
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </ConsoleShell>
  );
}
