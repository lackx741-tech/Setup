'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address } from 'viem';
import { useDaaS } from '@/hooks/useDaaS';
import { useExecutionStore } from '@/store/execution.store';

const COMMON_TOKENS: { symbol: string; address: Address }[] = [
  { symbol: 'USDC (Sepolia)', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' },
  { symbol: 'WETH (Sepolia)', address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9' },
];

export function DaaSSweeper() {
  const { address } = useAccount();
  const { sweepAll, getTokenBalances, isLoading, error } = useDaaS();
  const { pendingSweeps } = useExecutionStore();

  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<Set<Address>>(new Set());
  const [results, setResults] = useState<string[]>([]);

  const toggleToken = (addr: Address) => {
    setSelectedTokens((prev) => {
      const next = new Set(prev);
      if (next.has(addr)) next.delete(addr);
      else next.add(addr);
      return next;
    });
  };

  const handleSweep = async () => {
    if (!fromAddress || !toAddress) return;
    const hashes = await sweepAll(
      fromAddress as Address,
      toAddress as Address,
      Array.from(selectedTokens),
    );
    setResults(hashes);
  };

  return (
    <div className="card space-y-4">
      <h3 className="section-title">DaaS Full Sweeper</h3>
      <p className="text-xs text-slate-500">
        Sweep all ETH and selected ERC-20 tokens from one address to another using the DaaS executor.
      </p>

      <div className="space-y-3">
        <div>
          <label className="label">From Address</label>
          <input
            type="text"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            placeholder="0x... (source)"
            className="input"
          />
        </div>
        <div>
          <label className="label">To Address (recipient)</label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder={address ?? '0x... (destination)'}
            className="input"
          />
          {address && (
            <button
              onClick={() => setToAddress(address)}
              className="text-xs text-brand-400 mt-1 hover:text-brand-300"
            >
              Use my address
            </button>
          )}
        </div>

        <div>
          <label className="label">Include Tokens</label>
          <div className="space-y-1.5">
            {COMMON_TOKENS.map((token) => (
              <label key={token.address} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTokens.has(token.address)}
                  onChange={() => toggleToken(token.address)}
                  className="accent-brand-500"
                />
                <span className="text-sm text-slate-300">{token.symbol}</span>
                <span className="text-xs text-slate-500 font-mono">
                  {token.address.slice(0, 10)}...
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <p className="text-xs font-medium text-green-400 mb-1">Sweep complete ({results.length} tx)</p>
          {results.map((h, i) => (
            <p key={i} className="text-xs font-mono text-green-300 truncate">{h}</p>
          ))}
        </div>
      )}

      {pendingSweeps.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-1">Pending Operations</p>
          {pendingSweeps.slice(0, 3).map((op) => (
            <div key={op.id} className="text-xs flex justify-between py-0.5">
              <span className="text-slate-400">{op.type.toUpperCase()}</span>
              <span className="text-slate-500">{op.status}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSweep}
        disabled={!fromAddress || !toAddress || isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Sweeping...' : '🧹 Sweep All Assets'}
      </button>
    </div>
  );
}
