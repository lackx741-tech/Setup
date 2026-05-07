import { Address, Hex } from 'viem';

export interface DaaSConfig {
  executorAddress: Address;
  orchestratorAddress: Address;
  sweepThreshold: bigint;
  maxBatchSize: number;
  supportedTokens: Address[];
  chainId: number;
}

export interface SweepOperation {
  id: string;
  type: 'eth' | 'erc20' | 'batch';
  from: Address;
  to: Address;
  token?: Address;
  amount: bigint;
  status: 'pending' | 'executing' | 'complete' | 'failed';
  txHash?: string;
  timestamp: number;
  gasUsed?: bigint;
  error?: string;
}

export interface TokenBalance {
  token: Address;
  symbol: string;
  decimals: number;
  balance: bigint;
  balanceUSD?: number;
}

export interface ETHBalance {
  address: Address;
  balance: bigint;
  balanceUSD?: number;
}

export interface BatchOperation {
  id: string;
  operations: SweepOperation[];
  totalGasEstimate: bigint;
  status: 'building' | 'ready' | 'submitted' | 'complete' | 'failed';
  txHash?: string;
  createdAt: number;
  executedAt?: number;
}

export interface DaaSExecutionContext {
  executor: Address;
  nonce: bigint;
  deadline: bigint;
  calldata: Hex;
  signature: Hex;
}

export interface RecoveryRequest {
  targetAddress: Address;
  tokens: Address[];
  recipient: Address;
  includeETH: boolean;
  minAmount?: bigint;
}

export interface GasEstimation {
  operation: string;
  gasLimit: bigint;
  gasPrice: bigint;
  totalCostWei: bigint;
  totalCostETH: string;
  totalCostUSD?: number;
}

export interface DaaSSweeperState {
  isRunning: boolean;
  lastSweepAt?: number;
  totalSwept: bigint;
  operationCount: number;
  errors: string[];
}
