# Wednesday Demo Flow

The end-to-end journey shown to MTN. Every step persists through the shared API
and is covered by automated tests (`services/api/src/app.test.ts`) and a live
HTTP end-to-end run.

## Setup

```bash
cp services/api/.env.example services/api/.env   # set DEMO_USER_PASSWORD + JWT_SECRET
pnpm --filter @telyad/api dev                    # :4000  (seeded in-memory store)
pnpm --filter @telyad/advertiser dev             # :3001
pnpm --filter @telyad/telco-console dev          # :3002
```

Seeded demo accounts (sign in with your `DEMO_USER_PASSWORD`):

- Advertiser (Toyota, Campaign Manager): `bola@toyota.example`
- MTN operations: `ops.lead@mtn.example`

## The journey

### Step 1 — Advertiser creates & submits
1. Sign in at `advertiser.telyad.com` (`:3001`).
2. **New Campaign** → wizard:
   - Format **STK Push**, name *Highlander Test Drive*, objective *Acquisition*.
   - Creative: STK menu title/body/CTA (live handset preview updates).
   - Audience: Lagos + Abuja, 30–44, premium, automotive, exclude DND. A
     **deterministic** aggregate reach estimate updates live (no subscriber data).
   - Budget: CPM, daily + total, campaign dates.
   - Review → **Submit for approval**.
3. Campaign status becomes **PENDING_TELCO_APPROVAL**.

### Step 2 — MTN reviews & approves
1. Sign in at `mtn.telyad.com` (`:3002`) as MTN operations.
2. **Campaign Approval** — *Highlander Test Drive* is in the queue with advertiser,
   objective, format, budget, estimated reach, compliance score, risk score and
   audience (aggregate).
3. **Approve** → enter a comment → confirm.
4. Recorded: approver, timestamp, decision, comment, and an **audit event**.
   Campaign becomes **APPROVED**.

### Step 3 — Advertiser sees the result
1. Back in the Advertiser Portal, open the campaign.
2. It now shows **“Approved by MTN Nigeria”** and can be scheduled/launched in
   demo mode. The dashboard reflects the new approved campaign.

## Automated proof

- Engine unit test: `DRAFT → PENDING_TELCO_APPROVAL → APPROVED`.
- API integration test: advertiser creates → submits → MTN sees in queue →
  approves with comment → APPROVED + `approvedByTelcoName = "MTN Nigeria"` +
  audit action `Approved campaign`; plus tenant-isolation and RBAC assertions.
- Live HTTP run reproduces the same journey against the running server.
