import { type ChainInfo, type ChainId } from '@/types/global';

export const chainsConfig: Record<ChainId, ChainInfo> = {
  1: {
    id: 1,
    name: 'Ethereum Mainnet',
    shortName: 'ETH',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL ?? 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    isTestnet: false,
  },
  11155111: {
    id: 11155111,
    name: 'Sepolia Testnet',
    shortName: 'SEP',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
    isTestnet: true,
  },
  8453: {
    id: 8453,
    name: 'Base',
    shortName: 'BASE',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL ?? 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    isTestnet: false,
  },
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ?? 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    isTestnet: false,
  },
};

export function getChainConfig(chainId: ChainId): ChainInfo {
  return chainsConfig[chainId];
}

export const defaultChain = chainsConfig[11155111];

export default chainsConfig;
