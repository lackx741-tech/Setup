'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { useEIP7702 } from '@/hooks/useEIP7702';
import { clsx } from 'clsx';

interface AuthCall {
  to: string;
  value: string;
  data: string;
}

export function AuthCallExecutor() {
  const { address } = useAccount();
  const { sendType4Transaction, isLoading, error, pendingAuthorization, clearError } = useEIP7702();

  const [calls, setCalls] = useState<AuthCall[]>([
    { to: '', value: '0', data: '0x' },
  ]);
  const [txHash, setTxHash] = useState('');

  const addCall = () => {
    setCalls((prev) => [...prev, { to: '', value: '0', data: '0x' }]);
  };

  const removeCall = (i: number) => {
    setCalls((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateCall = (i: number, field: keyof AuthCall, value: string) => {
    setCalls((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    );
  };

  const handleExecute = async () => {
    if (!pendingAuthorization) return;
    clearError();

    const hash = await sendType4Transaction({
      authorization: pendingAuthorization,
      calls: calls.map((c) => ({
        to: c.to as Address,
        value: BigInt(c.value || '0'),
        data: (c.data || '0x') as Hex,
      })),
    });

    if (hash) {
      setTxHash(hash);
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">Auth Call Executor</h3>
        <button onClick={addCall} className="btn-secondary text-sm px-3 py-1">
          + Add Call
        </button>
      </div>

      {!pendingAuthorization && (
        <p className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          Sign a delegation authorization first using the Delegation Form.
        </p>
      )}

      <div className="space-y-3">
        {calls.map((call, i) => (
          <div key={i} className="bg-surface p-3 rounded-lg border border-surface-border space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">Call #{i + 1}</span>
              {calls.length > 1 && (
                <button
                  onClick={() => removeCall(i)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label text-xs">To</label>
                <input
                  type="text"
                  value={call.to}
                  onChange={(e) => updateCall(i, 'to', e.target.value)}
                  placeholder="0x..."
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="label text-xs">Value (wei)</label>
                <input
                  type="text"
                  value={call.value}
                  onChange={(e) => updateCall(i, 'value', e.target.value)}
                  placeholder="0"
                  className="input text-xs"
                />
              </div>
            </div>
            <div>
              <label className="label text-xs">Calldata</label>
              <input
                type="text"
                value={call.data}
                onChange={(e) => updateCall(i, 'data', e.target.value)}
                placeholder="0x"
                className="input text-xs font-mono"
              />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}
      {txHash && (
        <p className="text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20 font-mono break-all">
          ✅ {txHash}
        </p>
      )}

      <button
        onClick={handleExecute}
        disabled={!pendingAuthorization || isLoading || !address}
        className="btn-primary w-full"
      >
        {isLoading ? 'Executing...' : 'Execute Auth Calls'}
      </button>
    </div>
  );
}
