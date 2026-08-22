'use client';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Field,
  Input,
  Kpi,
  KpiGrid,
  PageHeader,
  Select,
  Table,
  Textarea,
} from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { DEMO_NOTE, SUPPORT_FAQ, SUPPORT_TICKETS } from '@/lib/demo';

const CATEGORY_OPTIONS = [
  { value: 'Campaign', label: 'Campaign' },
  { value: 'Billing', label: 'Billing' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'Technical', label: 'Technical' },
];

function priorityTone(p: string): 'danger' | 'warning' | 'neutral' {
  if (p === 'High') return 'danger';
  if (p === 'Medium') return 'warning';
  return 'neutral';
}

function statusTone(s: string): 'warning' | 'success' | 'neutral' {
  if (s === 'Open') return 'warning';
  if (s === 'Resolved') return 'success';
  return 'neutral';
}

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);

  const openCount = SUPPORT_TICKETS.filter((t) => t.status === 'Open').length;
  const resolvedCount = SUPPORT_TICKETS.filter((t) => t.status === 'Resolved').length;
  const highCount = SUPPORT_TICKETS.filter((t) => t.priority === 'High').length;

  function handleSubmit() {
    // Demonstration no-op: no live ticket backend in this build.
    setSubmitted(true);
  }

  return (
    <ConsoleShell active="support">
      <PageHeader
        eyebrow="ACCESS & SYSTEM"
        title="Support Centre"
        desc="Open tickets from advertisers and internal MTN staff."
      />

      <KpiGrid>
        <Kpi label="Open tickets" value={openCount} />
        <Kpi label="Resolved" value={resolvedCount} />
        <Kpi label="High priority" value={highCount} />
      </KpiGrid>

      <Card>
        <CardHead title="Tickets" sub="Advertiser and internal support requests" />
        <Table head={['Ticket', 'Subject', 'Advertiser', 'Priority', 'Status']}>
          {SUPPORT_TICKETS.map((t) => (
            <tr key={t.id}>
              <td className="tly-mono">{t.id}</td>
              <td>{t.subject}</td>
              <td className="tly-faint">{t.advertiser}</td>
              <td>
                <Badge tone={priorityTone(t.priority)}>{t.priority}</Badge>
              </td>
              <td>
                <Badge tone={statusTone(t.status)}>{t.status}</Badge>
              </td>
            </tr>
          ))}
        </Table>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          {DEMO_NOTE}
        </div>
      </Card>

      <Card>
        <CardHead title="Contact / escalation" sub="Raise a support request to the platform team" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
          <Field label="Category">
            <Select options={CATEGORY_OPTIONS} defaultValue="Campaign" />
          </Field>
          <Field label="Subject">
            <Input placeholder="Short summary of the issue" />
          </Field>
          <Field label="Details">
            <Textarea rows={4} placeholder="Describe the issue, affected campaign and any references." />
          </Field>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button onClick={handleSubmit}>Submit</Button>
            {submitted && (
              <span className="tly-faint" style={{ fontSize: 12.5 }}>
                Captured for demonstration — no live ticket backend is connected.
              </span>
            )}
          </div>
        </div>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          {DEMO_NOTE}
        </div>
      </Card>

      <Card>
        <CardHead title="FAQ" sub="Common operator questions" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SUPPORT_FAQ.map((f) => (
            <div key={f.q}>
              <div style={{ fontWeight: 600 }}>{f.q}</div>
              <div className="tly-faint" style={{ fontSize: 12.5, marginTop: 2 }}>
                {f.a}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  );
}
