# TelyAd — Prototype Parity Matrix

Traceability from the four approved HTML prototypes to the production Next.js
apps, rebuilt on the approved **Light Enterprise** design system. Each portal is
its own parity work package / branch / PR — independently mergeable.

Data-honesty policy: every surface is **REAL** (persisted platform/API data),
**DEMO** (deterministic demonstration data — never presented as production), or
**EXT** (external carrier/registry/gateway integration required). No subscriber
PII / MSISDN / individual lookup anywhere.

| Prototype | Portal | WP | Branch | PR | Status |
|---|---|---|---|---|---|
| `tely_advertiser_portal_3.html` | Advertiser Portal | PARITY-01 | `feature/parity-advertiser` | #7 | ✅ Delivered |
| `Tely_Telco_Operations_Dashboard.html` | Telco Console | PARITY-02 | `feature/parity-telco` | #8 | ✅ Delivered |
| `Tely_Master_Admin_3_2.html` | Master Admin | PARITY-03 | `feature/parity-admin` | #9 | ✅ Delivered |
| `telydial(1).html` | TelyDial | PARITY-04 | `feature/parity-telydial` | this PR | ✅ Delivered |

---

## PARITY-04 — TelyDial (`apps/telydial`)

TelyDial is the **MVAS / telco-product acquisition module** inside TelyAd: a
provider uses approved MTN VAS products to acquire subscribers through
network-controlled STK campaign experiences. It stays part of the TelyAd
ecosystem (shared UI, shared auth, shared API, shared audience models,
48-capability architecture) — not a standalone legacy app.

**9 destinations — all real, populated routes (no dead nav, no "coming soon"):**

| # | Prototype destination | Route | Page | Classification |
|---|---|---|---|---|
| 1 | Dashboard | `/dashboard` | `dashboard/page.tsx` | REAL (campaign counts) + DEMO + EXT (delivery) |
| 2 | Campaigns | `/campaigns` | `campaigns/page.tsx` | REAL (live table) + DEMO (management table) |
| 3 | Create Campaign (hero builder) | `/campaigns/new` | `campaigns/new/page.tsx` | REAL (submit persists) + DEMO (registry/forecast) |
| 4 | Products | `/products` | `products/page.tsx` | DEMO + EXT (MTN registry) |
| 5 | Analytics | `/analytics` | `analytics/page.tsx` | DEMO + EXT (carrier volumes) |
| 6 | Wallet | `/wallet` | `wallet/page.tsx` | DEMO (no real payment processing) |
| 7 | Reports | `/reports` | `reports/page.tsx` | DEMO + one REAL client-side CSV export |
| 8 | Notifications | `/notifications` | `notifications/page.tsx` | DEMO |
| 9 | Support | `/support` | `support/page.tsx` | DEMO (no live ticketing) |

**Navigation (recovered):** Core → Dashboard · Campaigns · Create Campaign ·
Product → Products · Intelligence → Analytics · Finance → Wallet · Operations →
Reports · Notifications · Support.

### Campaign builder (the hero experience)

Five-step wizard (`Stepper`), preserving the existing backend campaign lifecycle
(`api.createCampaign` → `api.submitCampaign`, format `stk`, shared
`AudienceDefinition`):

| Feature | Behaviour |
|---|---|
| **Product ID verification** | Deterministic demo registry seam (`verifyProductId`). Known IDs verify and show a product summary; unknown IDs return **not found** — never treated as network-approved. Live lookup = EXT. |
| **Creative builder** | Campaign name, internal reference, service name, body copy (char counts), CTA, SMS fallback. |
| **Emoji picker** | Lightweight local component (`EmojiField`) — search, categories, insert-at-cursor, Escape/outside-click close. No external package. |
| **CTA presets** | Subscribe · Join now · Play now · Activate · Continue · Learn more, plus a custom label; renders live in the device preview. |
| **SMS fallback** | Dedicated creative field; labelled — live fallback delivery requires gateway integration (EXT). |
| **Android STK preview** | Realistic STK dialog; updates live with service name / body / CTA. |
| **iOS experience preview** | iPhone frame + configured subscriber experience; **honestly labelled "not native SIM Toolkit"**. |
| **Device switcher** | Android / iOS tabs; creative state is preserved (state lives in the parent — no refresh, no static image). |
| **Audience** | Shared audience architecture: categories, ARPU band, network type, language, national/by-state location. Aggregate only, DND/existing-subscriber exclusion always on. |
| **Audience estimate** | Live `estimateAudience` — eligible reach range, excluded (compliance), forecast opt-ins, forecast CPA, quality score. Labelled forecast/demo. |
| **Commercial / Budget** | CPA / CPM model cards; daily & campaign budget; priority; delivery speed; schedule; budget-impact + wallet-remaining forecast (no real charge). |
| **Review** | Per-section summary (Product / Creative / Audience / Commercial) with Edit links + forecast + wallet line. |
| **Submit** | Persists a real campaign and submits it to MTN telco approval; redirects to campaign detail. |

### Preserved (hard freeze, no regression)
Fastify API · Prisma/Postgres · tenant isolation · RBAC · Demo Access · campaign
lifecycle · Light Enterprise UI · shared 48-capability architecture · existing
TelyDial campaign persistence · deployment config · CI · Playwright.

### Data classification summary
- **REAL:** authenticated session; campaigns created/listed via the platform API; the working CSV export.
- **DEMO:** dashboard/analytics/wallet figures, product registry, ledger, notifications, FAQ, forecasts.
- **EXT (integration required):** MTN product registry, STK/SMS gateway, DCB charging, live acquisition/delivery events, real payment processing.

### Verification
`platform typecheck / lint / build` green; Playwright `telydial-parity.spec.ts`
(9-destination nav sweep + campaign-builder + no-PII) green; preserved Maltina
advertiser→MTN journey green. Visual evidence in `visual-review-parity/telydial/`.
