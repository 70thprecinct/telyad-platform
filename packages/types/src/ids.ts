/** Branded string IDs — stable identifiers, never display names. */

// A nameable phantom property (not a `unique symbol`) so branded types survive
// declaration emit across package boundaries.
export type Brand<T, B extends string> = T & { readonly __telyadBrand: B };

export type TelcoId = Brand<string, 'TelcoId'>;
export type AdvertiserId = Brand<string, 'AdvertiserId'>;
export type AgencyId = Brand<string, 'AgencyId'>;
export type UserId = Brand<string, 'UserId'>;
export type CampaignId = Brand<string, 'CampaignId'>;
export type CreativeId = Brand<string, 'CreativeId'>;
export type AudienceId = Brand<string, 'AudienceId'>;
export type ApprovalId = Brand<string, 'ApprovalId'>;
export type WalletId = Brand<string, 'WalletId'>;
export type LedgerEntryId = Brand<string, 'LedgerEntryId'>;
export type InvoiceId = Brand<string, 'InvoiceId'>;
export type AuditEventId = Brand<string, 'AuditEventId'>;
export type NotificationId = Brand<string, 'NotificationId'>;

/** Cast a raw string coming from the DB/API into a branded id. */
export const asId = <B extends string>(raw: string): Brand<string, B> =>
  raw as Brand<string, B>;
