import { buildApp } from './app';
import { createStore } from './store/index';
import { env } from './env';

async function main(): Promise<void> {
  const storeKind = process.env.STORE === 'memory' ? 'memory' : 'prisma';
  const store = await createStore();
  const ready = await store.ping();
  const app = buildApp({ store, logger: true });
  await app.listen({ port: env.port, host: env.host });
  app.log.info(
    {
      port: env.port,
      store: storeKind,
      appEnv: env.appEnv,
      demoMode: env.demoMode,
      dbReady: ready,
      corsOrigins: env.corsOrigins,
    },
    `TelyAd API ready — ${env.envLabel}`,
  );
}

main().catch((err) => {
  console.error('Failed to start TelyAd API', err);
  process.exit(1);
});
