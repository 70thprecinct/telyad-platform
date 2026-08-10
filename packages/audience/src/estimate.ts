import {
  audienceEstimateSchema,
  type AudienceDefinition,
  type AudienceEstimate,
} from '@telyad/types';

/**
 * Estimates aggregate, privacy-safe reach from an audience definition.
 *
 * The result is **deterministic**: identical inputs always yield identical
 * numbers, so demo figures are stable and reproducible for MTN executives
 * (unlike the prototype's `Math.random()` placeholders). No subscriber
 * identities are ever computed, stored, or returned (spec §10).
 */

export interface EstimateOptions {
  /** Total reachable subscriber pool for the telco (default: MTN NG demo). */
  basePool?: number;
}

const DEFAULT_BASE_POOL = 78_400_000; // MTN Nigeria demo reach

/** FNV-1a 32-bit hash → stable pseudo-random basis. */
function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic 0..1 from a seed string. */
function unit(seed: string): number {
  return hash32(seed) / 0xffffffff;
}

/** Narrowing factor for a targeting dimension: more selections → narrower. */
function narrowing(selected: string[], universe: number): number {
  if (selected.length === 0) return 1; // no constraint on this dimension
  // fraction of the universe covered, floored so it never collapses to zero
  return Math.max(0.05, Math.min(1, selected.length / universe));
}

export function estimateAudience(
  def: AudienceDefinition,
  opts: EstimateOptions = {},
): AudienceEstimate {
  const basePool = opts.basePool ?? DEFAULT_BASE_POOL;
  const seed = JSON.stringify(def);

  // Approximate universe sizes per dimension (demo taxonomy sizes).
  let factor = 1;
  factor *= narrowing(def.geographies, 37); // Nigerian states
  factor *= narrowing(def.ageBands, 6);
  factor *= def.genders.includes('all') || def.genders.length === 0 ? 1 : 0.52;
  factor *= narrowing(def.deviceTypes, 3);
  factor *= narrowing(def.subscriberTiers, 4);
  factor *= narrowing(def.interests, 8);
  factor *= narrowing(def.arpuBands, 4);
  factor *= narrowing(def.networkTypes, 4);
  factor *= narrowing(def.languages, 6);

  // Small deterministic jitter (±8%) so numbers look organic but stay stable.
  const jitter = 0.92 + unit(seed) * 0.16;
  const rawReach = Math.round(basePool * factor * jitter);

  // Exclusions (e.g. DND / recent subscribers) remove an aggregate slice.
  const exclusionRate = Math.min(0.25, def.exclusions.length * 0.06);
  const excludedForCompliance = Math.round(rawReach * exclusionRate);
  const estimatedReach = Math.max(0, rawReach - excludedForCompliance);

  const reachLow = Math.round(estimatedReach * 0.88);
  const reachHigh = Math.round(estimatedReach * 1.12);

  // Quality score: more specific targeting scores higher (fewer, sharper picks).
  const specificity =
    def.geographies.length +
    def.interests.length +
    def.subscriberTiers.length +
    def.arpuBands.length;
  const qualityScore = Math.max(40, Math.min(100, 55 + specificity * 4));

  const estimate: AudienceEstimate = {
    estimatedReach,
    reachLow,
    reachHigh,
    excludedForCompliance,
    qualityScore,
    seed: seed.length.toString(36) + '-' + hash32(seed).toString(36),
  };

  // Validate against the shared schema — guarantees no PII, correct invariants.
  return audienceEstimateSchema.parse(estimate);
}
