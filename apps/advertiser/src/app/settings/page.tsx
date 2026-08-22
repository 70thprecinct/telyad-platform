'use client';
import { useState } from 'react';
import { Badge, Button, Card, CardHead, Field, Input, PageHeader, Select } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { DEMO_NOTE } from '@/lib/demo';

const INDUSTRY_OPTIONS = [
  { value: 'fmcg', label: 'FMCG' },
  { value: 'financial', label: 'Financial Services' },
  { value: 'betting', label: 'Betting & Gaming' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'vas', label: 'Telecoms/VAS' },
  { value: 'other', label: 'Other' },
];
const COUNTRY_OPTIONS = [{ value: 'ng', label: 'Nigeria' }];
const ONOFF_OPTIONS = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
];
const OBJECTIVE_OPTIONS = [
  { value: 'acquisition', label: 'Acquisition' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'engagement', label: 'Engagement' },
];
const PRICING_OPTIONS = [
  { value: 'cpm', label: 'CPM' },
  { value: 'cpc', label: 'CPC' },
  { value: 'cpa', label: 'CPA' },
  { value: 'cpl', label: 'CPL' },
];
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'pcm', label: 'Nigerian Pidgin' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'ha', label: 'Hausa' },
  { value: 'ig', label: 'Igbo' },
];

const NOTIF_PREFS: Array<{ key: string; label: string }> = [
  { key: 'campaignStatus', label: 'Campaign approved / rejected' },
  { key: 'budgetAlerts', label: 'Budget alerts' },
  { key: 'creativeReview', label: 'Creative review updates' },
  { key: 'weeklySummary', label: 'Weekly performance summary' },
];

export default function SettingsPage() {
  // Editable demo values — no persistence in this pass.
  const [orgName, setOrgName] = useState('70TH Precinct');
  const [industry, setIndustry] = useState('other');
  const [email, setEmail] = useState('ops@70thprecinct.example');
  const [country, setCountry] = useState('ng');

  const [prefs, setPrefs] = useState<Record<string, string>>({
    campaignStatus: 'on',
    budgetAlerts: 'on',
    creativeReview: 'on',
    weeklySummary: 'off',
  });

  const [objective, setObjective] = useState('acquisition');
  const [pricing, setPricing] = useState('cpm');
  const [language, setLanguage] = useState('en');

  const [saved, setSaved] = useState(false);
  function save() {
    // Persistence lands in a later pass — this only confirms client-side.
    setSaved(true);
  }

  return (
    <PortalShell active="settings">
      <PageHeader
        eyebrow="ACCOUNT · SETTINGS"
        title="Settings"
        desc="Organisation, notification and campaign preferences."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card>
          <CardHead title="Organisation profile" sub="Company details used across the portal." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <Field label="Organisation name">
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </Field>
            <Field label="Industry">
              <Select value={industry} onChange={(e) => setIndustry(e.target.value)} options={INDUSTRY_OPTIONS} />
            </Field>
            <Field label="Primary contact email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Country">
              <Select value={country} onChange={(e) => setCountry(e.target.value)} options={COUNTRY_OPTIONS} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHead title="Notification preferences" sub="Which alerts reach you." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {NOTIF_PREFS.map((p) => (
              <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 13 }}>{p.label}</span>
                <div style={{ width: 120 }}>
                  <Select
                    value={prefs[p.key]}
                    onChange={(e) => setPrefs((prev) => ({ ...prev, [p.key]: e.target.value }))}
                    options={ONOFF_OPTIONS}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="tly-faint" style={{ marginTop: 12, fontSize: 12 }}>{DEMO_NOTE} Preferences are not yet persisted.</div>
        </Card>

        <Card>
          <CardHead title="Campaign defaults" sub="Pre-filled when you create a new campaign." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <Field label="Default objective">
              <Select value={objective} onChange={(e) => setObjective(e.target.value)} options={OBJECTIVE_OPTIONS} />
            </Field>
            <Field label="Default pricing model">
              <Select value={pricing} onChange={(e) => setPricing(e.target.value)} options={PRICING_OPTIONS} />
            </Field>
            <Field label="Default language">
              <Select value={language} onChange={(e) => setLanguage(e.target.value)} options={LANGUAGE_OPTIONS} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHead title="Security & access" sub="Read-only summary. No secrets or tokens are shown." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span className="tly-faint" style={{ fontSize: 13 }}>Signed-in user</span>
              <span className="tly-mono" style={{ fontSize: 13 }}>—</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span className="tly-faint" style={{ fontSize: 13 }}>Multi-factor authentication</span>
              <Badge tone="warning">Not enabled (demo)</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span className="tly-faint" style={{ fontSize: 13 }}>Session</span>
              <span style={{ fontSize: 13 }}>Local demonstration session — no live credentials stored.</span>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button onClick={save}>Save changes</Button>
          {saved && <span style={{ color: 'var(--tly-success)', fontSize: 13 }}>Saved</span>}
          <span className="tly-faint" style={{ fontSize: 12 }}>{DEMO_NOTE} Changes persist in a later pass.</span>
        </div>
      </div>
    </PortalShell>
  );
}
