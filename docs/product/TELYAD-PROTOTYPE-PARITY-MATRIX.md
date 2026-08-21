# TelyAd — Prototype Parity Matrix

Traceability from the four approved HTML prototypes
(`/Users/osaumweni/Desktop/TELY AD PLATFORMS HTML/`) to the production Next.js
apps, rebuilt on the approved **Light Enterprise** design system.

Each portal is delivered as its own parity work package, its own branch, and its
own PR — independently mergeable. Data-honesty policy: every surface is labelled
**REAL** (persisted platform/API data), **DEMO** (deterministic demonstration
data — never presented as production), or **EXT** (external carrier/infra
integration required). No subscriber PII / MSISDN / individual lookup anywhere.

| Prototype | Portal | WP | Branch | PR | Status |
|---|---|---|---|---|---|
| `tely_advertiser_portal_3.html` | Advertiser Portal | PARITY-01 | `feature/parity-advertiser` | #7 | ✅ Delivered |
| `Tely_Telco_Operations_Dashboard.html` | Telco Console | PARITY-02 | `feature/parity-telco` | #8 | ✅ Delivered |
| `Tely_Master_Admin_3_2.html` | Master Admin | PARITY-03 | `feature/parity-admin` | this PR | ✅ Delivered |
| `telydial.html` | TelyDial | PARITY-04 | — | — | ⏳ Not started |

---

## PARITY-03 — Master Admin (`apps/platform-admin`)

The Tely-owned cross-telco control plane. **Aggregate only** — no subscriber-level
data ever appears here. Cross-telco isolation is a **hard gate**: global pages
aggregate only; the scoped drill-down shows exactly one telco; RBAC is enforced
server-side; no Telco / Advertiser / TelyDial user can reach these routes.

| # | Prototype destination | Route | Page | Classification | Parity notes |
|---|---|---|---|---|---|
| 1 | Global Dashboard (`renderGlobal`) | `/dashboard` | `dashboard/page.tsx` | REAL + DEMO | Telco list & status REAL (`/telcos`); reach/revenue/advertisers DEMO. KPIs, revenue-by-telco bar (`g1`), platform-growth line (`g2`), Active Telco Summary table. |
| 2 | Telco Directory (`renderDirectory`) | `/directory` | `directory/page.tsx` | DEMO | Telco cards + status filter. **Onboard modal** (`openOnboard`) creates an environment record (EXT to provision). **Scoped drill-down** (`enterTelco`) → isolation banner "Viewing [TELCO] scoped environment" + settlement summary + **Exit to global view** (`exitTelco`). |
| 3 | Commercial Terms (`renderTerms`) | `/terms` | `terms/page.tsx` | REAL + DEMO | Share %/status REAL; settlement cadence, contract, effective date DEMO. Revenue-share model explainer + KPI strip. |
| 4 | Platform Health (`renderHealth`) | `/platform-health` | `platform-health/page.tsx` | REAL + DEMO + EXT | **Live** `/health` + `/ready` probes (REAL); per-app & per-telco environment health (DEMO); carrier gateways (EXT). Infra-load 24h line (`h1`). |
| 5 | Master Admin Users (`renderAdmin`) | `/users` | `users/page.tsx` | DEMO | Admin users table with time-limited **Demo Access** accounts (server-side lifecycle, not a client toggle — reuses PR #6 engine) + **role permission matrix** (6 permission columns × 5 roles). |
| 6 | Engine Dashboards (`renderEngineering`) | `/engines` | `engines/page.tsx` | DEMO | Overview cards for all four engines (scope = all telco environments), status + volume, drill into each. |
| 7 | — TelySignal | `/engines/telysignal` | `engines/telysignal/page.tsx` | DEMO | Carrier audience intelligence. Pseudonymisation gateway (no raw MSISDN downstream), ingestion-load 24h line, segment generation. |
| 8 | — TelyXchange | `/engines/telyxchange` | `engines/telyxchange/page.tsx` | DEMO + EXT | Programmatic exchange; RTB decisioning seam. Demand/inventory/pricing mix. |
| 9 | — TelyAds | `/engines/telyads` | `engines/telyads/page.tsx` | DEMO | Multi-channel execution mapped to the **48-capability registry**; throughput-by-channel bar. |
| 10 | — TelyReach | `/engines/telyreach` | `engines/telyreach/page.tsx` | DEMO + EXT | Reach/attribution/verification funnel; external postback attribution. |

**Navigation (recovered):** Global → Global Dashboard · Partnerships → Telco
Directory, Commercial Terms · Platform → Platform Health, Master Admin Users ·
Engineering → Engine Dashboards. All 10 destinations are real, populated routes —
no dead navigation, no "coming soon".

**Preserved platform capabilities (hard freeze, no regression):** Fastify API,
Prisma/Postgres, RBAC, tenant isolation, cross-telco privacy boundaries, Demo
Access engine (PR #6), audit, Light Enterprise UI, 48-capability registry,
campaign/operator/advertiser workflows, Audience Match, AI intelligence,
multilingual.

**Verification:** `pnpm --filter @telyad/platform-admin typecheck | lint | build`
all green (13 static routes). Playwright `admin-parity.spec.ts` (5 tests:
unauthenticated-redirect access control, 10-destination nav sweep with no-PII /
no-dead-route assertions, scoped drill-down + exit, onboard modal, users + role
matrix) — all green. Full e2e suite (19 tests incl. preserved Maltina demo
journey) green. Visual evidence in `visual-review-parity/admin/`.
