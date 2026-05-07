import { type Address } from 'viem';

export interface PaymasterConfig {
  url: string;
  apiKey?: string;
  policyId?: string;
  chainId: number;
  paymasterAddress?: Address;
  supportedTokens: Address[];
  maxSponsoredGas: bigint;
}

// USDC addresses for ERC-20 paymaster
const USDC_ADDRESSES: Record<number, Address> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
};

export const paymasterConfigs: Record<number, PaymasterConfig> = {
  1: {
    url: process.env.NEXT_PUBLIC_PAYMASTER_URL ?? '',
    apiKey: process.env.PAYMASTER_API_KEY,
    policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
    chainId: 1,
    supportedTokens: [USDC_ADDRESSES[1]],
    maxSponsoredGas: BigInt('5000000000000000'), // 0.005 ETH
  },
  11155111: {
    url: process.env.NEXT_PUBLIC_PAYMASTER_URL ?? '',
    apiKey: process.env.PAYMASTER_API_KEY,
    policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
    chainId: 11155111,
    supportedTokens: [USDC_ADDRESSES[11155111]],
    maxSponsoredGas: BigInt('10000000000000000'), // 0.01 ETH (testnet)
  },
  8453: {
    url: process.env.NEXT_PUBLIC_PAYMASTER_URL ?? '',
    apiKey: process.env.PAYMASTER_API_KEY,
    policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
    chainId: 8453,
    supportedTokens: [USDC_ADDRESSES[8453]],
    maxSponsoredGas: BigInt('5000000000000000'),
  },
  42161: {
    url: process.env.NEXT_PUBLIC_PAYMASTER_URL ?? '',
    apiKey: process.env.PAYMASTER_API_KEY,
    policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
    chainId: 42161,
    supportedTokens: [USDC_ADDRESSES[42161]],
    maxSponsoredGas: BigInt('5000000000000000'),
  },
};

export function getPaymasterConfig(chainId: number): PaymasterConfig | undefined {
  return paymasterConfigs[chainId];
}

export default paymasterConfigs;
