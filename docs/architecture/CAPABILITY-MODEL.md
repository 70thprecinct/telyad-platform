# Capability Model

WP02B replaces the flat "format" concept with a multi-dimensional **capability
model** (`packages/types/src/capability.ts`). A capability is described along
independent axes rather than as one rigid enum, so the catalogue can grow to
48+ without a new database model per combination.

## Dimensions

| Dimension | Values (enum) |
| --- | --- |
| **Placement** | sms, ussd, stk, voice, end_of_call, billing_receipt, notification, lock_screen, telco_app, web_portal, wifi_portal, rcs, whatsapp, search, dooh |
| **Creative type** | text, interactive_menu, voice, rich_card, image, video, banner, native_card, survey, voucher |
| **Trigger** | scheduled, recharge, data_purchase, balance_enquiry, call_end, session_event, geo, time_context, network_event |
| **Mechanic** | awareness, engagement, conversion, acquisition, lead_generation, reward, coupon, competition, survey, subscription |
| **Journey** | single, retargeting, sequential, cross_channel, win_back |
| **Family** | 12 marketplace families (messaging, ussd_interactive, voice, sim_device, carrier_digital_media, billing_network_events, sponsored_connectivity_rewards, commerce_performance, location_context, journey_retargeting, research_insights, advanced_media) |
| **Device class** | smartphone, feature_phone, both |
| **Product** | telyads, telydial |
| **Pricing** | CPM, CPC, CPA, CPL, CPD, REVSHARE, FIXED, HYBRID |

## Network-capability lifecycle

`CapabilityStatus`: `TELYAD_SUPPORTED · NETWORK_APPROVAL_REQUIRED ·
INTEGRATION_REQUIRED · PILOT · LIVE · DISABLED · FUTURE_CAPABILITY`.

- `telyadStatus` — what the TelyAd platform can do.
- `defaultNetworkStatus` — the demonstration MTN posture per capability.
- Per-telco overrides are persisted (`TelcoCapabilityAvailability`) and set via
  the MTN Inventory governance screen.
- `isNetworkLive(status)` is true only for `LIVE`/`PILOT`. Only these may be
  presented to advertisers as available on the network. Everything else is
  labelled **"TelyAd Capability — Network Enablement Required"**.

## Relationship to creatable formats

The 5 concrete, creatable `AdvertisingFormat`s (`@telyad/ad-formats` registry:
stk, sms, obd, wap, ussd) remain the campaign-creation vehicles with real
creative schemas and previews. A capability that maps to one carries
`creatableFormatId`. The other 43 are catalogue/planner/inventory capabilities
pending network enablement — which is exactly the commercial story.

## Where it lives

- Types & enums: `packages/types/src/capability.ts`
- The 48 catalogue: `packages/ad-formats/src/capabilities.ts`
  (`listCapabilities`, `getCapability`, `capabilitiesByFamily`,
  `networkAvailableCapabilities`)
- Formats 01–19 are authored from `reference/nineteen-formats-prototype.html`.
