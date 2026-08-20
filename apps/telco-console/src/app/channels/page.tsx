'use client';
import { useState } from 'react';
import { listCapabilities } from '@telyad/ad-formats';
import {
  CAPABILITY_FAMILY_LABELS,
  CAPABILITY_STATUS_LABELS,
  type AdCapability,
  type CapabilityFamily,
  type CapabilityStatus,
} from '@telyad/types';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Modal,
  PageHeader,
  Progress,
  Select,
  Table,
  ExperiencePreview,
} from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { DEMO_NOTE } from '@/lib/demo';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

// The registry IS the single source of truth. This operator-governance view
// reads the SAME 48-capability registry the inventory governance seam writes to;
// enable/disable is governed by RBAC and applied via that existing seam — no
// destructive action is exposed here.
const CAPS: AdCapability[] = listCapabilities();

function statusTone(status: CapabilityStatus): BadgeTone {
  switch (status) {
    case 'LIVE':
      return 'success';
    case 'PILOT':
      return 'info';
    case 'INTEGRATION_REQUIRED':
    case 'NETWORK_APPROVAL_REQUIRED':
      return 'warning';
    case 'DISABLED':
      return 'danger';
    case 'FUTURE_CAPABILITY':
    default:
      return 'neutral';
  }
}

function statusLabel(status: CapabilityStatus): string {
  return CAPABILITY_STATUS_LABELS[status] ?? String(status);
}

function familyLabel(family: CapabilityFamily): string {
  return CAPABILITY_FAMILY_LABELS[family] ?? String(family);
}

// Deterministic demonstration utilisation (no live carrier throughput signal).
function utilisation(number: number): number {
  return 40 + ((number * 7) % 55);
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'LIVE', label: 'Live' },
  { value: 'PILOT', label: 'Pilot' },
  { value: 'INTEGRATION_REQUIRED', label: 'Integration required' },
  { value: 'NETWORK_APPROVAL_REQUIRED', label: 'Network approval required' },
  { value: 'FUTURE_CAPABILITY', label: 'Future' },
];

export default function ChannelsPage() {
  const [familyFilter, setFamilyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [active, setActive] = useState<AdCapability | null>(null);

  const distinctFamilies = Array.from(new Set(CAPS.map((c) => c.family)));
  const familyOptions = [
    { value: 'ALL', label: 'All families' },
    ...distinctFamilies.map((f) => ({ value: f, label: familyLabel(f) })),
  ];

  const filtered = CAPS.filter((c) => {
    if (familyFilter !== 'ALL' && c.family !== familyFilter) return false;
    if (statusFilter !== 'ALL' && c.defaultNetworkStatus !== statusFilter) return false;
    return true;
  });

  const groups = distinctFamilies
    .map((family) => ({
      family,
      caps: filtered.filter((c) => c.family === family).sort((a, b) => a.number - b.number),
    }))
    .filter((g) => g.caps.length > 0);

  return (
    <ConsoleShell active="channels">
      <PageHeader
        eyebrow="AUDIENCE & TRAFFIC"
        title="Messaging Channels"
        desc="Live status for every delivery channel operating on MTN Nigeria's network."
      />

      <Card>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: 260 }}>
            <Select
              options={familyOptions}
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              data-testid="channels-family-filter"
            />
          </div>
          <div style={{ width: 240 }}>
            <Select
              options={STATUS_FILTERS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-testid="channels-status-filter"
            />
          </div>
          <div className="tly-faint" style={{ fontSize: 11.5, marginLeft: 'auto' }}>
            Network status is the real registry value. Utilisation is demonstration only — {DEMO_NOTE}
          </div>
        </div>
      </Card>

      <div data-testid="channels-grid">
        {groups.map(({ family, caps }) => (
          <Card key={family}>
            <CardHead title={familyLabel(family)} sub={`${caps.length} capabilities`} />
            <Table head={['Capability', 'Device', 'Pricing', 'Network status', 'Utilisation', 'Action']}>
              {caps.map((c) => {
                const util = utilisation(c.number);
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div className="tly-mono tly-faint" style={{ fontSize: 11 }}>
                        #{c.number}
                      </div>
                    </td>
                    <td className="tly-faint">{c.deviceClass.replace(/_/g, ' ')}</td>
                    <td className="tly-mono tly-faint">{c.pricingModels.join(' / ')}</td>
                    <td>
                      <Badge tone={statusTone(c.defaultNetworkStatus)}>
                        {statusLabel(c.defaultNetworkStatus)}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: 80 }}>
                          <Progress value={util} />
                        </div>
                        <span className="tly-mono tly-faint" style={{ fontSize: 11 }}>
                          {util}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <Button size="sm" variant="ghost" onClick={() => setActive(c)}>
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </Card>
        ))}
      </div>

      <Modal open={!!active} title={active ? active.name : ''} onClose={() => setActive(null)}>
        {active && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
            <div>
              <div className="tly-faint" style={{ fontSize: 11.5, marginBottom: 10 }}>
                {active.description}
              </div>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', margin: 0, fontSize: 12 }}>
                <dt className="tly-faint">Number</dt>
                <dd className="tly-mono" style={{ margin: 0 }}>#{active.number}</dd>
                <dt className="tly-faint">Family</dt>
                <dd style={{ margin: 0 }}>{familyLabel(active.family)}</dd>
                <dt className="tly-faint">Placement</dt>
                <dd style={{ margin: 0 }}>{active.placement.replace(/_/g, ' ')}</dd>
                <dt className="tly-faint">Device</dt>
                <dd style={{ margin: 0 }}>{active.deviceClass.replace(/_/g, ' ')}</dd>
                <dt className="tly-faint">Pricing</dt>
                <dd className="tly-mono" style={{ margin: 0 }}>{active.pricingModels.join(' / ')}</dd>
                <dt className="tly-faint">Network status</dt>
                <dd style={{ margin: 0 }}>
                  <Badge tone={statusTone(active.defaultNetworkStatus)}>
                    {statusLabel(active.defaultNetworkStatus)}
                  </Badge>
                </dd>
              </dl>
              <div className="tly-faint" style={{ fontSize: 10.5, marginTop: 12 }}>
                Enable/disable is governed by RBAC and applied via the existing inventory governance
                seam. This view is read-only.
              </div>
            </div>
            <div>
              <ExperiencePreview
                renderer={active.previewRenderer}
                content={active.sample}
                device={active.deviceClass === 'feature_phone' ? 'feature_phone' : 'smartphone'}
              />
            </div>
          </div>
        )}
      </Modal>
    </ConsoleShell>
  );
}
