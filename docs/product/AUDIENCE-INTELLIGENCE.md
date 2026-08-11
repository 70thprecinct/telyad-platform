# Audience Intelligence

## Permitted dimensions
The aggregate audience builder supports (where legitimately available):
geography, age band, device class (smartphone/feature-phone), data-use cohort,
recharge/spend band, broad behavioural/engagement cohorts, broad affinities,
time/day behaviour, and language/context strategy. Unsupported dimensions are
shown as capability labels / demonstration data — never as live MTN production
data.

## Privacy (unchanged, enforced server-side)
Advertisers see: segment definition, estimated audience, projected reach,
aggregate performance. Advertisers **never** see MSISDN, name, individual device
identity, raw location history, individual telecom/recharge records, or
subscriber lists. Enforcement: `audienceEstimateSchema` is a **strict** Zod
schema permitting only aggregate counts; `findPiiLeak()` rejects any payload
containing forbidden keys. See `docs/architecture/MULTI-TENANCY.md`.

## AI Audience Opportunity Finder
`POST /ai/audience-opportunity` returns aggregate-only expansion opportunities,
each with a reason, **incremental reach**, and **budget impact**, requiring
advertiser confirmation:
- Add Nigerian Pidgin creative (+~18% eligible reach).
- Expand to two adjacent permitted cohorts (+~32%).
- Include feature-phone-capable formats when smartphone-only (+~24%).

All figures are deterministic demonstration estimates. Tested in
`packages/intelligence/src/intelligence.test.ts` and
`services/api/src/capabilities-api.test.ts`.
