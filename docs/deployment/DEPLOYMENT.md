# Deployment

Deploys the four independently-deployable apps + one shared API to the TelyAd
domains. **No DNS or hosting changes are made by this repository.**

> **Status in this repo:** deployment artifacts are prepared and committed, but
> the platform was **NOT deployed from the build environment** (no Docker, no
> cloud/DB/DNS credentials available). Follow this doc to deploy where those are
> available. See the WP03 completion report for the honest per-component state.

## Chosen platform & rationale
- **API + PostgreSQL → Render** (`render.yaml` blueprint). One host for a
  Dockerised Fastify service **and** managed Postgres, with HTTPS, custom
  domains, logs, health checks, one-click rollback, and no Kubernetes overhead.
- **Three Next.js apps → Vercel** (`apps/*/vercel.json`). First-class Next.js
  hosting, per-branch preview URLs (verify before switching DNS), instant
  rollback, custom domains, env management.
- Any equivalent host works (Fly.io/Railway for the API; Netlify for the apps).

## Target domains
| Component | Domain | Host |
| --- | --- | --- |
| Advertiser Portal | `advertiser.telyad.com` | Vercel |
| MTN Operations | `mtn.telyad.com` | Vercel |
| Tely Master Admin | `admin.telyad.com` | Vercel |
| Shared API | `api.telyad.com` | Render (Docker) |
| Database | — | Render managed PostgreSQL 16 |

## Existing DNS (recorded for rollback — inspect again before changing)
Read-only inspection at WP03 time:
- `advertiser.telyad.com` → **217.154.0.66** (IONOS), Apache/2.4.37 AlmaLinux, HTTP 200 (old dev implementation).
- `admin.telyad.com` → **217.154.0.66**, Apache/2.4.37, HTTP 200.
- `api.telyad.com` → **217.154.0.66**, HTTP 404 (no app).
- `mtn.telyad.com` → **no DNS record** (must be created).
- apex `telyad.com` → **217.160.0.246**.

**Rollback target for advertiser/admin: `217.154.0.66` (IONOS).** Record the
exact current records (A/CNAME + TTL) before editing, and keep the IONOS host
serving until the new Vercel deployment is verified on its preview URL. Do not
alter unrelated records (apex, MX, etc.).

## Deployment order (spec §15)
1. **PostgreSQL** — provision (Render blueprint creates `telyad-db`).
2. **API** — deploy the Docker image; it runs `prisma migrate deploy` (Postgres
   schema) then starts. Confirm `/health` and `/ready`.
3. **Admin**, 4. **MTN console**, 5. **Advertiser** — deploy on Vercel; set
   `NEXT_PUBLIC_API_URL=https://api.telyad.com`; verify on preview URLs.
4. **DNS / custom domains** — only after backend readiness: point the three app
   subdomains at Vercel and `api.telyad.com` at Render. Create `mtn.telyad.com`.
5. **Seed demo data** — one-off: `DEMO_MODE=on pnpm --filter @telyad/api demo:reset`.
6. **Browser E2E** — run `pnpm --filter @telyad/e2e e2e:live` (see below).

## Database & migrations (spec §4–5)
- Local/dev/tests use **SQLite** (`prisma/schema.prisma`).
- Production uses **PostgreSQL** (`prisma-postgres/schema.prisma`, identical
  models). Committed migrations live in `prisma-postgres/migrations/`:
  - `0001_init/` — baseline schema.
  - `0002_campaign_snapshot_plan/` — adds the WP02C.1 columns
    `Campaign.audienceSnapshotJson` and `Campaign.capabilityPlanJson` (both
    nullable `TEXT`). **Additive and non-destructive**: existing rows backfill to
    `NULL`, so it is safe to apply to a populated database with no downtime or
    backfill step. These columns persist the immutable audience-estimate snapshot
    and full multi-capability media plan captured at submission, which MTN reviews
    verbatim during approval.
- `pnpm --filter @telyad/api db:migrate:deploy` applies **all** pending
  migrations in order (non-destructive; no reset). `db:generate:pg` generates the
  Postgres client. On a fresh database both migrations run; on the existing demo
  database only `0002` applies.
- **Seed vs reset:** `db:seed` seeds initial data; **`demo:reset`** restores the
  deterministic demo state and **refuses unless `DEMO_MODE` is on** — it never
  runs a schema reset and never wipes state implicitly.

## Environment variables
| Variable | Where | Notes |
| --- | --- | --- |
| `DATABASE_URL` | API | Postgres URL (from Render DB) |
| `STORE` | API | `prisma` in production |
| `JWT_SECRET` | API | long random; Render `generateValue` |
| `DEMO_USER_PASSWORD` | API | set in dashboard (not committed) |
| `ALLOWED_ORIGINS` | API | `https://advertiser.telyad.com,https://mtn.telyad.com,https://admin.telyad.com` |
| `API_BASE_URL` | API | `https://api.telyad.com` |
| `APP_ENV` / `DEMO_MODE` | API | `production` / `on` for the demo |
| `NEXT_PUBLIC_API_URL` | each app | `https://api.telyad.com` (build-time) |

## Health, CORS, session
- **Health:** `/health` (liveness), `/ready` (503 when DB unreachable).
- **CORS:** explicit `ALLOWED_ORIGINS` only — never wildcard for authed traffic.
- **Session:** stateless JWT in the `Authorization` header (no cross-domain
  cookies), so the three subdomains work without cookie-domain config.

## Live E2E (spec §20)
```bash
ADVERTISER_URL=https://advertiser.telyad.com TELCO_URL=https://mtn.telyad.com \
ADMIN_URL=https://admin.telyad.com API_URL=https://api.telyad.com \
DEMO_USER_PASSWORD=<deployed demo password> \
pnpm --filter @telyad/e2e e2e:live
```
Runs the demo journey + responsive + WP02B + admin smoke on desktop (1440) and
Pixel-7 mobile, against the deployed domains.

## Rollback
- **Apps (Vercel):** instant rollback to the previous deployment; or repoint DNS
  to the recorded IONOS host `217.154.0.66`.
- **API (Render):** redeploy the previous image; DB is decoupled.
- **Database:** restore from Render's automated snapshot; `demo:reset` restores
  the demo dataset. Keep the previous IONOS deployment live until verified.

## CI
`.github/workflows/ci.yml`: **verify** (install/lint/typecheck/test/build) +
**e2e** (Playwright against locally-started servers). Live-domain E2E is run
manually post-deploy (it needs live URLs), not in CI.
