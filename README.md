# TelyAd Platform

TelyAd is a **carrier-powered advertising platform**. Advertisers buy access to
privacy-safe telecom audiences and carrier-controlled advertising inventory;
telecom operators retain control of their subscriber relationship, campaign
approvals, compliance and monetisation; and Tely provides the cross-carrier
technology platform underneath.

This repository is the canonical source for the platform. It is a real, coded,
deployable application ported from the approved HTML prototypes (kept in
[`/reference`](./reference) as read-only specification artifacts).

> **Demonstration Environment.** Metrics in this build are polished but
> illustrative demo data — never live MTN production results.

## The three realms

The product is deliberately split into three separate experiences. The
separation is enforced in the API (server-side), not just the UI.

| Realm | App | Who uses it | Scope |
| --- | --- | --- | --- |
| **Advertiser** | `apps/advertiser` (`advertiser.telyad.com`) | Brands & agencies | Their own campaigns, one telco |
| **Telco** | `apps/telco-console` (`mtn.telyad.com`) | MTN Nigeria staff | One telco tenant only |
| **Platform** | `apps/platform-admin` (`admin.telyad.com`) | Tely staff | Cross-telco, aggregate only |
| **MVAS module** | `apps/telydial` | MVAS acquisition | Advertiser-realm module |

Advertisers **never** see subscriber identities — only aggregate audience
estimates and campaign metrics. See [Multi-tenancy](./docs/architecture/MULTI-TENANCY.md).

## Architecture

- **Monorepo:** pnpm workspaces + Turborepo, strict TypeScript.
- **Frontend:** Next.js 15 (App Router), React 19. Each app is independently deployable.
- **Backend:** a single shared Fastify API (`services/api`) — the source of truth for
  the cross-app workflow. JWT auth, server-enforced RBAC and tenant isolation.
- **Persistence:** a `Store` interface with two implementations — a seeded
  in-memory store (default, zero-setup demo) and Prisma (SQLite for the demo,
  PostgreSQL-portable for production).
- **Shared packages:** typed domain model, campaign lifecycle state machine,
  ad-format registry, deterministic audience estimator, RBAC model, design system.

```
apps/            advertiser · telco-console · platform-admin · telydial   (Next.js)
services/api     Fastify + Prisma — shared persistence & campaign workflow
packages/
  types          domain types, money (minor units), enums, Zod DTO schemas
  campaign-engine centrally-controlled lifecycle state machine
  ad-formats     extensible STK/SMS/OBD/WAP/USSD registry
  audience       deterministic, aggregate-only reach estimator
  auth           realm/role/permission model
  ui             themeable design system (ported from the prototypes)
  demo-data      reproducible seed (incl. the Toyota Highlander campaign)
  config         shared tsconfig presets
reference/       the four approved HTML prototypes (specification only)
docs/            architecture · product · deployment
```

See [Platform architecture](./docs/architecture/PLATFORM-ARCHITECTURE.md).

## Local development

Prerequisites: **Node 20**, **pnpm 9** (`npm i -g pnpm@9`).

```bash
pnpm install

# 1) copy the API env template and choose a demo password + JWT secret
cp services/api/.env.example services/api/.env
#    edit services/api/.env  (DEMO_USER_PASSWORD, JWT_SECRET)

# 2) start the shared API (defaults to the seeded in-memory store — no DB needed)
pnpm --filter @telyad/api dev            # http://localhost:4000

# 3) in separate terminals, start the apps you need
pnpm --filter @telyad/advertiser dev     # http://localhost:3001
pnpm --filter @telyad/telco-console dev  # http://localhost:3002
pnpm --filter @telyad/platform-admin dev # http://localhost:3003
pnpm --filter @telyad/telydial dev       # http://localhost:3004
```

Sign in with the seeded demo users (emails in `packages/demo-data`) using the
`DEMO_USER_PASSWORD` you set. Passwords are never stored in source.

To use real database persistence instead of the in-memory store:

```bash
cd services/api
STORE=prisma pnpm db:reset   # prisma db push --force-reset + seed
STORE=prisma pnpm dev
```

## Commands (run from the repo root)

```bash
pnpm lint         # ESLint across every package
pnpm typecheck    # tsc --noEmit across every package
pnpm test         # unit + integration tests (Vitest)
pnpm build        # production builds (Turborepo)
pnpm e2e:install  # one-time: install the Playwright Chromium browser
pnpm test:e2e     # build + Playwright browser E2E (demo journey + responsive)
```

For the live demo, follow the [MTN Presentation Runbook](./docs/product/MTN-PRESENTATION-RUNBOOK.md).

## The Wednesday demo flow

Advertiser creates the *Toyota Highlander Test Drive* campaign → submits →
it appears in MTN's approval queue → MTN approves with a comment → the
advertiser sees **“Approved by MTN Nigeria.”** Every step persists through the
shared API and writes an audit event. Full walkthrough:
[Wednesday demo flow](./docs/product/WEDNESDAY-DEMO-FLOW.md).

## Deployment

Each app deploys independently to a modern host (e.g. Vercel) behind its own
subdomain; the API deploys as a Node service with a PostgreSQL database. See
[Deployment](./docs/deployment/DEPLOYMENT.md).

## Status & scope

This is the foundation + demo work package. Not yet built (future packages):
real MTN/DND/SMS/STK gateways, charging/billing, carrier mediation, programmatic
exchanges, and the remaining ~19 advertising formats. Clean adapter boundaries
(the `Store` interface, the ad-format registry) exist so these connect later.
