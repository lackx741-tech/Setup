import { type BundlerConfig } from '@/types/erc4337';
import { ENTRY_POINT_V07_ADDRESS } from '@/contracts/constants';
import { type Address } from 'viem';

export const bundlerConfigs: Record<number, BundlerConfig> = {
  1: {
    url: process.env.NEXT_PUBLIC_BUNDLER_URL ?? 'https://bundler.example.com/rpc',
    apiKey: process.env.BUNDLER_API_KEY,
    chainId: 1,
    entryPointAddress: ENTRY_POINT_V07_ADDRESS,
    maxBundleSize: 10,
  },
  11155111: {
    url: process.env.NEXT_PUBLIC_BUNDLER_URL ?? 'https://bundler.example.com/rpc',
    apiKey: process.env.BUNDLER_API_KEY,
    chainId: 11155111,
    entryPointAddress: ENTRY_POINT_V07_ADDRESS,
    maxBundleSize: 10,
  },
  8453: {
    url: process.env.NEXT_PUBLIC_BUNDLER_URL ?? 'https://bundler.example.com/rpc',
    apiKey: process.env.BUNDLER_API_KEY,
    chainId: 8453,
    entryPointAddress: ENTRY_POINT_V07_ADDRESS,
    maxBundleSize: 10,
  },
  42161: {
    url: process.env.NEXT_PUBLIC_BUNDLER_URL ?? 'https://bundler.example.com/rpc',
    apiKey: process.env.BUNDLER_API_KEY,
    chainId: 42161,
    entryPointAddress: ENTRY_POINT_V07_ADDRESS,
    maxBundleSize: 10,
  },
};

export function getBundlerConfig(chainId: number): BundlerConfig {
  const config = bundlerConfigs[chainId];
  if (!config) {
    throw new Error(`No bundler config for chain ${chainId}`);
  }
  return config;
}

export default bundlerConfigs;
