import { Address, Hash, Hex } from 'viem';

export interface Authorization {
  chainId: number;
  address: Address;
  nonce: bigint;
  yParity: number;
  r: Hex;
  s: Hex;
}

export interface SignedAuthorization extends Authorization {
  signature: Hex;
}

export interface DelegationRequest {
  delegator: Address;
  delegatee: Address;
  chainId: number;
  nonce: bigint;
  expiry?: bigint;
}

export interface DelegationRecord {
  id: string;
  delegator: Address;
  delegatee: Address;
  chainId: number;
  txHash: Hash;
  blockNumber: bigint;
  timestamp: number;
  status: 'pending' | 'active' | 'revoked' | 'expired';
  authorization: SignedAuthorization;
}

export interface Type4Transaction {
  type: '0x4';
  chainId: number;
  nonce: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gas: bigint;
  to: Address;
  value: bigint;
  data: Hex;
  authorizationList: SignedAuthorization[];
  accessList?: AccessListItem[];
}

export interface AccessListItem {
  address: Address;
  storageKeys: Hex[];
}

export interface AuthCall {
  to: Address;
  value: bigint;
  data: Hex;
  gas?: bigint;
}

export interface DelegationStatus {
  isActive: boolean;
  delegatee?: Address;
  nonce: bigint;
  expiresAt?: number;
}

export interface EIP7702Config {
  delegationManagerAddress: Address;
  maxDelegations: number;
  supportedChains: number[];
}

export interface EIP7702TransactionParams {
  from: Address;
  authorizationList: SignedAuthorization[];
  calls: AuthCall[];
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}
