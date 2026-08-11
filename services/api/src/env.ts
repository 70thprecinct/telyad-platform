/** Centralised environment access. Secrets come from env, never source. */

function optional(name: string, fallback: string): string {
  const v = process.env[name];
  if (v && v.length > 0) return v;
  return fallback;
}

const isProd = process.env.NODE_ENV === 'production';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  /** Deployment environment label: development | staging | production. */
  appEnv: optional('APP_ENV', process.env.NODE_ENV ?? 'development'),
  /** DEMO_MODE gates demo-only operations (e.g. demo:reset). */
  demoMode: /^(on|true|1)$/i.test(optional('DEMO_MODE', isProd ? 'off' : 'on')),
  port: Number(optional('API_PORT', '4000')),
  host: optional('API_HOST', '0.0.0.0'),
  /**
   * Comma-separated allowed origins for CORS. Prefers ALLOWED_ORIGINS, falls
   * back to CORS_ORIGINS, then the local dev origins.
   */
  corsOrigins: optional(
    'ALLOWED_ORIGINS',
    optional(
      'CORS_ORIGINS',
      'http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004',
    ),
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
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
  /**
   * Demo user password used only for seeding. Real value comes from
   * DEMO_USER_PASSWORD; the dev placeholder below is not a secret and seeding in
   * production refuses to use it (see seed.ts).
   */
  demoPassword: optional('DEMO_USER_PASSWORD', 'dev-demo-password-not-secret'),
  envLabel: optional('TELYAD_ENV_LABEL', 'Demonstration Environment'),
};
