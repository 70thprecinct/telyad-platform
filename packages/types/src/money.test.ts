import { describe, expect, it } from 'vitest';
import { addMoney, formatMoney, fromMajor, isValidMinor, money, shareOf } from './money.js';
import { budgetSchema } from './dto.js';

describe('money (integer minor units)', () => {
  it('rejects non-integer / negative minor amounts', () => {
    expect(isValidMinor(1000)).toBe(true);
    expect(isValidMinor(-1)).toBe(false);
    expect(isValidMinor(10.5)).toBe(false);
    expect(() => money(10.5)).toThrow(RangeError);
  });

  it('builds from major units and rejects sub-minor precision', () => {
    expect(fromMajor(1000.5).minor).toBe(100050);
    expect(() => fromMajor(1.005)).toThrow(RangeError);
  });

  it('adds only within the same currency', () => {
    expect(addMoney(money(100), money(50)).minor).toBe(150);
    expect(() => addMoney(money(100, 'NGN'), money(50, 'USD'))).toThrow(TypeError);
  });

  it('splits by basis points without float drift (80/20)', () => {
    const spend = money(710_000_000_00); // ₦710M
    const telcoShare = shareOf(spend, 8000);
    const telyShare = shareOf(spend, 2000);
    expect(telcoShare.minor + telyShare.minor).toBe(spend.minor);
  });

  it('formats compactly', () => {
    expect(formatMoney(money(568_000_000_00), { compact: true })).toBe('₦568M');
  });
});

describe('budget validation', () => {
  const valid = {
    pricingModel: 'CPM' as const,
    dailyCap: { minor: 50_000_00, currency: 'NGN' as const },
    total: { minor: 500_000_00, currency: 'NGN' as const },
    startDate: '2026-08-14',
    endDate: '2026-08-28',
    deliverySpeed: 'standard' as const,
  };

  it('accepts a well-formed budget', () => {
    expect(budgetSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a daily cap greater than the total budget', () => {
    const bad = { ...valid, dailyCap: { minor: 900_000_00, currency: 'NGN' as const } };
    expect(budgetSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an end date before the start date', () => {
    const bad = { ...valid, endDate: '2026-08-01' };
    expect(budgetSchema.safeParse(bad).success).toBe(false);
  });
});
