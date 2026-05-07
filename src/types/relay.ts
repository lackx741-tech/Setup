import { Address, Hash, Hex } from 'viem';

export interface RelayRequest {
  id: string;
  type: 'delegation' | 'execute' | 'batch';
  sender: Address;
  payload: Hex;
  signature: Hex;
  nonce: bigint;
  deadline: bigint;
  chainId: number;
  metadata?: Record<string, unknown>;
}

export interface RelayResponse {
  id: string;
  status: RelayStatus;
  txHash?: Hash;
  userOpHash?: Hash;
  error?: string;
  gasUsed?: bigint;
  timestamp: number;
}

export type RelayStatus =
  | 'pending'
  | 'submitted'
  | 'confirmed'
  | 'failed'
  | 'reverted';

export interface RelayAuthToken {
  token: string;
  expiresAt: number;
  address: Address;
  chainId: number;
}

export interface RelayAuthRequest {
  address: Address;
  signature: Hex;
  message: string;
  chainId: number;
}

export interface RelaySession {
  sessionId: string;
  address: Address;
  chainId: number;
  createdAt: number;
  expiresAt: number;
  permissions: string[];
}

export interface RelayHealth {
  status: 'ok' | 'degraded' | 'down';
  latency: number;
  bundlerStatus: 'ok' | 'degraded' | 'down';
  paymasterStatus: 'ok' | 'degraded' | 'down';
  timestamp: number;
  version: string;
}

export interface RelayConfig {
  url: string;
  secretKey?: string;
  defaultChainId: number;
  timeout: number;
  retries: number;
}

export interface DelegateRelayPayload {
  delegator: Address;
  delegatee: Address;
  chainId: number;
  authorization: Hex;
  nonce: bigint;
}

export interface ExecuteRelayPayload {
  sender: Address;
  calls: {
    to: Address;
    value: bigint;
    data: Hex;
  }[];
  chainId: number;
}
