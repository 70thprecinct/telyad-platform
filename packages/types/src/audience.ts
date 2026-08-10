import { z } from 'zod';

/**
 * Audience targeting works against **abstract segments** only. An audience
 * definition and its estimate NEVER contain subscriber identities (spec §10).
 */

export const audienceDefinitionSchema = z.object({
  geographies: z.array(z.string()).default([]),
  ageBands: z.array(z.string()).default([]),
  genders: z.array(z.enum(['male', 'female', 'all'])).default(['all']),
  deviceTypes: z.array(z.string()).default([]),
  subscriberTiers: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  arpuBands: z.array(z.string()).default([]),
  networkTypes: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
});

export type AudienceDefinition = z.infer<typeof audienceDefinitionSchema>;

/**
 * Aggregate estimate returned to advertisers. Structurally forbids identity
 * leakage: only counts and ranges, no arrays of subscribers, no MSISDNs.
 */
export const audienceEstimateSchema = z
  .object({
    /** Point estimate of eligible, reachable subscribers. */
    estimatedReach: z.number().int().nonnegative(),
    /** Range for display (low/high), both aggregate counts. */
    reachLow: z.number().int().nonnegative(),
    reachHigh: z.number().int().nonnegative(),
    /** Excluded due to DND/consent — aggregate count only. */
    excludedForCompliance: z.number().int().nonnegative(),
    /** TelySignal-style quality score 0..100. */
    qualityScore: z.number().int().min(0).max(100),
    /** Deterministic seed used, so demo numbers are reproducible. */
    seed: z.string(),
  })
  .strict()
  .refine((e) => e.reachLow <= e.estimatedReach && e.estimatedReach <= e.reachHigh, {
    message: 'estimatedReach must fall within [reachLow, reachHigh]',
  });

export type AudienceEstimate = z.infer<typeof audienceEstimateSchema>;

/** Keys that must never appear in any audience payload — defence in depth. */
export const FORBIDDEN_PII_KEYS = [
  'msisdn',
  'phone',
  'phoneNumber',
  'imsi',
  'imei',
  'subscriberId',
  'subscriberName',
  'name',
  'email',
  'deviceId',
] as const;

/** Returns the offending key if a payload contains any forbidden PII field. */
export function findPiiLeak(payload: unknown): string | null {
  if (payload == null || typeof payload !== 'object') return null;
  const forbidden = new Set<string>(FORBIDDEN_PII_KEYS);
  const stack: unknown[] = [payload];
  while (stack.length) {
    const cur = stack.pop();
    if (cur == null || typeof cur !== 'object') continue;
    for (const [key, value] of Object.entries(cur as Record<string, unknown>)) {
      if (forbidden.has(key)) return key;
      if (value && typeof value === 'object') stack.push(value);
    }
  }
  return null;
}
