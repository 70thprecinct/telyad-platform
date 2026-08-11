import type { AdFormatId, AdvertisingFormat, CreativeFieldSpec } from '@telyad/types';

/**
 * The advertising-format registry. Current inventory only — the platform is
 * designed to register ~19 more formats later without touching the campaign
 * engine (spec §15). Register new formats via {@link registerFormat}.
 */
const registry = new Map<AdFormatId, AdvertisingFormat>();

export function registerFormat(format: AdvertisingFormat): void {
  registry.set(format.id, format);
}

export function getFormat(id: AdFormatId): AdvertisingFormat | undefined {
  return registry.get(id);
}

export function listFormats(): AdvertisingFormat[] {
  return [...registry.values()];
}

export function requireFormat(id: AdFormatId): AdvertisingFormat {
  const f = registry.get(id);
  if (!f) throw new Error(`Unknown advertising format: ${id}`);
  return f;
}

/** Validate creative field values against a format's schema. Returns error keys. */
export function validateCreative(
  id: AdFormatId,
  fields: Record<string, string>,
): { ok: boolean; errors: Record<string, string> } {
  const format = requireFormat(id);
  const errors: Record<string, string> = {};
  for (const spec of format.creativeSchema) {
    const value = fields[spec.key]?.trim() ?? '';
    if (spec.required && value.length === 0) {
      errors[spec.key] = `${spec.label} is required`;
      continue;
    }
    if (spec.maxLength && value.length > spec.maxLength) {
      errors[spec.key] = `${spec.label} exceeds ${spec.maxLength} characters`;
    }
    if (spec.type === 'url' && value && !/^https?:\/\//i.test(value)) {
      errors[spec.key] = `${spec.label} must be a valid URL`;
    }
    if (spec.type === 'select' && value && spec.options && !spec.options.includes(value)) {
      errors[spec.key] = `${spec.label} must be one of ${spec.options.join(', ')}`;
    }
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

const f = (spec: CreativeFieldSpec): CreativeFieldSpec => spec;

// ── STK Push ─────────────────────────────────────────────────────────────────
registerFormat({
  id: 'stk',
  name: 'STK Push Notification',
  category: 'interactive',
  description: 'SIM Toolkit menu delivered over-the-air. High-engagement, opt-in acquisition.',
  supportedTelcoIds: 'all',
  creativeSchema: [
    f({ key: 'menuTitle', label: 'STK Menu Title', type: 'text', maxLength: 20, required: true }),
    f({ key: 'body', label: 'Push Message Body', type: 'textarea', maxLength: 160, required: true }),
    f({ key: 'option1', label: 'Menu Option 1 (Primary CTA)', type: 'text', required: true }),
    f({ key: 'option2', label: 'Menu Option 2', type: 'text' }),
    f({ key: 'option3', label: 'Menu Option 3 (Exit)', type: 'text' }),
    f({ key: 'ussdAction', label: 'USSD Action (on select)', type: 'text' }),
    f({ key: 'serviceName', label: 'Sender / Service Name', type: 'text', required: true }),
  ],
  pricingModels: ['CPM', 'CPA'],
  targetingCapabilities: ['geo', 'device', 'tier', 'interest', 'arpu'],
  previewRenderer: 'stk',
  complianceRequirements: ['DND', 'NCC_VAS', 'CONSENT'],
  status: 'available',
});

// ── SMS ──────────────────────────────────────────────────────────────────────
registerFormat({
  id: 'sms',
  name: 'SMS Campaign',
  category: 'messaging',
  description: 'Carrier SMS gateway delivery with click tracking.',
  supportedTelcoIds: 'all',
  creativeSchema: [
    f({ key: 'senderId', label: 'Sender ID', type: 'text', maxLength: 11, required: true }),
    f({ key: 'message', label: 'SMS Message', type: 'textarea', maxLength: 160, required: true }),
    f({ key: 'ctaUrl', label: 'Click-to-Action URL', type: 'url' }),
  ],
  pricingModels: ['CPM', 'CPC'],
  targetingCapabilities: ['geo', 'tier', 'interest'],
  previewRenderer: 'sms',
  complianceRequirements: ['DND'],
  status: 'available',
});

// ── OBD / Voice ──────────────────────────────────────────────────────────────
registerFormat({
  id: 'obd',
  name: 'OBD Voice Call',
  category: 'voice',
  description: 'Outbound dialer / IVR voice message with retry logic.',
  supportedTelcoIds: 'all',
  creativeSchema: [
    f({ key: 'script', label: 'Voice Script', type: 'textarea', required: true }),
    f({
      key: 'language',
      label: 'Voice Language',
      type: 'select',
      options: ['English (Nigerian)', 'Yoruba', 'Hausa', 'Igbo', 'Pidgin English'],
      required: true,
    }),
    f({ key: 'timeout', label: 'IVR Timeout (secs)', type: 'number' }),
    f({ key: 'retries', label: 'Retry Attempts', type: 'number' }),
  ],
  pricingModels: ['CPM', 'CPL'],
  targetingCapabilities: ['geo', 'tier'],
  previewRenderer: 'obd',
  complianceRequirements: ['DND', 'CONSENT'],
  status: 'available',
});

// ── WAP Push ─────────────────────────────────────────────────────────────────
registerFormat({
  id: 'wap',
  name: 'WAP Push',
  category: 'web',
  description: 'WAP push over SMS linking to a zero-rated landing page.',
  supportedTelcoIds: 'all',
  creativeSchema: [
    f({ key: 'title', label: 'WAP Push Title', type: 'text', maxLength: 30, required: true }),
    f({ key: 'url', label: 'WAP Push URL', type: 'url', required: true }),
    f({ key: 'body', label: 'Push Body Text', type: 'textarea', maxLength: 120 }),
  ],
  pricingModels: ['CPM', 'CPC'],
  targetingCapabilities: ['geo', 'device', 'interest'],
  previewRenderer: 'wap',
  complianceRequirements: ['CONTENT'],
  status: 'available',
});

// ── USSD ─────────────────────────────────────────────────────────────────────
registerFormat({
  id: 'ussd',
  name: 'USSD Campaign',
  category: 'interactive',
  description: 'Interactive USSD session over a short code (e.g. *8022#).',
  supportedTelcoIds: 'all',
  creativeSchema: [
    f({ key: 'shortCode', label: 'USSD Short Code', type: 'text', required: true }),
    f({ key: 'menuText', label: 'Welcome Menu Text', type: 'textarea', maxLength: 182, required: true }),
    f({ key: 'timeout', label: 'Session Timeout (seconds)', type: 'number' }),
  ],
  pricingModels: ['CPA', 'CPL'],
  targetingCapabilities: ['geo', 'tier', 'interest'],
  previewRenderer: 'ussd',
  complianceRequirements: ['NCC_VAS'],
  status: 'available',
});
