import type { Store } from './store.js';
import { MemoryStore } from './memory-store.js';
import { hashPassword } from '../auth.js';
import { env } from '../env.js';

export * from './store.js';
export { MemoryStore } from './memory-store.js';

/**
 * Selects the runtime store. Defaults to the seeded in-memory store so the demo
 * runs with zero external setup. Set STORE=prisma (with DATABASE_URL) to use the
 * Prisma/SQLite (or Postgres) persistence path.
 */
export async function createStore(): Promise<Store> {
  if (process.env.STORE === 'prisma') {
    const { PrismaClient } = await import('@prisma/client');
    const { PrismaStore } = await import('./prisma-store.js');
    return new PrismaStore(new PrismaClient());
  }
  return new MemoryStore(hashPassword(env.demoPassword));
}
