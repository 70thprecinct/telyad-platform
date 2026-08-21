# TelyAd — Prototype Parity Matrix

Source of truth for product breadth: the four approved HTML prototypes. Runtime
foundation: the production Next.js monorepo. Status: **IMPLEMENTED · PARTIAL ·
MISSING · PLACEHOLDER**. Data: **REAL** (persisted API) · **DEMO** (deterministic
demonstration, labelled in-UI) · **EXT** (external integration required).

Delivery: PARITY-01 Advertiser (PR #7) · **PARITY-02 Telco (this PR)** ·
PARITY-03 Master Admin · PARITY-04 TelyDial · PARITY-05 QA.

---

## Advertiser Portal — PARITY-01 (PR #7)

All 12 destinations IMPLEMENTED (Dashboard · Campaigns · Analytics · Audience ·
Segments · Reach & Verify · Channels · Creatives · AI Tools · Billing ·
Notifications · Settings), 0 dead routes. See PR #7 for the full row-level table.

---

## Telco / Operator Console — PARITY-02 (this PR)

| Prototype feature | Nav group | Production route | Status | Data | Notes |
|---|---|---|---|---|---|
| Dashboard / Executive Overview | Overview | `/dashboard` | IMPLEMENTED | REAL + DEMO | Real revenue intelligence + campaigns; enriched with network/channel status, operational alerts, opportunity cards |
| Advertiser Management | Advertisers & Campaigns | `/advertisers` | IMPLEMENTED | REAL | Existing; advertiser directory |
| Campaign Approval | Advertisers & Campaigns | `/approvals` | IMPLEMENTED | REAL | Audience snapshot + capability plan + subscriber preview + approve/reject + audit preserved |
| Campaign Monitoring | Advertisers & Campaigns | `/monitoring` | IMPLEMENTED | DEMO | Delivery progress, spend, anomalies |
| Audience Monitoring | Audience & Traffic | `/audience` | IMPLEMENTED | DEMO | Aggregate; geography/age/device; privacy threshold |
| Traffic Monitoring | Audience & Traffic | `/traffic` | IMPLEMENTED | DEMO + EXT | Request/delivery time-series + per-channel; live carrier throughput = EXT |
| Subscriber Insights | Audience & Traffic | `/subscribers` | IMPLEMENTED | DEMO | Aggregate only — no MSISDN, no lookup |
| Messaging Channels | Audience & Traffic | `/channels` | IMPLEMENTED | REAL (48 registry) + DEMO util | Operator governance over the same 48-capability registry (single source) |
| Pricing & Revenue | Finance | `/revenue` | IMPLEMENTED | REAL | Existing Revenue & Commercials; RBAC-gated |
| Wallet Monitoring | Finance | `/wallet` | IMPLEMENTED | DEMO | Balances, exposure, low-balance alerts; no payment processing |
| Compliance | Governance | `/compliance` | IMPLEMENTED | DEMO + EXT | Score/risk/DND/consent/flags; live NCC/ARCON = EXT |
| Consent & DND | Governance | `/consent` | IMPLEMENTED | DEMO + EXT | Aggregate suppression; DND registry sync = EXT; no PII |
| Content Moderation | Governance | `/moderation` | IMPLEMENTED | DEMO | Creative queue, approve/reject with reason |
| Approvals (governance) | Governance | `/governance/approvals` | IMPLEMENTED | DEMO | Maker/checker governance — distinct from campaign approval |
| Reports | Intelligence | `/reports` | IMPLEMENTED | DEMO | Report catalogue; no fabricated generated files |
| Analytics | Intelligence | `/analytics` | IMPLEMENTED | DEMO | Trends/charts — separate from AI Intelligence |
| Users & Roles | Access & System | `/users` | IMPLEMENTED | REAL engine (PR #6) + DEMO surface | Console surface for the Demo Access engine (not rebuilt); permission matrix; RBAC authoritative |
| Audit Logs | Access & System | `/audit` | IMPLEMENTED | REAL | Existing audit trail |
| API Monitoring | Access & System | `/api-monitoring` | IMPLEMENTED | REAL health + DEMO | Live /health + /ready; demo endpoint telemetry |
| Notifications | Access & System | `/notifications` | IMPLEMENTED | REAL (demo fallback) | Wires /notifications |
| Support Centre | Access & System | `/support` | IMPLEMENTED | DEMO | Tickets, FAQ, escalation shell — no live backend |
| Settings | Access & System | `/settings` | IMPLEMENTED | DEMO | Workspace/approval/governance prefs; no secrets |
| Platform Health | Access & System | `/platform-health` | IMPLEMENTED | REAL health + EXT + DEMO | Live API/DB via /health,/ready; gateways = EXT; history = DEMO |

**Telco parity: 23/23 destinations IMPLEMENTED · 0 MISSING · 0 dead routes.**
(`/inventory` and `/ai` remain reachable; superseded in nav by Messaging Channels
and Analytics respectively — no feature lost.)

Demo Access integration: `/users` is the operator console **surface** for the Demo
Access engine on `feature/demo-access-control` (PR #6) — reused, not rebuilt. The
live create/expiry/revoke/extend/reset lifecycle + server-side enforcement land
when PR #6 merges.

48-capability registry: `/channels` is the operator governance view over the
**existing** registry (`listCapabilities`) — no parallel channel catalogue.

---

## Master Admin — PARITY-03 (planned) · TelyDial — PARITY-04 (planned)

See PARITY-01 audit for the destination-level plan.

---

## Frozen (never regressed)

Fastify API · Prisma/Postgres · RBAC · tenant isolation · campaign lifecycle ·
MTN approval · 48-capability registry + previews · Audience Match · snapshot &
capability-plan persistence · AI intelligence · multilingual · demo-access logic ·
Light Enterprise UI · deployment · CI.
