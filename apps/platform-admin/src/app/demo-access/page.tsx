'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  ADVERTISER_ROLES,
  PLATFORM_ROLES,
  TELCO_ROLES,
  type CreateDemoUserRequest,
  type DemoUserView,
  type Portal,
} from '@telyad/types';
import { Badge, Button, Card, CardHead, Field, Input, PageHeader, Select, Table } from '@telyad/ui';
import { Modal } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { api, type DemoCredentials } from '@/lib/api';

const PORTAL_LABEL: Record<Portal, string> = {
  advertiser: 'Tely Advertiser',
  telco: 'MTN / Operator Console',
  admin: 'Tely Master Admin',
  telydial: 'TelyDial',
};

const ROLES_FOR: Record<Portal, readonly string[]> = {
  advertiser: ADVERTISER_ROLES,
  telydial: ADVERTISER_ROLES,
  telco: TELCO_ROLES,
  admin: PLATFORM_ROLES,
};

const DURATIONS: { label: string; hours: number }[] = [
  { label: '4 hours', hours: 4 },
  { label: '12 hours', hours: 12 },
  { label: '24 hours', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
];

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  Active: 'success',
  Scheduled: 'info',
  'Expiring Soon': 'warning',
  Expired: 'neutral',
  Revoked: 'danger',
  Disabled: 'neutral',
};

function fmt(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function DemoAccessPage() {
  const [users, setUsers] = useState<DemoUserView[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [credentials, setCredentials] = useState<DemoCredentials | null>(null);

  function load() {
    setLoaded(false);
    setError('');
    api
      .listDemoUsers()
      .then((r) => setUsers(r.users))
      .catch((e) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoaded(true));
  }
  useEffect(load, []);

  async function act(fn: () => Promise<unknown>) {
    try {
      await fn();
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <AdminShell active="demo-access">
      <PageHeader
        eyebrow="Access & Security"
        title="Demo Access"
        desc="Issue time-limited credentials for invited demonstration users. Access is enforced server-side and stops working automatically at expiry. Passwords are shown once and stored only as a secure hash."
      />

      {error && (
        <Card>
          <div className="tly-empty" data-testid="demo-access-error" style={{ color: 'var(--tly-danger)' }}>
            {error}
          </div>
        </Card>
      )}

      <Card>
        <CardHead
          title="Temporary demo accounts"
          sub={loaded ? `${users.length} account${users.length === 1 ? '' : 's'}` : 'Loading…'}
          action={
            <Button size="sm" onClick={() => setShowCreate(true)} data-testid="create-demo-access">
              + Create Demo Access
            </Button>
          }
        />
        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : users.length === 0 ? (
          <div className="tly-empty">No demo accounts yet. Create one to invite a demonstration user.</div>
        ) : (
          <Table head={['User', 'Organisation', 'Portal', 'Role', 'Valid From', 'Expires', 'Status', 'Last Login', 'Actions']}>
            {users.map((u) => (
              <tr key={u.id} data-testid="demo-user-row">
                <td>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div className="tly-faint" style={{ fontSize: 11 }}>{u.email}</div>
                </td>
                <td className="tly-faint">{u.organisation ?? '—'}</td>
                <td className="tly-faint">{PORTAL_LABEL[u.portal]}</td>
                <td className="tly-faint">{u.role}</td>
                <td className="tly-faint tly-mono" style={{ fontSize: 11 }}>{fmt(u.validFrom)}</td>
                <td className="tly-faint tly-mono" style={{ fontSize: 11 }}>{fmt(u.expiresAt)}</td>
                <td><Badge tone={STATUS_TONE[u.status] ?? 'neutral'}>{u.status}</Badge></td>
                <td className="tly-faint tly-mono" style={{ fontSize: 11 }}>{fmt(u.lastLoginAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Button size="sm" variant="ghost" onClick={() => act(() => api.extendDemoUser(u.id, new Date(Date.now() + 24 * 3600_000).toISOString()))}>
                      +24h
                    </Button>
                    {u.status === 'Disabled' ? (
                      <Button size="sm" variant="ghost" onClick={() => act(() => api.enableDemoUser(u.id))}>Enable</Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => act(() => api.disableDemoUser(u.id))}>Disable</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => api.resetDemoPassword(u.id).then((r) => setCredentials(r.credentials)).catch((e) => setError(e.message))}>
                      Reset
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => act(() => api.revokeDemoUser(u.id))} data-testid="revoke-demo-user">
                      Revoke
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {showCreate && (
        <CreateDemoModal
          onClose={() => setShowCreate(false)}
          onCreated={(creds) => {
            setShowCreate(false);
            setCredentials(creds);
            load();
          }}
        />
      )}

      {credentials && <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />}
    </AdminShell>
  );
}

function CreateDemoModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: DemoCredentials) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [portal, setPortal] = useState<Portal>('advertiser');
  const [organisation, setOrganisation] = useState('');
  const [role, setRole] = useState<string>(ADVERTISER_ROLES[0]!);
  const [hours, setHours] = useState(72);
  const [pwMode, setPwMode] = useState<'generate' | 'manual'>('generate');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const roles = ROLES_FOR[portal];
  const validFrom = useMemo(() => new Date().toISOString(), []);
  const expiresAt = useMemo(() => new Date(Date.parse(validFrom) + hours * 3600_000).toISOString(), [validFrom, hours]);

  async function submit() {
    setErr('');
    setBusy(true);
    try {
      const input: CreateDemoUserRequest = {
        name,
        email,
        portal,
        organisation: organisation || undefined,
        role,
        durationHours: hours,
        ...(pwMode === 'manual' ? { password } : { generatePassword: true }),
      };
      const res = await api.createDemoUser(input);
      onCreated(res.credentials);
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal open title="Create Demo Access" onClose={onClose}>
      <div data-testid="create-demo-form" style={{ display: 'grid', gap: 2 }}>
        <Field label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@company.com" />
        </Field>
        <Field label="Portal">
          <Select
            value={portal}
            options={(Object.keys(PORTAL_LABEL) as Portal[]).map((p) => ({ value: p, label: PORTAL_LABEL[p] }))}
            onChange={(e) => {
              const p = e.target.value as Portal;
              setPortal(p);
              setRole(ROLES_FOR[p][0]!);
            }}
          />
        </Field>
        <Field label="Organisation / tenant">
          <Input value={organisation} onChange={(e) => setOrganisation(e.target.value)} placeholder="Coca-Cola Demo" />
        </Field>
        <Field label="Role">
          <Select
            value={role}
            options={roles.map((r) => ({ value: r, label: r }))}
            onChange={(e) => setRole(e.target.value)}
          />
        </Field>
        <Field label="Access duration">
          <Select
            value={hours}
            options={DURATIONS.map((d) => ({ value: String(d.hours), label: d.label }))}
            onChange={(e) => setHours(Number(e.target.value))}
          />
          <div className="hint">Valid {fmt(validFrom)} → {fmt(expiresAt)}</div>
        </Field>
        <Field label="Temporary password">
          <div style={{ display: 'flex', gap: 8, marginBottom: pwMode === 'manual' ? 8 : 0 }}>
            <Button size="sm" variant={pwMode === 'generate' ? 'primary' : 'ghost'} onClick={() => setPwMode('generate')}>
              Generate strong password
            </Button>
            <Button size="sm" variant={pwMode === 'manual' ? 'primary' : 'ghost'} onClick={() => setPwMode('manual')}>
              Set manually
            </Button>
          </div>
          {pwMode === 'manual' && (
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          )}
        </Field>
        {err && <div className="hint" style={{ color: 'var(--tly-danger)' }}>{err}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={busy || !name || !email || (pwMode === 'manual' && password.length < 8)}
            data-testid="submit-demo-user"
          >
            {busy ? 'Creating…' : 'Create Demo Access'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function CredentialsModal({ credentials, onClose }: { credentials: DemoCredentials; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = `Portal: ${credentials.portal}\nUsername: ${credentials.email}\nTemporary Password: ${credentials.password}\nExpires: ${fmt(credentials.expiresAt)}`;
  return (
    <Modal open title="Demo Access Created" onClose={onClose}>
      <div data-testid="demo-credentials" style={{ display: 'grid', gap: 10 }}>
        <div className="hint" style={{ color: 'var(--tly-warning)' }}>
          This password is shown once. Copy it now and send it securely — it cannot be retrieved again.
        </div>
        <div
          className="tly-mono"
          style={{ background: 'var(--tly-card-2)', border: '1px solid var(--tly-border)', borderRadius: 10, padding: 14, fontSize: 12.5, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
        >
          <div>Portal: <strong>{credentials.portal}</strong></div>
          <div>Username: <strong>{credentials.email}</strong></div>
          <div>Temporary Password: <strong data-testid="demo-password">{credentials.password}</strong></div>
          <div>Expires: <strong>{fmt(credentials.expiresAt)}</strong></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button
            variant="ghost"
            onClick={() => {
              navigator.clipboard?.writeText(text).then(() => setCopied(true)).catch(() => undefined);
            }}
          >
            {copied ? 'Copied ✓' : 'Copy Credentials'}
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
