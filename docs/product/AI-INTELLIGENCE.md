# AI Intelligence

Demonstration intelligence (deterministic — see `docs/architecture/AI-ADAPTERS.md`)
surfaced in both realms.

## Advertiser side
| Module | Endpoint | Status |
| --- | --- | --- |
| AI Campaign Copilot / Media Planner | `POST /ai/media-plan` | **Implemented** — NL-ish inputs (sector, objective, budget, geo, languages, duration) → explainable capability mix with budget split, estimated reach/frequency, network warnings, "Apply to Campaign". |
| AI Media Planner | (same) | Implemented (the plan output). |
| AI Audience Opportunity Finder | `POST /ai/audience-opportunity` | **Implemented** — aggregate-only expansions with incremental reach + budget impact. |
| AI Multilingual Intelligence | `POST /ai/localise` | **Implemented** (CTA localisation + review flag; see Multilingual doc). |
| AI Creative Studio | `CreativeIntelligence` (package) | **Partial** — engine implemented (write/improve/score); surfaced lightly in the wizard. |
| AI Budget Optimiser | `BudgetScenario` DTO | **Partial** — DTO + forecast in planner; dedicated scenarios screen deferred. |
| Campaign Forecast | planner output | **Implemented** — estimated reach/frequency in the plan; per-campaign analytics exist. |
| Performance Intelligence / Next Best Action | — | **Not implemented** (deferred). |

## MTN side
| Module | Endpoint | Status |
| --- | --- | --- |
| Revenue Opportunity / Inventory Opportunity | `GET /telco/ai-intelligence`, `GET /telco/revenue-intelligence` | **Implemented** — under-utilised inventory + revenue upside. |
| Campaign Risk / Audience Saturation | `/telco/ai-intelligence` insights | **Implemented** (demonstration insights). |
| Revenue Forecast | `/telco/revenue-intelligence` (projectedMonthlyRevenueMinor) | **Implemented**. |
| Performance Anomaly / Next Best Commercial Action | — | **Partial / demonstration insight text**. |

Everything is labelled demonstration intelligence and is deterministic.
