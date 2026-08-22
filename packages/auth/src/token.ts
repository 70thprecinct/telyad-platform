import type { Portal, Realm } from '@telyad/types';

/**
 * The claims carried in a signed session token. Tenant identity (`telcoId`),
 * realm and portal travel with the token so the API can enforce isolation
 * server-side — the client can never widen its own scope.
 */
export interface AuthTokenPayload {
  sub: string; // userId
  email: string;
  name: string;
  realm: Realm;
  portal: Portal;
  role: string;
  telcoId: string | null;
  advertiserId: string | null;
}

/** Contract the API implements to issue/verify tokens (JWT in the API layer). */
export interface TokenService {
  sign(payload: AuthTokenPayload): string;
  verify(token: string): AuthTokenPayload;
}
