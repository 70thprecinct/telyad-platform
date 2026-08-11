# Platform Architecture

## Goals

1. Preserve the **three-realm separation** — Advertiser, Telco, Tely — as an
   architectural boundary, not a cosmetic one.
2. Make the **cross-app campaign workflow** work on shared persistence.
3. Keep subscriber data private: advertisers see aggregates only.
4. Stay extensible — ~19 more ad formats and real carrier integrations land later
   without rewriting the campaign engine.

## Shape

```
┌ advertiser.telyad.com ┐   ┌ mtn.telyad.com ┐   ┌ admin.telyad.com ┐
│  apps/advertiser      │   │ apps/telco-    │   │ apps/platform-   │
│  (Next.js)            │   │ console        │   │ admin            │
└──────────┬────────────┘   └───────┬────────┘   └────────┬─────────┘
           │  HTTPS + JWT (Bearer)  │                     │
           └────────────┬───────────┴─────────────────────┘
                        ▼
             services/api  (Fastify)
             ├─ JWT auth, RBAC, tenant scoping   (packages/auth)
             ├─ campaign lifecycle transitions   (packages/campaign-engine)
             ├─ audience estimate / ad formats   (packages/audience, ad-formats)
             └─ Store interface
                  ├─ MemoryStore   (seeded, default — demo/tests)
                  └─ PrismaStore   (SQLite dev · PostgreSQL prod)
```

Everything shared lives in `packages/*` and is consumed as TypeScript source
(no inter-package build step): Next apps use `transpilePackages`, the API uses
`tsx`/`tsup`, tests use Vitest. This keeps the monorepo simple and fast.

## Why these choices

- **Next.js per app** — each realm is independently deployable to its own
  subdomain, with its own theme, while sharing the design system and types.
- **One shared API, not per-app backends** — the demo requires a single source
  of truth: a campaign the advertiser submits must appear in MTN's queue. A
  shared Fastify service gives one authoritative datastore and one place to
  enforce auth, RBAC and tenant isolation.
- **`Store` interface with two implementations** — the in-memory store makes the
  demo run with zero external setup (ideal on a laptop) and makes integration
  tests fast and deterministic; the Prisma store is the production persistence
  path. Swapping is a single env var (`STORE=prisma`).
- **Design tokens over forked components** — one `@telyad/ui` kit, themed per app
  via a `--tly-*` CSS variable contract (advertiser orange, telco MTN-yellow,
  admin cyan, TelyDial violet).

## Package boundaries

| Package | Responsibility | Depends on |
| --- | --- | --- |
| `@telyad/types` | Domain types, money, enums, Zod DTOs | — |
| `@telyad/campaign-engine` | Lifecycle state machine | types |
| `@telyad/ad-formats` | Format registry + creative validation | types |
| `@telyad/audience` | Deterministic aggregate estimator | types |
| `@telyad/auth` | Realm/role/permission model | types |
| `@telyad/ui` | Design system | types |
| `@telyad/demo-data` | Reproducible seed | types, audience |
| `@telyad/api` | HTTP API + persistence | all of the above |

## Adapter seams for future integrations

- **Persistence** → the `Store` interface. A production `PrismaStore` (Postgres)
  drops in behind it; so could an event-sourced or carrier-hosted store.
- **Ad formats** → `registerFormat()` in `@telyad/ad-formats`. New formats add a
  descriptor + creative schema; the wizard and API validate generically.
- **Gateways (DND/SMS/STK/charging)** → not built in this package (see the scope
  list in the README). They attach at the API service layer behind interfaces.
