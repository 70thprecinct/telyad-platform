# TelyAd — Prototype Parity Matrix

Source of truth for product breadth: the four approved HTML prototypes
(`tely_advertiser_portal_3`, `Tely_Telco_Operations_Dashboard`,
`Tely_Master_Admin_3_2`, `telydial`). Runtime foundation: the production
Next.js monorepo. This matrix tracks every prototype navigation destination and
significant interaction against its production equivalent.

Status legend: **IMPLEMENTED** · **PARTIAL** · **MISSING** · **PLACEHOLDER**.
Data source: **REAL** (persisted API objects) · **DEMO** (deterministic
demonstration data, labelled in the UI) · **EXT** (external integration
required). Delivery is tracked per work package: PARITY-01 Advertiser,
PARITY-02 Telco, PARITY-03 Master Admin, PARITY-04 TelyDial, PARITY-05 QA.

---

## Advertiser Portal — PARITY-01 (this PR)

| Portal | Prototype feature | Prototype nav | Production equivalent | Status | Gap severity | Target route | Backend/data | Impl. | Visual parity | Tests | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Advertiser | Dashboard | Overview | Enriched dashboard (portfolio KPIs + performance strip + spend/channel charts + campaigns + quick actions + alerts) | IMPLEMENTED | — | `/dashboard` | REAL campaigns + DEMO perf | Done | High | route+e2e | `+ New Campaign` + campaign nav preserved |
| Advertiser | Campaigns | Overview | Campaigns list + KPI summary + status/objective filters + dates/actions | IMPLEMENTED | — | `/campaigns` | REAL | Done | High | route | Maltina journey preserved |
| Advertiser | Analytics | Overview | Analytics centre — KPI strip, spend line, channel doughnut, channel table, conversions bar | IMPLEMENTED | — | `/analytics` | DEMO | Done | High | route | Labelled demonstration analytics |
| Advertiser | Audience | Targeting | Audience centre — aggregate overview, eligibility + privacy, saved definitions | IMPLEMENTED | — | `/audience` | REAL match + DEMO aggregates | Done | High | route | Aggregate only, no PII |
| Advertiser | Segments | Targeting | Segment management — list, create modal, detail, size estimate, status | IMPLEMENTED | — | `/segments` | DEMO | Done | High | route | Persistence deferred (documented) |
| Advertiser | Reach & Verify | Targeting | Selected→Eligible→Targeted→Delivered→Verified funnel + verification status | IMPLEMENTED | — | `/reach` | DEMO + EXT (verify) | Done | High | route | Forecast≠Delivered≠Verified distinguished |
| Advertiser | Channels | Delivery | Business view over the 48-capability registry — families, filters, detail + preview | IMPLEMENTED | — | `/channels` | REAL (48 registry) | Done | High | route | Single source = 48 registry; `/marketplace` retained |
| Advertiser | Creatives | Delivery | Creative Library — list, status, language, per-row handset preview | IMPLEMENTED | — | `/creatives` | DEMO + REAL preview renderer | Done | High | route | Reuses ExperiencePreview (no 2nd preview arch) |
| Advertiser | AI Tools | Delivery | AI module suite + working Campaign Copilot / Media Planner | IMPLEMENTED | — | `/ai` | DEMO intelligence | Done | High | route+e2e | Not production ML; copy honest |
| Advertiser | Billing & Budget | Account | Budget summary, allocations, ledger, invoices, alerts | IMPLEMENTED | — | `/billing` | DEMO | Done | High | route | No real payment processing |
| Advertiser | Notifications | Account | Notifications centre — real API, read/unread, filter | IMPLEMENTED | — | `/notifications` | REAL (demo fallback) | Done | High | route | Wires `/notifications` |
| Advertiser | Settings | Account | Org profile, notification prefs, campaign defaults, security summary | IMPLEMENTED | — | `/settings` | DEMO | Done | High | route | No secrets exposed |
| Advertiser | Campaign wizard | (button) | 5-step wizard: objective → capabilities → audience match → creative/language → review | IMPLEMENTED (preserved) | — | `/campaigns/new` | REAL + 48-cap + Audience Match | Preserved | High | e2e | 48 caps, eligible/target/forecast/cost/plan intact |

**Advertiser parity: 12/12 nav destinations IMPLEMENTED · 0 MISSING · 0 dead routes.**

---

## Telco / Operator Console — PARITY-02 (planned)

| Feature | Prototype nav | Status | Target route | Backend/data |
|---|---|---|---|---|
| Dashboard / Exec Overview | Overview | IMPLEMENTED | `/dashboard` | REAL |
| Advertiser Management | Advertisers & Campaigns | IMPLEMENTED | `/advertisers` | REAL |
| Campaign Approval | Advertisers & Campaigns | IMPLEMENTED | `/approvals` | REAL |
| Campaign Monitoring | Advertisers & Campaigns | MISSING | `/monitoring` | DEMO |
| Audience Monitoring | Audience & Traffic | MISSING | `/audience` | DEMO |
| Traffic Monitoring | Audience & Traffic | MISSING | `/traffic` | DEMO |
| Subscriber Insights | Audience & Traffic | MISSING | `/subscribers` | DEMO (no PII) |
| Messaging Channels | Audience & Traffic | PARTIAL (`/inventory`) | `/channels` | REAL (48-cap) |
| Pricing & Revenue | Finance | IMPLEMENTED | `/revenue` | REAL |
| Wallet Monitoring | Finance | MISSING | `/wallet` | DEMO |
| Compliance | Governance | MISSING | `/compliance` | DEMO |
| Consent & DND | Governance | MISSING | `/consent` | DEMO |
| Content Moderation | Governance | MISSING | `/moderation` | DEMO |
| Approvals (governance) | Governance | PARTIAL | `/governance/approvals` | REAL |
| Reports | Intelligence | MISSING | `/reports` | DEMO |
| Analytics | Intelligence | PARTIAL (`/ai`) | `/analytics` | REAL |
| Users & Roles | Access & System | MISSING on main (built on PR #6) | `/users` | REAL (demo-access) |
| Audit Logs | Access & System | IMPLEMENTED | `/audit` | REAL |
| API Monitoring | Access & System | MISSING | `/api-monitoring` | REAL health + DEMO |
| Notifications | Access & System | MISSING | `/notifications` | REAL |
| Support Centre | Access & System | MISSING | `/support` | DEMO |
| Settings | Access & System | MISSING | `/settings` | DEMO |
| Platform Health | Access & System | MISSING | `/platform-health` | REAL health |

---

## Master Admin — PARITY-03 (planned)

| Feature | Status | Target route | Backend/data |
|---|---|---|---|
| Global Dashboard | IMPLEMENTED | `/dashboard` | REAL |
| Telco Directory (+ onboard modal, enter-console drill-down) | PARTIAL | `/directory` | REAL |
| Commercial Terms | IMPLEMENTED | `/terms` | REAL |
| Platform Health | MISSING | `/platform-health` | REAL health + DEMO |
| Master Admin Users | MISSING | `/users` | REAL access-control |
| Engine Dashboards — TelySignal/TelyXchange/TelyAds/TelyReach | MISSING | `/engines/*` | DEMO ops |

---

## TelyDial — PARITY-04 (planned)

| Feature | Status | Target route | Backend/data |
|---|---|---|---|
| Dashboard | IMPLEMENTED | `/dashboard` | REAL |
| Campaigns | IMPLEMENTED | `/campaigns` | REAL |
| Create campaign (product-ID verify, emoji picker, dual-OS preview, SMS fallback) | PARTIAL | `/campaigns/new` | REAL + 48-cap |
| Products | MISSING | `/products` | DEMO |
| Analytics | MISSING | `/analytics` | DEMO |
| Wallet | MISSING | `/wallet` | DEMO |
| Reports | MISSING | `/reports` | DEMO |
| Notifications | MISSING | `/notifications` | REAL |
| Support | MISSING | `/support` | DEMO |

---

## Frozen (never regressed)

Fastify API · PostgreSQL/Prisma · RBAC · tenant isolation · campaign lifecycle ·
MTN approval · 48-capability registry · capability previews · Audience Match
(eligible / selected target / forecast / frequency / cost) · audience-snapshot &
capability-plan persistence · AI intelligence · multilingual architecture ·
Light Enterprise UI · deployment configuration · CI · Playwright.
