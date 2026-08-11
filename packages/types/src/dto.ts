import { z } from 'zod';
import { audienceDefinitionSchema } from './audience';
import { AD_FORMAT_IDS, CAMPAIGN_OBJECTIVES, PRICING_MODELS } from './enums';
import { CURRENCIES } from './money';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  realm: 'advertiser' | 'telco' | 'platform';
  role: string;
  telcoId: string | null;
  advertiserId: string | null;
  permissions: string[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ── Money DTO ────────────────────────────────────────────────────────────────
export const moneySchema = z.object({
  minor: z.number().int().nonnegative(),
  currency: z.enum(CURRENCIES),
});

// ── Budget DTO ───────────────────────────────────────────────────────────────
export const budgetSchema = z
  .object({
    pricingModel: z.enum(PRICING_MODELS),
    dailyCap: moneySchema,
    total: moneySchema,
    lifetimeCap: moneySchema.optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD'),
    frequencyCapPerDay: z.number().int().positive().optional(),
    deliverySpeed: z.enum(['standard', 'accelerated', 'even']).default('standard'),
  })
  .refine((b) => b.startDate <= b.endDate, {
    message: 'startDate must be on or before endDate',
    path: ['endDate'],
  })
  .refine((b) => b.dailyCap.minor <= b.total.minor, {
    message: 'dailyCap cannot exceed total budget',
    path: ['dailyCap'],
  });
export type BudgetInput = z.infer<typeof budgetSchema>;

// ── Create / update campaign draft ───────────────────────────────────────────
export const createCampaignSchema = z.object({
  advertiserId: z.string().min(1),
  telcoId: z.string().min(1),
  name: z.string().min(2).max(120),
  objective: z.enum(CAMPAIGN_OBJECTIVES),
  formatId: z.enum(AD_FORMAT_IDS),
  audience: audienceDefinitionSchema,
  creativeFields: z.record(z.string()),
  smsFallback: z.string().max(160).optional(),
  budget: budgetSchema,
  /** Full multi-capability selection (WP02C.1). Server computes the plan. */
  capabilityIds: z.array(z.string().min(1)).optional(),
  /** Desired target size; the server clamps it to the eligible audience. */
  selectedTarget: z.number().int().nonnegative().optional(),
});
export type CreateCampaignRequest = z.infer<typeof createCampaignSchema>;

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  id: z.string().min(1),
});
export type UpdateCampaignRequest = z.infer<typeof updateCampaignSchema>;

// ── Submit for approval ──────────────────────────────────────────────────────
export const submitCampaignSchema = z.object({
  campaignId: z.string().min(1),
});
export type SubmitCampaignRequest = z.infer<typeof submitCampaignSchema>;

// ── Approval decision (telco side) ───────────────────────────────────────────
export const approvalDecisionSchema = z.object({
  campaignId: z.string().min(1),
  decision: z.enum(['APPROVED', 'REJECTED', 'CHANGES_REQUESTED']),
  comments: z.string().max(1000).default(''),
});
export type ApprovalDecisionRequest = z.infer<typeof approvalDecisionSchema>;
