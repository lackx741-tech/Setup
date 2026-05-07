'use client';

import { useEffect, useState } from 'react';
import { type Address } from 'viem';
import { usePaymaster, type PaymasterMode } from '@/hooks/usePaymaster';

export function PaymasterSelector() {
  const { paymasterMode, setPaymasterMode, getSupportedTokens, supportedTokens, isLoading } =
    usePaymaster();
  const [selectedToken, setSelectedToken] = useState<Address | undefined>();

  useEffect(() => {
    getSupportedTokens();
  }, [getSupportedTokens]);

  const modes: { value: PaymasterMode; label: string; description: string }[] = [
    {
      value: 'verifying',
      label: 'Sponsored',
      description: 'Transaction fees covered by the paymaster policy',
    },
    {
      value: 'token',
      label: 'Token Payment',
      description: 'Pay gas with an ERC-20 token instead of ETH',
    },
    {
      value: 'none',
      label: 'Self-pay',
      description: 'Pay gas from the smart account ETH balance',
    },
  ];

  return (
    <div className="card space-y-4">
      <h3 className="section-title">Paymaster Configuration</h3>

      <div className="space-y-2">
        {modes.map((mode) => (
          <label
            key={mode.value}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              paymasterMode === mode.value
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-surface-border hover:border-slate-500'
            }`}
          >
            <input
              type="radio"
              name="paymasterMode"
              value={mode.value}
              checked={paymasterMode === mode.value}
              onChange={() => setPaymasterMode(mode.value)}
              className="mt-0.5 accent-brand-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-200">{mode.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{mode.description}</p>
            </div>
          </label>
        ))}
      </div>

      {paymasterMode === 'token' && (
        <div>
          <label className="label">Payment Token</label>
          {isLoading ? (
            <div className="skeleton h-10 w-full rounded-lg" />
          ) : supportedTokens.length > 0 ? (
            <select
              value={selectedToken ?? ''}
              onChange={(e) => setSelectedToken(e.target.value as Address)}
              className="input"
            >
              <option value="">Select token...</option>
              {supportedTokens.map((t) => (
                <option key={t} value={t}>
                  {t.slice(0, 8)}...{t.slice(-6)}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-slate-500 bg-surface p-3 rounded-lg">
              No supported tokens found for this network.
            </p>
          )}
        </div>
      )}

      <div className="bg-surface rounded-lg p-3 text-xs text-slate-400 border border-surface-border">
        <p className="font-medium text-slate-300 mb-1">Selected Mode</p>
        <p>{modes.find((m) => m.value === paymasterMode)?.description}</p>
      </div>
    </div>
  );
}
