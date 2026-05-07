'use client';

import { useCallback, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { type Hex, type Address } from 'viem';
import { type UserOperation, type UserOperationReceipt, type GasEstimate } from '@/types/erc4337';
import { useBundlerStore } from '@/store/bundler.store';
import { getBundlerClient } from '@/lib/bundler';
import { getUserOperationHash, createEmptyUserOperation } from '@/lib/utils/userop';
import { logger } from '@/lib/logger';

const log = logger.child('useERC4337');

interface UseERC4337Return {
  isLoading: boolean;
  error: string | undefined;
  pendingUserOpHash: Hex | undefined;
  lastReceipt: UserOperationReceipt | undefined;
  gasEstimate: GasEstimate | undefined;

  estimateGas: (userOp: UserOperation) => Promise<GasEstimate | null>;
  sendUserOperation: (userOp: UserOperation) => Promise<Hex | null>;
  waitForReceipt: (userOpHash: Hex) => Promise<UserOperationReceipt | null>;
  buildUserOperation: (params: {
    sender: Address;
    callData: Hex;
    initCode?: Hex;
  }) => UserOperation;
  clearError: () => void;
}

export function useERC4337(): UseERC4337Return {
  const { chainId } = useAccount();
  const publicClient = usePublicClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const {
    pendingUserOpHash,
    lastReceipt,
    gasEstimate,
    setIsSubmitting,
    setPendingUserOpHash,
    setLastReceipt,
    setGasEstimate,
    setError: storeSetError,
  } = useBundlerStore();

  const buildUserOperation = useCallback(
    (params: { sender: Address; callData: Hex; initCode?: Hex }): UserOperation => {
      return {
        ...createEmptyUserOperation(params.sender),
        callData: params.callData,
        initCode: params.initCode ?? '0x',
      };
    },
    [],
  );

  const estimateGas = useCallback(
    async (userOp: UserOperation): Promise<GasEstimate | null> => {
      if (!chainId) {
        setError('No chain connected');
        return null;
      }

      try {
        setIsLoading(true);
        // In production, this would call the bundler's eth_estimateUserOperationGas
        const estimate: GasEstimate = {
          callGasLimit: 100_000n,
          verificationGasLimit: 150_000n,
          preVerificationGas: 50_000n,
          maxFeePerGas: 1_000_000_000n,
          maxPriorityFeePerGas: 100_000_000n,
        };
        setGasEstimate(estimate);
        return estimate;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gas estimation failed';
        setError(message);
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
        log.info('UserOperation submitted', { hash });
        return hash as Hex;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send UserOperation';
        setError(message);
        storeSetError(message);
        log.error('Failed to send UserOperation', err);
        return null;
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    },
    [chainId, setIsSubmitting, setPendingUserOpHash, storeSetError],
  );

  const waitForReceipt = useCallback(
    async (userOpHash: Hex): Promise<UserOperationReceipt | null> => {
      if (!chainId) return null;

      try {
        const bundler = getBundlerClient(chainId);
        const receipt = await bundler.waitForUserOperationReceipt({
          hash: userOpHash as `0x${string}`,
        });
        const typedReceipt = receipt as unknown as UserOperationReceipt;
        setLastReceipt(typedReceipt);
        return typedReceipt;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get receipt';
        setError(message);
        return null;
      }
    },
    [chainId, setLastReceipt],
  );

  return {
    isLoading,
    error,
    pendingUserOpHash,
    lastReceipt,
    gasEstimate,
    estimateGas,
    sendUserOperation,
    waitForReceipt,
    buildUserOperation,
    clearError: () => setError(undefined),
  };
}
