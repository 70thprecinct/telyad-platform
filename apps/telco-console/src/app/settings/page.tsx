'use client';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Field,
  Input,
  PageHeader,
  Select,
} from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { DEMO_NOTE } from '@/lib/demo';

const ON_OFF = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
];

const TIMEZONE_OPTIONS = [{ value: 'wat', label: 'WAT (UTC+1)' }];
const CURRENCY_OPTIONS = [{ value: 'ngn', label: 'NGN' }];
const SLA_OPTIONS = [{ value: '2h', label: '2 hours' }];
const DND_OPTIONS = [{ value: 'on', label: 'On (locked)' }];
const CAP_OPTIONS = [{ value: 'approval', label: 'Network approval required' }];

function ToggleRow({ label, options = ON_OFF, defaultValue = 'on', locked = false }: {
  label: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string;
  locked?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '8px 0',
        borderBottom: '1px solid var(--tly-border)',
      }}
    >
      <span style={{ fontSize: 13 }}>{label}</span>
      <div style={{ width: 180 }}>
        <Select options={options} defaultValue={defaultValue} disabled={locked} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // Client-side confirmation only — server-side persistence lands later.
    setSaved(true);
  }

  return (
    <ConsoleShell active="settings">
      <PageHeader
        eyebrow="ACCESS & SYSTEM"
        title="Settings"
        desc="Operator-level configuration for the MTN Nigeria environment."
      />

      <Card>
        <CardHead title="Workspace" sub="Environment identity and locale" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
          <Field label="Environment name">
            <Input value="MTN Nigeria" readOnly />
          </Field>
          <Field label="Timezone">
            <Select options={TIMEZONE_OPTIONS} defaultValue="wat" />
          </Field>
          <Field label="Currency">
            <Select options={CURRENCY_OPTIONS} defaultValue="ngn" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHead title="Approval settings" sub="Governance controls for campaign go-live" />
        <div style={{ maxWidth: 620 }}>
          <ToggleRow label="Require two-person approval for high-risk campaigns" defaultValue="on" />
          <ToggleRow label="Auto-apply DND suppression" options={DND_OPTIONS} defaultValue="on" locked />
          <ToggleRow label="Compliance review SLA" options={SLA_OPTIONS} defaultValue="2h" />
        </div>
      </Card>

      <Card>
        <CardHead title="Notification preferences" sub="Which roles receive which alerts" />
        <div style={{ maxWidth: 620 }}>
          <ToggleRow label="Operations — campaign approval alerts" defaultValue="on" />
          <ToggleRow label="Compliance — DND / consent alerts" defaultValue="on" />
          <ToggleRow label="Finance — low wallet balance alerts" defaultValue="on" />
          <ToggleRow label="Commercial — integration issue alerts" defaultValue="off" />
        </div>
      </Card>

      <Card>
        <CardHead title="Capability governance" sub="Default posture for newly registered capabilities" />
        <div style={{ maxWidth: 480 }}>
          <Field label="Default new-capability state">
            <Select options={CAP_OPTIONS} defaultValue="approval" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHead title="Security summary" sub="Read-only posture overview — no secrets are exposed" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 620 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 13 }}>Multi-factor authentication</span>
            <Badge tone="warning">Recommended</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 13 }}>Session policy</span>
            <span className="tly-faint" style={{ fontSize: 12.5 }}>
              30-minute idle timeout; re-authentication required for sensitive actions.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 13 }}>Server-side RBAC</span>
            <Badge tone="success">Enforced</Badge>
          </div>
        </div>
      </Card>

      <Card>
        <CardHead title="Environment info" sub="Deployment metadata" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span className="tly-faint" style={{ fontSize: 13 }}>Environment</span>
            <span className="tly-mono">MTN Nigeria (operator console)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span className="tly-faint" style={{ fontSize: 13 }}>Region</span>
            <span className="tly-mono">West Africa (Lagos)</span>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button onClick={handleSave}>Save changes</Button>
          {saved && (
            <Badge tone="success">Saved</Badge>
          )}
        </div>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          {DEMO_NOTE} Changes are held in this session only — persistence lands later.
        </div>
      </Card>
    </ConsoleShell>
  );
}
