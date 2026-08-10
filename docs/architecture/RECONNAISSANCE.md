# TelyAd — Phase A Reconnaissance

> Source of truth: the four approved HTML prototypes in [`/reference`](../../reference). This
> document is a faithful inventory of what they contain. It is **not** a redesign. Where the
> prototypes are ambiguous or internally inconsistent, this is recorded under _Technical
> interpretation required_ so the port makes a deliberate, documented choice.

## 1. The four experiences

| App | Prototype | `<title>` | Brand accent | Theme | Scope |
| --- | --- | --- | --- | --- | --- |
| Advertiser Portal | `advertiser-prototype.html` | "Tely Ads Manager — MTN Nigeria" | Orange `#FF6A3D` | Dark `#0B0E14` | Advertiser, targeting one telco |
| MTN / Telco Operations | `telco-operations-prototype.html` | "Tely Telco Operations — MTN Nigeria" | MTN Yellow `#FFCC08` | Dark `#070C12` + light toggle | Single telco (MTN NG) |
| Tely Master Admin | `platform-admin-prototype.html` | "Tely Master Admin — Cross-Telco" | Cyan `#22D3EE` / Indigo `#818CF8` | Dark `#06090F` | Cross-telco (Tely staff) |
| TelyDial | `telydial-prototype.html` | "TelyDial" | Violet `#4a3aa7` | **Light** `#f1f0ea` | MVAS acquisition module |

Shared fonts across the first three: **Space Grotesk** (display), **Inter** (body), **JetBrains
Mono** (mono). TelyDial uses `-apple-system` / Inter, no Space Grotesk. → The shared UI package is
**themeable via CSS custom properties**; each app supplies a theme layer for accent, background,
radius and font family. Components are shared; tokens are per-app.

## 2. Screen & navigation inventory

### Advertiser Portal (SPA `nav(page)`)

`dashboard, campaigns, analytics, audience, segments, reach, channels, creatives, ai, billing,
notifications, settings`. Sidebar groups: **Overview** (Dashboard, Campaigns, Analytics),
**Targeting** (Audience, Segments, Reach & Verify), **Delivery** (Channels, Creatives, AI Tools),
**Account** (Billing & Budget, Notifications, Settings). Plus the **Campaign Wizard** overlay
(5 steps). `segments/reach/creatives/settings` are placeholder "coming soon" panes in the prototype.

Campaign Wizard steps: **1 Channel** (stk/sms/obd/wap/ussd cards) → **2 Creative** (channel-specific
fields + live phone preview) → **3 Audience** (geo chips, age, gender, device, tier, interests,
reach slider, exclusions) → **4 Budget & Schedule** (pricing model CPM/CPC/CPA/CPL, daily/total
budget, dates, delivery hours, frequency cap, speed) → **5 Review & Launch** (summary + STK
compliance check + submit).

### MTN Telco Operations (SPA `renderPage(id)`, 23 pages)

Groups: **Overview** (Dashboard) · **Advertisers & Campaigns** (Advertiser Management, Campaign
Approval, Campaign Monitoring) · **Audience & Traffic** (Audience Monitoring, Traffic Monitoring,
Subscriber Insights, Messaging Channels) · **Finance** (Pricing & Revenue, Wallet Monitoring) ·
**Governance** (Compliance, Consent & DND, Content Moderation, Approvals) · **Intelligence**
(Reports, Analytics) · **Access & System** (Users & Roles, Audit Logs, API Monitoring,
Notifications, Support Centre, Settings, Platform Health).

**Campaign Approval** is the demo-critical screen. Per pending campaign an operator sees: advertiser,
industry, objective, format/type, budget, estimated reach, schedule, compliance score, risk score,
channel creative previews (SMS/WhatsApp/Push/USSD), creative body. Actions: Approve, Reject, Request
Changes, Escalate, plus Bulk Approve/Reject. **The prototype's demo queue already contains
"Highlander Test Drive" by Toyota Nigeria** — this is the Wednesday demo campaign.

### Tely Master Admin (SPA `renderPage(id)`)

Groups: **Global** (Global Dashboard) · **Partnerships** (Telco Directory, Commercial Terms) ·
**Platform** (Platform Health, Master Admin Users) · **Engineering** (Engine Dashboards). Includes
an "Enter telco console view" that scopes to a single telco read-only, and an "Onboard new telco"
modal that provisions an isolated environment. No individual subscriber data anywhere — aggregates
only.

### TelyDial (SPA `showPage(id)`)

Flat nav: `dashboard, campaigns, create, products, analytics, wallet, reports, notifications,
support`. `create` is a 5-step wizard: **Product** (verify MTN Product ID) → **Creative** (STK push
builder + Android STK / iOS SIM-Application handset previews + SMS fallback) → **Audience**
(category, ARPU band, network type, language, location) → **Budget** (CPA/CPM model, budget,
frequency cap) → **Review**. Shares the advertiser "ads manager" grammar; specialised for MVAS
acquisition (product verification, STK creative, CPA/CPM, delivery funnel).

## 3. Reusable UI patterns (→ `packages/ui`)

Across the prototypes these recur and become shared components: **AppShell** (sidebar + topbar +
content), **Sidebar** (grouped nav, brand mark, footer health), **Topbar** (title, search, user
chip, actions), **Card** / **card-head/title/sub**, **MetricCard/KPI** (`kpi(label,val,delta,dir)`),
**Button** (primary/ghost/danger/sm/block), **Badge** & **StatusBadge** (success/warning/danger/
info/neutral + colored dot), **Table**, **Tabs / chip-row / pill filters**, **Modal/Overlay**,
**Drawer**, form **Input/Select/Textarea**, **Toggle**, **range/MoneyInput**, **PhonePreview**
(STK dialog, iOS SIM alert, SMS bubble, OBD dialer, WAP banner, USSD screen), **ChartContainer**
(Chart.js), **Toast**, **EmptyState**, **PageHeader** (eyebrow/h1/desc), **Progress bars**,
**config-row + Toggle**.

## 4. Domain concepts (→ `packages/types`, Prisma schema)

- **Telco** `{ id, name, country, status(Active|Pipeline|Prospect), revenueShareToTelco, ... }` — MTN
  Nigeria is the one Active tenant.
- **Advertiser** `{ name, industry, status, risk, wallet, campaigns, revenue, since, manager }`.
- **Campaign** (telco view) `{ name, advertiser, industry, objective, type/format, budget, status,
  reach, compScore, riskScore, start, end }`; (advertiser view adds) `{ channel, impressions,
  conversions, spend, pricingModel }`.
- **AdvertisingFormat**: `stk, sms, obd, wap, ussd` — each with delivery mechanism, pricing models,
  verify method, creative schema, stats. Extensible registry (spec: ~19 more to come).
- **AudienceDefinition** (geo, age, gender, device, tier, interests, exclusions / ARPU, network,
  language, location) → **AudienceEstimate** (aggregate reach only — never identities).
- **Budget** `{ pricingModel(CPM|CPC|CPA|CPL), dailyMinor, totalMinor, startDate, endDate, ... }`.
- **PricingModel**: CPM, CPC, CPA, CPL (TelyDial: CPA, CPM).
- **CampaignApproval** `{ campaignId, decision, approver, comments, timestamp }`.
- **AuditEvent** `{ user, role, action, old, new, target, ip, browser, ts }` — canonical shape from
  the telco `AUDIT_LOG`.
- **Wallet / LedgerEntry / Invoice**, **ComplianceCheck**, **Notification**, **User / Role /
  Permission** (RBAC matrix `permsFor(role)` in the telco prototype).

## 5. Campaign lifecycle (→ `packages/campaign-engine`)

The prototypes imply, but do not enforce: `Draft → (submit) → Pending Approval → Active | Rejected`,
with `Paused ⇄ Active`, `Scheduled`, `Completed/Ended`. The spec mandates the full canonical set:
`DRAFT, READY_FOR_REVIEW, SUBMITTED, PENDING_TELCO_APPROVAL, APPROVED, REJECTED, SCHEDULED, LIVE,
PAUSED, COMPLETED, CANCELLED`, with transitions **centrally controlled** (a state machine, not
scattered UI mutations).

## 6. Multi-tenancy & privacy findings

- The telco console is **hard-scoped to MTN Nigeria** (title, login, persistent isolation banner,
  `@mtn.com.ng` users, settings `Network = MTN Nigeria`). → becomes a `telcoId` tenant context, not
  hardcoded strings. Server-side tenant boundaries, not frontend filtering.
- Master Admin explicitly **never shows subscriber PII**; advertiser sees only aggregate reach
  ("Estimated eligible audience: 2.8M"), never MSISDN/identity. → enforced in DTOs + API.
- Settlement model: advertiser spend split telco/Tely per negotiated share (MTN example: 80% telco /
  20% Tely).

## 7. Technical interpretation required (prototype gaps)

These are the deliberate decisions the port makes because the prototypes leave them unimplemented:

1. **Approvals/submits don't persist.** All three consoles use `alert()`/toast + local splice; no
   approver, timestamp, comment, or audit write. → The port implements real persistence and a
   centrally-controlled state machine. This is the core Wednesday deliverable.
2. **Estimates are static strings.** Reach sliders, TelySignal scores, projections, compliance
   counts are hardcoded. → The port computes a **deterministic seeded** audience estimate from the
   audience definition (demo-safe, reproducible), not `Math.random()`.
3. **No form-state model in the wizard.** Inputs lack `name`/`id`; Review shows hardcoded values. →
   The port defines a typed campaign draft schema and binds Review to live state.
4. **Status taxonomy mismatch** (Completed vs Ended; Pending vs Pending Approval; transaction status
   reusing campaign pill). → One canonical `CampaignStatus` enum; transaction status separated.
5. **RBAC is display-only** in the prototype. → The port enforces permissions server-side.
6. **Client-only auth** (login just hides a div). → Real JWT auth abstraction, seeded demo users,
   no committed credentials.
7. **Comment capture missing** on the approval screen despite the history table having a Comments
   column. → The port adds a decision-comment input; it is recorded on the approval + audit event.
8. **Ephemeral `Math.random()` demo data.** → Replaced by a seeded `@telyad/demo-data` package so
   the demo is stable and reproducible for MTN executives.
9. **TelyDial CPM rows still carry CPA values; no rate model.** → Pricing modeled explicitly per
   format; CPA/CPM kept distinct.
10. **Placeholder pages** (advertiser segments/reach/creatives/settings). → Ported as real routes;
    non-functional-in-prototype areas are labelled and scoped, never faked as complete.

## 8. Out of scope for this work package (per spec §24)

Real MTN APIs, subscriber ingestion, DND/SMS/STK gateways, charging/billing switches, carrier
mediation, programmatic exchanges, settlement infra, production telecom reporting, and the remaining
~19 ad formats. The architecture provides **adapter interfaces** so these connect later without
rewriting the campaign engine.
