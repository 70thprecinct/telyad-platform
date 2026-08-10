import { describe, expect, it } from 'vitest';
import {
  allowedEvents,
  applyEvent,
  canApply,
  InvalidTransitionError,
  isTerminal,
  nextStatus,
} from './lifecycle';

describe('campaign lifecycle state machine', () => {
  it('drives the Wednesday demo path: DRAFT → PENDING_TELCO_APPROVAL → APPROVED', () => {
    const submitted = applyEvent('DRAFT', 'submit');
    expect(submitted).toBe('PENDING_TELCO_APPROVAL');
    const approved = applyEvent(submitted, 'approve');
    expect(approved).toBe('APPROVED');
  });

  it('supports rejection from the approval queue', () => {
    expect(applyEvent('PENDING_TELCO_APPROVAL', 'reject')).toBe('REJECTED');
  });

  it('lets a rejected campaign be revised back to DRAFT', () => {
    expect(applyEvent('REJECTED', 'revise')).toBe('DRAFT');
  });

  it('runs the live lifecycle: APPROVED → LIVE → PAUSED → LIVE → COMPLETED', () => {
    let s = applyEvent('APPROVED', 'goLive');
    expect(s).toBe('LIVE');
    s = applyEvent(s, 'pause');
    expect(s).toBe('PAUSED');
    s = applyEvent(s, 'resume');
    expect(s).toBe('LIVE');
    s = applyEvent(s, 'complete');
    expect(s).toBe('COMPLETED');
  });

  it('throws on illegal transitions', () => {
    expect(() => applyEvent('APPROVED', 'approve')).toThrow(InvalidTransitionError);
    expect(() => applyEvent('COMPLETED', 'goLive')).toThrow(InvalidTransitionError);
    expect(canApply('LIVE', 'submit')).toBe(false);
  });

  it('cannot approve a campaign that was never submitted', () => {
    expect(nextStatus('DRAFT', 'approve')).toBeNull();
  });

  it('marks terminal states', () => {
    expect(isTerminal('COMPLETED')).toBe(true);
    expect(isTerminal('CANCELLED')).toBe(true);
    expect(isTerminal('LIVE')).toBe(false);
    expect(allowedEvents('COMPLETED')).toHaveLength(0);
  });
});
