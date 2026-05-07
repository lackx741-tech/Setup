import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

describe('Relay API Integration', () => {
  const headers = { 'Content-Type': 'application/json' };
  let authToken = '';

  describe('GET /api/relay/health', () => {
    it('returns health status', async () => {
      const res = await fetch(`${BASE_URL}/api/relay/health`, { headers });
      expect(res.status).toBe(200);

      const body = await res.json() as { status: string; bundler: unknown };
      expect(body).toHaveProperty('status');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(body.status);
    });
  });

  describe('POST /api/relay/auth', () => {
    it('returns 400 for missing body fields', async () => {
      const res = await fetch(`${BASE_URL}/api/relay/auth`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it('returns a nonce via GET', async () => {
      const res = await fetch(`${BASE_URL}/api/relay/auth`, { headers });
      expect(res.status).toBe(200);

      const body = await res.json() as { nonce: string };
      expect(body).toHaveProperty('nonce');
      expect(typeof body.nonce).toBe('string');
    });
  });

  describe('GET /api/relay', () => {
    it('returns version info', async () => {
      const res = await fetch(`${BASE_URL}/api/relay`, { headers });
      expect(res.status).toBe(200);

      const body = await res.json() as { version: string; status: string };
      expect(body).toHaveProperty('version');
      expect(body).toHaveProperty('status');
    });
  });

  describe('POST /api/relay (protected)', () => {
    it('returns 401 without auth token', async () => {
      const res = await fetch(`${BASE_URL}/api/relay`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: 'delegate', payload: {} }),
      });
      expect(res.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      const res = await fetch(`${BASE_URL}/api/relay`, {
        method: 'POST',
        headers: { ...headers, Authorization: 'Bearer invalid-token' },
        body: JSON.stringify({ type: 'delegate', payload: {} }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/relay/delegate (protected)', () => {
    it('returns 401 without auth', async () => {
      const res = await fetch(`${BASE_URL}/api/relay/delegate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ authority: '0x', delegate: '0x', chainId: 11155111 }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/relay/execute (protected)', () => {
    it('returns 401 without auth', async () => {
      const res = await fetch(`${BASE_URL}/api/relay/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ authority: '0x', calls: [] }),
      });
      expect(res.status).toBe(401);
    });
  });
});
