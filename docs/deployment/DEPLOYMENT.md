# Deployment

Each front-end app deploys independently behind its own subdomain; the API
deploys as a Node service with a PostgreSQL database. No DNS changes are made by
this repository.

## Targets

| Component | Host (suggested) | Domain |
| --- | --- | --- |
| Advertiser Portal | Vercel (Next.js) | `advertiser.telyad.com` |
| MTN Operations | Vercel (Next.js) | `mtn.telyad.com` |
| Tely Master Admin | Vercel (Next.js) | `admin.telyad.com` |
| TelyDial | Vercel (Next.js) | (initially separate) |
| Shared API | Fly.io / Render / Railway (Node) | `api.telyad.com` |
| Database | Managed PostgreSQL | — |

## API service

1. Provision PostgreSQL; set `DATABASE_URL` to it.
2. Set environment variables (see `services/api/.env.example`):
   - `JWT_SECRET` — long random string (`openssl rand -hex 32`). **Required.**
   - `DEMO_USER_PASSWORD` — password assigned to seeded demo users.
   - `STORE=prisma` — use the database (omit for the in-memory demo store).
   - `CORS_ORIGINS` — the deployed app origins, comma-separated.
   - `TELYAD_ENV_LABEL` — e.g. `Demonstration Environment`.
3. Build & migrate & seed:
   ```bash
   pnpm --filter @telyad/api build
   DATABASE_URL=... pnpm --filter @telyad/api exec prisma migrate deploy
   STORE=prisma DATABASE_URL=... pnpm --filter @telyad/api db:seed
   ```
   For PostgreSQL, set `provider = "postgresql"` in `services/api/prisma/schema.prisma`.
4. Start: `pnpm --filter @telyad/api start`.

## Front-end apps

For each app (`advertiser`, `telco-console`, `platform-admin`, `telydial`):

- Root directory: the app folder (monorepo-aware; Vercel detects pnpm workspaces).
- Build command: `pnpm build` (Turborepo builds workspace deps first) or
  `pnpm --filter @telyad/<app> build`.
- Environment: `NEXT_PUBLIC_API_URL=https://api.telyad.com`.
- Assign the domain from the table above.

## Environment variables summary

| Variable | Where | Required | Notes |
| --- | --- | --- | --- |
| `JWT_SECRET` | API | prod: yes | ≥16 chars; long random in prod |
| `DEMO_USER_PASSWORD` | API | demo | seed-time password for demo users |
| `DATABASE_URL` | API | with Prisma | SQLite file or Postgres URL |
| `STORE` | API | no | `prisma` to use the DB; unset = in-memory |
| `CORS_ORIGINS` | API | prod | comma-separated app origins |
| `NEXT_PUBLIC_API_URL` | each app | yes | the API base URL |

## Health checks

The API exposes two probes (no secrets, no infra internals):

- `GET /health` — **liveness**. `{ ok: true }` when the process is up.
- `GET /ready` — **readiness**. `{ ready: true, store, db }` (200), or **503**
  when the backing store is unreachable. Point your load balancer / platform
  health check at `/ready`.

## Persistence

The API defaults to the **persistent Prisma store**; `DATABASE_URL` is required
and the process fails fast if it is missing (no silent fallback to memory).
Set `provider = "postgresql"` in `services/api/prisma/schema.prisma` for
production and run `prisma migrate deploy` + `db:seed`. `STORE=memory` is for
tests / throwaway runs only.

## Session, cookies & CORS

Authentication is **stateless JWT in the `Authorization: Bearer` header** (stored
client-side), *not* cookies. Therefore:

- No cross-subdomain cookie/domain configuration is required — advertiser, MTN
  and admin apps on separate subdomains all send the header to the API.
- `CORS_ORIGINS` must list the exact app origins (e.g.
  `https://advertiser.telyad.com,https://mtn.telyad.com,https://admin.telyad.com`).
  Wildcard CORS is not used for authenticated traffic.
- Because tokens live in `localStorage`, they are origin-scoped per app. A 401
  mid-session clears the token and returns the user to the login page.

## Rollback

- **Front-end apps** (Vercel or similar): redeploy the previous build, or use the
  platform's instant rollback to the prior deployment. No DB coupling.
- **API:** deploy the previous image/commit. The database schema is
  additive-friendly; if a release included a migration, roll back with the
  paired down-migration or redeploy the prior schema before the prior API image.
- **Database:** restore from the managed provider's latest snapshot. For the
  demo, `pnpm --filter @telyad/api db:reset` restores the deterministic dataset.

## CI

`.github/workflows/ci.yml` runs two jobs on every push and pull request:

- **verify:** install → lint → typecheck → test → build.
- **e2e:** build the apps, install Chromium, run the Playwright demo-journey and
  responsive suites (starting the API + apps automatically). The Playwright HTML
  report is uploaded as a build artifact.
