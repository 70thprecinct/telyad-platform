import type { Campaign, CampaignMetrics, CampaignStatus, DailyMetric } from '@telyad/types';

/**
 * Deterministic demonstration analytics. Metrics are derived from the campaign
 * (id-seeded) so they are believable, internally consistent and **stable across
 * refreshes** — never randomly regenerated (spec §14). Clearly demo data.
 */

// Fractions of the estimated audience actually "delivered" to, by status.
const DELIVERY_FACTOR: Partial<Record<CampaignStatus, number>> = {
  APPROVED: 0.08,
  SCHEDULED: 0.12,
  LIVE: 0.42,
  PAUSED: 0.31,
  COMPLETED: 0.86,
};

function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
const unit = (seed: string): number => hash32(seed) / 0xffffffff;

const EMPTY: CampaignMetrics = {
  hasData: false,
  impressions: 0,
  clicks: 0,
  conversions: 0,
  spendMinor: 0,
  remainingBudgetMinor: 0,
  ctr: 0,
  conversionRate: 0,
  daily: [],
};

export function deriveCampaignMetrics(campaign: Campaign): CampaignMetrics {
  const factor = DELIVERY_FACTOR[campaign.status];
  if (!factor) return { ...EMPTY, remainingBudgetMinor: campaign.budget.total.minor };

  const impressions = Math.round(campaign.estimatedReach * factor);
  // CTR 2.2–6.4%, conversion 8–18% of clicks — deterministic per campaign.
  const ctr = 2.2 + unit(campaign.id + ':ctr') * 4.2;
  const convRate = 8 + unit(campaign.id + ':cv') * 10;
  const clicks = Math.round((impressions * ctr) / 100);
  const conversions = Math.round((clicks * convRate) / 100);
  const spendMinor = Math.min(
    campaign.budget.total.minor,
    Math.round(campaign.budget.total.minor * factor),
  );

  // 7-day series that sums (roughly) to the totals, weighted deterministically.
  const days = 7;
  const weights = Array.from({ length: days }, (_, i) => 0.6 + unit(`${campaign.id}:${i}`) * 0.8);
  const wsum = weights.reduce((a, b) => a + b, 0);
  const start = new Date(campaign.budget.startDate + 'T00:00:00.000Z').getTime();
  const daily: DailyMetric[] = weights.map((w, i) => {
    const share = w / wsum;
    const date = new Date(start + i * 86_400_000).toISOString().slice(0, 10);
    return {
      date,
      impressions: Math.round(impressions * share),
      clicks: Math.round(clicks * share),
      conversions: Math.round(conversions * share),
      spendMinor: Math.round(spendMinor * share),
    };
  });

  return {
    hasData: true,
    impressions,
    clicks,
    conversions,
    spendMinor,
    remainingBudgetMinor: Math.max(0, campaign.budget.total.minor - spendMinor),
    ctr: Math.round(ctr * 100) / 100,
    conversionRate: Math.round(convRate * 100) / 100,
    daily,
  };
}
