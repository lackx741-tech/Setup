'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useBundler } from '@/hooks/useBundler';
import { ENTRY_POINT_V07_ADDRESS } from '@/contracts/constants';
import { clsx } from 'clsx';

export function EntryPointStatus() {
  const { chainId } = useAccount();
  const { isConnected, supportedEntryPoints, checkBundlerHealth, getSupportedEntryPoints } = useBundler();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chainId) return;

    const init = async () => {
      setIsLoading(true);
      await Promise.all([checkBundlerHealth(), getSupportedEntryPoints()]);
      setIsLoading(false);
    };

    init();
  }, [chainId, checkBundlerHealth, getSupportedEntryPoints]);

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">EntryPoint Status</h3>
        <span
          className={clsx('badge', {
            'badge-success': isConnected,
            'badge-error': !isConnected,
          })}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Default EntryPoint</span>
          <span className="font-mono text-slate-300 text-xs">
            {ENTRY_POINT_V07_ADDRESS.slice(0, 10)}...
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Version</span>
          <span className="text-slate-300">v0.7</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Chain</span>
          <span className="text-slate-300">{chainId ?? '—'}</span>
        </div>
      </div>

      {supportedEntryPoints.length > 0 && (
        <div>
          <p className="label text-xs mb-2">Supported EntryPoints</p>
          <div className="space-y-1">
            {supportedEntryPoints.map((ep) => (
              <div
                key={ep}
                className="flex items-center gap-2 text-xs font-mono bg-surface p-2 rounded border border-surface-border"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-slate-300 truncate">{ep}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      )}
    </div>
  );
}
