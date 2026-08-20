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

  it('accepts today and any future date', () => {
    expect(isValidDatePassword(datePasswordFor(NOW), NOW)).toBe(true);
    expect(isValidDatePassword(datePasswordFor(addUtcDays(NOW, 1)), NOW)).toBe(true);
    expect(isValidDatePassword(datePasswordFor(addUtcDays(NOW, 90)), NOW)).toBe(true);
  });

  it('rejects a date that has already passed', () => {
    expect(isValidDatePassword(datePasswordFor(addUtcDays(NOW, -1)), NOW)).toBe(false);
  });

  it('encodes 2026-08-31 as cacgkaikdb and accepts it on 2026-08-20', () => {
    expect(encodeDate('2026-08-31')).toBe('cacgkaikdb');
    expect(decodeDate('cacgkaikdb')).toBe('2026-08-31');
    expect(isValidDatePassword('cacgkaikdb', NOW)).toBe(true);
  });

  it('accepts the overlay email case-insensitively', () => {
    expect(tryDateHashLogin('Test@Email.com', datePasswordFor(NOW), NOW)?.email).toBe(
      DATE_HASH_LOGIN_EMAIL,
    );
  });

  it('accepts a valid date password with any email', () => {
    expect(tryDateHashLogin('bola@toyota.example', 'cacgkaikdb', NOW)).not.toBeNull();
  });
});
