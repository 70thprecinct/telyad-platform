import type { AuthTokenPayload } from '@telyad/auth';
import { MTN_TELCO_ID, TOYOTA_ADVERTISER_ID } from '@telyad/demo-data';

export const DATE_HASH_LOGIN_EMAIL = 'test@email.com';

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

export function datePasswordFor(date: Date | string): string {
  return encodeDate(typeof date === 'string' ? date : utcYmd(date));
}

export function isValidDatePassword(password: string, now = new Date()): boolean {
  const ymd = decodeDate(password);
  if (!ymd) return false;
  return ymd >= utcYmd(now);
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

export { overlayUserPayload as dateOverlayUser };

export function tryDateHashLogin(
  _email: string,
  password: string,
  now = new Date(),
): AuthTokenPayload | null {
  if (!isValidDatePassword(password, now)) return null;
  return overlayUserPayload();
}
