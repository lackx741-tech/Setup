'use client';

import { useCallback, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { type RelayResponse, type RelayAuthToken } from '@/types/relay';
import { relaySDK } from '@/lib/relay-sdk';
import { buildSiweMessage, generateNonce, isTokenValid } from '@/lib/auth';
import { logger } from '@/lib/logger';

const log = logger.child('useRelay');

interface UseRelayReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | undefined;
  authToken: RelayAuthToken | undefined;

  authenticate: () => Promise<boolean>;
  relayDelegate: (params: {
    delegatee: Address;
    authorization: Hex;
  }) => Promise<RelayResponse | null>;
  relayExecute: (params: {
    calls: { to: Address; value: bigint; data: Hex }[];
  }) => Promise<RelayResponse | null>;
  checkHealth: () => Promise<boolean>;
  clearError: () => void;
}

export function useRelay(): UseRelayReturn {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [authToken, setAuthToken] = useState<RelayAuthToken | undefined>();

  const isAuthenticated = !!authToken && isTokenValid(authToken);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!address || !walletClient || !chainId) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      const nonce = generateNonce();
      const message = buildSiweMessage({ address, chainId, nonce });
      const signature = await walletClient.signMessage({ account: address, message });

      const token = await relaySDK.authenticate(address, signature, message, chainId);
      setAuthToken(token);
      log.info('Relay authentication successful');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
      log.error('Relay authentication failed', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address, walletClient, chainId]);

  const ensureAuthenticated = useCallback(async (): Promise<boolean> => {
    if (isAuthenticated) return true;
    return authenticate();
  }, [isAuthenticated, authenticate]);

  const relayDelegate = useCallback(
    async (params: { delegatee: Address; authorization: Hex }): Promise<RelayResponse | null> => {
      if (!address || !chainId) {
        setError('Wallet not connected');
        return null;
      }

      if (!(await ensureAuthenticated())) return null;

      try {
        setIsLoading(true);
        const response = await relaySDK.delegate({
          delegator: address,
          delegatee: params.delegatee,
          chainId,
          authorization: params.authorization,
        });
        log.info('Relay delegation submitted', { response });
        return response;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Relay delegate failed';
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, ensureAuthenticated],
  );

  const relayExecute = useCallback(
    async (params: {
      calls: { to: Address; value: bigint; data: Hex }[];
    }): Promise<RelayResponse | null> => {
      if (!address || !chainId) {
        setError('Wallet not connected');
        return null;
      }

      if (!(await ensureAuthenticated())) return null;

      try {
        setIsLoading(true);
        const response = await relaySDK.execute({
          sender: address,
          calls: params.calls.map((c) => ({
            to: c.to,
            value: c.value.toString(),
            data: c.data,
          })),
          chainId,
        });
        return response;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Relay execute failed';
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, ensureAuthenticated],
  );

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const health = await relaySDK.getHealth();
      return health.status === 'ok';
    } catch {
      return false;
    }
  }, []);

  return {
    isLoading,
    isAuthenticated,
    error,
    authToken,
    authenticate,
    relayDelegate,
    relayExecute,
    checkHealth,
    clearError: () => setError(undefined),
  };
}
