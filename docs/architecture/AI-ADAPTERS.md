# AI Adapters

All "AI" in WP02B is **deterministic, rule-based demonstration intelligence**
behind clean interfaces (`packages/intelligence`). Nothing is production ML, and
the UI labels it as demonstration intelligence. A real provider can be dropped
in behind each interface without touching callers.

> Rule (spec §46): do not call rule-based recommendations "machine learning".
> No external paid AI APIs are integrated in this work package.

## Interfaces (and demo implementations)

| Interface | Demo impl | Responsibility |
| --- | --- | --- |
| `AIPlanner` | `DemoAIPlanner` | Media plan across the 48 capabilities — scores capabilities by objective/sector/device/network-readiness, allocates budget, explains each pick, flags non-live capabilities. |
| `CreativeIntelligence` | `DemoCreativeIntelligence` | Write / shorten / expand / improve-CTA / tone; readability + quality scoring; compliance warnings; char-limit checks. |
| `AudienceIntelligence` | `DemoAudienceIntelligence` | Aggregate-only expansion opportunities (add Pidgin, adjacent cohorts, feature-phone) with incremental reach + budget impact. |
| `RevenueIntelligence` | `DemoRevenueIntelligence` | Telco revenue by family/industry/pricing, inventory utilisation, projected revenue, opportunities. |
| `LocalisationService` | `DemoLocalisationService` | Language variants across 5 languages; CTA dictionary; brand-term locking; **human review required**. |

## Determinism

Every output is a pure function of its input (FNV-1a seeded where variety is
needed), so demo numbers are stable across refreshes — never `Math.random()`.
Tests assert determinism (`packages/intelligence/src/intelligence.test.ts`).

## Swapping in a real provider

Implement the interface (e.g. `class OpenAIPlanner implements AIPlanner`) and
replace the singleton in `packages/intelligence/src/index.ts` (`intelligence`),
or inject per-request. The API and apps depend only on the interfaces + DTOs
(`packages/types/src/intelligence.ts`), so no caller changes.

## Exposed via the API

`/ai/media-plan`, `/ai/localise`, `/ai/audience-opportunity` (advertiser);
`/telco/revenue-intelligence`, `/telco/ai-intelligence` (telco, RBAC-gated).
