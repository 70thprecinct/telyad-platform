# MTN (Telco) RBAC

Roles and permissions are defined in `@telyad/auth` (`ROLE_PERMISSIONS`) and
**enforced server-side** on every mutating endpoint. UI reflects permissions but
never relies on hidden navigation alone.

## Telco roles → key permissions

| Role | Can approve | Inventory manage | Revenue view | Audience view | Compliance enforce |
| --- | --- | --- | --- | --- | --- |
| Telco Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Commercial Manager | — | ✅ | ✅ | ✅ | — |
| Operations Manager | ✅ | — | — | ✅ | — |
| Campaign Reviewer | ✅ | — | — | — | — |
| Compliance Officer | reject | — | — | — | ✅ |
| Finance Officer | — | — | ✅ | — | — |
| Audience Analyst | — | — | — | ✅ | — |
| Technical Operations | — | ✅ | — | — | — |
| Marketing Manager | — | — | — | ✅ | — |
| Support / Read Only | — | — | — | — | — |

(All roles have `campaign:view`.) Full permission set:
`campaign:*`, `creative:manage`, `advertiser:approve/suspend`, `wallet:manage`,
`compliance:view/enforce`, `inventory:manage`, `revenue:view`, `audience:view`,
`platform:health:view`, `users:manage`, `audit:view`, `reports:export`,
`telco:manage`.

## Advertiser roles
Advertiser Admin, Campaign Manager, **Creative Manager** (view + `creative:manage`),
Analyst, Finance, Read Only. No advertiser role can approve campaigns.

## Enforcement evidence
- `packages/auth/src/rbac.test.ts` — role → permission assertions.
- `services/api/src/capabilities-api.test.ts` — Commercial Manager can change
  inventory status + view revenue; Campaign Reviewer cannot change inventory
  (403); Operations Manager cannot view revenue (403); advertiser cannot access
  telco inventory (403).
- `services/api/src/app.test.ts` — advertiser cannot approve (403); tenant reads
  cross-boundary → 404.

## Maker/checker
The approval flow is a representative maker (advertiser submit) / checker (telco
approve/reject with recorded comment + audit) workflow. Broader maker/checker for
pricing/suspension is modelled at the permission layer but a dedicated dual-control
UI is **deferred** (WP02C).
