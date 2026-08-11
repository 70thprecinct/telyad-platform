import { listCapabilities } from '@telyad/ad-formats';
import {
  CAPABILITY_FAMILY_LABELS,
  isNetworkLive,
  type RevenueIntelligenceReport,
  type RevenueSlice,
} from '@telyad/types';
import { unit } from './seed-random';

/** Telco revenue & inventory intelligence. Swappable for real analytics. */
export interface RevenueIntelligence {
  analyse(input: RevenueInput): RevenueIntelligenceReport;
}

export interface RevenueLine {
  industry: string;
  family: string;
  pricingModel: string;
  spendMinor: number;
}
export interface RevenueInput {
  currency: string;
  lines: RevenueLine[];
}

function slices(lines: RevenueLine[], key: (l: RevenueLine) => string, label?: (k: string) => string): RevenueSlice[] {
  const totals = new Map<string, number>();
  let sum = 0;
  for (const l of lines) {
    totals.set(key(l), (totals.get(key(l)) ?? 0) + l.spendMinor);
    sum += l.spendMinor;
  }
  return [...totals.entries()]
    .map(([k, amountMinor]) => ({
      label: label ? label(k) : k,
      amountMinor,
      sharePct: sum ? Math.round((amountMinor / sum) * 100) : 0,
    }))
    .sort((a, b) => b.amountMinor - a.amountMinor);
}

export class DemoRevenueIntelligence implements RevenueIntelligence {
  analyse(input: RevenueInput): RevenueIntelligenceReport {
    const total = input.lines.reduce((a, l) => a + l.spendMinor, 0);

    const byFamily = slices(
      input.lines,
      (l) => l.family,
      (k) => CAPABILITY_FAMILY_LABELS[k as keyof typeof CAPABILITY_FAMILY_LABELS] ?? k,
    );
    const byIndustry = slices(input.lines, (l) => l.industry);
    const byPricingModel = slices(input.lines, (l) => l.pricingModel);

    // Deterministic demonstration inventory utilisation.
    const inventoryUtilisation = listCapabilities()
      .map((c) => ({
        capabilityId: c.id,
        capabilityName: c.name,
        utilisationPct: isNetworkLive(c.defaultNetworkStatus)
          ? 30 + Math.round(unit(c.id + ':util') * 60)
          : Math.round(unit(c.id + ':util') * 20),
      }))
      .sort((a, b) => b.utilisationPct - a.utilisationPct);

    // Opportunities: under-utilised network-ready capabilities.
    const underUtilised = inventoryUtilisation
      .filter((u) => u.utilisationPct < 45)
      .slice(0, 3)
      .map((u) => ({
        title: `Grow ${u.capabilityName}`,
        detail: `${u.capabilityName} inventory utilisation is ${u.utilisationPct}%. Packaging it for FMCG/Banking demand may unlock additional revenue.`,
        estimatedUpsideMinor: Math.round(total * (0.04 + unit(u.capabilityId + ':ups') * 0.06)),
      }));

    return {
      totalRevenueMinor: total,
      currency: input.currency,
      byFamily,
      byIndustry,
      byPricingModel,
      inventoryUtilisation,
      projectedMonthlyRevenueMinor: Math.round(total * 1.18),
      opportunities: underUtilised,
      generatedBy: 'demonstration-rules',
    };
  }
}
