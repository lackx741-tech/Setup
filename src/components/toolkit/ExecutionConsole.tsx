'use client';

import { useRef } from 'react';
import { useExecutionStore } from '@/store/execution.store';
import { clsx } from 'clsx';

const STATUS_COLORS = {
  idle: 'text-slate-400',
  preparing: 'text-yellow-400',
  signing: 'text-blue-400',
  submitting: 'text-purple-400',
  pending: 'text-yellow-400',
  confirmed: 'text-green-400',
  failed: 'text-red-400',
};

export function ExecutionConsole() {
  const {
    status,
    executionLog,
    clearLog,
    currentTxHash,
    currentUserOpHash,
    error,
  } = useExecutionStore();

  const logRef = useRef<HTMLDivElement>(null);

  const getStatusIcon = () => {
    switch (status) {
      case 'idle': return '●';
      case 'preparing': return '⏳';
      case 'signing': return '✍️';
      case 'submitting': return '📤';
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'failed': return '❌';
      default: return '●';
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">Execution Console</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{getStatusIcon()}</span>
            <span className={clsx('text-xs font-medium', STATUS_COLORS[status])}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <button
            onClick={clearLog}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Current transaction info */}
      {(currentTxHash || currentUserOpHash) && (
        <div className="bg-surface rounded-lg p-3 border border-surface-border space-y-1.5 text-xs">
          {currentTxHash && (
            <div className="flex justify-between gap-2">
              <span className="text-slate-500 flex-shrink-0">Tx Hash</span>
              <span className="font-mono text-slate-300 truncate">{currentTxHash}</span>
            </div>
          )}
          {currentUserOpHash && (
            <div className="flex justify-between gap-2">
              <span className="text-slate-500 flex-shrink-0">UserOp Hash</span>
              <span className="font-mono text-slate-300 truncate">{currentUserOpHash}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
          <span className="font-medium">Error: </span>
          {error}
        </div>
      )}

      {/* Log output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-slate-500">Log Output</p>
          <p className="text-xs text-slate-600">{executionLog.length} entries</p>
        </div>
        <div
          ref={logRef}
          className="bg-surface rounded-lg border border-surface-border p-3 h-56 overflow-y-auto"
        >
          {executionLog.length === 0 ? (
            <p className="text-xs text-slate-600 italic">Execution log is empty...</p>
          ) : (
            <div className="space-y-0.5">
              {executionLog.map((entry, i) => (
                <p
                  key={i}
                  className={clsx('text-xs font-mono leading-relaxed', {
                    'text-red-400': entry.toLowerCase().includes('error') || entry.toLowerCase().includes('failed'),
                    'text-green-400': entry.toLowerCase().includes('complete') || entry.toLowerCase().includes('success'),
                    'text-yellow-400': entry.toLowerCase().includes('pending') || entry.toLowerCase().includes('warning'),
                    'text-slate-400': !entry.toLowerCase().match(/error|failed|complete|success|pending|warning/),
                  })}
                >
                  {entry}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
