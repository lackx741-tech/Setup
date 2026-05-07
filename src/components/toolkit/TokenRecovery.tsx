'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address, formatUnits } from 'viem';
import { useDaaS } from '@/hooks/useDaaS';

interface TokenEntry {
  address: string;
}

export function TokenRecovery() {
  const { address } = useAccount();
  const { getTokenBalances, sweepToken, isLoading, error } = useDaaS();

  const [targetAddress, setTargetAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tokenInputs, setTokenInputs] = useState<TokenEntry[]>([{ address: '' }]);
  const [balances, setBalances] = useState<
    { token: Address; symbol: string; decimals: number; balance: bigint }[]
  >([]);
  const [results, setResults] = useState<string[]>([]);

  const addToken = () => setTokenInputs((prev) => [...prev, { address: '' }]);
  const removeToken = (i: number) =>
    setTokenInputs((prev) => prev.filter((_, idx) => idx !== i));
  const updateToken = (i: number, value: string) =>
    setTokenInputs((prev) => prev.map((t, idx) => (idx === i ? { address: value } : t)));

  const handleCheckBalances = async () => {
    if (!targetAddress) return;
    const tokens = tokenInputs
      .map((t) => t.address.trim())
      .filter((a) => /^0x[0-9a-fA-F]{40}$/.test(a)) as Address[];
    const result = await getTokenBalances(targetAddress as Address, tokens);
    setBalances(result);
  };

  const handleRecoverAll = async () => {
    if (!targetAddress || !recipient) return;
    const hashes: string[] = [];
    for (const b of balances) {
      if (b.balance > 0n) {
        const hash = await sweepToken(
          b.token,
          targetAddress as Address,
          recipient as Address,
          b.balance,
        );
        if (hash) hashes.push(hash);
      }
    }
    setResults(hashes);
  };

  return (
    <div className="card space-y-4">
      <h3 className="section-title">Token Recovery</h3>
      <p className="text-xs text-slate-500">
        Recover ERC-20 tokens from a delegated address.
      </p>

      <div className="space-y-3">
        <div>
          <label className="label">Target Address (has tokens)</label>
          <input
            type="text"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            placeholder="0x..."
            className="input"
          />
        </div>
        <div>
          <label className="label">Recipient</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={address ?? '0x...'}
            className="input"
          />
          {address && (
            <button
              onClick={() => setRecipient(address)}
              className="text-xs text-brand-400 mt-1 hover:text-brand-300"
            >
              Use my address
            </button>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Token Addresses</label>
            <button onClick={addToken} className="text-xs text-brand-400 hover:text-brand-300">
              + Add
            </button>
          </div>
          {tokenInputs.map((token, i) => (
            <div key={i} className="flex gap-2 mb-1.5">
              <input
                type="text"
                value={token.address}
                onChange={(e) => updateToken(i, e.target.value)}
                placeholder="0x..."
                className="input text-xs"
              />
              {tokenInputs.length > 1 && (
                <button
                  onClick={() => removeToken(i)}
                  className="text-red-400 hover:text-red-300 text-xs px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleCheckBalances}
            disabled={!targetAddress || isLoading}
            className="btn-secondary text-xs w-full mt-1"
          >
            Check Balances
          </button>
        </div>
      </div>

      {balances.length > 0 && (
        <div className="space-y-1">
          {balances.map((b) => (
            <div key={b.token} className="flex justify-between text-xs bg-surface p-2 rounded border border-surface-border">
              <span className="text-slate-400 font-mono">{b.symbol}</span>
              <span className="text-slate-300 font-mono">
                {formatUnits(b.balance, b.decimals)} {b.symbol}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <p className="text-xs text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
          ✅ Recovered {results.length} token(s)
        </p>
      )}

      <button
        onClick={handleRecoverAll}
        disabled={!targetAddress || !recipient || balances.every((b) => b.balance === 0n) || isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Recovering...' : '🔄 Recover All Tokens'}
      </button>
    </div>
  );
}
