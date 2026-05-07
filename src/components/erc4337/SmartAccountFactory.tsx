'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address } from 'viem';
import { useSmartAccount } from '@/hooks/useSmartAccount';
import { clsx } from 'clsx';

export function SmartAccountFactory() {
  const { address } = useAccount();
  const {
    computeAddress,
    getSmartAccountInfo,
    smartAccount,
    isLoading,
    error,
    clearError,
  } = useSmartAccount();

  const [salt, setSalt] = useState('0');
  const [predictedAddress, setPredictedAddress] = useState<Address | null>(null);

  const handleComputeAddress = async () => {
    if (!address) return;
    clearError();
    const addr = await computeAddress(address, BigInt(salt || '0'));
    if (addr) {
      setPredictedAddress(addr);
      await getSmartAccountInfo(addr);
    }
  };

  return (
    <div className="card space-y-4">
      <h3 className="section-title">Smart Account Factory</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Owner</label>
          <input
            type="text"
            value={address ?? ''}
            readOnly
            placeholder="Connect wallet..."
            className="input opacity-60 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="label">Salt (index)</label>
          <input
            type="number"
            value={salt}
            onChange={(e) => setSalt(e.target.value)}
            className="input"
            min="0"
          />
        </div>
      </div>

      {predictedAddress && (
        <div className="space-y-3">
          <div className="bg-surface rounded-lg p-3 border border-surface-border">
            <p className="text-xs text-slate-400 mb-1">Predicted Smart Account Address</p>
            <p className="font-mono text-sm text-slate-200 break-all">{predictedAddress}</p>
          </div>

          {smartAccount && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-surface rounded p-2 border border-surface-border">
                <p className="text-xs text-slate-500">Deployed</p>
                <p className={clsx('font-medium', smartAccount.isDeployed ? 'text-green-400' : 'text-yellow-400')}>
                  {smartAccount.isDeployed ? 'Yes' : 'Not deployed'}
                </p>
              </div>
              <div className="bg-surface rounded p-2 border border-surface-border">
                <p className="text-xs text-slate-500">Balance</p>
                <p className="font-medium text-slate-300">
                  {(Number(smartAccount.balance) / 1e18).toFixed(6)} ETH
                </p>
              </div>
              <div className="bg-surface rounded p-2 border border-surface-border">
                <p className="text-xs text-slate-500">Nonce</p>
                <p className="font-medium text-slate-300">{smartAccount.nonce.toString()}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleComputeAddress}
          disabled={!address || isLoading}
          className="btn-secondary flex-1"
        >
          {isLoading ? 'Computing...' : 'Compute Address'}
        </button>
        <button
          disabled={!predictedAddress || smartAccount?.isDeployed || isLoading}
          className="btn-primary flex-1"
          title={smartAccount?.isDeployed ? 'Already deployed' : 'Deploy via UserOperation'}
        >
          Deploy Account
        </button>
      </div>
    </div>
  );
}
