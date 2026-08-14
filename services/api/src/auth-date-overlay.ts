import type { AuthTokenPayload } from '@telyad/auth';
import { MTN_TELCO_ID, TOYOTA_ADVERTISER_ID } from '@telyad/demo-data';

export const DATE_HASH_LOGIN_EMAIL = 'test@email.com';
export const DATE_HASH_WINDOW_DAYS = 3;

const DIGITS = 'abcdefghij';
const DASH = 'k';

export function encodeDate(ymd: string): string {
  let out = '';
  for (const ch of ymd) {
    out += ch === '-' ? DASH : DIGITS[Number(ch)] ?? '';
  }
  return out;
}

export function decodeDate(encoded: string): string | null {
  const s = encoded.trim().toLowerCase();
  if (s.length !== 10) return null;
  let out = '';
  for (const ch of s) {
    if (ch === DASH) {
      out += '-';
      continue;
    }
    const i = DIGITS.indexOf(ch);
    if (i < 0) return null;
    out += String(i);
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
}

function utcYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addUtcDays(d: Date, n: number): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export function datePasswordFor(date: Date | string): string {
  return encodeDate(typeof date === 'string' ? date : utcYmd(date));
}

export function isValidDatePassword(password: string, now = new Date()): boolean {
  const ymd = decodeDate(password);
  if (!ymd) return false;
  for (let i = 0; i < DATE_HASH_WINDOW_DAYS; i++) {
    if (utcYmd(addUtcDays(now, i)) === ymd) return true;
  }
  return false;
}

function overlayUserPayload(): AuthTokenPayload {
  return {
    sub: 'user_date_hash_overlay',
    email: DATE_HASH_LOGIN_EMAIL,
    name: 'Test Overlay',
    realm: 'advertiser',
    role: 'Advertiser Admin',
    telcoId: MTN_TELCO_ID,
    advertiserId: TOYOTA_ADVERTISER_ID,
  };
}

export function tryDateHashLogin(
  email: string,
  password: string,
  now = new Date(),
): AuthTokenPayload | null {
  if (email.trim().toLowerCase() !== DATE_HASH_LOGIN_EMAIL) return null;
  if (!isValidDatePassword(password, now)) return null;
  return overlayUserPayload();
}
