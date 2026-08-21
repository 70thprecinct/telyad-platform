'use client';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { ADMIN_USERS, ADMIN_ROLE_MATRIX, DEMO_NOTE } from '@/lib/demo';

// Permission columns shown in the role matrix (mirrors ADMIN_ROLE_MATRIX perms keys).
const PERM_COLS: { key: string; label: string }[] = [
  { key: 'global', label: 'Global Dashboard' },
  { key: 'telcos', label: 'Telco Directory' },
  { key: 'terms', label: 'Commercial Terms' },
  { key: 'health', label: 'Platform Health' },
  { key: 'users', label: 'Admin Users' },
  { key: 'engines', label: 'Engine Dashboards' },
];

export default function UsersPage() {
  const demoCount = ADMIN_USERS.filter((u) => u.demo).length;

  return (
    <AdminShell active="users">
      <PageHeader
        eyebrow="Platform · access control"
        title="Master Admin Users"
        desc="Tely staff with access to this cross-telco console, and the role permission matrix that governs them. Time-limited demo accounts are managed by the Demo Access engine — server-side expiry, not a client toggle."
      />

      <KpiGrid>
        <Kpi label="Admin users" value={`${ADMIN_USERS.length}`} delta="Tely staff only" />
        <Kpi label="Time-limited demo accounts" value={`${demoCount}`} delta="Auto-expiring" />
        <Kpi label="Roles defined" value={`${ADMIN_ROLE_MATRIX.length}`} delta="RBAC authoritative" />
        <Kpi label="Access model" value="Server-side" delta="Enforced by API" />
      </KpiGrid>

      <Card>
        <CardHead
          title="Admin users"
          sub="Demo accounts are provisioned and expired by the Demo Access engine (server-side lifecycle). Console cannot access any telco environment."
        />
        <Table head={['Name', 'Email', 'Role', 'Visibility', 'Type', 'Valid from', 'Expires', 'Status']}>
          {ADMIN_USERS.map((u) => (
            <tr key={u.email}>
              <td style={{ fontWeight: 600 }}>{u.name}</td>
              <td className="tly-faint">{u.email}</td>
              <td>{u.role}</td>
              <td className="tly-faint">{u.visibility}</td>
              <td>{u.demo ? <Badge tone="warning">Demo · time-limited</Badge> : <Badge tone="neutral">Permanent</Badge>}</td>
              <td className="tly-mono">{u.validFrom ?? '—'}</td>
              <td className="tly-mono">{u.expires ?? '—'}</td>
              <td><Badge tone={u.status === 'Active' ? 'success' : 'neutral'}>{u.status}</Badge></td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card>
        <CardHead title="Role permission matrix" sub="What each role can access. RBAC is enforced server-side by the API — no Telco, Advertiser or TelyDial user can reach this console." />
        <div style={{ overflowX: 'auto' }}>
          <Table head={['Role', ...PERM_COLS.map((c) => c.label)]}>
            {ADMIN_ROLE_MATRIX.map((r) => (
              <tr key={r.role}>
                <td style={{ fontWeight: 600 }}>{r.role}</td>
                {PERM_COLS.map((c) => (
                  <td key={c.key} style={{ textAlign: 'center' }}>
                    {r.perms[c.key] ? <span style={{ color: 'var(--tly-success)' }}>●</span> : <span className="tly-faint">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <div className="tly-faint" style={{ fontSize: 11 }}>
        {DEMO_NOTE} The Demo Access lifecycle engine (create, auto-expire, blank credentials on expiry) is delivered separately; this screen is its console surface.
      </div>
    </AdminShell>
  );
}
