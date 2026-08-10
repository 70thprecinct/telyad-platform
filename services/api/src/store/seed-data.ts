import {
  ADVERTISERS,
  CAMPAIGNS,
  DEMO_USERS,
  TELCOS,
} from '@telyad/demo-data';
import { asId } from '@telyad/types';
import type {
  Advertiser,
  AnyRole,
  Campaign,
  Notification,
  Telco,
} from '@telyad/types';
import type { StoredUser } from './store.js';

const SEED_TS = '2026-08-10T09:00:00.000Z';

export interface SeedBundle {
  telcos: Telco[];
  advertisers: Advertiser[];
  users: StoredUser[];
  campaigns: Campaign[];
  notifications: Notification[];
}

/** Build the full demo dataset. `passwordHash` is the pre-hashed demo password. */
export function buildSeed(passwordHash: string): SeedBundle {
  const telcos: Telco[] = TELCOS.map((t) => ({
    id: t.id,
    name: t.name,
    country: t.country,
    status: t.status,
    revenueShareBps: t.revenueShareBps,
    currency: t.currency,
    partnerSince: t.partnerSince,
    createdAt: SEED_TS,
  }));

  const advertisers: Advertiser[] = ADVERTISERS.map((a) => ({
    id: a.id,
    telcoId: a.telcoId,
    name: a.name,
    industry: a.industry,
    status: a.status,
    risk: a.risk,
    accountManager: a.accountManager,
    since: a.since,
    createdAt: SEED_TS,
  }));

  const users: StoredUser[] = DEMO_USERS.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    realm: u.realm,
    role: u.role as AnyRole,
    telcoId: u.telcoId,
    advertiserId: u.advertiserId,
    status: 'Active',
    lastLoginAt: null,
    passwordHash,
  }));

  const campaigns: Campaign[] = CAMPAIGNS.map((c) => ({ ...c }));

  const mtnId = TELCOS[0]!.id;
  const notifications: Notification[] = [
    {
      id: asId<'NotificationId'>('notif_seed_1'),
      telcoId: mtnId,
      audienceRealm: 'telco',
      severity: 'info',
      title: 'Welcome to the MTN Operations console',
      body: 'Campaigns submitted by advertisers appear in Campaign Approval.',
      read: false,
      createdAt: SEED_TS,
    },
    {
      id: asId<'NotificationId'>('notif_seed_2'),
      telcoId: mtnId,
      audienceRealm: 'advertiser',
      severity: 'success',
      title: 'Wallet funded',
      body: 'Your demo wallet is ready. Create a campaign to get started.',
      read: false,
      createdAt: SEED_TS,
    },
  ];

  return { telcos, advertisers, users, campaigns, notifications };
}
