/**
 * Money is represented everywhere as an integer number of **minor units**
 * (e.g. kobo for NGN, cents for USD). Never use floats for money.
 */

export const CURRENCIES = ['NGN', 'USD', 'GHS', 'KES', 'TZS', 'ZAR'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export interface Money {
  /** Integer minor units. 1_000_00 === ₦1,000.00 for NGN. */
  readonly minor: number;
  readonly currency: CurrencyCode;
}

export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  NGN: '₦',
  USD: '$',
  GHS: 'GH₵',
  KES: 'KSh',
  TZS: 'TSh',
  ZAR: 'R',
};

/** Whether a value is a valid money minor-unit amount (safe integer, >= 0). */
export function isValidMinor(minor: number): boolean {
  return Number.isSafeInteger(minor) && minor >= 0;
}

export function money(minor: number, currency: CurrencyCode = 'NGN'): Money {
  if (!isValidMinor(minor)) {
    throw new RangeError(`Invalid money minor amount: ${minor}`);
  }
  return { minor, currency };
}

/** Build Money from a major-unit decimal (e.g. 1000.50) — validates 2dp. */
export function fromMajor(major: number, currency: CurrencyCode = 'NGN'): Money {
  const minor = Math.round(major * 100);
  if (Math.abs(major * 100 - minor) > 1e-6) {
    throw new RangeError(`Amount ${major} has sub-minor-unit precision`);
  }
  return money(minor, currency);
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.minor + b.minor, a.currency);
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.minor - b.minor, a.currency);
}

/** Split an amount by a basis-points share (e.g. 8000 bps = 80%). Integer-safe. */
export function shareOf(amount: Money, basisPoints: number): Money {
  if (!Number.isInteger(basisPoints) || basisPoints < 0 || basisPoints > 10_000) {
    throw new RangeError(`basisPoints must be an integer 0..10000, got ${basisPoints}`);
  }
  return money(Math.round((amount.minor * basisPoints) / 10_000), amount.currency);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new TypeError(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

export interface FormatMoneyOptions {
  /** Show minor units (kobo). Default false → whole-major, grouped. */
  showMinor?: boolean;
  /** Compact large numbers: ₦568M. Default false. */
  compact?: boolean;
}

export function formatMoney(m: Money, opts: FormatMoneyOptions = {}): string {
  const symbol = CURRENCY_SYMBOL[m.currency];
  const major = m.minor / 100;
  if (opts.compact) {
    return `${symbol}${compactNumber(major)}`;
  }
  const fractionDigits = opts.showMinor ? 2 : 0;
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(major);
  return `${symbol}${formatted}`;
}

export function compactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${trim(n / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (abs >= 1_000) return `${trim(n / 1_000)}K`;
  return `${n}`;
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '');
}
