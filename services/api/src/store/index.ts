import type { Store } from './store';
import { MemoryStore } from './memory-store';
import { hashPassword } from '../auth';
import { env } from '../env';

export * from './store';
export { MemoryStore } from './memory-store';

/**
 * Selects the runtime store.
 *
 * - `STORE=memory` → in-memory seeded store (automated tests / explicit dev use).
 * - otherwise (the default) → **persistent** Prisma store. This is the demo and
 *   production default: campaign state, approvals and audit survive an API
 *   restart. Fails fast if DATABASE_URL is missing rather than silently falling
 *   back to non-persistent memory (spec §3, §18).
 */
export async function createStore(): Promise<Store> {
  if (process.env.STORE === 'memory') {
    return new MemoryStore(hashPassword(env.demoPassword));
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is required for the persistent store. Set it, or set STORE=memory for a non-persistent dev/test run.',
    );
  }
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaStore } = await import('./prisma-store');
  return new PrismaStore(new PrismaClient());
}
