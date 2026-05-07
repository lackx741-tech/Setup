'use client';

import { useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { type Address, type Hex, formatEther, formatGwei } from 'viem';
import { type GasEstimation } from '@/types/daas';

export function GasEstimator() {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();

  const [to, setTo] = useState('');
  const [value, setValue] = useState('0');
  const [data, setData] = useState('0x');
  const [estimation, setEstimation] = useState<GasEstimation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEstimate = async () => {
    if (!address || !chainId || !publicClient) {
      setError('Connect wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const [gasLimit, feeData] = await Promise.all([
        publicClient.estimateGas({
          account: address,
          to: (to || address) as Address,
          value: BigInt(value || '0'),
          data: (data || '0x') as Hex,
        }),
        publicClient.estimateFeesPerGas(),
      ]);

      const gasPrice = feeData.maxFeePerGas ?? 1_000_000_000n;
      const totalWei = gasLimit * gasPrice;

      setEstimation({
        operation: 'Custom Transaction',
        gasLimit,
        gasPrice,
        totalCostWei: totalWei,
        totalCostETH: formatEther(totalWei),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Estimation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card space-y-4">
      <h3 className="section-title">Gas Estimator</h3>

      <div className="space-y-3">
        <div>
          <label className="label">To</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={address ?? '0x...'}
            className="input"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Value (wei)</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              className="input"
            />
          </div>
          <div>
            <label className="label">Calldata</label>
            <input
              type="text"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="0x"
              className="input font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {estimation && (
        <div className="bg-surface rounded-lg p-3 space-y-2 border border-surface-border">
          <p className="text-xs font-medium text-slate-300">Estimate</p>
          {[
            ['Gas Limit', estimation.gasLimit.toLocaleString()],
            ['Gas Price', `${formatGwei(estimation.gasPrice)} Gwei`],
            ['Total Cost (ETH)', estimation.totalCostETH],
            ['Total Cost (wei)', estimation.totalCostWei.toLocaleString()],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span className="text-slate-500">{k}</span>
              <span className="font-mono text-slate-300">{v}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}

      <button
        onClick={handleEstimate}
        disabled={!address || isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Estimating...' : '⛽ Estimate Gas'}
      </button>
    </div>
  );
}
