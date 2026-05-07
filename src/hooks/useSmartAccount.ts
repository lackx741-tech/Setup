'use client';

import { useCallback, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { type SmartAccountInfo } from '@/types/erc4337';
import { getPublicClient } from '@/lib/viem';
import { logger } from '@/lib/logger';
import SmartAccountABI from '@/contracts/abis/SmartAccount.json';

const log = logger.child('useSmartAccount');

interface UseSmartAccountReturn {
  isLoading: boolean;
  error: string | undefined;
  smartAccount: SmartAccountInfo | undefined;

  computeAddress: (owner: Address, salt?: bigint) => Promise<Address | null>;
  deploySmartAccount: (owner: Address, salt?: bigint) => Promise<Hex | null>;
  getSmartAccountInfo: (address: Address) => Promise<SmartAccountInfo | null>;
  isDeployed: (address: Address) => Promise<boolean>;
  clearError: () => void;
}

export function useSmartAccount(): UseSmartAccountReturn {
  const { chainId, address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [smartAccount, setSmartAccount] = useState<SmartAccountInfo | undefined>();

  const isDeployed = useCallback(
    async (accountAddress: Address): Promise<boolean> => {
      if (!chainId) return false;
      try {
        const client = getPublicClient(chainId);
        const code = await client.getCode({ address: accountAddress });
        return !!code && code !== '0x';
      } catch {
        return false;
      }
    },
    [chainId],
  );

  const computeAddress = useCallback(
    async (owner: Address, salt = 0n): Promise<Address | null> => {
      if (!chainId) {
        setError('No chain connected');
        return null;
      }
      try {
        // In production this would call the factory's getAddress/computeAddress
        // Returning a placeholder here
        const mockAddress = `0x${owner.replace('0x', '').toLowerCase()}` as Address;
        return mockAddress;
      } catch (err) {
        log.error('Failed to compute smart account address', err);
        return null;
      }
    },
    [chainId],
  );

  const getSmartAccountInfo = useCallback(
    async (accountAddress: Address): Promise<SmartAccountInfo | null> => {
      if (!chainId) return null;
      try {
        setIsLoading(true);
        const client = getPublicClient(chainId);

        const [deployed, balance] = await Promise.all([
          isDeployed(accountAddress),
          client.getBalance({ address: accountAddress }),
        ]);

        const info: SmartAccountInfo = {
          address: accountAddress,
          factoryAddress: '0x0000000000000000000000000000000000000000',
          isDeployed: deployed,
          nonce: 0n,
          balance,
        };

        if (deployed) {
          try {
            const nonce = await client.readContract({
              address: accountAddress,
              abi: SmartAccountABI,
              functionName: 'getNonce',
            }) as bigint;
            info.nonce = nonce;
          } catch {
            // Contract may not support getNonce
          }
        }

        setSmartAccount(info);
        return info;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to get smart account info';
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [chainId, isDeployed],
  );

  const deploySmartAccount = useCallback(
    async (owner: Address, salt = 0n): Promise<Hex | null> => {
      setError('Smart account deployment requires a bundler UserOperation. Use useERC4337 hook.');
      return null;
    },
    [],
  );

  return {
    isLoading,
    error,
    smartAccount,
    computeAddress,
    deploySmartAccount,
    getSmartAccountInfo,
    isDeployed,
    clearError: () => setError(undefined),
  };
}
