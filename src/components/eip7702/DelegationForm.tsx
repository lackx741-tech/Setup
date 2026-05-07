'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address } from 'viem';
import { useEIP7702 } from '@/hooks/useEIP7702';
import { validateAddress } from '@/lib/utils/validation';
import { clsx } from 'clsx';

export function DelegationForm() {
  const { address, chainId } = useAccount();
  const { signDelegation, sendType4Transaction, isLoading, error, clearError } = useEIP7702();

  const [contractAddress, setContractAddress] = useState('');
  const [validationError, setValidationError] = useState('');
  const [signed, setSigned] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSign = async () => {
    clearError();
    setValidationError('');

    const result = validateAddress(contractAddress);
    if (!result.valid) {
      setValidationError(result.errors[0]);
      return;
    }

    const auth = await signDelegation({
      contractAddress: contractAddress as Address,
      nonce: 0n,
    });

    if (auth) {
      setSigned(true);
    }
  };

  const handleSend = async () => {
    if (!address) return;
    clearError();

    const hash = await sendType4Transaction({
      authorization: {
        chainId: chainId ?? 1,
        address: contractAddress as Address,
        nonce: 0n,
        yParity: 0,
        r: '0x',
        s: '0x',
        signature: '0x',
      },
      calls: [
        {
          to: address,
          value: 0n,
          data: '0x',
        },
      ],
    });

    if (hash) {
      setTxHash(hash);
    }
  };

  return (
    <div className="card space-y-4">
      <h3 className="section-title">Create EIP-7702 Delegation</h3>

      <div>
        <label className="label">Contract Address to Delegate To</label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => {
            setContractAddress(e.target.value);
            setValidationError('');
          }}
          placeholder="0x..."
          className={clsx('input', {
            'ring-2 ring-red-500': validationError,
          })}
        />
        {validationError && (
          <p className="text-xs text-red-400 mt-1">{validationError}</p>
        )}
      </div>

      {!address && (
        <p className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          Connect your wallet to create a delegation.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </p>
      )}

      {txHash && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3 font-mono break-all">
          ✅ Tx: {txHash}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSign}
          disabled={!address || isLoading || !contractAddress}
          className="btn-primary flex-1"
        >
          {isLoading ? 'Signing...' : '1. Sign Authorization'}
        </button>
        <button
          onClick={handleSend}
          disabled={!signed || isLoading || !address}
          className="btn-secondary flex-1"
        >
          {isLoading ? 'Sending...' : '2. Send Type-4 Tx'}
        </button>
      </div>
    </div>
  );
}
