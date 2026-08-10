import { buildApp } from './app.js';
import { createStore } from './store/index.js';
import { env } from './env.js';

async function main(): Promise<void> {
  const store = await createStore();
  const app = buildApp({ store, logger: true });
  await app.listen({ port: env.port, host: env.host });
  app.log.info(
    `TelyAd API listening on :${env.port} — store=${process.env.STORE ?? 'memory'} — ${env.envLabel}`,
  );
}

main().catch((err) => {
  console.error('Failed to start TelyAd API', err);
  process.exit(1);
});
