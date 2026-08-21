'use client';
import { useState } from 'react';
import { Button, Card, CardHead, Field, Input, PageHeader, Textarea } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { SUPPORT_TOPICS, FAQS, DEMO_NOTE } from '@/lib/demo';

export default function SupportPage() {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <PortalShell active="support">
      <PageHeader
        eyebrow="Operations"
        title="Support"
        desc="Help, product-verification guidance, billing questions and escalation."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 18,
        }}
      >
        {SUPPORT_TOPICS.map((t) => (
          <Card key={t.title}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
            <div className="tly-faint" style={{ fontSize: 12.5 }}>
              {t.desc}
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardHead title="Frequently asked questions" sub="Common questions about campaigns, products and billing." />
        <div data-testid="faq" style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQS.map((f, i) => {
            const isOpen = open.has(i);
            return (
              <div key={f.q} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--tly-border)' }}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    font: 'inherit',
                    color: 'inherit',
                    fontWeight: 600,
                  }}
                >
                  <span>{f.q}</span>
                  <span className="tly-faint" aria-hidden style={{ flex: '0 0 auto' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="tly-dim" style={{ fontSize: 13, padding: '0 0 12px', lineHeight: 1.5 }}>
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHead title="Contact support" sub="Escalate an issue to the TelyDial support desk." />
        <Field label="Subject">
          <Input placeholder="Brief summary of your issue" />
        </Field>
        <Field label="Message">
          <Textarea rows={4} placeholder="Describe the issue, including campaign or product IDs where relevant." />
        </Field>
        <Button data-testid="support-submit" onClick={() => setSubmitted(true)}>
          Submit request
        </Button>
        {submitted && (
          <div style={{ color: 'var(--tly-success)', fontSize: 13, marginTop: 10 }}>
            Support request captured (demonstration — no live ticket is created).
          </div>
        )}
      </Card>

      <div className="tly-faint" style={{ fontSize: 11, marginTop: 16 }}>
        {DEMO_NOTE}
      </div>
    </PortalShell>
  );
}
