import type { AdCapability, CapabilityFamily, CapabilityStatus } from '@telyad/types';

/**
 * The TelyAd Capability Universe — 48 carrier-advertising capabilities.
 *
 * Formats 01–19 are authored from the canonical prototype
 * (`reference/nineteen-formats-prototype.html`); 20–48 are the WP02B expansion.
 * These are TelyAd *capabilities* — `defaultNetworkStatus` reflects a
 * demonstration MTN posture and is overridable per telco via governance. Only
 * LIVE/PILOT may be presented to advertisers as available on the network.
 */

type CapInput = Pick<AdCapability, 'number' | 'id' | 'name' | 'family' | 'placement'> &
  Partial<AdCapability>;

function cap(c: CapInput): AdCapability {
  return {
    creativeTypes: ['text'],
    triggers: ['scheduled'],
    mechanics: ['awareness'],
    journeyTypes: ['single'],
    deviceClass: 'both',
    products: ['telyads'],
    objectives: ['Awareness'],
    pricingModels: ['CPM'],
    targetingCapabilities: ['geo', 'device', 'tier'],
    telyadStatus: 'TELYAD_SUPPORTED',
    defaultNetworkStatus: 'NETWORK_APPROVAL_REQUIRED',
    complianceRequirements: ['DND', 'Consent'],
    description: '',
    bestUseCases: [],
    recommendedSectors: [],
    previewRenderer: 'sms',
    sample: {},
    ...c,
  };
}

const CAPABILITIES: AdCapability[] = [
  // ── SMS (1–4) — Messaging ───────────────────────────────────────────────────
  cap({
    number: 1, id: 'standard_sms', name: 'Standard SMS', family: 'messaging', placement: 'sms',
    creativeTypes: ['text'], mechanics: ['awareness', 'conversion'], products: ['telyads', 'telydial'],
    objectives: ['Awareness', 'Conversion'], pricingModels: ['CPM', 'REVSHARE'], characterLimit: 160,
    telyadStatus: 'LIVE', defaultNetworkStatus: 'LIVE', previewRenderer: 'sms', creatableFormatId: 'sms',
    description: 'MT bulk SMS via shortcode with sender ID. The workhorse of carrier messaging.',
    bestUseCases: ['Mass awareness', 'Promotions', 'Reminders'], recommendedSectors: ['FMCG', 'Banking', 'Retail'],
    complianceRequirements: ['DND', 'Opt-out mandatory', 'Consent'],
    sample: {
      brand: 'Maltina', sender: 'Maltina', title: 'Refresh with Maltina',
      body: 'Buy any 2 Maltina, get 1 FREE this weekend at your nearest store. Reply STOP to opt out.',
      cta: 'Find a store',
    },
  }),
  cap({
    number: 2, id: 'flash_sms', name: 'Flash SMS (Class 0)', family: 'messaging', placement: 'sms',
    creativeTypes: ['text'], mechanics: ['conversion'], products: ['telyads', 'telydial'],
    objectives: ['Conversion'], pricingModels: ['CPM', 'CPD', 'REVSHARE'], characterLimit: 160,
    telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT', previewRenderer: 'flash_sms',
    frequencyConcept: 'Max 1 per subscriber per 72 hours (platform-enforced)',
    description: 'Class 0 message that pops over any screen and is not saved. High-attention, tightly capped.',
    bestUseCases: ['Urgent offers', 'Time-critical alerts'], recommendedSectors: ['Betting', 'Retail'],
    sample: {
      brand: 'Coca-Cola', sender: 'Coca-Cola', title: 'Flash offer — today only',
      body: 'Ice-cold Coke just ₦150 at any kiosk near you. Show this message. Ends midnight.',
      cta: 'Grab yours',
    },
  }),
  cap({
    number: 3, id: 'recharge_confirmation_sms', name: 'Recharge Confirmation SMS', family: 'billing_network_events',
    placement: 'billing_receipt', creativeTypes: ['text'], triggers: ['recharge'], mechanics: ['conversion'],
    products: ['telyads', 'telydial'], objectives: ['Conversion'], pricingModels: ['CPM', 'CPA', 'REVSHARE'],
    telyadStatus: 'LIVE', defaultNetworkStatus: 'LIVE', previewRenderer: 'receipt',
    description: 'Ad appended after the system recharge-success text — reaches a subscriber with proven spend.',
    bestUseCases: ['Post-recharge upsell', 'Data offers'], recommendedSectors: ['FMCG', 'Telco VAS'],
    sample: {
      brand: 'Maltina', sender: 'MTN', title: 'Recharge successful',
      body: 'Your airtime is live. Enjoy a cold Maltina on us — reply YES to claim a free-drink voucher.',
      cta: 'Get voucher', amount: '₦500 airtime added',
    },
  }),
  cap({
    number: 4, id: 'transactional_sms', name: 'Transactional SMS', family: 'billing_network_events',
    placement: 'billing_receipt', creativeTypes: ['text'], triggers: ['network_event'], mechanics: ['awareness', 'conversion'],
    products: ['telyads'], objectives: ['Awareness', 'Conversion'], pricingModels: ['CPM'],
    telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'NETWORK_APPROVAL_REQUIRED', previewRenderer: 'sms',
    description: 'Ad appended to a data alert, expiry notice or balance alert. TelyAds only.',
    bestUseCases: ['Contextual upsell'], recommendedSectors: ['Telco VAS', 'Banking'],
    sample: {
      brand: 'Access Bank', sender: 'MTN', title: 'Data running low',
      body: 'You have 200MB left. Top up on AccessMore and get 10% cashback on your next bundle.',
      cta: 'Top up',
    },
  }),
  // ── USSD (5–9) — USSD & Interactive ────────────────────────────────────────
  cap({
    number: 5, id: 'ussd_pre_session', name: 'USSD Pre-Session Splash', family: 'ussd_interactive', placement: 'ussd',
    creativeTypes: ['text', 'interactive_menu'], mechanics: ['conversion', 'lead_generation'], products: ['telyads', 'telydial'],
    objectives: ['Conversion', 'Lead generation'], pricingModels: ['CPM', 'CPD'],
    telyadStatus: 'LIVE', defaultNetworkStatus: 'LIVE', previewRenderer: 'ussd', creatableFormatId: 'ussd',
    description: 'Interstitial shown before the USSD menu loads — the subscriber must see it to proceed.',
    bestUseCases: ['Guaranteed impressions', 'Menu sponsorship'], recommendedSectors: ['Banking', 'Betting'],
    sample: {
      brand: 'Maltina', title: 'Sponsored by Maltina',
      options: ['1. Continue to menu', '2. Claim Maltina offer', '0. Exit'],
    },
  }),
  cap({
    number: 6, id: 'ussd_mid_session', name: 'USSD Mid-Session Inject', family: 'ussd_interactive', placement: 'ussd',
    creativeTypes: ['text', 'interactive_menu'], mechanics: ['conversion'], products: ['telyads', 'telydial'],
    objectives: ['Conversion'], pricingModels: ['CPM', 'CPD'], telyadStatus: 'LIVE', defaultNetworkStatus: 'LIVE',
    previewRenderer: 'ussd', description: 'Appended below a live USSD menu; reply with a digit to engage.',
    bestUseCases: ['In-context conversion'], recommendedSectors: ['Banking', 'Telco VAS'],
    sample: {
      brand: 'Access Bank', title: 'Access Bank quick loan',
      options: ['1. Borrow ₦5,000 now', '2. Learn more', '0. Back to menu'],
    },
  }),
  cap({
    number: 7, id: 'ussd_post_session', name: 'USSD Post-Session', family: 'ussd_interactive', placement: 'ussd',
    creativeTypes: ['text'], mechanics: ['awareness', 'conversion'], products: ['telyads', 'telydial'],
    objectives: ['Awareness', 'Conversion'], pricingModels: ['CPM'], telyadStatus: 'LIVE', defaultNetworkStatus: 'LIVE',
    previewRenderer: 'ussd', description: 'Shown immediately after a USSD session closes.',
    bestUseCases: ['Follow-up offer'], recommendedSectors: ['Betting', 'Retail'],
    sample: {
      brand: 'Jumia', title: 'Before you go — Jumia deals',
      options: ["1. Shop today's deals", '2. Remind me later', '0. Exit'],
    },
  }),
  cap({
    number: 8, id: 'balance_enquiry_inject', name: 'Balance Enquiry Inject', family: 'ussd_interactive', placement: 'ussd',
    creativeTypes: ['text'], triggers: ['balance_enquiry'], mechanics: ['conversion'], products: ['telyads', 'telydial'],
    objectives: ['Conversion'], pricingModels: ['CPM', 'CPD'], targetingCapabilities: ['geo', 'device', 'tier', 'balance_band'],
    telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT', previewRenderer: 'ussd',
    description: 'Injected into the *556# balance result — low and high balance variants.',
    bestUseCases: ['Airtime lending', 'Data top-up'], recommendedSectors: ['Banking', 'Telco VAS'],
    sample: {
      brand: 'MTN Xtratime', title: 'Low balance? Get airtime now',
      options: ['1. Borrow ₦200 airtime', '2. Buy a data bundle', '0. Exit'],
    },
  }),
  cap({
    number: 9, id: 'data_purchase_flow', name: 'Data Purchase Flow', family: 'ussd_interactive', placement: 'ussd',
    creativeTypes: ['text'], triggers: ['data_purchase'], mechanics: ['conversion', 'awareness'], products: ['telyads'],
    objectives: ['Conversion', 'Awareness'], pricingModels: ['CPM', 'CPD'], telyadStatus: 'TELYAD_SUPPORTED',
    defaultNetworkStatus: 'NETWORK_APPROVAL_REQUIRED', previewRenderer: 'ussd',
    description: 'Injected during *131# bundle selection while the subscriber is actively buying. TelyAds only.',
    bestUseCases: ['Bundle cross-sell'], recommendedSectors: ['Telco VAS', 'Streaming'],
    sample: {
      brand: 'Showmax', title: 'Add Showmax to your bundle',
      options: ['1. 1.5GB + Showmax — ₦1,500', '2. 3GB + Showmax — ₦2,500', '0. Skip'],
    },
  }),
  // ── Voice (10–11) ──────────────────────────────────────────────────────────
  cap({
    number: 10, id: 'end_of_call', name: 'End of Call (EOC)', family: 'voice', placement: 'end_of_call',
    creativeTypes: ['rich_card', 'text'], triggers: ['call_end'], mechanics: ['conversion'], products: ['telyads', 'telydial'],
    objectives: ['Conversion'], pricingModels: ['CPM', 'CPA', 'REVSHARE'], telyadStatus: 'TELYAD_SUPPORTED',
    defaultNetworkStatus: 'PILOT', previewRenderer: 'end_of_call',
    description: 'Fires at the exact call-end moment — dialler overlay on smartphones, Flash SMS on feature phones.',
    bestUseCases: ['High-attention conversion'], recommendedSectors: ['Betting', 'FMCG'],
    sample: {
      brand: 'Maltina',
      body: 'That was a great chat! Stay refreshed — buy any Maltina today and stand a chance to win instant airtime.',
      cta: 'Claim offer',
    },
  }),
  cap({
    number: 11, id: 'outbound_voice', name: 'Outbound Voice (OBD)', family: 'voice', placement: 'voice',
    creativeTypes: ['voice'], mechanics: ['conversion', 'lead_generation'], products: ['telyads', 'telydial'],
    objectives: ['Conversion', 'Lead generation'], pricingModels: ['CPM'], telyadStatus: 'LIVE', defaultNetworkStatus: 'LIVE',
    previewRenderer: 'voice_call', creatableFormatId: 'obd', frequencyConcept: 'Delivery 8AM–8PM; TelyDial 1 per 7 days per subscriber',
    description: 'Automated IVR call, press 1 to engage; multilingual voice scripts.',
    bestUseCases: ['Feature-phone reach', 'Lead capture'], recommendedSectors: ['Banking', 'Telco VAS'],
    complianceRequirements: ['DND', 'Consent', 'Delivery window 8AM–8PM'],
    sample: {
      brand: 'Access Bank',
      body: 'Hello, this is Access Bank. Press 1 to open a free savings account today and start earning interest.',
      cta: 'Press 1 to continue',
    },
  }),
  // ── SIM-Level (12–13) — SIM & Device ───────────────────────────────────────
  cap({
    number: 12, id: 'stk_push', name: 'STK Push (SIM Toolkit)', family: 'sim_device', placement: 'stk',
    creativeTypes: ['interactive_menu', 'text'], mechanics: ['conversion', 'awareness'], products: ['telyads', 'telydial'],
    objectives: ['Conversion', 'Awareness'], pricingModels: ['CPM', 'REVSHARE'], telyadStatus: 'LIVE', defaultNetworkStatus: 'LIVE',
    previewRenderer: 'stk', creatableFormatId: 'stk', characterLimit: 160,
    description: 'SIM applet menu — works on every MTN SIM, no internet needed.',
    bestUseCases: ['Universal reach', 'Subscription acquisition'], recommendedSectors: ['Telco VAS', 'FMCG', 'Betting'],
    sample: {
      sender: 'Maltina Rewards',
      body: 'Join Maltina Rewards and get a free-drink voucher every week. Standard SMS rates may apply.',
      cta: 'Accept', cta3: 'Cancel',
    },
  }),
  cap({
    number: 13, id: 'wap_push', name: 'WAP Push', family: 'sim_device', placement: 'stk',
    creativeTypes: ['text', 'rich_card'], mechanics: ['awareness', 'lead_generation'], products: ['telyads', 'telydial'],
    objectives: ['Awareness', 'Lead generation'], pricingModels: ['CPM'], telyadStatus: 'LIVE', defaultNetworkStatus: 'LIVE',
    previewRenderer: 'wap_push', creatableFormatId: 'wap',
    description: 'Push to the device message inbox with a clickable link. Both device types.',
    bestUseCases: ['Drive to landing page'], recommendedSectors: ['Retail', 'E-commerce'],
    sample: {
      brand: 'Jumia', title: 'Jumia Flash Sale',
      body: 'Up to 70% off phones today. Tap to shop before the deals run out.',
      cta: 'Open Jumia', url: 'https://jumia.com.ng/flash',
    },
  }),
  // ── Smartphone (14–16) — Carrier Digital Media ─────────────────────────────
  cap({
    number: 14, id: 'lock_screen_interstitial', name: 'Lock Screen Interstitial', family: 'carrier_digital_media',
    placement: 'lock_screen', creativeTypes: ['rich_card', 'image'], mechanics: ['conversion', 'awareness'], products: ['telyads'],
    objectives: ['Conversion', 'Awareness'], pricingModels: ['CPM', 'CPA'], deviceClass: 'smartphone',
    telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'NETWORK_APPROVAL_REQUIRED', previewRenderer: 'lock_screen',
    description: 'Carrier-injected on device wake — no app needed. Smartphone only, TelyAds only.',
    bestUseCases: ['Premium brand impact'], recommendedSectors: ['FMCG', 'Automotive'],
    sample: {
      brand: 'Coca-Cola', title: 'Taste the feeling',
      body: 'New Coca-Cola Zero. Swipe to discover where to get yours near you.',
      cta: 'Discover',
    },
  }),
  cap({
    number: 15, id: 'notification_shade', name: 'Notification Shade', family: 'carrier_digital_media',
    placement: 'notification', creativeTypes: ['rich_card', 'native_card'], mechanics: ['conversion', 'awareness'], products: ['telyads'],
    objectives: ['Conversion', 'Awareness'], pricingModels: ['CPM'], deviceClass: 'smartphone',
    telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'NETWORK_APPROVAL_REQUIRED', previewRenderer: 'notification',
    description: 'Android pull-down inject that sits among organic notifications. Smartphone only, TelyAds only.',
    bestUseCases: ['Native-feel engagement'], recommendedSectors: ['E-commerce', 'Retail'],
    sample: {
      brand: 'Jumia', title: 'Your cart misses you',
      body: 'Complete your order in the next hour and get free delivery.',
      cta: 'Checkout',
    },
  }),
  cap({
    number: 16, id: 'wap_portal_banner', name: 'In-Browser / WAP Portal Banner', family: 'carrier_digital_media',
    placement: 'web_portal', creativeTypes: ['image', 'banner'], mechanics: ['awareness', 'conversion', 'lead_generation'],
    products: ['telyads'], objectives: ['Awareness', 'Conversion', 'Lead generation'], pricingModels: ['CPM'],
    deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'NETWORK_APPROVAL_REQUIRED',
    previewRenderer: 'browser', description: 'Banner on the MTN carrier web portal. Smartphone only, TelyAds only.',
    bestUseCases: ['Display awareness'], recommendedSectors: ['Retail', 'E-commerce'],
    sample: {
      brand: 'Access Bank', title: 'Bank smarter with AccessMore',
      body: 'Open an account in 5 minutes, right from your phone.',
      cta: 'Get started', url: 'https://accessbankplc.com',
    },
  }),
  // ── Billing Event (17–18) ──────────────────────────────────────────────────
  cap({
    number: 17, id: 'airtime_recharge_receipt', name: 'Airtime Recharge Receipt', family: 'billing_network_events',
    placement: 'billing_receipt', creativeTypes: ['rich_card', 'text'], triggers: ['recharge'], mechanics: ['conversion', 'awareness'],
    products: ['telyads'], objectives: ['Conversion', 'Awareness'], pricingModels: ['CPM', 'CPA'],
    targetingCapabilities: ['geo', 'device', 'tier', 'spend_band'], telyadStatus: 'TELYAD_SUPPORTED',
    defaultNetworkStatus: 'NETWORK_APPROVAL_REQUIRED', previewRenderer: 'receipt',
    description: 'Post-recharge screen — the subscriber has just proven spend power. Spend-tier targeted.',
    bestUseCases: ['Premium-tier upsell'], recommendedSectors: ['Banking', 'FMCG'],
    sample: {
      brand: 'Maltina', sender: 'MTN', title: 'Recharge complete',
      body: 'Treat yourself — a Maltina 6-pack is now ₦1,800 at ShopRite this week.',
      cta: 'See offer', amount: '₦1,000 airtime added',
    },
  }),
  cap({
    number: 18, id: 'data_bundle_receipt', name: 'Data Bundle Purchase Receipt', family: 'billing_network_events',
    placement: 'billing_receipt', creativeTypes: ['rich_card', 'text'], triggers: ['data_purchase'], mechanics: ['conversion', 'awareness'],
    products: ['telyads'], objectives: ['Conversion', 'Awareness'], pricingModels: ['CPM', 'CPA'], telyadStatus: 'TELYAD_SUPPORTED',
    defaultNetworkStatus: 'NETWORK_APPROVAL_REQUIRED', previewRenderer: 'receipt',
    description: 'Post data-buy screen — the subscriber is now online. TelyAds only.',
    bestUseCases: ['Drive to app / stream'], recommendedSectors: ['Streaming', 'E-commerce'],
    sample: {
      brand: 'Showmax', sender: 'MTN', title: 'Bundle active',
      body: "You're online! Stream Premier League free on Showmax all weekend.",
      cta: 'Start streaming', amount: '2GB data added',
    },
  }),
  // ── Retargeting (19) — Journey & Retargeting ───────────────────────────────
  cap({
    number: 19, id: 'sequenced_retargeting', name: 'Sequenced Follow-Up Retargeting', family: 'journey_retargeting',
    placement: 'sms', creativeTypes: ['text', 'interactive_menu'], mechanics: ['conversion'], journeyTypes: ['sequential', 'retargeting', 'cross_channel'],
    products: ['telyads', 'telydial'], objectives: ['Conversion'], pricingModels: ['CPM', 'CPA', 'REVSHARE'],
    telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT', previewRenderer: 'journey',
    sequenceConcept: 'Day 1 SMS → Day 3 USSD inject → Day 7 EOC (max 3 touchpoints, conditional on no conversion)',
    frequencyConcept: 'Max 3 touchpoints per subscriber; full multi-touch attribution',
    description: 'Cross-channel re-engagement for non-converters across SMS, USSD and EOC.',
    bestUseCases: ['Win-back', 'Conversion lift'], recommendedSectors: ['Betting', 'E-commerce', 'Banking'],
    sample: {
      brand: 'Bet9ja',
      body: 'Re-engage subscribers who did not convert, across three channels.',
      steps: [
        { channel: 'SMS', label: 'Day 1 — welcome offer' },
        { channel: 'USSD', label: 'Day 3 — reminder inject' },
        { channel: 'EOC', label: 'Day 7 — final bonus' },
      ],
    },
  }),
  // ── 20–24 Sponsored Connectivity & Rewards ─────────────────────────────────
  cap({
    number: 20, id: 'sponsored_data', name: 'Sponsored Data / Zero-Rated Campaign', family: 'sponsored_connectivity_rewards',
    placement: 'web_portal', creativeTypes: ['banner', 'rich_card'], mechanics: ['engagement', 'reward'], products: ['telyads'],
    objectives: ['Engagement', 'Reward'], pricingModels: ['CPD', 'REVSHARE', 'FIXED'], deviceClass: 'smartphone',
    telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT', previewRenderer: 'sponsored_data',
    description: 'Brand sponsors zero-rated data so subscribers browse the brand experience for free.',
    bestUseCases: ['Deep engagement', 'App trials'], recommendedSectors: ['FMCG', 'Streaming', 'E-commerce'],
    sample: {
      brand: 'Maltina',
      body: 'Free browsing sponsored by Maltina. Enjoy 30 minutes of data on us — no charge.',
      cta: 'Browse free',
    },
  }),
  cap({
    number: 21, id: 'rewarded_data', name: 'Rewarded Data Ad', family: 'sponsored_connectivity_rewards', placement: 'telco_app',
    creativeTypes: ['video', 'rich_card'], mechanics: ['reward', 'engagement'], products: ['telyads'], objectives: ['Engagement', 'Reward'],
    pricingModels: ['CPA', 'CPD'], deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED',
    previewRenderer: 'reward', description: 'Subscriber earns data by engaging with a brand action.',
    bestUseCases: ['Opt-in engagement'], recommendedSectors: ['FMCG', 'Streaming'],
    sample: {
      brand: 'Coca-Cola', reward: '500MB data',
      body: 'Watch a 30-second Coca-Cola ad and get 500MB added instantly.',
      cta: 'Watch & earn',
    },
  }),
  cap({
    number: 22, id: 'rewarded_airtime', name: 'Rewarded Airtime Ad', family: 'sponsored_connectivity_rewards', placement: 'telco_app',
    creativeTypes: ['video', 'rich_card'], mechanics: ['reward', 'engagement'], products: ['telyads'], objectives: ['Engagement', 'Reward'],
    pricingModels: ['CPA'], deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED',
    previewRenderer: 'reward', description: 'Subscriber earns airtime for a completed brand action.',
    bestUseCases: ['Survey completion', 'Sign-ups'], recommendedSectors: ['Banking', 'FMCG'],
    sample: {
      brand: 'Access Bank', reward: '₦100 airtime',
      body: 'Complete a quick AccessMore sign-up and earn ₦100 airtime.',
      cta: 'Start & earn',
    },
  }),
  cap({
    number: 23, id: 'sponsored_browsing', name: 'Sponsored Browsing Session', family: 'sponsored_connectivity_rewards',
    placement: 'web_portal', creativeTypes: ['banner'], mechanics: ['engagement'], products: ['telyads'], objectives: ['Engagement'],
    pricingModels: ['CPD', 'FIXED'], deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED',
    previewRenderer: 'sponsored_data', description: 'A brand sponsors a time-boxed free browsing session.',
    bestUseCases: ['Trial engagement'], recommendedSectors: ['Streaming', 'E-commerce'],
    sample: {
      brand: 'Jumia',
      body: 'Free browsing sponsored by Jumia. Shop for 1 hour with zero data charges.',
      cta: 'Shop free',
    },
  }),
  cap({
    number: 24, id: 'captive_portal', name: 'Captive Portal / Wi-Fi Ad', family: 'sponsored_connectivity_rewards',
    placement: 'wifi_portal', creativeTypes: ['banner', 'video'], triggers: ['session_event'], mechanics: ['awareness', 'engagement'],
    products: ['telyads'], objectives: ['Awareness', 'Engagement'], pricingModels: ['CPM', 'FIXED'], deviceClass: 'smartphone',
    telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED', previewRenderer: 'captive_portal',
    description: 'Ad on the MTN Wi-Fi captive portal before connection.', bestUseCases: ['Venue targeting'],
    recommendedSectors: ['Retail', 'FMCG'],
    sample: {
      brand: 'Coca-Cola',
      body: 'Free Wi-Fi sponsored by Coca-Cola. Connect to enjoy the internet on us.',
      cta: 'Connect',
    },
  }),
  // ── 25–31 Messaging & Interactive (rich) ───────────────────────────────────
  cap({
    number: 25, id: 'rcs_message', name: 'RCS Rich Message', family: 'messaging', placement: 'rcs',
    creativeTypes: ['rich_card', 'image', 'interactive_menu'], mechanics: ['conversion', 'engagement'], products: ['telyads'],
    objectives: ['Conversion', 'Engagement'], pricingModels: ['CPM', 'CPA'], deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED',
    defaultNetworkStatus: 'INTEGRATION_REQUIRED', previewRenderer: 'rcs',
    description: 'Rich, branded, interactive messaging with images and suggested replies.',
    bestUseCases: ['Rich conversion'], recommendedSectors: ['Banking', 'Retail', 'E-commerce'],
    sample: {
      brand: 'Access Bank',
      body: 'Your AccessMore upgrade is ready. Manage cards, loans and savings in one place.',
      cta: 'Open app', cta2: 'Chat to us',
    },
  }),
  cap({
    number: 26, id: 'whatsapp_campaign', name: 'WhatsApp Business Campaign', family: 'messaging', placement: 'whatsapp',
    creativeTypes: ['rich_card', 'image', 'interactive_menu'], mechanics: ['conversion', 'lead_generation'], products: ['telyads'],
    objectives: ['Conversion', 'Lead generation'], pricingModels: ['CPA', 'CPM'], deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED',
    defaultNetworkStatus: 'INTEGRATION_REQUIRED', previewRenderer: 'whatsapp',
    description: 'Opt-in WhatsApp Business messaging with rich templates.', bestUseCases: ['Conversational commerce'],
    recommendedSectors: ['Banking', 'E-commerce'],
    sample: {
      brand: 'Jumia',
      body: 'Hi! Your exclusive Jumia coupon is here. Reply to shop or browse today’s deals.',
      cta: 'Shop now', cta2: 'View deals',
    },
  }),
  cap({
    number: 27, id: 'interactive_sms_journey', name: 'Interactive SMS Journey', family: 'messaging', placement: 'sms',
    creativeTypes: ['text', 'interactive_menu'], mechanics: ['engagement', 'lead_generation'], journeyTypes: ['sequential'],
    products: ['telyads', 'telydial'], objectives: ['Engagement', 'Lead generation'], pricingModels: ['CPM', 'CPA'],
    telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT', previewRenderer: 'interactive_message',
    description: 'Two-way SMS keyword journeys that branch on replies.', bestUseCases: ['Quizzes', 'Sign-up flows'],
    recommendedSectors: ['FMCG', 'Betting'],
    sample: {
      brand: 'Maltina',
      body: 'Play the Maltina quiz! Text A, B or C to answer and win instant airtime.',
      cta: 'Text A', cta2: 'Text B',
    },
  }),
  cap({
    number: 28, id: 'click_to_ussd', name: 'Click-to-USSD Ad', family: 'ussd_interactive', placement: 'web_portal',
    creativeTypes: ['banner'], mechanics: ['conversion'], products: ['telyads'], objectives: ['Conversion'], pricingModels: ['CPC', 'CPA'],
    deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED', previewRenderer: 'browser',
    description: 'Tap a banner to auto-launch a USSD string.', bestUseCases: ['Frictionless conversion'], recommendedSectors: ['Banking', 'Telco VAS'],
    sample: {
      brand: 'Access Bank', title: 'Check your balance instantly',
      body: 'Tap to dial *901# and manage your account — no app needed.',
      cta: 'Dial *901#',
    },
  }),
  cap({
    number: 29, id: 'click_to_call', name: 'Click-to-Call Ad', family: 'voice', placement: 'web_portal',
    creativeTypes: ['banner'], mechanics: ['lead_generation'], products: ['telyads'], objectives: ['Lead generation'], pricingModels: ['CPC', 'CPL'],
    deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED', previewRenderer: 'browser',
    description: 'Tap to place a call to a brand hotline.', bestUseCases: ['Lead capture'], recommendedSectors: ['Banking', 'Automotive'],
    sample: {
      brand: 'Access Bank', title: 'Talk to a loan advisor',
      body: 'Tap to call our loan hotline — free and instant.',
      cta: 'Call now',
    },
  }),
  cap({
    number: 30, id: 'click_to_whatsapp', name: 'Click-to-WhatsApp Ad', family: 'messaging', placement: 'web_portal',
    creativeTypes: ['banner'], mechanics: ['lead_generation', 'conversion'], products: ['telyads'], objectives: ['Lead generation'], pricingModels: ['CPC', 'CPL'],
    deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED', previewRenderer: 'whatsapp',
    description: 'Tap to open a WhatsApp conversation with the brand.', bestUseCases: ['Conversational leads'], recommendedSectors: ['SME', 'Retail'],
    sample: {
      brand: 'Jumia',
      body: 'Chat with a Jumia agent on WhatsApp for personal shopping help.',
      cta: 'Chat on WhatsApp', cta2: 'View catalogue',
    },
  }),
  cap({
    number: 31, id: 'branded_ussd_session', name: 'Branded USSD Session', family: 'ussd_interactive', placement: 'ussd',
    creativeTypes: ['interactive_menu'], mechanics: ['engagement', 'subscription'], products: ['telyads', 'telydial'],
    objectives: ['Engagement', 'Subscription'], pricingModels: ['REVSHARE', 'FIXED'], telyadStatus: 'TELYAD_SUPPORTED',
    defaultNetworkStatus: 'NETWORK_APPROVAL_REQUIRED', previewRenderer: 'ussd',
    description: 'A fully branded USSD service menu experience.', bestUseCases: ['Branded services'], recommendedSectors: ['Banking', 'Telco VAS'],
    sample: {
      brand: 'Maltina', title: 'Maltina Rewards Club',
      options: ['1. Check my points', '2. Redeem a reward', '0. Exit'],
    },
  }),
  // ── 32–37 Carrier Digital Media / Advanced Media ───────────────────────────
  cap({
    number: 32, id: 'sponsored_service_menu', name: 'Sponsored Service Menu Placement', family: 'carrier_digital_media', placement: 'telco_app',
    creativeTypes: ['native_card'], mechanics: ['awareness'], products: ['telyads'], objectives: ['Awareness'], pricingModels: ['FIXED', 'CPM'],
    deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED', previewRenderer: 'carrier_app',
    description: 'Sponsored placement within the telco app service menu.', bestUseCases: ['Prominent placement'], recommendedSectors: ['Banking', 'FMCG'],
    sample: {
      brand: 'Access Bank', appName: 'MyMTN', title: 'Access Bank',
      body: 'Featured in your services menu — open an account without leaving the app.',
      cta: 'Open',
    },
  }),
  cap({
    number: 33, id: 'telco_app_banner', name: 'Telco App Native Banner', family: 'carrier_digital_media', placement: 'telco_app',
    creativeTypes: ['banner', 'image'], mechanics: ['awareness'], products: ['telyads'], objectives: ['Awareness'], pricingModels: ['CPM'],
    deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED', previewRenderer: 'carrier_app',
    description: 'Native banner inside the MyMTN app.', bestUseCases: ['App display'], recommendedSectors: ['Retail', 'E-commerce'],
    sample: {
      brand: 'Jumia', appName: 'MyMTN', title: 'Jumia Tech Week',
      body: 'Up to 70% off gadgets. Shop now inside MyMTN.',
      cta: 'Shop',
    },
  }),
  cap({
    number: 34, id: 'telco_app_interstitial', name: 'Telco App Interstitial', family: 'carrier_digital_media', placement: 'telco_app',
    creativeTypes: ['image', 'rich_card'], mechanics: ['awareness', 'conversion'], products: ['telyads'], objectives: ['Awareness', 'Conversion'],
    pricingModels: ['CPM'], deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED',
    previewRenderer: 'carrier_app', description: 'Full-screen interstitial in the telco app.', bestUseCases: ['High-impact moment'], recommendedSectors: ['FMCG', 'Automotive'],
    sample: {
      brand: 'Coca-Cola', appName: 'MyMTN', title: 'Taste the feeling',
      body: 'New Coca-Cola Zero — refresh your day.',
      cta: 'Discover',
    },
  }),
  cap({
    number: 35, id: 'telco_app_native_card', name: 'Telco App Native Card', family: 'carrier_digital_media', placement: 'telco_app',
    creativeTypes: ['native_card'], mechanics: ['engagement'], products: ['telyads'], objectives: ['Engagement'], pricingModels: ['CPM', 'CPC'],
    deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED', previewRenderer: 'carrier_app',
    description: 'Native content card in the app feed.', bestUseCases: ['Feed engagement'], recommendedSectors: ['E-commerce', 'Retail'],
    sample: {
      brand: 'Maltina', appName: 'MyMTN', title: 'Maltina Moments',
      body: 'Recommended for you: win prizes with every Maltina pack.',
      cta: 'Learn more',
    },
  }),
  cap({
    number: 36, id: 'telco_app_video', name: 'Telco App Video Ad', family: 'advanced_media', placement: 'telco_app',
    creativeTypes: ['video'], mechanics: ['awareness', 'engagement'], products: ['telyads'], objectives: ['Awareness', 'Engagement'],
    pricingModels: ['CPM'], deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED',
    previewRenderer: 'video', description: 'In-app video placement.', bestUseCases: ['Brand storytelling'], recommendedSectors: ['FMCG', 'Automotive'],
    sample: {
      brand: 'Coca-Cola', title: 'Open happiness',
      body: 'Watch the new Coca-Cola film — 30 seconds of refreshment.',
      cta: 'Watch now',
    },
  }),
  cap({
    number: 37, id: 'rewarded_video', name: 'Rewarded Video', family: 'advanced_media', placement: 'telco_app',
    creativeTypes: ['video'], mechanics: ['reward', 'engagement'], products: ['telyads'], objectives: ['Engagement', 'Reward'],
    pricingModels: ['CPA'], deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED',
    previewRenderer: 'video', description: 'Watch a video to earn a data/airtime reward.', bestUseCases: ['Guaranteed views'], recommendedSectors: ['Streaming', 'FMCG'],
    sample: {
      brand: 'Showmax', title: 'Watch & earn 500MB',
      body: 'Watch this Showmax trailer to the end and get 500MB data added.',
      cta: 'Watch now', reward: '500MB data',
    },
  }),
  // ── 38–41 Location & Context ───────────────────────────────────────────────
  cap({
    number: 38, id: 'sponsored_search', name: 'Sponsored Search / Discovery', family: 'commerce_performance', placement: 'telco_app',
    creativeTypes: ['native_card'], mechanics: ['conversion'], products: ['telyads'], objectives: ['Conversion'], pricingModels: ['CPC'],
    deviceClass: 'smartphone', telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'INTEGRATION_REQUIRED', previewRenderer: 'search',
    description: 'Sponsored results in telco app search/discovery.', bestUseCases: ['Intent capture'], recommendedSectors: ['E-commerce', 'Retail'],
    sample: {
      brand: 'Jumia', title: 'Jumia — Official Store',
      body: "Sponsored result for 'phones' — shop verified deals with free delivery.",
      cta: 'Visit store',
      options: ['Jumia — Phones & Tablets', "Jumia — Today's Deals"],
    },
  }),
  cap({
    number: 39, id: 'geo_fenced', name: 'Geo-Fenced Campaign', family: 'location_context', placement: 'sms',
    creativeTypes: ['text', 'banner'], triggers: ['geo'], mechanics: ['conversion', 'awareness'], products: ['telyads'],
    objectives: ['Conversion', 'Awareness'], pricingModels: ['CPM', 'CPA'], targetingCapabilities: ['geo', 'device', 'geo_fence'],
    telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'NETWORK_APPROVAL_REQUIRED', previewRenderer: 'geo',
    description: 'Deliver ads to aggregate audiences within a permitted geographic area.', bestUseCases: ['Store footfall'], recommendedSectors: ['Retail', 'SME', 'FMCG'],
    sample: {
      brand: 'ShopRite', title: "You're near ShopRite Ikeja",
      body: 'Show this message in-store today for 15% off your groceries.',
      cta: 'Get directions', note: 'Ikeja City Mall geo-zone, Lagos',
    },
  }),
  cap({
    number: 40, id: 'time_context_triggered', name: 'Time / Context Triggered Ad', family: 'location_context', placement: 'sms',
    creativeTypes: ['text'], triggers: ['time_context'], mechanics: ['conversion'], products: ['telyads'], objectives: ['Conversion'],
    pricingModels: ['CPM'], telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT', previewRenderer: 'trigger',
    description: 'Trigger delivery by time of day / day of week / context.', bestUseCases: ['Daypart offers'], recommendedSectors: ['FMCG', 'Retail'],
    sample: {
      brand: 'Coca-Cola', title: "Lunch o'clock",
      body: "It's 1PM — grab an ice-cold Coke with your meal for just ₦150.",
      cta: 'Find a kiosk', note: 'Weekday 12–2PM daypart trigger',
    },
  }),
  cap({
    number: 41, id: 'network_event_journey', name: 'Network Event Triggered Journey', family: 'billing_network_events', placement: 'sms',
    creativeTypes: ['text'], triggers: ['network_event'], mechanics: ['conversion'], journeyTypes: ['sequential'], products: ['telyads'],
    objectives: ['Conversion'], pricingModels: ['CPA'], telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'FUTURE_CAPABILITY',
    previewRenderer: 'trigger', description: 'Journeys triggered by approved network events (roaming, low balance, etc.).',
    bestUseCases: ['Contextual conversion'], recommendedSectors: ['Banking', 'Telco VAS'],
    sample: {
      brand: 'Access Bank', title: 'Welcome — traveling abroad?',
      body: 'Use your Access card abroad with zero foreign transaction fees.',
      cta: 'Activate', note: 'Triggered on roaming-on network event',
    },
  }),
  // ── 42–46 Commerce & Performance / Research ────────────────────────────────
  cap({
    number: 42, id: 'loyalty_reward', name: 'Loyalty / Reward Campaign', family: 'commerce_performance', placement: 'sms',
    creativeTypes: ['text', 'voucher'], mechanics: ['reward', 'engagement'], products: ['telyads'], objectives: ['Engagement', 'Reward'],
    pricingModels: ['CPA'], telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT', previewRenderer: 'reward',
    description: 'Points / rewards mechanics to drive repeat behaviour.', bestUseCases: ['Retention'], recommendedSectors: ['FMCG', 'Retail'],
    sample: {
      brand: 'Maltina', reward: '50 loyalty points',
      body: "You've earned 50 Maltina points. Collect 200 to claim a free crate.",
      cta: 'View rewards',
    },
  }),
  cap({
    number: 43, id: 'coupon_voucher', name: 'Coupon / Voucher Campaign', family: 'commerce_performance', placement: 'sms',
    creativeTypes: ['voucher', 'text'], mechanics: ['coupon', 'conversion'], products: ['telyads'], objectives: ['Conversion'],
    pricingModels: ['CPA', 'CPM'], telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT', previewRenderer: 'voucher',
    description: 'Distribute redeemable coupon codes with tracking.', bestUseCases: ['Retail activation'], recommendedSectors: ['Retail', 'FMCG', 'SME'],
    sample: {
      brand: 'Maltina', offer: '20% off any Maltina multipack',
      code: 'MALTINA20', cta: 'Redeem',
      body: 'Show this code at checkout at any ShopRite. Valid until month end.',
    },
  }),
  cap({
    number: 44, id: 'survey_poll', name: 'Survey / Poll Campaign', family: 'research_insights', placement: 'ussd',
    creativeTypes: ['survey', 'interactive_menu'], mechanics: ['survey', 'engagement'], products: ['telyads'], objectives: ['Engagement'],
    pricingModels: ['CPA'], telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT', previewRenderer: 'survey',
    description: 'Aggregate survey / poll capture via USSD or SMS.', bestUseCases: ['Market research'], recommendedSectors: ['FMCG', 'Banking'],
    sample: {
      brand: 'Maltina', question: 'Which Maltina flavour do you enjoy most?',
      options: ['1. Classic', '2. Pineapple', '3. Apple'],
    },
  }),
  cap({
    number: 45, id: 'lead_generation', name: 'Lead Generation Campaign', family: 'commerce_performance', placement: 'ussd',
    creativeTypes: ['interactive_menu', 'text'], mechanics: ['lead_generation'], products: ['telyads'], objectives: ['Lead generation'],
    pricingModels: ['CPL', 'CPA'], telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT', previewRenderer: 'lead_form',
    description: 'Capture qualified, consented leads (opt-in).', bestUseCases: ['Acquisition'], recommendedSectors: ['Banking', 'Automotive', 'Insurance'],
    sample: {
      brand: 'Access Bank', title: 'Get a home loan quote',
      body: 'Answer 3 quick questions and an advisor will reach out.',
      cta: 'Get a callback',
    },
  }),
  cap({
    number: 46, id: 'competition_instant_win', name: 'Sponsored Competition / Instant Win', family: 'commerce_performance', placement: 'sms',
    creativeTypes: ['text', 'interactive_menu'], mechanics: ['competition', 'engagement'], products: ['telyads', 'telydial'],
    objectives: ['Engagement'], pricingModels: ['CPA', 'REVSHARE'], telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT',
    previewRenderer: 'competition', description: 'Instant-win / prize competition mechanics.', bestUseCases: ['Mass participation'],
    recommendedSectors: ['FMCG', 'Betting'],
    sample: {
      brand: 'Maltina', title: 'Maltina Instant Win',
      body: 'Buy a Maltina, text the code under the cap and see if you win instantly.',
      cta: 'Enter to win', note: 'Prize: ₦1,000,000 or a new fridge',
    },
  }),
  // ── 47–48 Journey / Advanced ───────────────────────────────────────────────
  cap({
    number: 47, id: 'cross_channel_journey', name: 'Sequential Cross-Channel Journey', family: 'journey_retargeting', placement: 'sms',
    creativeTypes: ['text', 'rich_card'], mechanics: ['conversion'], journeyTypes: ['cross_channel', 'sequential'], products: ['telyads'],
    objectives: ['Conversion'], pricingModels: ['CPM', 'CPA'], telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'PILOT',
    previewRenderer: 'journey', sequenceConcept: 'SMS → RCS → USSD → Reward, orchestrated with stop-on-conversion',
    description: 'Orchestrated multi-channel journeys across the capability universe.', bestUseCases: ['Full-funnel'], recommendedSectors: ['Banking', 'E-commerce'],
    sample: {
      brand: 'Access Bank',
      body: 'A full-funnel journey that stops the moment the subscriber converts.',
      steps: [
        { channel: 'SMS', label: 'Day 1 — intro offer' },
        { channel: 'RCS', label: 'Day 3 — rich reminder' },
        { channel: 'USSD', label: 'Day 5 — quick apply' },
        { channel: 'Reward', label: 'Day 7 — data reward' },
      ],
    },
  }),
  cap({
    number: 48, id: 'dooh_extension', name: 'Digital Out-of-Home Audience Extension', family: 'advanced_media', placement: 'dooh',
    creativeTypes: ['image', 'video'], triggers: ['geo'], mechanics: ['awareness'], products: ['telyads'], objectives: ['Awareness'],
    pricingModels: ['FIXED', 'CPM'], telyadStatus: 'TELYAD_SUPPORTED', defaultNetworkStatus: 'FUTURE_CAPABILITY', previewRenderer: 'dooh',
    description: 'Extend DOOH audiences with carrier-powered mobile follow-up (aggregate).', bestUseCases: ['Cross-media reach'], recommendedSectors: ['FMCG', 'Automotive'],
    sample: {
      brand: 'Coca-Cola', title: 'Coca-Cola on the big screen',
      body: 'Seen our billboard? Tap to unlock a mobile treat near you.',
      cta: 'Unlock offer', note: 'Digital billboards, Lagos',
    },
  }),
];

const byId = new Map(CAPABILITIES.map((c) => [c.id, c]));

export function listCapabilities(): AdCapability[] {
  return CAPABILITIES;
}
export function getCapability(id: string): AdCapability | undefined {
  return byId.get(id);
}
export function capabilitiesByFamily(family: CapabilityFamily): AdCapability[] {
  return CAPABILITIES.filter((c) => c.family === family);
}
export function capabilityCount(): number {
  return CAPABILITIES.length;
}
/** Capabilities a telco presents as available (LIVE/PILOT) given availability overrides. */
export function networkAvailableCapabilities(
  overrides: Record<string, CapabilityStatus> = {},
): AdCapability[] {
  return CAPABILITIES.filter((c) => {
    const status = overrides[c.id] ?? c.defaultNetworkStatus;
    return status === 'LIVE' || status === 'PILOT';
  });
}
