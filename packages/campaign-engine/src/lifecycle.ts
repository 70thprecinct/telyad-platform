import type { CampaignStatus } from '@telyad/types';

/**
 * Campaign lifecycle events. All status changes go through {@link applyEvent} —
 * no code should assign `campaign.status` directly (spec §7).
 */
export const CAMPAIGN_EVENTS = [
  'markReady',
  'submit',
  'withdraw',
  'approve',
  'reject',
  'revise',
  'schedule',
  'goLive',
  'pause',
  'resume',
  'complete',
  'cancel',
] as const;
export type CampaignEvent = (typeof CAMPAIGN_EVENTS)[number];

/** (from status) → (event) → (to status). The single source of truth. */
const TRANSITIONS: Record<CampaignStatus, Partial<Record<CampaignEvent, CampaignStatus>>> = {
  DRAFT: {
    markReady: 'READY_FOR_REVIEW',
    submit: 'PENDING_TELCO_APPROVAL',
    cancel: 'CANCELLED',
  },
  READY_FOR_REVIEW: {
    submit: 'PENDING_TELCO_APPROVAL',
    withdraw: 'DRAFT',
    cancel: 'CANCELLED',
  },
  SUBMITTED: {
    // reserved for a future internal-review step; forwards to telco queue
    approve: 'PENDING_TELCO_APPROVAL',
    withdraw: 'DRAFT',
    cancel: 'CANCELLED',
  },
  PENDING_TELCO_APPROVAL: {
    approve: 'APPROVED',
    reject: 'REJECTED',
    withdraw: 'DRAFT',
    cancel: 'CANCELLED',
  },
  APPROVED: {
    schedule: 'SCHEDULED',
    goLive: 'LIVE',
    cancel: 'CANCELLED',
  },
  REJECTED: {
    revise: 'DRAFT',
    cancel: 'CANCELLED',
  },
  SCHEDULED: {
    goLive: 'LIVE',
    pause: 'PAUSED',
    cancel: 'CANCELLED',
  },
  LIVE: {
    pause: 'PAUSED',
    complete: 'COMPLETED',
    cancel: 'CANCELLED',
  },
  PAUSED: {
    resume: 'LIVE',
    complete: 'COMPLETED',
    cancel: 'CANCELLED',
  },
  COMPLETED: {},
  CANCELLED: {},
};

export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: CampaignStatus,
    public readonly event: CampaignEvent,
  ) {
    super(`Cannot apply "${event}" to a campaign in status "${from}"`);
    this.name = 'InvalidTransitionError';
  }
}

/** The status a campaign would reach after `event`, or null if not allowed. */
export function nextStatus(from: CampaignStatus, event: CampaignEvent): CampaignStatus | null {
  return TRANSITIONS[from][event] ?? null;
}

export function canApply(from: CampaignStatus, event: CampaignEvent): boolean {
  return nextStatus(from, event) !== null;
}

/** Apply an event, returning the new status or throwing InvalidTransitionError. */
export function applyEvent(from: CampaignStatus, event: CampaignEvent): CampaignStatus {
  const to = nextStatus(from, event);
  if (to === null) throw new InvalidTransitionError(from, event);
  return to;
}

export function allowedEvents(from: CampaignStatus): CampaignEvent[] {
  return Object.keys(TRANSITIONS[from]) as CampaignEvent[];
}

export const TERMINAL_STATUSES: CampaignStatus[] = ['COMPLETED', 'CANCELLED'];
export function isTerminal(status: CampaignStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/** Statuses a telco operator should see in the approval queue. */
export const TELCO_APPROVAL_QUEUE_STATUSES: CampaignStatus[] = ['PENDING_TELCO_APPROVAL'];
