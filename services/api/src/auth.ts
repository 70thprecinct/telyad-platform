import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthTokenPayload } from '@telyad/auth';
import { env } from './env';

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(payload: AuthTokenPayload, maxAgeSeconds?: number): string {
  // The token never outlives the account: use the smaller of the configured
  // session length and the caller-supplied account-expiry window (used by both
  // the date-restricted login TTL and the Demo Access account-expiry clamp).
  const expiresIn: jwt.SignOptions['expiresIn'] =
    typeof maxAgeSeconds === 'number'
      ? maxAgeSeconds
      : (env.jwtExpiresIn as jwt.SignOptions['expiresIn']);
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}
