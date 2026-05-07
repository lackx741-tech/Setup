'use client';

import { useCallback, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { type UserOperation } from '@/types/erc4337';
import { useERC4337 } from '@/hooks/useERC4337';
import { usePaymaster } from '@/hooks/usePaymaster';
import { useBundler } from '@/hooks/useBundler';
import { logger } from '@/lib/logger';

const log = logger.child('useGasless');

interface GaslessTransactionParams {
  from: Address;
  to: Address;
  value?: bigint;
  data?: Hex;
  initCode?: Hex;
}

interface UseGaslessReturn {
  isLoading: boolean;
  error: string | undefined;
  isSponsored: boolean;

  sendGaslessTransaction: (params: GaslessTransactionParams) => Promise<Hex | null>;
  estimateGaslessCost: (params: GaslessTransactionParams) => Promise<string>;
  clearError: () => void;
}

export function useGasless(): UseGaslessReturn {
  const { chainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isSponsored, setIsSponsored] = useState(false);

  const { buildUserOperation, sendUserOperation } = useERC4337();
  const { getPaymasterData, paymasterMode } = usePaymaster();
  const { estimateUserOperationGas } = useBundler();

  const sendGaslessTransaction = useCallback(
    async (params: GaslessTransactionParams): Promise<Hex | null> => {
      if (!chainId || !walletClient) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setIsLoading(true);
        setError(undefined);

        // 1. Build calldata
        const callData = params.data ?? '0x';

        // 2. Build initial UserOperation
        let userOp = buildUserOperation({
          sender: params.from,
          callData,
          initCode: params.initCode,
        });

        // 3. Estimate gas
        const gasEstimate = await estimateUserOperationGas(userOp);
        if (gasEstimate) {
          userOp = { ...userOp, ...gasEstimate };
        }

        // 4. Get paymaster sponsorship
        const pmData = await getPaymasterData(userOp);
        if (pmData) {
          setIsSponsored(true);
          userOp = {
            ...userOp,
            paymasterAndData: pmData.paymaster + pmData.paymasterData.replace('0x', ''),
          };
        } else {
          setIsSponsored(false);
        }

        // 5. Sign the UserOperation
        const userOpHash = '0x' as Hex; // Would be computed from getUserOperationHash
        const signature = await walletClient.signMessage({
          account: params.from,
          message: { raw: userOpHash },
        });
        userOp = { ...userOp, signature };

        // 6. Submit via bundler
        const txHash = await sendUserOperation(userOp);
        log.info('Gasless transaction sent', { txHash, isSponsored });
        return txHash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gasless transaction failed';
        setError(message);
        log.error('Gasless transaction failed', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [chainId, walletClient, buildUserOperation, estimateUserOperationGas, getPaymasterData, sendUserOperation],
  );

  const estimateGaslessCost = useCallback(
    async (params: GaslessTransactionParams): Promise<string> => {
      const pmData = paymasterMode !== 'none';
      if (pmData) return 'Sponsored (free)';
      return 'Requires gas in smart account';
    },
    [paymasterMode],
  );

  return {
    isLoading,
    error,
    isSponsored,
    sendGaslessTransaction,
    estimateGaslessCost,
    clearError: () => setError(undefined),
  };
}
