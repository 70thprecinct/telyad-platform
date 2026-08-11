import type { CapabilityPricingModel, LanguageCode } from './capability';

/**
 * DTOs for the TelyAd intelligence layer. The implementations
 * (`@telyad/intelligence`) are deterministic, rule-based **demonstration
 * intelligence** behind clean interfaces so a real AI provider can be swapped
 * in later. Nothing here is production ML.
 */

// ── Media planning ───────────────────────────────────────────────────────────
export interface MediaPlanRequest {
  sector: string;
  objective: string;
  budgetMinor: number;
  currency: string;
  geographies: string[];
  deviceMix: 'both' | 'smartphone' | 'feature_phone';
  languages: LanguageCode[];
  durationDays: number;
  desiredAction?: string;
}

export interface MediaPlanItem {
  capabilityId: string;
  capabilityName: string;
  family: string;
  sharePct: number;
  budgetMinor: number;
  reason: string;
  estimatedReach: number;
  pricingModel: CapabilityPricingModel;
  networkStatus: string;
}

export interface MediaPlan {
  request: MediaPlanRequest;
  items: MediaPlanItem[];
  totalEstimatedReach: number;
  estimatedFrequency: number;
  networkWarnings: string[];
  notes: string;
  generatedBy: 'demonstration-rules';
}

// ── Multilingual ─────────────────────────────────────────────────────────────
export interface LanguageVariant {
  language: LanguageCode;
  text: string;
  cta?: string;
  status: 'draft' | 'approved';
  requiresReview: boolean;
  charCount: number;
  charLimit?: number;
  withinLimit: boolean;
  lockedTerms: string[];
}

// ── Creative intelligence ────────────────────────────────────────────────────
export interface CreativeSuggestion {
  text: string;
  charCount: number;
  charLimit?: number;
  withinLimit: boolean;
  qualityScore: number; // 0..100
  readabilityScore: number; // 0..100
  warnings: string[];
}

// ── Audience opportunity ─────────────────────────────────────────────────────
export interface AudienceOpportunity {
  title: string;
  reason: string;
  incrementalReach: number;
  budgetImpactMinor: number;
  action: string;
}

// ── Budget scenarios / forecast ──────────────────────────────────────────────
export interface BudgetScenario {
  name: 'Conservative' | 'Balanced' | 'Maximum Reach' | 'Maximum Engagement';
  spendMinor: number;
  estimatedReach: number;
  estimatedFrequency: number;
  estimatedEngagement: number;
  estimatedConversions: number;
}

// ── Telco revenue intelligence ───────────────────────────────────────────────
export interface RevenueSlice {
  label: string;
  amountMinor: number;
  sharePct: number;
}
export interface RevenueIntelligenceReport {
  totalRevenueMinor: number;
  currency: string;
  byFamily: RevenueSlice[];
  byIndustry: RevenueSlice[];
  byPricingModel: RevenueSlice[];
  inventoryUtilisation: { capabilityId: string; capabilityName: string; utilisationPct: number }[];
  projectedMonthlyRevenueMinor: number;
  opportunities: { title: string; detail: string; estimatedUpsideMinor: number }[];
  generatedBy: 'demonstration-rules';
}
