'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address, type Hex, formatGwei } from 'viem';
import { useEIP7702 } from '@/hooks/useEIP7702';
import { type Type4Transaction } from '@/types/eip7702';

export function Type4TransactionBuilder() {
  const { address, chainId } = useAccount();
  const { pendingAuthorization, isLoading } = useEIP7702();

  const [to, setTo] = useState('');
  const [value, setValue] = useState('0');
  const [data, setData] = useState('0x');
  const [maxFeePerGas, setMaxFeePerGas] = useState('20');
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState('1');

  const preview: Partial<Type4Transaction> | null =
    address && chainId && pendingAuthorization
      ? {
          type: '0x4',
          chainId,
          nonce: 0n,
          maxFeePerGas: BigInt(Math.floor(parseFloat(maxFeePerGas) * 1e9)),
          maxPriorityFeePerGas: BigInt(
            Math.floor(parseFloat(maxPriorityFeePerGas) * 1e9),
          ),
          gas: 100_000n,
          to: (to || address) as Address,
          value: BigInt(value || '0'),
          data: (data || '0x') as Hex,
          authorizationList: [pendingAuthorization],
        }
      : null;

  return (
    <div className="card space-y-4">
      <h3 className="section-title">Type-4 Transaction Builder</h3>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="label">To Address</label>
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
            <label className="label">Max Fee (Gwei)</label>
            <input
              type="number"
              value={maxFeePerGas}
              onChange={(e) => setMaxFeePerGas(e.target.value)}
              className="input"
            />
          </div>
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

      {!pendingAuthorization && (
        <p className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
          ⚠️ No signed authorization. Sign a delegation first.
        </p>
      )}

      {preview && (
        <div>
          <p className="label">Transaction Preview</p>
          <pre className="bg-surface text-xs text-slate-300 p-3 rounded border border-surface-border overflow-x-auto">
            {JSON.stringify(
              {
                ...preview,
                maxFeePerGas: `${maxFeePerGas} Gwei`,
                maxPriorityFeePerGas: `${maxPriorityFeePerGas} Gwei`,
                authorizationList: `[${preview.authorizationList?.length ?? 0} auth(s)]`,
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
