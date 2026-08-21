'use client';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Progress } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { CONSENT, DEMO_NOTE, EXT_NOTE } from '@/lib/demo';

export default function ConsentPage() {
  return (
    <ConsoleShell active="consent">
      <PageHeader eyebrow="GOVERNANCE" title="Consent & DND" />

      <Card>
        <div className="tly-faint" style={{ fontSize: 12 }} data-testid="consent-note">
          Aggregate suppression only — no subscriber identities. Figures are demonstration data
          ({DEMO_NOTE}). DND registry sync: {EXT_NOTE}
        </div>
      </Card>

      <KpiGrid>
        <Kpi label="DND-suppressed" value={`${CONSENT.dndSuppressedM}M`} />
        <Kpi label="Consent-eligible" value={`${CONSENT.consentEligibleM}M`} />
        <Kpi label="Exclusion rate" value={`${CONSENT.exclusionRatePct}%`} />
        <Kpi label="Registry sync" value={CONSENT.registrySync} />
      </KpiGrid>

      <Card>
        <CardHead title="Channel suppression" sub="Share of audience suppressed per channel (aggregate)" />
        <div style={{ display: 'grid', gap: 12 }}>
          {CONSENT.channelSuppression.map(([channel, pct]) => (
            <div key={channel} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 56px', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 12.5 }}>{channel}</span>
              <Progress value={pct} />
              <span className="tly-mono tly-faint" style={{ fontSize: 11.5, textAlign: 'right' }}>{pct}%</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead title="Campaign eligibility impact" sub="How gating reduces the addressable audience" />
        <p className="tly-faint" style={{ fontSize: 12.5, marginTop: 0 }}>
          DND filtering and consent gating are applied before any campaign is delivered. Each campaign&apos;s
          eligible audience is the reachable base minus DND-suppressed subscribers and minus those
          without valid consent for the channel — reducing the addressable audience while keeping every
          delivery compliant.
        </p>
        <Badge tone="success">No subscriber identities — aggregate suppression only</Badge>
      </Card>
    </ConsoleShell>
  );
}
