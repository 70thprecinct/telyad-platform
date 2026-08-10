import type {
  AudienceDefinition,
  AudienceEstimate,
  AuthUser,
  Campaign,
  CreateCampaignRequest,
} from '@telyad/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'telyad_telydial_token';

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
    public details?: unknown,
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
  if (!res.ok) {
    throw new ApiError(res.status, (body as { error?: string })?.error ?? res.statusText, body);
  }
  return body as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: AuthUser }>('/auth/me'),
  estimate: (audience: AudienceDefinition) =>
    request<{ estimate: AudienceEstimate }>('/audience/estimate', {
      method: 'POST',
      body: JSON.stringify(audience),
    }),
  listCampaigns: () => request<{ campaigns: Campaign[] }>('/campaigns'),
  getCampaign: (id: string) => request<{ campaign: Campaign }>(`/campaigns/${id}`),
  createCampaign: (input: CreateCampaignRequest) =>
    request<{ campaign: Campaign }>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  submitCampaign: (id: string) =>
    request<{ campaign: Campaign }>(`/campaigns/${id}/submit`, { method: 'POST' }),
};
