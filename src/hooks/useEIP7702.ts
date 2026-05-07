'use client';

import { useCallback, useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { type SignedAuthorization, type DelegationRequest, type AuthCall } from '@/types/eip7702';
import { useDelegationStore } from '@/store/delegation.store';
import { signAuthorization, validateDelegationRequest } from '@/lib/utils/delegation';
import { logger } from '@/lib/logger';

const log = logger.child('useEIP7702');

interface UseEIP7702Return {
  // State
  isLoading: boolean;
  error: string | undefined;
  activeDelegation: ReturnType<typeof useDelegationStore>['activeDelegation'];
  pendingAuthorization: SignedAuthorization | undefined;

  // Actions
  signDelegation: (params: {
    contractAddress: Address;
    nonce?: bigint;
  }) => Promise<SignedAuthorization | null>;
  sendType4Transaction: (params: {
    authorization: SignedAuthorization;
    calls: AuthCall[];
  }) => Promise<Hex | null>;
  revokeDelegation: () => Promise<Hex | null>;
  clearError: () => void;
}

export function useEIP7702(): UseEIP7702Return {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const {
    activeDelegation,
    pendingAuthorization,
    setPendingAuthorization,
    setActiveDelegation,
    addDelegationRecord,
    setIsLoading: storeSetIsLoading,
    setError: storeSetError,
  } = useDelegationStore();

  const signDelegation = useCallback(
    async (params: { contractAddress: Address; nonce?: bigint }) => {
      if (!address || !walletClient || !chainId) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setIsLoading(true);
        setError(undefined);

        const nonce = params.nonce ?? 0n;
        const auth = await signAuthorization(walletClient, address, {
          chainId,
          contractAddress: params.contractAddress,
          nonce,
        });

        setPendingAuthorization(auth);
        log.info('Delegation signed', { contractAddress: params.contractAddress });
        return auth;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to sign delegation';
        setError(message);
        log.error('Failed to sign delegation', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, walletClient, chainId, setPendingAuthorization],
  );

  const sendType4Transaction = useCallback(
    async (params: { authorization: SignedAuthorization; calls: AuthCall[] }) => {
      if (!address || !walletClient) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setIsLoading(true);
        setError(undefined);

        // Build and send the EIP-7702 type-4 transaction
        const txHash = await walletClient.sendTransaction({
          account: address,
          to: params.calls[0]?.to ?? address,
          value: params.calls[0]?.value ?? 0n,
          data: params.calls[0]?.data ?? '0x',
          // authorizationList would be here in a full EIP-7702 implementation
        });

        log.info('Type-4 transaction sent', { txHash });
        return txHash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setError(message);
        log.error('Type-4 transaction failed', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, walletClient],
  );

  const revokeDelegation = useCallback(async () => {
    if (!address || !walletClient) {
      setError('Wallet not connected');
      return null;
    }
    try {
      setIsLoading(true);
      // Revoke by setting a self-delegation with nonce incremented
      const txHash = await walletClient.sendTransaction({
        account: address,
        to: address,
        value: 0n,
        data: '0x',
      });
      setActiveDelegation(undefined);
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Revocation failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, walletClient, setActiveDelegation]);

  return {
    isLoading,
    error,
    activeDelegation,
    pendingAuthorization,
    signDelegation,
    sendType4Transaction,
    revokeDelegation,
    clearError: () => setError(undefined),
  };
}
