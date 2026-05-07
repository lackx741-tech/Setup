'use client';

import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { type Hex } from 'viem';
import { type UserOperation, type GasEstimate } from '@/types/erc4337';
import { useBundlerStore } from '@/store/bundler.store';
import { getBundlerClient } from '@/lib/bundler';
import { logger } from '@/lib/logger';
import { ENTRY_POINT_V07_ADDRESS } from '@/contracts/constants';

const log = logger.child('useBundler');

interface UseBundlerReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | undefined;
  supportedEntryPoints: `0x${string}`[];

  estimateUserOperationGas: (userOp: UserOperation) => Promise<GasEstimate | null>;
  sendUserOperation: (userOp: UserOperation) => Promise<Hex | null>;
  waitForUserOperationReceipt: (hash: Hex, timeout?: number) => Promise<unknown>;
  checkBundlerHealth: () => Promise<boolean>;
  getSupportedEntryPoints: () => Promise<`0x${string}`[]>;
  clearError: () => void;
}

export function useBundler(): UseBundlerReturn {
  const { chainId } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [supportedEntryPoints, setSupportedEntryPoints] = useState<`0x${string}`[]>([]);

  const { setGasEstimate, setPendingUserOpHash, setIsSubmitting } = useBundlerStore();

  const checkBundlerHealth = useCallback(async (): Promise<boolean> => {
    if (!chainId) return false;
    try {
      const bundler = getBundlerClient(chainId);
      const eps = await bundler.supportedEntryPoints();
      setSupportedEntryPoints(eps as `0x${string}`[]);
      setIsConnected(true);
      return true;
    } catch (err) {
      log.error('Bundler health check failed', err);
      setIsConnected(false);
      return false;
    }
  }, [chainId]);

  const getSupportedEntryPoints = useCallback(async (): Promise<`0x${string}`[]> => {
    if (!chainId) return [];
    try {
      const bundler = getBundlerClient(chainId);
      const eps = await bundler.supportedEntryPoints();
      setSupportedEntryPoints(eps as `0x${string}`[]);
      return eps as `0x${string}`[];
    } catch (err) {
      log.error('Failed to get supported entry points', err);
      return [];
    }
  }, [chainId]);

  const estimateUserOperationGas = useCallback(
    async (userOp: UserOperation): Promise<GasEstimate | null> => {
      if (!chainId) {
        setError('No chain connected');
        return null;
      }
      try {
        setIsLoading(true);
        const bundler = getBundlerClient(chainId);
        const estimate = await bundler.estimateUserOperationGas({
          userOperation: userOp as never,
          entryPointAddress: ENTRY_POINT_V07_ADDRESS,
        });

        const gasEstimate: GasEstimate = {
          callGasLimit: BigInt(estimate.callGasLimit),
          verificationGasLimit: BigInt(estimate.verificationGasLimit),
          preVerificationGas: BigInt(estimate.preVerificationGas),
          maxFeePerGas: 1_000_000_000n,
          maxPriorityFeePerGas: 100_000_000n,
        };
        setGasEstimate(gasEstimate);
        return gasEstimate;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gas estimation failed';
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [chainId, setGasEstimate],
  );

  const sendUserOperation = useCallback(
    async (userOp: UserOperation): Promise<Hex | null> => {
      if (!chainId) {
        setError('No chain connected');
        return null;
      }
      try {
        setIsLoading(true);
        setIsSubmitting(true);
        const bundler = getBundlerClient(chainId);
        const hash = await bundler.sendUserOperation({
          userOperation: userOp as never,
        });
        setPendingUserOpHash(hash as Hex);
        log.info('UserOperation sent', { hash });
        return hash as Hex;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Send UserOperation failed';
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    },
    [chainId, setIsSubmitting, setPendingUserOpHash],
  );

  const waitForUserOperationReceipt = useCallback(
    async (hash: Hex, timeout = 60_000): Promise<unknown> => {
      if (!chainId) return null;
      const bundler = getBundlerClient(chainId);
      return bundler.waitForUserOperationReceipt({
        hash: hash as `0x${string}`,
        timeout,
      });
    },
    [chainId],
  );

  return {
    isConnected,
    isLoading,
    error,
    supportedEntryPoints,
    estimateUserOperationGas,
    sendUserOperation,
    waitForUserOperationReceipt,
    checkBundlerHealth,
    getSupportedEntryPoints,
    clearError: () => setError(undefined),
  };
}
