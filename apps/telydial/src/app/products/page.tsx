'use client';
import { useMemo, useState } from 'react';
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
import { PortalShell } from '@/components/PortalShell';
import {
  DEMO_CAMPAIGNS,
  DEMO_NOTE,
  EXT_NOTE,
  PRODUCTS,
  verifyProductId,
  type DemoProduct,
} from '@/lib/demo';

const KNOWN_IDS = 'MTN-89012, MTN-45678, MTN-23456, MTN-34567, MTN-12345';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  // Verify-new-product modal state
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<
    { kind: 'ok'; product: DemoProduct } | { kind: 'miss'; id: string } | null
  >(null);

  // Detail modal state
  const [detail, setDetail] = useState<DemoProduct | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchesStatus = status === 'All' || p.status === status;
      const matchesSearch =
        q === '' ||
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [search, status]);

  function runVerify() {
    const raw = verifyInput.trim();
    if (raw === '') {
      setVerifyResult(null);
      return;
    }
    const product = verifyProductId(raw);
    if (product) setVerifyResult({ kind: 'ok', product });
    else setVerifyResult({ kind: 'miss', id: raw });
  }

  function closeVerify() {
    setVerifyOpen(false);
    setVerifyInput('');
    setVerifyResult(null);
  }

  const detailCampaigns = detail
    ? DEMO_CAMPAIGNS.filter((c) => c.product === detail.name)
    : [];
  const detailAcq = detailCampaigns.reduce((s, c) => s + c.optins, 0);

  return (
    <PortalShell active="products">
      <PageHeader
        eyebrow="Product centre"
        title="Products"
        desc="MTN VAS products you can acquire subscribers for. Product details come from the MTN registry (demonstration seam)."
      />

      <Card>
        <CardHead
          title={`${rows.length} product${rows.length === 1 ? '' : 's'}`}
          action={
            <Button
              size="sm"
              data-testid="verify-product"
              onClick={() => setVerifyOpen(true)}
            >
              ＋ Verify new product
            </Button>
          }
        />

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          <div style={{ flex: '1 1 220px', minWidth: 180 }}>
            <Input
              data-testid="product-search"
              placeholder="Search by product ID, name or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ width: 180 }}>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'All', label: 'All statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Suspended', label: 'Suspended' },
              ]}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table
            head={[
              'Product ID',
              'Service name',
              'Type',
              'Network',
              'Tariff',
              'Billing',
              'Status',
              'Verification',
              'Campaigns',
              'Acquisition',
              'Created',
            ]}
          >
            {rows.map((p) => (
              <tr
                key={p.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setDetail(p)}
              >
                <td className="tly-mono">{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.type}</td>
                <td>{p.network}</td>
                <td>{p.tariff}</td>
                <td>{p.billing}</td>
                <td>
                  <Badge tone={p.status === 'Active' ? 'success' : 'danger'}>
                    {p.status}
                  </Badge>
                </td>
                <td>
                  <Badge tone="success">Verified</Badge>
                </td>
                <td className="tly-mono">{p.campaigns}</td>
                <td className="tly-mono">{p.acquisition.toLocaleString()}</td>
                <td className="tly-faint">{p.created}</td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="tly-faint" style={{ fontSize: 11, marginTop: 14 }}>
          {DEMO_NOTE} {EXT_NOTE}
        </div>
      </Card>

      {/* ── Verify new product modal ─────────────────────────────────────── */}
      <Modal
        open={verifyOpen}
        title="Verify MTN product"
        onClose={closeVerify}
        footer={
          <Button variant="ghost" onClick={closeVerify}>
            Close
          </Button>
        }
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 220px' }}>
            <Field label="MTN Product ID">
              <Input
                data-testid="verify-input"
                placeholder="e.g. MTN-89012"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runVerify();
                }}
              />
            </Field>
          </div>
          <div style={{ marginBottom: 2 }}>
            <Button data-testid="verify-submit" onClick={runVerify}>
              Verify
            </Button>
          </div>
        </div>

        {verifyResult?.kind === 'ok' && (
          <div
            style={{
              marginTop: 14,
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid var(--tly-success)',
              background: 'color-mix(in srgb, var(--tly-success) 10%, transparent)',
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: 'var(--tly-success)',
                marginBottom: 8,
              }}
            >
              ✓ Product verified
            </div>
            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '4px 16px',
                margin: 0,
                fontSize: 12.5,
              }}
            >
              <dt className="tly-faint">Product name</dt>
              <dd style={{ margin: 0, fontWeight: 600 }}>
                {verifyResult.product.name}
              </dd>
              <dt className="tly-faint">Category</dt>
              <dd style={{ margin: 0 }}>{verifyResult.product.category}</dd>
              <dt className="tly-faint">Subscription type</dt>
              <dd style={{ margin: 0 }}>{verifyResult.product.type}</dd>
              <dt className="tly-faint">Network</dt>
              <dd style={{ margin: 0 }}>{verifyResult.product.network}</dd>
              <dt className="tly-faint">Tariff</dt>
              <dd style={{ margin: 0 }}>{verifyResult.product.tariff}</dd>
              <dt className="tly-faint">Billing model</dt>
              <dd style={{ margin: 0 }}>{verifyResult.product.billing}</dd>
              <dt className="tly-faint">Provider</dt>
              <dd style={{ margin: 0 }}>{verifyResult.product.provider}</dd>
              <dt className="tly-faint">Status</dt>
              <dd style={{ margin: 0 }}>
                <Badge
                  tone={
                    verifyResult.product.status === 'Active'
                      ? 'success'
                      : 'danger'
                  }
                >
                  {verifyResult.product.status}
                </Badge>
              </dd>
              <dt className="tly-faint">Product ID</dt>
              <dd className="tly-mono" style={{ margin: 0 }}>
                {verifyResult.product.id}
              </dd>
            </dl>
          </div>
        )}

        {verifyResult?.kind === 'miss' && (
          <div
            style={{
              marginTop: 14,
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid var(--tly-danger)',
              background: 'color-mix(in srgb, var(--tly-danger) 10%, transparent)',
              color: 'var(--tly-danger)',
              fontSize: 12.5,
              lineHeight: 1.55,
            }}
          >
            <div style={{ fontWeight: 600 }}>Product not found</div>
            <div>
              This Product ID is not registered. Live lookup requires MTN
              registry integration.
            </div>
          </div>
        )}

        <div
          className="tly-faint"
          style={{ fontSize: 11.5, marginTop: 14, lineHeight: 1.6 }}
        >
          Known demo IDs: {KNOWN_IDS}.
          <br />
          Live registry lookup is EXTERNAL INTEGRATION REQUIRED (MTN product
          registry).
        </div>
      </Modal>

      {/* ── Product detail modal ─────────────────────────────────────────── */}
      <Modal
        open={detail !== null}
        title={detail ? detail.name : 'Product'}
        onClose={() => setDetail(null)}
        footer={
          <Button variant="ghost" onClick={() => setDetail(null)}>
            Close
          </Button>
        }
      >
        {detail && (
          <div data-testid="product-detail">
            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '4px 16px',
                margin: '0 0 16px',
                fontSize: 12.5,
              }}
            >
              <dt className="tly-faint">Product ID</dt>
              <dd className="tly-mono" style={{ margin: 0 }}>
                {detail.id}
              </dd>
              <dt className="tly-faint">Category</dt>
              <dd style={{ margin: 0 }}>{detail.category}</dd>
              <dt className="tly-faint">Type</dt>
              <dd style={{ margin: 0 }}>{detail.type}</dd>
              <dt className="tly-faint">Network</dt>
              <dd style={{ margin: 0 }}>{detail.network}</dd>
              <dt className="tly-faint">Tariff</dt>
              <dd style={{ margin: 0 }}>{detail.tariff}</dd>
              <dt className="tly-faint">Billing</dt>
              <dd style={{ margin: 0 }}>{detail.billing}</dd>
              <dt className="tly-faint">Provider</dt>
              <dd style={{ margin: 0 }}>{detail.provider}</dd>
              <dt className="tly-faint">Status</dt>
              <dd style={{ margin: 0 }}>
                <Badge tone={detail.status === 'Active' ? 'success' : 'danger'}>
                  {detail.status}
                </Badge>
              </dd>
              <dt className="tly-faint">Created</dt>
              <dd style={{ margin: 0 }}>{detail.created}</dd>
            </dl>

            <KpiGrid>
              <Kpi label="Campaigns" value={detail.campaigns} delta="Demo" />
              <Kpi
                label="Total acquisition"
                value={detail.acquisition.toLocaleString()}
                delta="Demo"
              />
            </KpiGrid>

            <div style={{ marginTop: 16 }}>
              <CardHead title="Campaign history" sub="Demonstration data" />
              <div style={{ overflowX: 'auto' }}>
                <Table head={['Campaign', 'Status', 'Model', 'Opt-ins', 'CPA']}>
                  {detailCampaigns.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>{c.status}</td>
                      <td>
                        <Badge tone={c.pricing === 'CPA' ? 'info' : 'neutral'}>
                          {c.pricing}
                        </Badge>
                      </td>
                      <td className="tly-mono">{c.optins.toLocaleString()}</td>
                      <td className="tly-mono">₦{c.cpa}</td>
                    </tr>
                  ))}
                  {detailCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="tly-faint">
                        No campaigns yet for this product.
                      </td>
                    </tr>
                  )}
                </Table>
              </div>
              {detailCampaigns.length > 0 && (
                <div
                  className="tly-faint"
                  style={{ fontSize: 11, marginTop: 8 }}
                >
                  {detailCampaigns.length} campaign
                  {detailCampaigns.length === 1 ? '' : 's'} ·{' '}
                  {detailAcq.toLocaleString()} opt-ins (demonstration).
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PortalShell>
  );
}
