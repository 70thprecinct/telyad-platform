'use client';
import { useState } from 'react';
import { Badge, Button, Card, CardHead, Field, Input, Kpi, KpiGrid, Modal, PageHeader, Select, Table } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { TELCO_ROLE_MATRIX, USERS, DEMO_NOTE } from '@/lib/demo';

// Users & Roles (§20). This is the operator console surface for user
// administration. The LIVE temporary/demo-access lifecycle — create, valid-from,
// expiry, revoke, extend, reset, server-side expiry enforcement — is the Demo
// Access engine (feature/demo-access-control, PR #6). This screen wires to that
// engine's admin API on merge; it is NOT a re-implementation. Server-side RBAC
// remains authoritative — the client never assigns privileged roles.
const PERM_COLS: { key: string; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'approve', label: 'Approve' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'users', label: 'Users' },
  { key: 'audit', label: 'Audit' },
];

export default function UsersPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [filter, setFilter] = useState('all');

  const users = USERS.filter((u) => filter === 'all' || (filter === 'demo' ? u.demo : !u.demo));
  const demoCount = USERS.filter((u) => u.demo).length;

  return (
    <ConsoleShell active="users">
      <PageHeader
        eyebrow="ACCESS & SYSTEM"
        title="Users & Roles"
        desc="MTN Nigeria staff with access to this console, and what they're permitted to do. Temporary demo accounts are issued and expired by the Demo Access engine — access is enforced server-side."
      />

      <KpiGrid>
        <Kpi label="Users" value={USERS.length} />
        <Kpi label="Permanent" value={USERS.length - demoCount} />
        <Kpi label="Temporary / demo" value={demoCount} />
        <Kpi label="Roles" value={TELCO_ROLE_MATRIX.length} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Users"
          sub="Permanent and temporary demo accounts"
          action={<Button size="sm" onClick={() => setShowInvite(true)}>+ Invite / create</Button>}
        />
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ minWidth: 180 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All users' },
                { value: 'permanent', label: 'Permanent only' },
                { value: 'demo', label: 'Temporary / demo only' },
              ]}
            />
          </div>
        </div>
        <Table head={['User', 'Role', 'Portal', 'Organisation', 'Status', 'Last login', 'Valid from', 'Expires', 'Actions']}>
          {users.map((u) => (
            <tr key={u.email}>
              <td>
                <div style={{ fontWeight: 600 }}>{u.name} {u.demo && <Badge tone="info">Demo</Badge>}</div>
                <div className="tly-faint" style={{ fontSize: 11 }}>{u.email}</div>
              </td>
              <td className="tly-faint">{u.role}</td>
              <td className="tly-faint">{u.portal}</td>
              <td className="tly-faint">{u.org}</td>
              <td><Badge tone={u.status === 'Active' ? 'success' : 'neutral'}>{u.status}</Badge></td>
              <td className="tly-faint tly-mono" style={{ fontSize: 11 }}>{u.lastLogin}</td>
              <td className="tly-faint tly-mono" style={{ fontSize: 11 }}>{u.validFrom ?? '—'}</td>
              <td className="tly-faint tly-mono" style={{ fontSize: 11 }}>{u.expires ?? '—'}</td>
              <td>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {u.demo && <Button size="sm" variant="ghost">Extend</Button>}
                  <Button size="sm" variant="ghost">Reset</Button>
                  <Button size="sm" variant="ghost">Disable</Button>
                  {u.demo && <Button size="sm" variant="danger">Revoke</Button>}
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <div className="tly-faint" style={{ fontSize: 11, marginTop: 10 }}>
          Temporary/demo lifecycle (create · expiry · revoke · extend · reset) is powered by the Demo Access engine
          (server-side expiry enforcement, bcrypt-hashed passwords, audit). {DEMO_NOTE}
        </div>
      </Card>

      <Card>
        <CardHead title="Permission matrix" sub="Server-side RBAC is authoritative — the client cannot assign privileged roles" />
        <Table head={['Role', ...PERM_COLS.map((p) => p.label)]}>
          {TELCO_ROLE_MATRIX.map((r) => (
            <tr key={r.role}>
              <td style={{ fontWeight: 600 }}>{r.role}</td>
              {PERM_COLS.map((p) => (
                <td key={p.key} style={{ textAlign: 'center' }}>
                  {r.perms[p.key] ? (
                    <span style={{ color: 'var(--tly-success)', fontWeight: 700 }}>✓</span>
                  ) : (
                    <span className="tly-faint">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </Table>
      </Card>

      {showInvite && (
        <Modal
          open
          title="Invite / create user"
          onClose={() => setShowInvite(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button onClick={() => setShowInvite(false)}>Send invite</Button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 2 }}>
            <Field label="Full name"><Input placeholder="Jane Doe" /></Field>
            <Field label="Email"><Input type="email" placeholder="jane@mtn.example" /></Field>
            <Field label="Role">
              <Select options={TELCO_ROLE_MATRIX.map((r) => ({ value: r.role, label: r.role }))} />
            </Field>
            <Field label="Account type">
              <Select options={[{ value: 'permanent', label: 'Permanent' }, { value: 'demo', label: 'Temporary demo (expires)' }]} />
            </Field>
            <div className="tly-faint" style={{ fontSize: 11, marginTop: 4 }}>
              Temporary demo accounts are created through the Demo Access engine with a validity window and server-side
              expiry. Roles are assigned by an authorised administrator only. {DEMO_NOTE}
            </div>
          </div>
        </Modal>
      )}
    </ConsoleShell>
  );
}
