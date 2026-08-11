# MTN Presentation Runbook

Concise operational guide for the live demo. Keep this open during the meeting.
**No passwords appear in this document** — see _Demo accounts_ for where they live.

---

## 0. Ports & URLs

| Component | Local URL |
| --- | --- |
| API | http://localhost:4000 |
| Advertiser Portal | http://localhost:3001 |
| MTN Operations | http://localhost:3002 |
| Tely Master Admin | http://localhost:3003 |

Deployed URLs (if deployed): `advertiser.telyad.com`, `mtn.telyad.com`,
`admin.telyad.com`, API at `api.telyad.com`.

---

## 1. Before the meeting (T‑15 min)

```bash
cd telyad-platform
pnpm install

# One-time: env + database
cp services/api/.env.example services/api/.env   # set JWT_SECRET + DEMO_USER_PASSWORD
pnpm --filter @telyad/api db:generate
pnpm --filter @telyad/api db:reset               # push schema + deterministic seed
```

Start everything (separate terminals, or a multiplexer):

```bash
pnpm --filter @telyad/api dev            # :4000  (persistent Prisma store)
pnpm --filter @telyad/advertiser dev     # :3001
pnpm --filter @telyad/telco-console dev  # :3002
```

**Health checks** (must return ok / ready):

```bash
curl -s localhost:4000/health   # {"ok":true,...}
curl -s localhost:4000/ready    # {"ready":true,"store":"prisma","db":"reachable"}
```

**Login verification:** sign in to the Advertiser Portal and the MTN console with
the demo accounts. Confirm the dashboards load.

**Browser prep:** Chrome, zoom 100%, close other tabs, disable notifications,
have the three URLs bookmarked. Pre-open the two login pages.

**Backup plan ready:** see §5.

---

## 2. Demo sequence (click‑by‑click) — WP02B

Primary brand: **Maltina Family Moments** (FMCG). Full narrative in
`MTN-EXECUTIVE-DEMO.md`.

**MTN Operations (`:3002`) — set the scene**
1. Sign in as MTN Commercial (`commercial@mtn.example`) → **Executive Overview**:
   ad revenue, revenue by capability family, pending approvals.

**Advertiser (`:3001`) — the pitch**
2. Sign in as the Maltina advertiser (`chidi@maltina.example`).
3. **Ad Format Marketplace** — filter by family; open a capability detail; show
   the 48-capability portfolio and network-status pills (LIVE vs "Network
   Enablement Required").
4. **AI Intelligence** — enter a Maltina brief (FMCG, Awareness, ₦20M, national,
   English+Pidgin, 28 days) → **Generate media plan** → explain the mix →
   **Apply to Campaign**.
5. **New Campaign** wizard — audience (aggregate estimate, no identities);
   creative + **Languages & localisation** (generate Pidgin/Yoruba variants,
   note "human review required"); budget; review; **Submit for approval**.

**MTN Operations (`:3002`) — govern & approve**
6. **Campaign Approval** → the campaign shows advertiser, audience definition,
   compliance/DND. **Approve** with a comment (rejection requires one).
7. **Inventory & Ad Formats** — show governance; toggle a capability's status
   (persists + audited).
8. **Revenue & Commercials** + **AI Intelligence** — revenue by family/industry,
   inventory utilisation, opportunities.

**Advertiser return (`:3001`)**
9. Reopen the campaign → **“Approved by MTN Nigeria”** + **Campaign analytics**.

> The original single-brand Toyota flow (advertiser `bola@toyota.example`)
> still works and is what the automated Playwright journey exercises.

**Optional — Tely Master Admin (`:3003`):** global dashboard, telco directory, commercial terms (cross-telco, aggregate only).

---

## 3. Demo accounts

Seeded users live in `packages/demo-data` (emails only). The shared password is
the `DEMO_USER_PASSWORD` from `services/api/.env` — **not stored in the repo**.

- Advertiser (Toyota, Campaign Manager) — see demo-data
- MTN Operations Manager — see demo-data
- Tely Platform Super Admin — see demo-data

---

## 4. Recovery

| Symptom | Action |
| --- | --- |
| Advertiser app error/blank | Reload; it shows a Retry state if the API is down. Restart `:3001`. |
| MTN app error | Reload; approval queue has a Retry state. Restart `:3002`. |
| API down | Restart `pnpm --filter @telyad/api dev`. State persists (Prisma) — campaigns/approvals survive. |
| DB unreachable | `curl /ready` shows it. Check `DATABASE_URL`; restart the API. |
| Campaign state messed up for a re-run | Run the **Reset** below. |
| Internet unstable | The whole stack runs **locally** — no internet needed for the demo itself. |

The API can restart mid-demo without losing campaign, approval or audit state
(verified by the restart-persistence test).

---

## 5. Reset (safe, deterministic — no manual DB editing)

```bash
pnpm --filter @telyad/api db:reset   # re-pushes schema + reseeds fixed demo data
```

This restores the exact demo dataset (incl. the Toyota Highlander draft) every
time. Never edit the database by hand during the meeting.

---

## 6. Backup demo strategy

- **Primary:** the live deployed platform on a persistent database.
- **Fallback A:** this stack run **locally** with the persistent Prisma/SQLite
  store (steps in §1). Zero internet dependency.
- **Fallback B (last resort):** run the API with `STORE=memory` (seeded, no DB) —
  non-persistent but instant. Use only if the DB itself is the problem.
- The `/reference` HTML prototypes are **design artifacts only** — not a demo
  fallback.
