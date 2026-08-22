'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardHead,
  ExperiencePreview,
  Kpi,
  KpiGrid,
  Modal,
  PageHeader,
  Table,
} from '@telyad/ui';
import { getCapability } from '@telyad/ad-formats';
import { PortalShell } from '@/components/PortalShell';
import { CREATIVES, DEMO_NOTE, type DemoCreative } from '@/lib/demo';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

function statusTone(status: DemoCreative['status']): BadgeTone {
  switch (status) {
    case 'Approved':
      return 'success';
    case 'In review':
      return 'warning';
    case 'Rejected':
      return 'danger';
    case 'Draft':
    default:
      return 'neutral';
  }
}

function truncate(text: string, max = 60): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

// Demo creatives reference capabilities by a hyphenated slug (e.g. `standard-sms`),
// while the registry keys are underscored (`standard_sms`). Resolve both so the
// single ExperiencePreview architecture renders a real handset for each creative.
function resolveCapability(capabilityId: string) {
  return getCapability(capabilityId) ?? getCapability(capabilityId.replace(/-/g, '_'));
}

export default function CreativesPage() {
  const router = useRouter();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const approved = CREATIVES.filter((c) => c.status === 'Approved').length;
  const inReview = CREATIVES.filter((c) => c.status === 'In review').length;
  const languages = new Set(CREATIVES.map((c) => c.language)).size;

  const creative = previewId ? CREATIVES.find((c) => c.id === previewId) ?? null : null;
  const cap = creative ? resolveCapability(creative.capabilityId) : undefined;

  return (
    <PortalShell active="creatives">
      <PageHeader
        eyebrow="DELIVERY · CREATIVES"
        title="Creative Library"
        desc="All creatives across formats and languages, with live subscriber previews."
      />

      <KpiGrid>
        <Kpi label="Total creatives" value={CREATIVES.length} />
        <Kpi label="Approved" value={approved} />
        <Kpi label="In review" value={inReview} />
        <Kpi label="Languages" value={languages} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Creatives"
          sub="Every creative across formats and languages."
          action={
            // Opens the campaign wizard's creative step in a later pass.
            <Button size="sm" onClick={() => router.push('/campaigns/new')}>
              + New creative
            </Button>
          }
        />
        <Table
          head={['Creative', 'Channel', 'Language', 'Status', 'Campaign', 'Created', 'Preview']}
        >
          {CREATIVES.map((c) => (
            <tr key={c.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div className="tly-faint" style={{ fontSize: 12 }}>
                  {truncate(c.body)}
                </div>
              </td>
              <td>
                <Badge tone="info">{c.channel}</Badge>
              </td>
              <td className="tly-dim">{c.language}</td>
              <td>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
              </td>
              <td className="tly-dim">{c.campaign ?? '—'}</td>
              <td className="tly-dim">{c.created}</td>
              <td>
                <Button size="sm" variant="ghost" onClick={() => setPreviewId(c.id)}>
                  Preview
                </Button>
              </td>
            </tr>
          ))}
        </Table>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 10 }}>
          {DEMO_NOTE}
        </div>
      </Card>

      {/* Preview — the creative's copy beside the capability's live handset mockup. */}
      {creative && (
        <Modal
          open={previewId !== null}
          title={creative.name}
          onClose={() => setPreviewId(null)}
          footer={
            <Button variant="ghost" onClick={() => setPreviewId(null)}>
              Close
            </Button>
          }
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 20,
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <Badge tone="info">{creative.channel}</Badge>
                <Badge tone={statusTone(creative.status)}>{creative.status}</Badge>
              </div>
              <div>
                <div className="tly-faint" style={{ fontSize: 11.5, marginBottom: 2 }}>
                  Language
                </div>
                <div className="tly-dim">{creative.language}</div>
              </div>
              <div>
                <div className="tly-faint" style={{ fontSize: 11.5, marginBottom: 2 }}>
                  Message
                </div>
                <div style={{ lineHeight: 1.55 }}>{creative.body}</div>
              </div>
              {creative.campaign && (
                <div>
                  <div className="tly-faint" style={{ fontSize: 11.5, marginBottom: 2 }}>
                    Campaign
                  </div>
                  <div className="tly-dim">{creative.campaign}</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {cap ? (
                <ExperiencePreview
                  renderer={cap.previewRenderer}
                  content={cap.sample}
                  device={cap.deviceClass === 'feature_phone' ? 'feature_phone' : 'smartphone'}
                />
              ) : (
                <div
                  className="tly-dim"
                  style={{ fontSize: 12.5, textAlign: 'center', padding: '24px 12px' }}
                >
                  No subscriber preview is available for this creative&rsquo;s capability.
                </div>
              )}
            </div>
          </div>
          <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 14 }}>
            {DEMO_NOTE}
          </div>
        </Modal>
      )}
    </PortalShell>
  );
}
