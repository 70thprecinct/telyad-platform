'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CAPABILITY_FAMILY_LABELS,
  CAPABILITY_STATUSES,
  CAPABILITY_STATUS_LABELS,
  type CapabilityStatus,
  type DeviceClass,
} from '@telyad/types';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Table,
  useToast,
} from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { CapabilityStatusBadge } from '@/components/commercial';
import { useAuth } from '@/lib/auth';
import { api, ApiError, type InventoryItem } from '@/lib/api';

const DEVICE_LABELS: Record<DeviceClass, string> = {
  smartphone: 'Smartphone',
  feature_phone: 'Feature phone',
  both: 'All devices',
};

export default function InventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = !!user?.permissions.includes('inventory:manage');

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CapabilityStatus>('ALL');
  const [search, setSearch] = useState('');

  const [active, setActive] = useState<InventoryItem | null>(null);
  const [draftStatus, setDraftStatus] = useState<CapabilityStatus>('LIVE');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setState('loading');
    api
      .inventory()
      .then((r) => {
        setItems(r.items);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);
  useEffect(refresh, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (statusFilter !== 'ALL' && it.effectiveStatus !== statusFilter) return false;
      if (!q) return true;
      const c = it.capability;
      return (
        c.name.toLowerCase().includes(q) ||
        CAPABILITY_FAMILY_LABELS[c.family].toLowerCase().includes(q) ||
        c.placement.toLowerCase().includes(q)
      );
    });
  }, [items, statusFilter, search]);

  function openManage(it: InventoryItem) {
    setActive(it);
    setDraftStatus(it.effectiveStatus);
  }

  async function save() {
    if (!active) return;
    setBusy(true);
    try {
      await api.setCapabilityStatus(active.capability.id, draftStatus);
      toast(
        'Capability updated',
        `${active.capability.name} → ${CAPABILITY_STATUS_LABELS[draftStatus]}. Audit event recorded.`,
        'success',
      );
      setActive(null);
      refresh();
    } catch (e) {
      toast('Update failed', e instanceof ApiError ? e.message : 'Unexpected error', 'danger');
    } finally {
      setBusy(false);
    }
  }

  const statusOptions = [
    { value: 'ALL', label: 'All statuses' },
    ...CAPABILITY_STATUSES.map((s) => ({ value: s, label: CAPABILITY_STATUS_LABELS[s] })),
  ];

  return (
    <ConsoleShell active="inventory">
      <PageHeader
        eyebrow="Commercial & Inventory"
        title="Inventory & Ad Formats"
        desc="The full carrier-advertising capability portfolio and its availability on MTN Nigeria. Availability and delivery are subject to participating network capabilities, technical integration, regulatory requirements and network approval."
      />

      {!canManage && (
        <Card>
          <div className="tly-faint" style={{ fontSize: 12.5 }} data-testid="inventory-readonly-note">
            Read-only — requires inventory management permission. Statuses below reflect the current
            network configuration and cannot be changed from this account.
          </div>
        </Card>
      )}

      <Card>
        <CardHead
          title={state === 'ready' ? `${items.length} capabilities` : 'Capability portfolio'}
          sub="Placement · creative · trigger · mechanic · journey across the full portfolio"
          action={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ width: 240 }}>
                <Input
                  placeholder="Search capability, family, placement…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="inventory-search"
                />
              </div>
              <div style={{ width: 220 }}>
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'ALL' | CapabilityStatus)}
                  data-testid="inventory-status-filter"
                />
              </div>
            </div>
          }
        />

        {state === 'loading' ? (
          <div className="tly-faint" data-testid="inventory-loading">
            Loading capability inventory…
          </div>
        ) : state === 'error' ? (
          <div className="tly-empty" data-testid="inventory-error">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t load inventory</div>
            <div style={{ fontSize: 12.5, marginBottom: 12 }}>The API may be unavailable.</div>
            <Button variant="ghost" onClick={refresh}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tly-empty">No capabilities match your filters.</div>
        ) : (
          <div data-testid="inventory-table">
            <Table
              head={[
                '#',
                'Capability',
                'Family',
                'Device',
                'Pricing',
                'Network status',
                canManage ? 'Manage' : '',
              ]}
            >
              {filtered.map((it) => {
                const c = it.capability;
                return (
                  <tr key={c.id}>
                    <td className="tly-mono tly-faint">{c.number}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div className="tly-faint" style={{ fontSize: 11 }}>
                        {c.placement.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="tly-faint">{CAPABILITY_FAMILY_LABELS[c.family]}</td>
                    <td className="tly-faint">{DEVICE_LABELS[c.deviceClass]}</td>
                    <td className="tly-mono tly-faint">{c.pricingModels.join(' / ')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <CapabilityStatusBadge status={it.effectiveStatus} />
                        {it.isOverridden && <Badge tone="info">Overridden</Badge>}
                      </div>
                    </td>
                    <td>
                      {canManage ? (
                        <Button size="sm" variant="ghost" data-testid="manage-capability" onClick={() => openManage(it)}>
                          Manage
                        </Button>
                      ) : (
                        <span className="tly-faint" style={{ fontSize: 11 }}>
                          Read-only
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </Table>
          </div>
        )}
      </Card>

      <Modal
        open={!!active}
        title="Manage network availability"
        onClose={() => setActive(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy} data-testid="save-capability-status">
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        {active && (
          <>
            <p className="tly-dim" style={{ fontSize: 12.5, marginBottom: 4 }}>
              {active.capability.name} — {CAPABILITY_FAMILY_LABELS[active.capability.family]}
            </p>
            <p className="tly-faint" style={{ fontSize: 11.5, marginBottom: 12 }}>
              Setting the network status changes what advertisers can plan and go live with on MTN
              Nigeria. Only LIVE and PILOT are presented as live. Your change is recorded as an audit
              event.
            </p>
            <Field label="Network status">
              <Select
                options={CAPABILITY_STATUSES.map((s) => ({ value: s, label: CAPABILITY_STATUS_LABELS[s] }))}
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value as CapabilityStatus)}
                data-testid="capability-status-select"
              />
            </Field>
          </>
        )}
      </Modal>
    </ConsoleShell>
  );
}
