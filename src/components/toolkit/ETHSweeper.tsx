'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address, formatEther } from 'viem';
import { useDaaS } from '@/hooks/useDaaS';

export function ETHSweeper() {
  const { address } = useAccount();
  const { sweepETH, getETHBalance, isLoading, error } = useDaaS();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [balance, setBalance] = useState<bigint | null>(null);
  const [txHash, setTxHash] = useState('');

  const handleCheckBalance = async () => {
    if (!from) return;
    const result = await getETHBalance(from as Address);
    if (result) setBalance(result.balance);
  };

  const handleSweep = async () => {
    if (!from || !to) return;
    const hash = await sweepETH(from as Address, to as Address);
    if (hash) setTxHash(hash);
  };

  return (
    <div className="card space-y-4">
      <h3 className="section-title">ETH Sweeper</h3>
      <p className="text-xs text-slate-500">
        Transfer all ETH from a delegated address to a recipient.
      </p>

      <div className="space-y-3">
        <div>
          <label className="label">From Address</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="0x... (delegated address)"
              className="input"
            />
            <button
              onClick={handleCheckBalance}
              disabled={!from || isLoading}
              className="btn-secondary text-sm px-3 flex-shrink-0"
            >
              Check
            </button>
          </div>
        </div>

        {balance !== null && (
          <div className="bg-surface rounded p-2 border border-surface-border text-sm flex justify-between">
            <span className="text-slate-400">Available ETH</span>
            <span className="font-mono text-slate-200">{formatEther(balance)} ETH</span>
          </div>
        )}

        <div>
          <label className="label">To Address (recipient)</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={address ?? '0x... (destination)'}
            className="input"
          />
          {address && (
            <button
              onClick={() => setTo(address)}
              className="text-xs text-brand-400 mt-1 hover:text-brand-300"
            >
              Use my address
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}

      {txHash && (
        <p className="text-xs text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20 font-mono break-all">
          ✅ Tx: {txHash}
        </p>
      )}

      {balance !== null && balance === 0n && (
        <p className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
          No ETH balance to sweep.
        </p>
      )}

      <button
        onClick={handleSweep}
        disabled={!from || !to || isLoading || (balance !== null && balance === 0n)}
        className="btn-primary w-full"
      >
        {isLoading ? 'Sweeping...' : '💸 Sweep ETH'}
      </button>
    </div>
  );
}
