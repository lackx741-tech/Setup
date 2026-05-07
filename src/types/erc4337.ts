import { Address, Hash, Hex } from 'viem';

export interface UserOperation {
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: Hex;
  signature: Hex;
}

export interface PackedUserOperation {
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  accountGasLimits: Hex;
  preVerificationGas: bigint;
  gasFees: Hex;
  paymasterAndData: Hex;
  signature: Hex;
}

export interface UserOperationReceipt {
  userOpHash: Hash;
  entryPoint: Address;
  sender: Address;
  nonce: bigint;
  success: boolean;
  actualGasCost: bigint;
  actualGasUsed: bigint;
  logs: UserOpLog[];
  receipt: TransactionReceipt;
}

export interface UserOpLog {
  address: Address;
  topics: Hex[];
  data: Hex;
  blockNumber: bigint;
  transactionHash: Hash;
  logIndex: number;
}

export interface TransactionReceipt {
  transactionHash: Hash;
  blockNumber: bigint;
  blockHash: Hash;
  gasUsed: bigint;
  status: 'success' | 'reverted';
}

export interface GasEstimate {
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

export interface PaymasterData {
  paymaster: Address;
  paymasterData: Hex;
  paymasterVerificationGasLimit: bigint;
  paymasterPostOpGasLimit: bigint;
}

export interface SmartAccountInfo {
  address: Address;
  factoryAddress: Address;
  isDeployed: boolean;
  nonce: bigint;
  balance: bigint;
  implementation?: Address;
}

export interface StakeInfo {
  stake: bigint;
  unstakeDelaySec: number;
}

export interface BundlerConfig {
  url: string;
  apiKey?: string;
  chainId: number;
  entryPointAddress: Address;
  maxBundleSize: number;
}

export interface SupportedEntryPoints {
  entryPoints: Address[];
}

export interface ExecutionBatch {
  dests: Address[];
  values: bigint[];
  funcs: Hex[];
}
