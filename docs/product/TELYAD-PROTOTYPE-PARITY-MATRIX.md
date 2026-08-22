# TelyAd — Prototype Parity Matrix (authoritative)

Reconciled in PARITY-05 from the four approved HTML prototypes
(`tely_advertiser_portal_3`, `Tely_Telco_Operations_Dashboard`,
`Tely_Master_Admin_3_2`, `telydial(1)`) into ONE integrated platform on the
approved **Light Enterprise** UI.

**Coverage: 54/54 primary destinations IMPLEMENTED · 0 PARTIAL · 0 MISSING · 0 dead routes.**
(+ legitimate supporting routes: campaign/detail, marketplace, capability detail,
directory drill-down, Demo Access console, login.)

Data classification — **REAL** (persisted platform/API state) · **DEMO**
(deterministic demonstration data, labelled in-UI) · **EXT** (external
carrier/registry/gateway integration required). Mobile certified at 390×844
(no page-level horizontal overflow). Evidence: `visual-review-final/` +
`e2e/tests/final-integration.spec.ts` (54-route hard gate) + per-portal parity
specs. No subscriber PII / MSISDN anywhere.

---

## Advertiser Portal — PARITY-01 (PR #7) · 12/12

| # | Prototype destination | Route | State | Key functionality & interactions | Data | Mobile | Visual | Known limitation |
|---|---|---|---|---|---|---|---|---|
| 1 | Dashboard | `/dashboard` | IMPLEMENTED | Portfolio KPIs, daily-spend line, channel-mix doughnut, campaigns table, quick actions, alerts | REAL campaigns + DEMO perf | ✓ | High | perf figures demo |
| 2 | Campaigns | `/campaigns` | IMPLEMENTED | List + KPI summary + status/objective filters + row→detail | REAL | ✓ | High | — |
| 3 | Analytics | `/analytics` | IMPLEMENTED | KPI strip, spend line, channel doughnut + table, conversions bar | DEMO | ✓ | High | labelled demo |
| 4 | Audience | `/audience` | IMPLEMENTED | Aggregate overview, eligibility + privacy, saved definitions | REAL match + DEMO | ✓ | High | aggregate only |
| 5 | Segments | `/segments` | IMPLEMENTED | List, create modal, detail, size estimate | DEMO | ✓ | High | persistence deferred |
| 6 | Reach & Verify | `/reach` | IMPLEMENTED | Selected→Eligible→Targeted→Delivered→Verified funnel | DEMO + EXT | ✓ | High | verify=EXT |
| 7 | Channels | `/channels` | IMPLEMENTED | Business view over the 48-capability registry + preview | REAL (48 registry) | ✓ | High | — |
| 8 | Creatives | `/creatives` | IMPLEMENTED | Creative Library, per-row handset preview | DEMO + REAL preview | ✓ | High | — |
| 9 | AI Tools | `/ai` | IMPLEMENTED | AI module suite + working Campaign Copilot / Media Planner | DEMO intelligence | ✓ | High | not production ML |
| 10 | Billing & Budget | `/billing` | IMPLEMENTED | Budget summary, allocations, ledger, invoices | DEMO | ✓ | High | no real payment |
| 11 | Notifications | `/notifications` | IMPLEMENTED | Real API, read/unread, filter | REAL (+demo fallback) | ✓ | High | — |
| 12 | Settings | `/settings` | IMPLEMENTED | Org profile, prefs, defaults, security summary | DEMO | ✓ | High | no secrets exposed |
| + | Campaign wizard | `/campaigns/new` | PRESERVED | 5-step: objective→capabilities→**Audience Match** (eligible≠target)→creative/language→review→submit→MTN approval | REAL + 48-cap | ✓ | High | — |
| + | Marketplace / capability detail | `/marketplace` | IMPLEMENTED | 48/48 capability previews | REAL | ✓ | High | — |

## Telco / Operator Console — PARITY-02 (PR #8) · 23/23

| # | Prototype destination | Route | State | Data | Mobile | Visual |
|---|---|---|---|---|---|---|
| 1 | Executive Overview | `/dashboard` | IMPLEMENTED | REAL + DEMO | ✓ | High |
| 2 | Advertiser Management | `/advertisers` | IMPLEMENTED | REAL | ✓ | High |
| 3 | Campaign Approval | `/approvals` | IMPLEMENTED | REAL | ✓ | High |
| 4 | Campaign Monitoring | `/monitoring` | IMPLEMENTED | DEMO | ✓ | High |
| 5 | Audience Monitoring | `/audience` | IMPLEMENTED | DEMO (no PII) | ✓ | High |
| 6 | Traffic Monitoring | `/traffic` | IMPLEMENTED | DEMO + EXT | ✓ | High |
| 7 | Subscriber Insights | `/subscribers` | IMPLEMENTED | DEMO (aggregate, no PII) | ✓ | High |
| 8 | Messaging Channels | `/channels` | IMPLEMENTED | REAL (48-cap) | ✓ | High |
| 9 | Pricing & Revenue | `/revenue` | IMPLEMENTED | REAL | ✓ | High |
| 10 | Wallet Monitoring | `/wallet` | IMPLEMENTED | DEMO | ✓ | High |
| 11 | Compliance | `/compliance` | IMPLEMENTED | DEMO + EXT | ✓ | High |
| 12 | Consent & DND | `/consent` | IMPLEMENTED | DEMO + EXT | ✓ | High |
| 13 | Content Moderation | `/moderation` | IMPLEMENTED | DEMO | ✓ | High |
| 14 | Governance Approvals | `/governance/approvals` | IMPLEMENTED | REAL | ✓ | High |
| 15 | Reports | `/reports` | IMPLEMENTED | DEMO | ✓ | High |
| 16 | Analytics | `/analytics` | IMPLEMENTED | REAL + DEMO | ✓ | High |
| 17 | Users & Roles | `/users` | IMPLEMENTED | REAL (RBAC) | ✓ | High |
| 18 | Audit Logs | `/audit` | IMPLEMENTED | REAL | ✓ | High |
| 19 | API Monitoring | `/api-monitoring` | IMPLEMENTED | REAL health + DEMO | ✓ | High |
| 20 | Notifications | `/notifications` | IMPLEMENTED | REAL | ✓ | High |
| 21 | Support Centre | `/support` | IMPLEMENTED | DEMO | ✓ | High |
| 22 | Settings | `/settings` | IMPLEMENTED | DEMO | ✓ | High |
| 23 | Platform Health | `/platform-health` | IMPLEMENTED | REAL health + DEMO | ✓ | High |

Cross-telco isolation banner ("viewing MTN Nigeria's isolated environment only"). Approval journey reviews the **immutable Audience Snapshot** the advertiser submitted (eligible / selected target / forecast / cost / capabilities). No subscriber PII.

## Master Admin — PARITY-03 (PR #9) · 10/10

| # | Prototype destination | Route | State | Data | Mobile | Visual |
|---|---|---|---|---|---|---|
| 1 | Global Dashboard | `/dashboard` | IMPLEMENTED | REAL + DEMO | ✓ | High |
| 2 | Telco Directory (+ onboard modal, scoped drill-down, isolation banner, exit) | `/directory` | IMPLEMENTED | DEMO | ✓ | High |
| 3 | Commercial Terms | `/terms` | IMPLEMENTED | REAL + DEMO | ✓ | High |
| 4 | Platform Health (live /health + /ready) | `/platform-health` | IMPLEMENTED | REAL + DEMO + EXT | ✓ | High |
| 5 | Master Admin Users | `/users` | IMPLEMENTED | DEMO | ✓ | High |
| 6 | Engine Overview | `/engines` | IMPLEMENTED | DEMO | ✓ | High |
| 7 | TelySignal | `/engines/telysignal` | IMPLEMENTED | DEMO | ✓ | High |
| 8 | TelyXchange | `/engines/telyxchange` | IMPLEMENTED | DEMO + EXT | ✓ | High |
| 9 | TelyAds | `/engines/telyads` | IMPLEMENTED | DEMO | ✓ | High |
| 10 | TelyReach | `/engines/telyreach` | IMPLEMENTED | DEMO + EXT | ✓ | High |
| + | Demo Access console | `/demo-access` | IMPLEMENTED | REAL (server-side lifecycle) | ✓ | High |

Cross-telco isolation is a hard gate: scoped drill-down shows exactly one telco. TelyAds throughput chart normalises mixed units (M/h vs k/h) — regression-tested.

## TelyDial — PARITY-04 (PR #10) · 9/9

| # | Prototype destination | Route | State | Data | Mobile | Visual |
|---|---|---|---|---|---|---|
| 1 | Dashboard | `/dashboard` | IMPLEMENTED | REAL + DEMO + EXT | ✓ | High |
| 2 | Campaigns | `/campaigns` | IMPLEMENTED | REAL + DEMO | ✓ | High |
| 3 | Create Campaign (hero builder) | `/campaigns/new` | IMPLEMENTED | REAL + DEMO | ✓ | High |
| 4 | Products | `/products` | IMPLEMENTED | DEMO + EXT | ✓ | High |
| 5 | Analytics | `/analytics` | IMPLEMENTED | DEMO + EXT | ✓ | High |
| 6 | Wallet | `/wallet` | IMPLEMENTED | DEMO | ✓ | High |
| 7 | Reports | `/reports` | IMPLEMENTED | DEMO + REAL CSV | ✓ | High |
| 8 | Notifications | `/notifications` | IMPLEMENTED | DEMO | ✓ | High |
| 9 | Support | `/support` | IMPLEMENTED | DEMO | ✓ | High |

Hero builder: product-ID verification (demo registry; unknown IDs rejected), emoji picker, CTA presets, SMS fallback, Android STK + iOS preview (honestly labelled *not native SIM Toolkit*), device switch preserves creative, audience + live estimate, budget + wallet impact, review + submit → telco approval. TelyDial provider account is a `telydial`-portal account (advertiser realm).

---

## Frozen core (never regressed)

Fastify API · PostgreSQL/Prisma · RBAC · tenant isolation · cross-telco isolation ·
campaign lifecycle · MTN approval · 48-capability registry · capability previews ·
Audience Match (eligible / selected target / forecast / frequency / cost) ·
audience-snapshot & capability-plan persistence · AI intelligence · multilingual
architecture · **Demo Access** (portal isolation, server-side expiry/revocation,
hashed passwords, audit) · Light Enterprise UI · CI · Playwright.
