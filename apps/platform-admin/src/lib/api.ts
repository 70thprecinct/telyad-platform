import type { AuthUser, Campaign, CreateDemoUserRequest, DemoUserView, Telco } from '@telyad/types';

export interface DemoCredentials {
  email: string;
  password: string;
  portal: string;
  expiresAt: string | null;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'telyad_platform_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, (body as { error?: string })?.error ?? res.statusText);
  return body as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, portal: 'admin' }),
    }),
  me: () => request<{ user: AuthUser }>('/auth/me'),
  listTelcos: () => request<{ telcos: Telco[] }>('/telcos'),
  listCampaigns: () => request<{ campaigns: Campaign[] }>('/campaigns'),

  // ── demo access ──────────────────────────────────────────────────────────
  listDemoUsers: () => request<{ users: DemoUserView[] }>('/admin/demo-users'),
  createDemoUser: (input: CreateDemoUserRequest) =>
    request<{ user: DemoUserView; credentials: DemoCredentials }>('/admin/demo-users', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  extendDemoUser: (id: string, expiresAt: string) =>
    request<{ user: DemoUserView }>(`/admin/demo-users/${id}/extend`, {
      method: 'POST',
      body: JSON.stringify({ expiresAt }),
    }),
  revokeDemoUser: (id: string) =>
    request<{ user: DemoUserView }>(`/admin/demo-users/${id}/revoke`, { method: 'POST' }),
  disableDemoUser: (id: string) =>
    request<{ user: DemoUserView }>(`/admin/demo-users/${id}/disable`, { method: 'POST' }),
  enableDemoUser: (id: string) =>
    request<{ user: DemoUserView }>(`/admin/demo-users/${id}/enable`, { method: 'POST' }),
  resetDemoPassword: (id: string) =>
    request<{ credentials: DemoCredentials }>(`/admin/demo-users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ generatePassword: true }),
    }),
};
