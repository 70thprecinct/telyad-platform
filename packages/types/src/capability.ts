/**
 * The TelyAd Capability Universe (WP02B).
 *
 * A "capability" is richer than the creatable `AdvertisingFormat`: it is a
 * marketable carrier-advertising capability described along independent
 * dimensions (placement · creative type · trigger · mechanic · journey) rather
 * than a single flat format. The 5 concrete creatable formats
 * (`@telyad/ad-formats` registry) remain the campaign-creation vehicles; the
 * capability catalogue is the marketplace/planner/inventory surface across all 48.
 *
 * Governing principle (shown across the product): TelyAd supports a broad
 * portfolio of carrier-powered advertising capabilities. Availability and
 * delivery are subject to participating network capabilities, technical
 * integration, regulatory requirements and network approval.
 */

import type { PreviewContent, PreviewRenderer } from './preview';

// ── Where an ad appears ──────────────────────────────────────────────────────
export const PLACEMENTS = [
  'sms',
  'ussd',
  'stk',
  'voice',
  'end_of_call',
  'billing_receipt',
  'notification',
  'lock_screen',
  'telco_app',
  'web_portal',
  'wifi_portal',
  'rcs',
  'whatsapp',
  'search',
  'dooh',
] as const;
export type Placement = (typeof PLACEMENTS)[number];

// ── Creative form ────────────────────────────────────────────────────────────
export const CREATIVE_TYPES = [
  'text',
  'interactive_menu',
  'voice',
  'rich_card',
  'image',
  'video',
  'banner',
  'native_card',
  'survey',
  'voucher',
] as const;
export type CreativeType = (typeof CREATIVE_TYPES)[number];

// ── What triggers delivery ───────────────────────────────────────────────────
export const TRIGGERS = [
  'scheduled',
  'recharge',
  'data_purchase',
  'balance_enquiry',
  'call_end',
  'session_event',
  'geo',
  'time_context',
  'network_event',
] as const;
export type Trigger = (typeof TRIGGERS)[number];

// ── Campaign mechanic ────────────────────────────────────────────────────────
export const MECHANICS = [
  'awareness',
  'engagement',
  'conversion',
  'acquisition',
  'lead_generation',
  'reward',
  'coupon',
  'competition',
  'survey',
  'subscription',
] as const;
export type Mechanic = (typeof MECHANICS)[number];

// ── Journey shape ────────────────────────────────────────────────────────────
export const JOURNEY_TYPES = ['single', 'retargeting', 'sequential', 'cross_channel', 'win_back'] as const;
export type JourneyType = (typeof JOURNEY_TYPES)[number];

// ── Capability families (marketplace grouping) ───────────────────────────────
export const CAPABILITY_FAMILIES = [
  'messaging',
  'ussd_interactive',
  'voice',
  'sim_device',
  'carrier_digital_media',
  'billing_network_events',
  'sponsored_connectivity_rewards',
  'commerce_performance',
  'location_context',
  'journey_retargeting',
  'research_insights',
  'advanced_media',
] as const;
export type CapabilityFamily = (typeof CAPABILITY_FAMILIES)[number];

export const CAPABILITY_FAMILY_LABELS: Record<CapabilityFamily, string> = {
  messaging: 'Messaging',
  ussd_interactive: 'USSD & Interactive',
  voice: 'Voice',
  sim_device: 'SIM & Device',
  carrier_digital_media: 'Carrier Digital Media',
  billing_network_events: 'Billing & Network Events',
  sponsored_connectivity_rewards: 'Sponsored Connectivity & Rewards',
  commerce_performance: 'Commerce & Performance',
  location_context: 'Location & Context',
  journey_retargeting: 'Journey & Retargeting',
  research_insights: 'Research & Insights',
  advanced_media: 'Advanced Media',
};

// ── Network-capability lifecycle ─────────────────────────────────────────────
export const CAPABILITY_STATUSES = [
  'TELYAD_SUPPORTED',
  'NETWORK_APPROVAL_REQUIRED',
  'INTEGRATION_REQUIRED',
  'PILOT',
  'LIVE',
  'DISABLED',
  'FUTURE_CAPABILITY',
] as const;
export type CapabilityStatus = (typeof CAPABILITY_STATUSES)[number];

export const CAPABILITY_STATUS_LABELS: Record<CapabilityStatus, string> = {
  TELYAD_SUPPORTED: 'TelyAd Capability — Network Enablement Required',
  NETWORK_APPROVAL_REQUIRED: 'Network Approval Required',
  INTEGRATION_REQUIRED: 'Integration Required',
  PILOT: 'Pilot',
  LIVE: 'Live',
  DISABLED: 'Disabled',
  FUTURE_CAPABILITY: 'Future Capability',
};

/** Only LIVE capabilities may be presented to advertisers as live on a network. */
export function isNetworkLive(status: CapabilityStatus): boolean {
  return status === 'LIVE' || status === 'PILOT';
}

// ── Device & product applicability ───────────────────────────────────────────
export const DEVICE_CLASSES = ['smartphone', 'feature_phone', 'both'] as const;
export type DeviceClass = (typeof DEVICE_CLASSES)[number];

export const PRODUCT_APPLICABILITY = ['telyads', 'telydial'] as const;
export type ProductApplicability = (typeof PRODUCT_APPLICABILITY)[number];

// ── Pricing (extends the campaign PricingModel set) ──────────────────────────
export const CAPABILITY_PRICING_MODELS = [
  'CPM',
  'CPC',
  'CPA',
  'CPL',
  'CPD',
  'REVSHARE',
  'FIXED',
  'HYBRID',
] as const;
export type CapabilityPricingModel = (typeof CAPABILITY_PRICING_MODELS)[number];

// ── Languages (multilingual advertising) ─────────────────────────────────────
export const LANGUAGES = ['en', 'pcm', 'yo', 'ha', 'ig'] as const;
export type LanguageCode = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  pcm: 'Nigerian Pidgin',
  yo: 'Yoruba',
  ha: 'Hausa',
  ig: 'Igbo',
};

// ── The capability descriptor ────────────────────────────────────────────────
export interface AdCapability {
  /** 1..48 canonical number. */
  number: number;
  /** Stable slug id. */
  id: string;
  name: string;
  family: CapabilityFamily;
  placement: Placement;
  creativeTypes: CreativeType[];
  triggers: Trigger[];
  mechanics: Mechanic[];
  journeyTypes: JourneyType[];
  deviceClass: DeviceClass;
  products: ProductApplicability[];
  objectives: string[];
  pricingModels: CapabilityPricingModel[];
  targetingCapabilities: string[];
  /** TelyAd platform support status (what TelyAd can do). */
  telyadStatus: CapabilityStatus;
  /** Default demo network (MTN) availability status. Overridable per telco. */
  defaultNetworkStatus: CapabilityStatus;
  complianceRequirements: string[];
  description: string;
  bestUseCases: string[];
  recommendedSectors: string[];
  /** Capability-specific subscriber-experience renderer (no generic fallback). */
  previewRenderer: PreviewRenderer;
  /** Deterministic representative sample content for the marketplace preview. */
  sample: PreviewContent;
  characterLimit?: number;
  frequencyConcept?: string;
  sequenceConcept?: string;
  /** If this capability maps to a creatable format, its AdFormatId. */
  creatableFormatId?: string;
}

/** Per-telco override of a capability's availability (governance). */
export interface TelcoCapabilityAvailability {
  telcoId: string;
  capabilityId: string;
  status: CapabilityStatus;
  updatedAt: string;
}
