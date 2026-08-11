import type {
  Advertiser,
  AuditEvent,
  AuthUser,
  Campaign,
  CampaignApproval,
} from '@telyad/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'telyad_telco_token';

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
  if (!res.ok) {
    if (res.status === 401 && token && !path.startsWith('/auth/login')) {
      clearToken();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    throw new ApiError(res.status, (body as { error?: string })?.error ?? res.statusText);
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
  listCampaigns: () => request<{ campaigns: Campaign[] }>('/campaigns'),
  approvalQueue: () => request<{ campaigns: Campaign[] }>('/telco/approval-queue'),
  decide: (id: string, decision: 'APPROVED' | 'REJECTED', comments: string) =>
    request<{ campaign: Campaign }>(`/campaigns/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments }),
    }),
  advertisers: () => request<{ advertisers: Advertiser[] }>('/telco/advertisers'),
  approvals: () => request<{ approvals: CampaignApproval[] }>('/telco/approvals'),
  audit: () => request<{ events: AuditEvent[] }>('/telco/audit'),
};
