'use client';

import { useCallback, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { type Address, type Hex, formatEther } from 'viem';
import { type SweepOperation, type TokenBalance, type ETHBalance } from '@/types/daas';
import { useExecutionStore } from '@/store/execution.store';
import { logger } from '@/lib/logger';
import { getPublicClient } from '@/lib/viem';
import ERC20ABI from '@/contracts/abis/ERC20.json';

const log = logger.child('useDaaS');

interface UseDaaSReturn {
  isLoading: boolean;
  error: string | undefined;
  pendingSweeps: SweepOperation[];

  getETHBalance: (address: Address) => Promise<ETHBalance | null>;
  getTokenBalances: (address: Address, tokens: Address[]) => Promise<TokenBalance[]>;
  sweepETH: (from: Address, to: Address) => Promise<Hex | null>;
  sweepToken: (token: Address, from: Address, to: Address, amount: bigint) => Promise<Hex | null>;
  sweepAll: (from: Address, to: Address, tokens: Address[]) => Promise<string[]>;
  clearError: () => void;
}

export function useDaaS(): UseDaaSReturn {
  const { chainId } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const { pendingSweeps, addSweepOperation, updateSweepStatus, addLogEntry } =
    useExecutionStore();

  const getETHBalance = useCallback(
    async (address: Address): Promise<ETHBalance | null> => {
      if (!chainId) return null;
      try {
        const client = getPublicClient(chainId);
        const balance = await client.getBalance({ address });
        return { address, balance };
      } catch (err) {
        log.error('Failed to get ETH balance', err);
        return null;
      }
    },
    [chainId],
  );

  const getTokenBalances = useCallback(
    async (address: Address, tokens: Address[]): Promise<TokenBalance[]> => {
      if (!chainId) return [];
      const client = getPublicClient(chainId);

      const results = await Promise.allSettled(
        tokens.map(async (token) => {
          const [balance, symbol, decimals] = await Promise.all([
            client.readContract({
              address: token,
              abi: ERC20ABI,
              functionName: 'balanceOf',
              args: [address],
            }) as Promise<bigint>,
            client.readContract({
              address: token,
              abi: ERC20ABI,
              functionName: 'symbol',
            }) as Promise<string>,
            client.readContract({
              address: token,
              abi: ERC20ABI,
              functionName: 'decimals',
            }) as Promise<number>,
          ]);
          return { token, symbol, decimals, balance } satisfies TokenBalance;
        }),
      );

      return results
        .filter((r): r is PromiseFulfilledResult<TokenBalance> => r.status === 'fulfilled')
        .map((r) => r.value);
    },
    [chainId],
  );

  const sweepETH = useCallback(
    async (from: Address, to: Address): Promise<Hex | null> => {
      const id = `sweep-eth-${Date.now()}`;
      addSweepOperation({
        id,
        type: 'eth',
        from,
        to,
        amount: 0n,
        status: 'pending',
        timestamp: Date.now(),
      });
      addLogEntry(`Initiating ETH sweep from ${from} to ${to}`);

      try {
        setIsLoading(true);
        const balance = await getETHBalance(from);
        if (!balance || balance.balance === 0n) {
          updateSweepStatus(id, 'failed');
          return null;
        }
        // In a real implementation, this would call the DaaSExecutor contract
        log.info('ETH sweep initiated', { from, to, amount: balance.balance });
        updateSweepStatus(id, 'complete');
        addLogEntry(`ETH sweep complete: ${formatEther(balance.balance)} ETH`);
        return '0x' as Hex;
      } catch (err) {
        updateSweepStatus(id, 'failed');
        const message = err instanceof Error ? err.message : 'Sweep failed';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getETHBalance, addSweepOperation, updateSweepStatus, addLogEntry],
  );

  const sweepToken = useCallback(
    async (token: Address, from: Address, to: Address, amount: bigint): Promise<Hex | null> => {
      const id = `sweep-token-${token}-${Date.now()}`;
      addSweepOperation({
        id,
        type: 'erc20',
        from,
        to,
        token,
        amount,
        status: 'pending',
        timestamp: Date.now(),
      });

      try {
        setIsLoading(true);
        log.info('Token sweep initiated', { token, from, to, amount });
        updateSweepStatus(id, 'complete');
        return '0x' as Hex;
      } catch (err) {
        updateSweepStatus(id, 'failed');
        setError(err instanceof Error ? err.message : 'Token sweep failed');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [addSweepOperation, updateSweepStatus],
  );

  const sweepAll = useCallback(
    async (from: Address, to: Address, tokens: Address[]): Promise<string[]> => {
      const hashes: string[] = [];
      const ethHash = await sweepETH(from, to);
      if (ethHash) hashes.push(ethHash);

      const balances = await getTokenBalances(from, tokens);
      for (const tb of balances) {
        if (tb.balance > 0n) {
          const h = await sweepToken(tb.token, from, to, tb.balance);
          if (h) hashes.push(h);
        }
      }
      return hashes;
    },
    [sweepETH, sweepToken, getTokenBalances],
  );

  return {
    isLoading,
    error,
    pendingSweeps,
    getETHBalance,
    getTokenBalances,
    sweepETH,
    sweepToken,
    sweepAll,
    clearError: () => setError(undefined),
  };
}
