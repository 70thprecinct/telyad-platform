# Campaign Lifecycle

Campaign status transitions are **centrally controlled** by the state machine in
`packages/campaign-engine`. No UI component or route mutates `campaign.status`
directly — all changes go through `applyEvent(status, event)`, which throws
`InvalidTransitionError` on an illegal move.

## States

```
DRAFT · READY_FOR_REVIEW · SUBMITTED · PENDING_TELCO_APPROVAL ·
APPROVED · REJECTED · SCHEDULED · LIVE · PAUSED · COMPLETED · CANCELLED
```

## Transition map

| From | Event | To |
| --- | --- | --- |
| DRAFT | `markReady` | READY_FOR_REVIEW |
| DRAFT | `submit` | PENDING_TELCO_APPROVAL |
| READY_FOR_REVIEW | `submit` | PENDING_TELCO_APPROVAL |
| PENDING_TELCO_APPROVAL | `approve` | APPROVED |
| PENDING_TELCO_APPROVAL | `reject` | REJECTED |
| REJECTED | `revise` | DRAFT |
| APPROVED | `schedule` | SCHEDULED |
| APPROVED / SCHEDULED | `goLive` | LIVE |
| LIVE / SCHEDULED | `pause` | PAUSED |
| PAUSED | `resume` | LIVE |
| LIVE / PAUSED | `complete` | COMPLETED |
| (most) | `cancel` | CANCELLED |

`COMPLETED` and `CANCELLED` are terminal. The full map lives in
`packages/campaign-engine/src/lifecycle.ts` and is covered by unit tests.

## Who can drive which transition

- **Advertiser** (`campaign:create`, `campaign:submit`): create DRAFT, `submit`.
- **Telco** (`campaign:approve` / `campaign:reject`): `approve` / `reject` from the
  approval queue. Every decision records a `CampaignApproval` (approver, comment,
  timestamp) **and** an `AuditEvent`, and stamps `approvedByTelcoName` on approval.
- **Advertiser** again: sees APPROVED/REJECTED; can `revise` a rejected campaign.

## The demo path

```
DRAFT --submit--> PENDING_TELCO_APPROVAL --approve--> APPROVED
```

This exact path is asserted in both the engine unit tests and the API
integration tests.
