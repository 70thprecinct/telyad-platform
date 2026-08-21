# TelyAd — MTN Executive Demo Runbook (10–15 min)

One coherent story across the four integrated portals. All figures are
demonstration data unless labelled REAL; nothing shown is live MTN production
data. No subscriber PII is ever displayed.

## Accounts (blank credentials by design — enter the shared demo password)

| Portal | URL (local) | Sign in as |
|---|---|---|
| Advertiser | `http://localhost:3001` | `bola@toyota.example` |
| Telco / MTN Operations | `http://localhost:3002` | `ops.lead@mtn.example` |
| Master Admin | `http://localhost:3003` | `admin@tely.example` |
| TelyDial | `http://localhost:3004` | `provider@telydial.example` |

> Login fields start blank (no default credentials). Time-limited demo accounts
> can be issued live from **Master Admin → Demo Access**.

## Sequence

1. **MTN opportunity — Executive Overview** *(Telco `/dashboard`)*
   Open on MTN's own console. Cross-telco isolation banner, subscriber reach,
   campaign book, channel status, commercial-opportunity upside. Frames the
   revenue story from MTN's seat.

2. **Advertiser portal** *(Advertiser `/dashboard`)*
   Switch to an advertiser (Toyota). Portfolio KPIs, spend, channel mix. This is
   the buyer's cockpit.

3. **48 advertising capabilities** *(Advertiser `/channels` → a capability)*
   The single 48-capability universe — families, filters, detail. Not a brochure:
   each renders a real subscriber-experience preview.

4. **Subscriber experience preview** *(capability detail / `/creatives`)*
   Show the dark handset preview for the selected capability. This is what the
   subscriber sees on the device.

5. **Audience Match** *(Advertiser `/campaigns/new` → Audience step)*
   Eligible subscribers vs the advertiser's chosen target — **they are separate**.
   Eligible may be tens of millions; the advertiser dials a subset.

6. **Advertiser chooses the target** *(same step)*
   Move the target below eligible. Forecast, frequency and estimated cost update
   live. Reinforce: TelyAd never force-targets the full eligible base.

7. **Campaign creative** *(creative/language step)*
   Compose the message; switch a language variant and watch the device preview
   switch. (Localisation is a deterministic demo seam — labelled honestly.)

8. **Submit** *(review → submit)*
   Submit for MTN approval. Campaign enters `PENDING_TELCO_APPROVAL`.

9. **MTN campaign review** *(Telco `/approvals`)*
   Switch to MTN. The submitted campaign appears. Open it: MTN reviews exactly
   what the advertiser submitted — the **immutable Audience Snapshot** (eligible,
   selected target, forecast, cost, selected capabilities), not a recomputed plan.

10. **Subscriber experience (operator side)** *(approval detail)*
    MTN sees the same subscriber previews + compliance / DND / consent posture.

11. **Approval** *(approve)*
    Approve. Return to the advertiser — the campaign now shows approved.

12. **Revenue / commercial opportunity** *(Telco `/revenue`)*
    Pricing, revenue share, utilisation — the money story for MTN.

13. **Master Admin control plane** *(Admin `/dashboard` → `/directory` → engines)*
    The Tely-owned cross-telco plane: global dashboard, telco directory with
    scoped drill-down + isolation banner, Platform Health (live probes), and the
    TelySignal / TelyXchange / TelyAds / TelyReach engine dashboards.

14. **TelyDial** *(TelyDial `/campaigns/new`)*
    The MVAS acquisition module: verify an MTN Product ID, compose an STK push
    with the emoji picker + CTA, flip Android ⇄ iOS preview, set audience/budget,
    submit → telco approval.

15. **Return to the approved advertiser campaign** *(Advertiser `/campaigns`)*
    Close the loop where you started: the buyer sees a live, MTN-approved campaign.

## Talking points to keep honest
- Say "demonstration data" whenever a dashboard figure is DEMO.
- Carrier delivery, DND/consent, product registry and charging are **EXT** —
  integrations, not yet live. Don't imply otherwise.
- iOS preview is a *configured subscriber experience*, not native SIM Toolkit.
- Audience is always aggregate — no MSISDN, no individual lookup.
