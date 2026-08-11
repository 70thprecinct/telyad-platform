import type {
  AdvertisingFormat,
  AudienceDefinition,
  AudienceEstimate,
  AuthUser,
  Campaign,
  CampaignMetrics,
  CreateCampaignRequest,
} from '@telyad/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'telyad_advertiser_token';

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
      // Only declare a JSON content-type when we actually send a body — an
      // empty application/json POST is rejected by the server.
      ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    // Session expired mid-use: clear the stale token and return to login.
    if (res.status === 401 && token && !path.startsWith('/auth/login')) {
      clearToken();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
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
  formats: () => request<{ formats: AdvertisingFormat[] }>('/formats'),
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
  campaignMetrics: (id: string) =>
    request<{ metrics: CampaignMetrics }>(`/campaigns/${id}/metrics`),
};
