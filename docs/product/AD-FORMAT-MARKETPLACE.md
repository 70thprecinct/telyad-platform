# Ad Format Marketplace

A polished, advertiser-facing catalogue of all 48 capabilities
(`apps/advertiser` → **Ad Format Marketplace**). Data comes from `/capabilities`.

## Layout
- Capabilities grouped into 12 families (see the Capability Universe doc).
- **Filters**: search, family, objective, device, pricing model, capability status.
- Lightweight cards (name, network-status pill, family, description, pricing,
  device). For performance, detailed handset previews render **on demand** in a
  detail modal — never 48 live previews at once.

## Capability detail
Full metadata (placement, creative types, triggers, mechanics, journey types,
objectives, pricing, targeting, TelyAd status + network status, compliance, best
use cases, recommended sectors) plus a preview (STK/SMS/USSD/WAP/OBD reuse the
handset previews; others show a styled placeholder). The network-dependent
disclaimer appears in the marketplace header and each detail.

## Status honesty
A capability's pill reflects its **network status**. Non-LIVE/PILOT capabilities
read "TelyAd Capability — Network Enablement Required". The advertiser is never
told a capability is live on MTN when it is not.

## Implementation status
- Catalogue, families, filters, detail modal, previews — **implemented**.
- Deep "add to campaign from marketplace" wiring — the campaign wizard remains
  the creation vehicle for the 5 creatable formats; other capabilities are shown
  as catalogue/enablement items (**partial**, by design for WP02B).
