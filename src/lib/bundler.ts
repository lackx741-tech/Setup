import { createPimlicoBundlerClient } from 'permissionless/clients/pimlico';
import { http } from 'viem';
import { ENTRY_POINT_V07_ADDRESS } from '@/contracts/constants';

export interface BundlerClientOptions {
  url: string;
  chainId: number;
  entryPointAddress?: `0x${string}`;
}

export function createBundlerClient(options: BundlerClientOptions) {
  const { url, entryPointAddress = ENTRY_POINT_V07_ADDRESS } = options;

  return createPimlicoBundlerClient({
    transport: http(url),
    entryPoint: {
      address: entryPointAddress,
      version: '0.7',
    },
  });
}

export function getBundlerUrl(chainId: number): string {
  const baseUrl = process.env.NEXT_PUBLIC_BUNDLER_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BUNDLER_URL is not configured');
  }
  return baseUrl;
}

export type BundlerClient = ReturnType<typeof createBundlerClient>;

let _bundlerClient: BundlerClient | null = null;

export function getBundlerClient(chainId: number): BundlerClient {
  if (!_bundlerClient) {
    _bundlerClient = createBundlerClient({
      url: getBundlerUrl(chainId),
      chainId,
    });
  }
  return _bundlerClient;
}

export function resetBundlerClient(): void {
  _bundlerClient = null;
}
