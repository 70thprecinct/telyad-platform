# Multi-tenancy & Data Privacy

Two invariants define the platform. Both are enforced **server-side** in
`services/api` — never by frontend filtering alone.

## 1. Telco isolation

Every telco-owned resource carries a `telcoId`. A telco user's token carries
their `telcoId`, and the API scopes every query to it:

- `GET /campaigns` for a telco user → `listCampaigns({ telcoId })`.
- `GET /telco/approval-queue` → campaigns for *that* telco in `PENDING_TELCO_APPROVAL`.
- `POST /campaigns/:id/decision` → rejected with 404 unless `campaign.telcoId === auth.telcoId`.
- `GET /telcos` (all telcos) → **platform realm only**; a telco user gets 403.

The token is the authority; a client cannot widen its own scope. For the demo
only MTN Nigeria is fully populated, but the model is multi-tenant from day one.

## 2. Subscriber privacy

Advertisers interact with **abstract audience segments**, never identities.

- An `AudienceDefinition` contains only segment selectors (geographies, age
  bands, interests, tiers, ARPU bands, exclusions) — no MSISDNs, names, or
  device IDs.
- An `AudienceEstimate` (returned to advertisers) is defined with a **strict**
  Zod schema (`packages/types/src/audience.ts`) that permits only aggregate
  counts and a quality score. Anything else fails validation.
- `findPiiLeak()` provides defence-in-depth: a recursive check that rejects any
  payload containing forbidden keys (`msisdn`, `phone`, `imsi`, `subscriberId`, …).
- The estimator (`@telyad/audience`) computes reach **deterministically** from
  the definition — it never enumerates or stores subscribers.

The Tely Master Admin console is aggregate-only too: it shows per-telco totals
and commercial terms, never subscriber-level data.

## RBAC

Permissions are granted by `(realm, role)` in `@telyad/auth` and checked on every
mutating endpoint. Examples:

- `campaign:approve` / `campaign:reject` — telco roles only. No advertiser role
  can approve a campaign (verified by test).
- `campaign:create` / `campaign:submit` — advertiser roles.
- `Read Only` — `campaign:view` only, in every realm.

Tenant scoping and RBAC are covered by the API integration tests
(`services/api/src/app.test.ts`): foreign-advertiser reads 404, advertiser
approval attempts 403, unauthenticated requests 401.
