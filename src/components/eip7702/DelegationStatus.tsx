'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useEIP7702 } from '@/hooks/useEIP7702';
import { useDelegationStore } from '@/store/delegation.store';
import { clsx } from 'clsx';

export function DelegationStatus() {
  const { address } = useAccount();
  const { activeDelegation, isLoading } = useEIP7702();
  const { delegationHistory } = useDelegationStore();

  if (!address) {
    return (
      <div className="card text-center py-6">
        <p className="text-slate-500 text-sm">Connect wallet to view delegation status</p>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <h3 className="section-title">Delegation Status</h3>

      {isLoading ? (
        <div className="space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      ) : activeDelegation ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={clsx('badge', {
                'badge-success': activeDelegation.status === 'active',
                'badge-warning': activeDelegation.status === 'pending',
                'badge-error': activeDelegation.status === 'revoked' || activeDelegation.status === 'expired',
              })}
            >
              {activeDelegation.status}
            </span>
            <span className="text-sm text-slate-300">Active Delegation</span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Delegator</span>
              <span className="font-mono text-slate-300">
                {activeDelegation.delegator.slice(0, 10)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Delegatee</span>
              <span className="font-mono text-slate-300">
                {activeDelegation.delegatee.slice(0, 10)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Chain</span>
              <span className="text-slate-300">{activeDelegation.chainId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tx Hash</span>
              <span className="font-mono text-slate-300">
                {activeDelegation.txHash.slice(0, 12)}...
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">🔓</div>
          <p className="text-slate-400 text-sm">No active delegation</p>
          <p className="text-slate-500 text-xs mt-1">
            Create a delegation to allow a contract to act on your behalf
          </p>
        </div>
      )}

      {delegationHistory.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">
            Recent ({delegationHistory.length})
          </p>
          <div className="space-y-1.5">
            {delegationHistory.slice(0, 3).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between text-xs bg-surface p-2 rounded border border-surface-border"
              >
                <span className="font-mono text-slate-400">
                  {d.delegatee.slice(0, 12)}...
                </span>
                <span
                  className={clsx('badge text-xs', {
                    'badge-success': d.status === 'active',
                    'badge-warning': d.status === 'pending',
                    'badge-error': d.status === 'revoked' || d.status === 'expired',
                  })}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
