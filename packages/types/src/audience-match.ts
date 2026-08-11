/**
 * Audience-match engine contract (WP02C). Three metrics are kept strictly
 * distinct and never conflated: Eligible Audience, Selected Target, Forecast
 * Reach. All figures are deterministic aggregate demonstration estimates — no
 * individual subscribers are ever modelled or returned (spec §16, §25).
 */
import type { DeviceClass } from './capability';

export interface AudienceCriteria {
  geographies: string[];
  ageBands: string[];
  /** Device classes the advertiser is willing to include. */
  devices: Array<'smartphone' | 'feature_phone'>;
  /** Aggregate data-use cohorts: light | medium | heavy. */
  dataUse: string[];
  /** Aggregate recharge/spend bands. */
  spendBands: string[];
  /** Broad permitted affinities (FMCG, sports, …). */
  affinities: string[];
  /** Aggregate engagement cohorts. */
  engagement: string[];
  /** Language strategy (en, pcm, yo, ha, ig). */
  languages: string[];
}

/** Minimal per-capability descriptor the estimator needs (caller derives it). */
export interface MatchCapabilityInput {
  id: string;
  name: string;
  deviceClass: DeviceClass;
  pricingModel: string;
  networkStatus: string;
}

export interface AudienceMatchInput {
  criteria: AudienceCriteria;
  capabilities: MatchCapabilityInput[];
  /** Desired target size; clamped server-side to <= eligibleAudience. */
  selectedTarget?: number;
  /** Override the addressable base pool (default: MTN demo base). */
  basePool?: number;
}

export interface FunnelStage {
  stage: string;
  value: number;
}

export interface FormatEstimate {
  capabilityId: string;
  name: string;
  eligible: number;
  allocation: number;
  forecast: number;
  pricingModel: string;
  costMinor: number;
  /** False when the capability is incompatible with the chosen device mix. */
  compatible: boolean;
}

export interface ForecastReach {
  low: number;
  point: number;
  high: number;
}

export interface AudienceMatchResult {
  estimatorVersion: string;
  basePool: number;
  funnel: FunnelStage[];
  eligibleAudience: number;
  selectedTarget: number;
  forecastReach: ForecastReach;
  frequency: number;
  estimatedCostMinor: number;
  perFormat: FormatEstimate[];
  privacy: {
    threshold: number;
    /** True when the criteria narrow the audience below the privacy threshold. */
    tooNarrow: boolean;
  };
  currency: 'NGN';
}

/** Persisted with a submitted campaign; MTN reviews the same snapshot (spec §37). */
export interface AudienceEstimateSnapshot {
  estimatorVersion: string;
  estimatedAt: string;
  criteria: AudienceCriteria;
  capabilityIds: string[];
  eligibleAudience: number;
  selectedTarget: number;
  forecastReach: ForecastReach;
  frequency: number;
  estimatedCostMinor: number;
  formatAllocation: Array<{ capabilityId: string; allocation: number; forecast: number; costMinor: number }>;
  languageStrategy: string[];
}
