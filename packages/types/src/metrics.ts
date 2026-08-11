/** Demonstration campaign analytics DTOs (deterministically derived, aggregate). */

export interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spendMinor: number;
}

export interface CampaignMetrics {
  hasData: boolean;
  impressions: number;
  clicks: number;
  conversions: number;
  spendMinor: number;
  remainingBudgetMinor: number;
  ctr: number;
  conversionRate: number;
  daily: DailyMetric[];
}
