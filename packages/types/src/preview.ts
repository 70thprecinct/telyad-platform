/**
 * Capability experience-preview contract (WP02C).
 *
 * Every one of the 48 capabilities maps to exactly one PreviewRenderer — a
 * capability-specific subscriber-experience visual, not a single phone frame.
 * There is deliberately NO generic fallback renderer: a capability with no
 * mapping is a bug caught by tests.
 */

export const PREVIEW_RENDERERS = [
  'sms',
  'flash_sms',
  'ussd',
  'voice_call',
  'end_of_call',
  'stk',
  'wap_push',
  'lock_screen',
  'notification',
  'browser',
  'receipt',
  'journey',
  'sponsored_data',
  'reward',
  'captive_portal',
  'rcs',
  'whatsapp',
  'interactive_message',
  'carrier_app',
  'video',
  'search',
  'geo',
  'trigger',
  'voucher',
  'survey',
  'lead_form',
  'competition',
  'dooh',
] as const;
export type PreviewRenderer = (typeof PREVIEW_RENDERERS)[number];

/** One step in a journey/sequence preview. */
export interface PreviewStep {
  channel: string;
  label: string;
  delay?: string;
}

/**
 * Content shown inside a preview. All fields optional so one shape serves every
 * renderer; the marketplace fills it from a capability's `sample`, the wizard
 * fills it live from creative + the selected (reviewed) language variant.
 */
export interface PreviewContent {
  brand?: string;
  sender?: string;
  title?: string;
  body?: string;
  cta?: string;
  cta2?: string;
  cta3?: string;
  offer?: string;
  code?: string;
  reward?: string;
  amount?: string;
  url?: string;
  question?: string;
  options?: string[];
  appName?: string;
  note?: string;
  steps?: PreviewStep[];
}

/** Human-readable label per renderer (for UIs and tests). */
export const PREVIEW_RENDERER_LABELS: Record<PreviewRenderer, string> = {
  sms: 'SMS',
  flash_sms: 'Flash SMS (Class 0)',
  ussd: 'USSD session',
  voice_call: 'Voice call',
  end_of_call: 'End of call',
  stk: 'SIM Toolkit',
  wap_push: 'WAP push',
  lock_screen: 'Lock screen',
  notification: 'Notification shade',
  browser: 'Browser / portal',
  receipt: 'Billing receipt',
  journey: 'Journey timeline',
  sponsored_data: 'Sponsored data',
  reward: 'Reward',
  captive_portal: 'Captive portal',
  rcs: 'RCS rich message',
  whatsapp: 'Business message',
  interactive_message: 'Interactive message',
  carrier_app: 'Carrier app',
  video: 'Video',
  search: 'Sponsored search',
  geo: 'Geo / location',
  trigger: 'Context trigger',
  voucher: 'Coupon / voucher',
  survey: 'Survey / poll',
  lead_form: 'Lead form',
  competition: 'Competition / instant win',
  dooh: 'Digital out-of-home',
};
