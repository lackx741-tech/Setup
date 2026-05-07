import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from 'viem';
import { mainnet, sepolia, base, arbitrum } from 'viem/chains';
import { CHAIN_IDS } from '@/contracts/chains';

function getRpcUrl(chainId: number): string {
  switch (chainId) {
    case CHAIN_IDS.MAINNET:
      return process.env.NEXT_PUBLIC_MAINNET_RPC_URL ?? 'https://eth.llamarpc.com';
    case CHAIN_IDS.SEPOLIA:
      return process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? 'https://rpc.sepolia.org';
    case CHAIN_IDS.BASE:
      return process.env.NEXT_PUBLIC_BASE_RPC_URL ?? 'https://mainnet.base.org';
    case CHAIN_IDS.ARBITRUM:
      return process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ?? 'https://arb1.arbitrum.io/rpc';
    default:
      throw new Error(`Unsupported chain: ${chainId}`);
  }
}

function getViemChain(chainId: number) {
  switch (chainId) {
    case CHAIN_IDS.MAINNET:
      return mainnet;
    case CHAIN_IDS.SEPOLIA:
      return sepolia;
    case CHAIN_IDS.BASE:
      return base;
    case CHAIN_IDS.ARBITRUM:
      return arbitrum;
    default:
      throw new Error(`Unsupported chain: ${chainId}`);
  }
}

export function createViemPublicClient(chainId: number): PublicClient {
  const chain = getViemChain(chainId);
  const rpcUrl = getRpcUrl(chainId);
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  }) as PublicClient;
}

// Pre-built clients for each chain
export const publicClients: Record<number, PublicClient> = {
  [CHAIN_IDS.MAINNET]: createViemPublicClient(CHAIN_IDS.MAINNET),
  [CHAIN_IDS.SEPOLIA]: createViemPublicClient(CHAIN_IDS.SEPOLIA),
  [CHAIN_IDS.BASE]: createViemPublicClient(CHAIN_IDS.BASE),
  [CHAIN_IDS.ARBITRUM]: createViemPublicClient(CHAIN_IDS.ARBITRUM),
};

export function getPublicClient(chainId: number): PublicClient {
  const client = publicClients[chainId];
  if (!client) {
    return createViemPublicClient(chainId);
  }
  return client;
}

export { createPublicClient, createWalletClient, http };
