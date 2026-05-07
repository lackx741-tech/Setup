import { Address } from 'viem';

export type ContractAddresses = {
  entryPoint: Address;
  paymaster: Address;
  smartAccountFactory: Address;
  delegationManager: Address;
  daaSExecutor: Address;
  orchestrator: Address;
};

const MAINNET_ADDRESSES: ContractAddresses = {
  entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  paymaster: '0x0000000000000000000000000000000000000000',
  smartAccountFactory: '0x0000000000000000000000000000000000000000',
  delegationManager: '0x0000000000000000000000000000000000000000',
  daaSExecutor: '0x0000000000000000000000000000000000000000',
  orchestrator: '0x0000000000000000000000000000000000000000',
};

const SEPOLIA_ADDRESSES: ContractAddresses = {
  entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  paymaster: '0x0000000000000000000000000000000000000001',
  smartAccountFactory: '0x0000000000000000000000000000000000000002',
  delegationManager: '0x0000000000000000000000000000000000000003',
  daaSExecutor: '0x0000000000000000000000000000000000000004',
  orchestrator: '0x0000000000000000000000000000000000000005',
};

const BASE_ADDRESSES: ContractAddresses = {
  entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  paymaster: '0x0000000000000000000000000000000000000000',
  smartAccountFactory: '0x0000000000000000000000000000000000000000',
  delegationManager: '0x0000000000000000000000000000000000000000',
  daaSExecutor: '0x0000000000000000000000000000000000000000',
  orchestrator: '0x0000000000000000000000000000000000000000',
};

const ARBITRUM_ADDRESSES: ContractAddresses = {
  entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  paymaster: '0x0000000000000000000000000000000000000000',
  smartAccountFactory: '0x0000000000000000000000000000000000000000',
  delegationManager: '0x0000000000000000000000000000000000000000',
  daaSExecutor: '0x0000000000000000000000000000000000000000',
  orchestrator: '0x0000000000000000000000000000000000000000',
};

export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  1: MAINNET_ADDRESSES,
  11155111: SEPOLIA_ADDRESSES,
  8453: BASE_ADDRESSES,
  42161: ARBITRUM_ADDRESSES,
};

export function getContractAddresses(chainId: number): ContractAddresses {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`No contract addresses configured for chain ${chainId}`);
  }
  return addresses;
}

export function getEntryPointAddress(chainId: number): Address {
  return getContractAddresses(chainId).entryPoint;
}
