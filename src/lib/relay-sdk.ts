import { type RelayRequest, type RelayResponse, type RelayAuthToken, type RelayHealth, type RelayConfig } from '@/types/relay';

const DEFAULT_CONFIG: RelayConfig = {
  url: process.env.NEXT_PUBLIC_RELAY_URL ?? '/api/relay',
  defaultChainId: 11155111,
  timeout: 30_000,
  retries: 3,
};

export class RelaySDK {
  private config: RelayConfig;
  private authToken: RelayAuthToken | null = null;

  constructor(config: Partial<RelayConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setAuthToken(token: RelayAuthToken): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.authToken
        ? { Authorization: `Bearer ${this.authToken.token}` }
        : {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const res = await fetch(`${this.config.url}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string>) },
        signal: controller.signal,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message ?? `HTTP ${res.status}`);
      }

      return res.json() as Promise<T>;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getHealth(): Promise<RelayHealth> {
    return this.request<RelayHealth>('/health');
  }

  async authenticate(address: string, signature: string, message: string, chainId: number): Promise<RelayAuthToken> {
    const token = await this.request<RelayAuthToken>('/auth', {
      method: 'POST',
      body: JSON.stringify({ address, signature, message, chainId }),
    });
    this.authToken = token;
    return token;
  }

  async submitRelayRequest(req: Omit<RelayRequest, 'id'>): Promise<RelayResponse> {
    return this.request<RelayResponse>('', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async delegate(payload: {
    delegator: string;
    delegatee: string;
    chainId: number;
    authorization: string;
  }): Promise<RelayResponse> {
    return this.request<RelayResponse>('/delegate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async execute(payload: {
    sender: string;
    calls: { to: string; value: string; data: string }[];
    chainId: number;
  }): Promise<RelayResponse> {
    return this.request<RelayResponse>('/execute', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const relaySDK = new RelaySDK();
export default relaySDK;
