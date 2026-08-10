import type { Store } from './store';
import { MemoryStore } from './memory-store';
import { hashPassword } from '../auth';
import { env } from '../env';

export * from './store';
export { MemoryStore } from './memory-store';

/**
 * Selects the runtime store. Defaults to the seeded in-memory store so the demo
 * runs with zero external setup. Set STORE=prisma (with DATABASE_URL) to use the
 * Prisma/SQLite (or Postgres) persistence path.
 */
export async function createStore(): Promise<Store> {
  if (process.env.STORE === 'prisma') {
    const { PrismaClient } = await import('@prisma/client');
    const { PrismaStore } = await import('./prisma-store');
    return new PrismaStore(new PrismaClient());
  }
  return new MemoryStore(hashPassword(env.demoPassword));
}
