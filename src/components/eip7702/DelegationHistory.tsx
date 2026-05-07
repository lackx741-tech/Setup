'use client';

import { useDelegationStore } from '@/store/delegation.store';
import { type DelegationRecord } from '@/types/eip7702';
import { CHAIN_NAMES } from '@/contracts/chains';
import { clsx } from 'clsx';

function DelegationRow({ record }: { record: DelegationRecord }) {
  const date = new Date(record.timestamp).toLocaleDateString();

  return (
    <div className="flex items-start justify-between p-3 border-b border-surface-border last:border-b-0 hover:bg-white/5 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={clsx('badge', {
              'badge-success': record.status === 'active',
              'badge-warning': record.status === 'pending',
              'badge-error': record.status === 'revoked' || record.status === 'expired',
            })}
          >
            {record.status}
          </span>
          <span className="text-xs text-slate-500">
            {CHAIN_NAMES[record.chainId] ?? `Chain ${record.chainId}`}
          </span>
          <span className="text-xs text-slate-600">{date}</span>
        </div>
        <div className="text-xs font-mono text-slate-400 truncate">
          <span className="text-slate-500">Delegatee:</span>{' '}
          {record.delegatee}
        </div>
        {record.txHash && (
          <div className="text-xs font-mono text-slate-500 truncate mt-0.5">
            <span className="text-slate-600">Tx:</span> {record.txHash.slice(0, 18)}...
          </div>
        )}
      </div>
    </div>
  );
}

export function DelegationHistory() {
  const { delegationHistory, clearHistory } = useDelegationStore();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Delegation History</h3>
        {delegationHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {delegationHistory.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">📜</div>
          <p className="text-slate-500 text-sm">No delegation history yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-surface-border overflow-hidden">
          {delegationHistory.map((record) => (
            <DelegationRow key={record.id} record={record} />
          ))}
        </div>
      )}

      {delegationHistory.length > 0 && (
        <p className="text-xs text-slate-600 mt-2 text-right">
          {delegationHistory.length} record{delegationHistory.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
