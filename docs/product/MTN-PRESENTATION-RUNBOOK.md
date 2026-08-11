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

## 2. Demo sequence (click‑by‑click)

**Advertiser (`:3001`)**
1. Sign in as the Toyota advertiser → **Dashboard**.
2. **+ New Campaign**.
3. Step 1 — Format **STK Push Notification**; name *Toyota Highlander Test Drive*; objective *Acquisition*. **Next**.
4. Step 2 — Creative: menu title, body, CTA, service name. Point out the **live handset preview**. **Next**.
5. Step 3 — Audience: **Lagos**, **Abuja FCT**, **automotive**, **premium**, keep **dnd** exclusion. Point out the **estimated eligible audience** — aggregate only, no subscriber identities. **Next**.
6. Step 4 — Budget: CPM, daily + total, dates. **Next**.
7. Step 5 — Review. **Submit for approval** → status becomes **Pending approval**.

**MTN Operations (`:3002`)**
8. Sign in as MTN Operations → **Dashboard** (note the pending-approval count).
9. **Campaign Approval** → the Toyota campaign is in the queue with advertiser, audience definition, estimated audience, compliance & risk scores, DND status.
10. **Approve** → enter a comment → **Confirm approval**. (Rejecting requires a comment.)

**Advertiser return (`:3001`)**
11. Reopen the campaign → **“Approved by MTN Nigeria”** banner.
12. Show **Campaign analytics** (deterministic demo data) on the campaign.

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
