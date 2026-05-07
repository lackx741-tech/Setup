import { defineChain } from 'viem';
import {
  mainnet,
  sepolia,
  base,
  arbitrum,
} from 'viem/chains';

export { mainnet, sepolia, base, arbitrum };

export const SUPPORTED_CHAINS = [mainnet, sepolia, base, arbitrum] as const;

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];

export const CHAIN_IDS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
  BASE: 8453,
  ARBITRUM: 42161,
} as const;

export const CHAIN_NAMES: Record<number, string> = {
  [CHAIN_IDS.MAINNET]: 'Ethereum',
  [CHAIN_IDS.SEPOLIA]: 'Sepolia',
  [CHAIN_IDS.BASE]: 'Base',
  [CHAIN_IDS.ARBITRUM]: 'Arbitrum One',
};

export const CHAIN_SHORT_NAMES: Record<number, string> = {
  [CHAIN_IDS.MAINNET]: 'ETH',
  [CHAIN_IDS.SEPOLIA]: 'SEP',
  [CHAIN_IDS.BASE]: 'BASE',
  [CHAIN_IDS.ARBITRUM]: 'ARB',
};

export const BLOCK_EXPLORERS: Record<number, string> = {
  [CHAIN_IDS.MAINNET]: 'https://etherscan.io',
  [CHAIN_IDS.SEPOLIA]: 'https://sepolia.etherscan.io',
  [CHAIN_IDS.BASE]: 'https://basescan.org',
  [CHAIN_IDS.ARBITRUM]: 'https://arbiscan.io',
};

export const TESTNET_CHAIN_IDS = [CHAIN_IDS.SEPOLIA];

export function isTestnet(chainId: number): boolean {
  return TESTNET_CHAIN_IDS.includes(chainId as typeof CHAIN_IDS.SEPOLIA);
}

export function getChainById(chainId: number): SupportedChain | undefined {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId);
}

export function getBlockExplorer(chainId: number): string {
  return BLOCK_EXPLORERS[chainId] ?? 'https://etherscan.io';
}

export function getTxUrl(chainId: number, txHash: string): string {
  return `${getBlockExplorer(chainId)}/tx/${txHash}`;
}

export function getAddressUrl(chainId: number, address: string): string {
  return `${getBlockExplorer(chainId)}/address/${address}`;
}

// EIP-7702 capable chains (those that support type-4 transactions)
export const EIP7702_CHAINS = [CHAIN_IDS.SEPOLIA] as const;

export function supportsEIP7702(chainId: number): boolean {
  return EIP7702_CHAINS.includes(chainId as (typeof EIP7702_CHAINS)[number]);
}
