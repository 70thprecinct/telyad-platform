'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardHead,
  ExperiencePreview,
  Field,
  Modal,
  PageHeader,
  Select,
  Table,
} from '@telyad/ui';
import {
  CAPABILITY_FAMILY_LABELS,
  CAPABILITY_STATUS_LABELS,
  type CapabilityStatus,
} from '@telyad/types';
import { listCapabilities, getCapability } from '@telyad/ad-formats';
import { PortalShell } from '@/components/PortalShell';

// Business-facing view over the SINGLE 48-capability registry (source of truth) —
// grouped by family, with availability governed by each capability's network status.
const CAPABILITIES = listCapabilities();

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

function statusTone(status: CapabilityStatus): BadgeTone {
  switch (status) {
    case 'LIVE':
      return 'success';
    case 'PILOT':
      return 'info';
    case 'INTEGRATION_REQUIRED':
    case 'NETWORK_APPROVAL_REQUIRED':
    case 'TELYAD_SUPPORTED':
      return 'warning';
    case 'DISABLED':
      return 'danger';
    case 'FUTURE_CAPABILITY':
    default:
      return 'neutral';
  }
}

function statusLabel(status: CapabilityStatus): string {
  return CAPABILITY_STATUS_LABELS[status] ?? status;
}

function familyLabel(family: string): string {
  return CAPABILITY_FAMILY_LABELS[family as keyof typeof CAPABILITY_FAMILY_LABELS] ?? family;
}

// Distinct families, preserving registry order.
const FAMILY_ORDER: string[] = [];
for (const c of CAPABILITIES) if (!FAMILY_ORDER.includes(c.family)) FAMILY_ORDER.push(c.family);

const FAMILY_OPTIONS = [
  { value: 'ALL', label: 'All families' },
  ...FAMILY_ORDER.map((f) => ({ value: f, label: familyLabel(f) })),
];

const STATUS_OPTIONS: Array<{ value: 'ALL' | CapabilityStatus; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'LIVE', label: 'Live' },
  { value: 'PILOT', label: 'Pilot' },
  { value: 'INTEGRATION_REQUIRED', label: 'Integration required' },
  { value: 'NETWORK_APPROVAL_REQUIRED', label: 'Network approval required' },
  { value: 'FUTURE_CAPABILITY', label: 'Future' },
];

const NUM_STYLE: React.CSSProperties = { whiteSpace: 'nowrap' };

export default function ChannelsPage() {
  const router = useRouter();
  const [family, setFamily] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = CAPABILITIES.filter(
    (c) =>
      (family === 'ALL' || c.family === family) &&
      (status === 'ALL' || c.defaultNetworkStatus === status),
  );

  const groups = FAMILY_ORDER.map((f) => ({
    family: f,
    items: visible.filter((c) => c.family === f),
  })).filter((g) => g.items.length > 0);

  const detail = openId ? getCapability(openId) : undefined;

  return (
    <PortalShell active="channels">
      <PageHeader
        eyebrow="DELIVERY · CHANNELS"
        title="Channels"
        desc="The full carrier channel portfolio — 48 capabilities across their families, availability governed by network status."
      />

      <Card>
        <CardHead
          title="Filter the portfolio"
          sub={`Showing ${visible.length} of ${CAPABILITIES.length} capabilities`}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ minWidth: 220, flex: '1 1 220px' }}>
            <Field label="Family">
              <Select
                options={FAMILY_OPTIONS}
                value={family}
                onChange={(e) => setFamily(e.target.value)}
              />
            </Field>
          </div>
          <div style={{ minWidth: 220, flex: '1 1 220px' }}>
            <Field label="Network status">
              <Select
                options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      <div data-testid="channels-grid" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map((g) => (
          <Card key={g.family}>
            <CardHead title={familyLabel(g.family)} sub={`${g.items.length} capabilities`} />
            <Table
              head={[
                'Capability',
                'Placement',
                'Objective',
                'Device',
                'Pricing',
                'Network status',
                'Action',
              ]}
            >
              {g.items.map((cap) => (
                <tr key={cap.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{cap.name}</div>
                    <div className="tly-faint" style={{ fontSize: 12 }}>
                      #{cap.number}
                    </div>
                  </td>
                  <td className="tly-dim">{cap.placement}</td>
                  <td className="tly-dim">{cap.objectives.slice(0, 2).join(', ')}</td>
                  <td className="tly-dim" style={NUM_STYLE}>
                    {cap.deviceClass.replace(/_/g, ' ')}
                  </td>
                  <td className="tly-dim">{cap.pricingModels.join(' / ')}</td>
                  <td>
                    <Badge tone={statusTone(cap.defaultNetworkStatus)}>
                      {statusLabel(cap.defaultNetworkStatus)}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button size="sm" variant="ghost" onClick={() => setOpenId(cap.id)}>
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push('/campaigns/new')}
                      >
                        Use in campaign
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        ))}
      </div>

      {/* Capability detail — metadata on the left, live subscriber preview on the right. */}
      {detail && (
        <Modal open={openId !== null} title={detail.name} onClose={() => setOpenId(null)}>
          <div
            data-testid="capability-detail"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 20,
              alignItems: 'start',
            }}
            className="tly-channels-detail"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {detail.description && <div className="tly-dim">{detail.description}</div>}
              <DetailRow label="Capability" value={`#${detail.number} · ${detail.name}`} />
              <DetailRow label="Family" value={familyLabel(detail.family)} />
              <DetailRow label="Placement" value={detail.placement} />
              <DetailRow label="Objectives" value={detail.objectives.join(', ')} />
              <DetailRow label="Pricing" value={detail.pricingModels.join(' / ')} />
              {detail.targetingCapabilities.length > 0 && (
                <DetailRow label="Targeting" value={detail.targetingCapabilities.join(', ')} />
              )}
              <DetailRow label="Device" value={detail.deviceClass.replace(/_/g, ' ')} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <span className="tly-faint">Network status</span>
                <Badge tone={statusTone(detail.defaultNetworkStatus)}>
                  {statusLabel(detail.defaultNetworkStatus)}
                </Badge>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ExperiencePreview
                renderer={detail.previewRenderer}
                content={detail.sample}
                device={detail.deviceClass === 'feature_phone' ? 'feature_phone' : 'smartphone'}
              />
            </div>
          </div>
        </Modal>
      )}
    </PortalShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span className="tly-faint">{label}</span>
      <span style={{ textAlign: 'right' }}>{value}</span>
    </div>
  );
}
