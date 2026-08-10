import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts', 'src/seed.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  // Bundle the workspace source packages into the output.
  noExternal: [/^@telyad\//],
});
