'use client';

import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { type PaymasterData } from '@/types/erc4337';
import { type UserOperation } from '@/types/erc4337';
import { logger } from '@/lib/logger';

const log = logger.child('usePaymaster');

export type PaymasterMode = 'verifying' | 'token' | 'none';

interface UsePaymasterReturn {
  isLoading: boolean;
  error: string | undefined;
  paymasterMode: PaymasterMode;
  supportedTokens: Address[];

  getPaymasterData: (
    userOp: UserOperation,
    mode?: PaymasterMode,
    token?: Address,
  ) => Promise<PaymasterData | null>;
  setPaymasterMode: (mode: PaymasterMode) => void;
  getSupportedTokens: () => Promise<Address[]>;
  clearError: () => void;
}

export function usePaymaster(): UsePaymasterReturn {
  const { chainId } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [paymasterMode, setPaymasterMode] = useState<PaymasterMode>('verifying');
  const [supportedTokens, setSupportedTokens] = useState<Address[]>([]);

  const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
  const policyId = process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID;

  const getSupportedTokens = useCallback(async (): Promise<Address[]> => {
    if (!paymasterUrl) return [];
    try {
      const res = await fetch(`${paymasterUrl}/supported-tokens?chainId=${chainId}`);
      if (!res.ok) return [];
      const data = await res.json() as { tokens: Address[] };
      setSupportedTokens(data.tokens);
      return data.tokens;
    } catch (err) {
      log.error('Failed to get supported tokens', err);
      return [];
    }
  }, [paymasterUrl, chainId]);

  const getPaymasterData = useCallback(
    async (
      userOp: UserOperation,
      mode: PaymasterMode = paymasterMode,
      token?: Address,
    ): Promise<PaymasterData | null> => {
      if (mode === 'none' || !paymasterUrl) return null;

      try {
        setIsLoading(true);
        setError(undefined);

        const payload = {
          method: 'pm_sponsorUserOperation',
          params: [
            {
              sender: userOp.sender,
              nonce: userOp.nonce.toString(),
              callData: userOp.callData,
              callGasLimit: userOp.callGasLimit.toString(),
              verificationGasLimit: userOp.verificationGasLimit.toString(),
              preVerificationGas: userOp.preVerificationGas.toString(),
              maxFeePerGas: userOp.maxFeePerGas.toString(),
              maxPriorityFeePerGas: userOp.maxPriorityFeePerGas.toString(),
              signature: '0x',
              initCode: userOp.initCode,
            },
            { policyId, chainId, token },
          ],
        };

        const res = await fetch(paymasterUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`Paymaster error: ${res.statusText}`);

        const data = await res.json() as { result: PaymasterData };
        return data.result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Paymaster request failed';
        setError(msg);
        log.error('Paymaster data fetch failed', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [paymasterUrl, policyId, chainId, paymasterMode],
  );

  return {
    isLoading,
    error,
    paymasterMode,
    supportedTokens,
    getPaymasterData,
    setPaymasterMode,
    getSupportedTokens,
    clearError: () => setError(undefined),
  };
}
