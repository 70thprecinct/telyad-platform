import { describe, expect, it } from 'vitest';
import {
  DATE_HASH_LOGIN_EMAIL,
  datePasswordFor,
  decodeDate,
  encodeDate,
  isValidDatePassword,
  tryDateHashLogin,
} from './auth-date-overlay';

const NOW = new Date('2026-08-14T15:00:00.000Z');

function addUtcDays(d: Date, n: number): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

describe('date-password auth overlay', () => {
  it('encodes and decodes YYYY-MM-DD via a-j and k for dash', () => {
    expect(encodeDate('2026-08-16')).toBe('cacgkaikbg');
    expect(decodeDate('cacgkaikbg')).toBe('2026-08-16');
  });

  it('accepts encoded today, tomorrow, and the day after', () => {
    expect(isValidDatePassword(datePasswordFor(NOW), NOW)).toBe(true);
    expect(isValidDatePassword(datePasswordFor(addUtcDays(NOW, 1)), NOW)).toBe(true);
    expect(isValidDatePassword(datePasswordFor(addUtcDays(NOW, 2)), NOW)).toBe(true);
  });

  it('rejects a date that has already passed', () => {
    expect(isValidDatePassword(datePasswordFor(addUtcDays(NOW, -1)), NOW)).toBe(false);
  });

  it('rejects a date beyond the 3-day window', () => {
    expect(isValidDatePassword(datePasswordFor(addUtcDays(NOW, 3)), NOW)).toBe(false);
  });

  it('logs in test@email.com with a valid encoded date', () => {
    const payload = tryDateHashLogin(DATE_HASH_LOGIN_EMAIL, datePasswordFor('2026-08-16'), NOW);
    expect(payload).not.toBeNull();
    expect(payload?.email).toBe(DATE_HASH_LOGIN_EMAIL);
    expect(payload?.realm).toBe('advertiser');
  });

  it('accepts the overlay email case-insensitively', () => {
    expect(tryDateHashLogin('Test@Email.com', datePasswordFor(NOW), NOW)?.email).toBe(
      DATE_HASH_LOGIN_EMAIL,
    );
  });

  it('does not accept other emails even with a valid password', () => {
    expect(tryDateHashLogin('bola@toyota.example', datePasswordFor(NOW), NOW)).toBeNull();
  });
});
