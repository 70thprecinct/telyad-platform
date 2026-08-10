# Architecture Decision Record

Short log of the decisions that shaped this work package, including the two
deliberate deviations from the spec's defaults.

## ADR-1: Next.js + pnpm + Turborepo (as specified)
Chosen per spec §3–4. Each app is an independently deployable Next.js 15 app;
pnpm workspaces + Turborepo orchestrate the monorepo. No deviation.

## ADR-2: One shared Fastify API, not per-app backends
The demo requires a single source of truth across apps (a campaign submitted in
the advertiser app must appear in MTN's queue). A shared `services/api` gives one
datastore and one enforcement point for auth, RBAC and tenant isolation. Fastify
chosen for a lean, TypeScript-friendly HTTP layer.

## ADR-3: `Store` interface with in-memory default; Prisma for production
**Deviation (justified).** The spec prefers PostgreSQL. This Mac demo has no
Docker/Postgres, and the Wednesday demo must run reliably with zero setup.
Resolution: a `Store` interface with two implementations —
- `MemoryStore` (seeded from `@telyad/demo-data`): the **default** runtime store
  and the store used by integration tests. Zero external dependencies.
- `PrismaStore`: the production persistence path. Prisma schema ships with the
  repo; `provider = "sqlite"` for local real-DB use, PostgreSQL-portable (JSON
  stored as strings, money as integer minor units, no engine-specific types).
Switch with `STORE=prisma`. This guarantees a working demo while keeping a real,
documented database path. `prisma generate` is wired into the API's
typecheck/build so CI stays green.

## ADR-4: Shared packages consumed as TypeScript source
No inter-package build step. Next apps use `transpilePackages`; the API uses
`tsx`/`tsup`; tests use Vitest. Relative imports are **extensionless** so the same
source resolves under tsc (bundler resolution), webpack, tsx, tsup and Vitest.
Simpler and faster than emitting `dist/` per package for a repo of this size.

## ADR-5: Deterministic demo data & estimates
The prototypes used `Math.random()` for reach and metrics. For a stable
executive demo, `@telyad/audience` computes reach **deterministically** from the
audience definition, and all seed data is fixed constants — reproducible across
reseeds, never presented as live MTN data.

## ADR-6: Themed single design system
One `@telyad/ui` kit themed per app via a `--tly-*` CSS variable contract, rather
than four forked component sets. Preserves each prototype's visual character
(advertiser orange, telco MTN-yellow, admin cyan, TelyDial violet) without
copy-paste.
