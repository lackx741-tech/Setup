'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { useGasless } from '@/hooks/useGasless';

export function SponsoredTransaction() {
  const { address } = useAccount();
  const { sendGaslessTransaction, isLoading, error, isSponsored, clearError } = useGasless();

  const [to, setTo] = useState('');
  const [value, setValue] = useState('0');
  const [data, setData] = useState('0x');
  const [txHash, setTxHash] = useState('');

  const handleSend = async () => {
    if (!address) return;
    clearError();

    const hash = await sendGaslessTransaction({
      from: address,
      to: (to || address) as Address,
      value: BigInt(value || '0'),
      data: (data || '0x') as Hex,
    });

    if (hash) setTxHash(hash);
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">Sponsored Transaction</h3>
        {isSponsored && (
          <span className="badge badge-success">⛽ Sponsored</span>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Send a transaction without paying gas fees. The paymaster will cover the costs.
      </p>

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

      {!address && (
        <p className="text-sm text-yellow-400 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
          Connect your wallet to send sponsored transactions.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}

      {txHash && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <p className="text-xs text-green-400 font-medium mb-1">Transaction Submitted</p>
          <p className="text-xs font-mono text-green-300 break-all">{txHash}</p>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={!address || isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Submitting...' : '⚡ Send Gasless Transaction'}
      </button>
    </div>
  );
}
