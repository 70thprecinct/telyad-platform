'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Field,
  Input,
  Kpi,
  KpiGrid,
  Modal,
  PageHeader,
  Select,
  Table,
} from '@telyad/ui';
import { compactNumber } from '@telyad/types';
import { PortalShell } from '@/components/PortalShell';
import { SEGMENTS, DEMO_NOTE, type DemoSegment } from '@/lib/demo';

const GEOGRAPHY_OPTIONS = [
  { value: 'National', label: 'National' },
  { value: 'Lagos', label: 'Lagos' },
  { value: 'Oyo', label: 'Oyo' },
  { value: 'Kano', label: 'Kano' },
  { value: 'Abuja FCT', label: 'Abuja FCT' },
  { value: 'Rivers', label: 'Rivers' },
];

const DEVICE_OPTIONS = [
  { value: 'All devices', label: 'All devices' },
  { value: 'Smartphone', label: 'Smartphone' },
  { value: 'Feature phone', label: 'Feature phone' },
];

function statusTone(status: DemoSegment['status']): 'success' | 'warning' | 'neutral' {
  return status === 'Active' ? 'success' : status === 'Draft' ? 'warning' : 'neutral';
}

const NUM_STYLE: React.CSSProperties = { textAlign: 'right', whiteSpace: 'nowrap' };

export default function SegmentsPage() {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<DemoSegment | null>(null);

  const activeCount = SEGMENTS.filter((s) => s.status === 'Active').length;
  const combinedSize = SEGMENTS.reduce((sum, s) => sum + s.size, 0);

  return (
    <PortalShell active="segments">
      <PageHeader
        eyebrow="TARGETING · SEGMENTS"
        title="Segments"
        desc="Reusable, privacy-safe audience segments — aggregate only, no subscriber identities."
      />

      <KpiGrid>
        <Kpi label="Saved segments" value={SEGMENTS.length} />
        <Kpi label="Active" value={activeCount} />
        <Kpi label="Combined size" value={compactNumber(combinedSize)} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Saved segments"
          sub="Aggregate audiences reusable across campaigns."
          action={
            <Button size="sm" onClick={() => setShowCreate(true)}>
              + Create segment
            </Button>
          }
        />
        <Table
          head={[
            'Segment',
            'Criteria',
            'Est. eligible',
            'Geography',
            'Devices',
            'Status',
            'Updated',
            'Action',
          ]}
        >
          {SEGMENTS.map((s) => (
            <tr key={s.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div className="tly-faint" style={{ fontSize: 12 }}>
                  {s.description}
                </div>
              </td>
              <td className="tly-dim">{s.channels.join(' · ')}</td>
              <td className="tly-mono" style={NUM_STYLE}>
                {compactNumber(s.size)}
              </td>
              <td className="tly-dim">{s.geography.join(', ')}</td>
              <td className="tly-dim">{s.devices}</td>
              <td>
                <Badge tone={statusTone(s.status)}>{s.status}</Badge>
              </td>
              <td className="tly-dim">{s.updated}</td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button size="sm" variant="ghost" onClick={() => router.push('/campaigns/new')}>
                    Use
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDetail(s)}>
                    View
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 10 }}>
          {DEMO_NOTE}
        </div>
      </Card>

      {/* Create segment modal */}
      <Modal
        open={showCreate}
        title="Create segment"
        onClose={() => setShowCreate(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            {/* Demonstration only — segment persistence lands in a later pass */}
            <Button onClick={() => setShowCreate(false)}>Create segment</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Segment name">
            <Input placeholder="e.g. High-intent sports gamblers" />
          </Field>
          <Field label="Description">
            <Input placeholder="Short description of the audience" />
          </Field>
          <Field label="Geography">
            <Select options={GEOGRAPHY_OPTIONS} defaultValue="National" />
          </Field>
          <Field label="Device">
            <Select options={DEVICE_OPTIONS} defaultValue="All devices" />
          </Field>
          <div
            style={{
              borderTop: '1px solid var(--tly-border)',
              paddingTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div className="tly-dim" style={{ fontSize: 12 }}>
              Estimated eligible subscribers
            </div>
            <div className="tly-mono" style={{ fontSize: 20, fontWeight: 700 }}>
              ≈ 1.2M
            </div>
            <div className="tly-faint" style={{ fontSize: 11.5 }}>
              Segments below 50,000 subscribers are privacy-masked and cannot be targeted.
            </div>
          </div>
        </div>
      </Modal>

      {/* Segment detail modal */}
      <Modal
        open={detail !== null}
        title={detail ? detail.name : 'Segment'}
        onClose={() => setDetail(null)}
        footer={
          <Button variant="ghost" onClick={() => setDetail(null)}>
            Close
          </Button>
        }
      >
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div className="tly-dim">{detail.description}</div>
            <DetailRow label="Criteria" value={detail.channels.join(' · ')} />
            <DetailRow label="Estimated size" value={compactNumber(detail.size)} mono />
            <DetailRow label="Signal score" value={`${detail.signalScore} / 100`} mono />
            <DetailRow label="Geography" value={detail.geography.join(', ')} />
            <DetailRow label="Devices" value={detail.devices} />
            <DetailRow label="Channels" value={detail.channels.join(', ')} />
            <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 4 }}>
              {DEMO_NOTE}
            </div>
          </div>
        )}
      </Modal>
    </PortalShell>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span className="tly-faint">{label}</span>
      <span className={mono ? 'tly-mono' : undefined} style={{ textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}
