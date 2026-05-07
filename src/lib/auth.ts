import { type Address, type Hex } from 'viem';
import { type RelaySession, type RelayAuthToken } from '@/types/relay';
import { logger } from '@/lib/logger';

const log = logger.child('auth');

export interface JWTPayload {
  sub: string; // address
  chainId: number;
  sessionId: string;
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Generate the sign-in message for wallet authentication.
 */
export function buildSiweMessage(params: {
  address: Address;
  chainId: number;
  nonce: string;
  domain?: string;
  statement?: string;
  expirationTime?: string;
}): string {
  const {
    address,
    chainId,
    nonce,
    domain = 'localhost',
    statement = 'Sign in to EIP-7702 Dashboard',
    expirationTime,
  } = params;

  const lines = [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    '',
    statement,
    '',
    `URI: https://${domain}`,
    `Version: 1`,
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ];

  if (expirationTime) {
    lines.push(`Expiration Time: ${expirationTime}`);
  }

  return lines.join('\n');
}

/**
 * Generate a random nonce for SIWE messages.
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Decode a JWT payload without verification (client-side use only).
 * Never use this for authorization decisions.
 */
export function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload) as JWTPayload;
  } catch (err) {
    log.warn('Failed to decode JWT', err);
    return null;
  }
}

/**
 * Check if a relay auth token is still valid.
 */
export function isTokenValid(token: RelayAuthToken): boolean {
  return Date.now() < token.expiresAt * 1000;
}

/**
 * Check if a relay session is still valid.
 */
export function isSessionValid(session: RelaySession): boolean {
  return Date.now() < session.expiresAt * 1000;
}

/**
 * Verify a message was signed by the given address.
 * This is a client-side utility; real verification is done server-side.
 */
export async function verifyMessageSignature(params: {
  message: string;
  signature: Hex;
  address: Address;
}): Promise<boolean> {
  try {
    const { verifyMessage } = await import('viem');
    return verifyMessage({
      address: params.address,
      message: params.message,
      signature: params.signature,
    });
  } catch {
    return false;
  }
}
