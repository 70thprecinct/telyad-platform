# TelyAd Capability Universe (48)

The full carrier-advertising capability portfolio. Formats 01–19 are authored
from the canonical prototype (`reference/nineteen-formats-prototype.html`);
20–48 are the WP02B expansion. Source of truth: `packages/ad-formats/src/capabilities.ts`.

> **Governing principle.** TelyAd supports a broad portfolio of carrier-powered
> advertising capabilities. Availability and delivery are subject to
> participating network capabilities, technical integration, regulatory
> requirements and network approval. Only capabilities marked **LIVE/PILOT** on
> a network are presented to advertisers as available there.

## The 48 capabilities

**Messaging** — 01 Standard SMS · 02 Flash SMS (Class 0) · 25 RCS Rich Message ·
26 WhatsApp Business Campaign · 27 Interactive SMS Journey · 30 Click-to-WhatsApp Ad

**USSD & Interactive** — 05 USSD Pre-Session Splash · 06 USSD Mid-Session Inject ·
07 USSD Post-Session · 08 Balance Enquiry Inject · 09 Data Purchase Flow ·
28 Click-to-USSD Ad · 31 Branded USSD Session

**Voice** — 10 End of Call (EOC) · 11 Outbound Voice (OBD) · 29 Click-to-Call Ad

**SIM & Device** — 12 STK Push (SIM Toolkit) · 13 WAP Push

**Carrier Digital Media** — 14 Lock Screen Interstitial · 15 Notification Shade ·
16 In-Browser / WAP Portal Banner · 32 Sponsored Service Menu Placement ·
33 Telco App Native Banner · 34 Telco App Interstitial · 35 Telco App Native Card

**Billing & Network Events** — 03 Recharge Confirmation SMS · 04 Transactional SMS ·
17 Airtime Recharge Receipt · 18 Data Bundle Purchase Receipt · 41 Network Event Triggered Journey

**Sponsored Connectivity & Rewards** — 20 Sponsored Data / Zero-Rated ·
21 Rewarded Data Ad · 22 Rewarded Airtime Ad · 23 Sponsored Browsing Session ·
24 Captive Portal / Wi-Fi Ad

**Commerce & Performance** — 38 Sponsored Search / Discovery · 42 Loyalty / Reward ·
43 Coupon / Voucher · 45 Lead Generation · 46 Sponsored Competition / Instant Win

**Location & Context** — 39 Geo-Fenced Campaign · 40 Time / Context Triggered Ad

**Journey & Retargeting** — 19 Sequenced Follow-Up Retargeting · 47 Sequential Cross-Channel Journey

**Research & Insights** — 44 Survey / Poll Campaign

**Advanced Media** — 36 Telco App Video Ad · 37 Rewarded Video · 48 Digital Out-of-Home Audience Extension

## Statuses in the demo (MTN default posture)

- **LIVE**: 01, 03, 05, 06, 07, 11, 12, 13 (proven core)
- **PILOT**: 02, 08, 10, 19, 20, 27, 40, 42, 43, 44, 45, 46, 47
- **NETWORK_APPROVAL_REQUIRED**: 04, 09, 14, 15, 16, 17, 18, 31, 39
- **INTEGRATION_REQUIRED**: 21, 22, 23, 24, 25, 26, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38
- **FUTURE_CAPABILITY**: 41, 48

MTN can change any capability's status per-telco in **Inventory & Ad Formats**;
changes persist and are audited. Coverage is asserted by
`packages/ad-formats/src/capabilities.test.ts` (exactly 48, numbered 1..48,
every family populated).
