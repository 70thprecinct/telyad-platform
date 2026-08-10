/** Centralised environment access. Secrets come from env, never source. */

function optional(name: string, fallback: string): string {
  const v = process.env[name];
  if (v && v.length > 0) return v;
  return fallback;
}

const isProd = process.env.NODE_ENV === 'production';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(optional('API_PORT', '4000')),
  host: optional('API_HOST', '0.0.0.0'),
  /** Comma-separated allowed origins for CORS. */
  corsOrigins: optional(
    'CORS_ORIGINS',
    'http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004',
  )
    .split(',')
    .map((s) => s.trim()),
  jwtSecret: (() => {
    const v = process.env.JWT_SECRET;
    if (!v || v.length < 16) {
      if (isProd) {
        throw new Error('JWT_SECRET must be set (>=16 chars) in production');
      }
      // Dev-only fallback. Never used in production.
      return 'dev-only-insecure-jwt-secret-change-me';
    }
    return v;
  })(),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '12h'),
  /** Demo user password — supplied at seed time, never committed. */
  demoPassword: optional('DEMO_USER_PASSWORD', 'Demo!Passw0rd'),
  envLabel: optional('TELYAD_ENV_LABEL', 'Demonstration Environment'),
};
