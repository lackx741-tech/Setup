'use client';

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { clsx } from 'clsx';
import { useRelay } from '@/hooks/useRelay';
import { useBundler } from '@/hooks/useBundler';
import { CHAIN_NAMES } from '@/contracts/chains';

interface ServiceStatus {
  name: string;
  status: 'ok' | 'degraded' | 'down' | 'unknown';
  latency?: number;
}

interface NetworkStatusProps {
  compact?: boolean;
}

export function NetworkStatus({ compact = false }: NetworkStatusProps) {
  const { chainId, isConnected } = useAccount();
  const { checkHealth: checkRelay } = useRelay();
  const { checkBundlerHealth } = useBundler();

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Relay', status: 'unknown' },
    { name: 'Bundler', status: 'unknown' },
    { name: 'RPC', status: 'unknown' },
  ]);
  const [blockNumber, setBlockNumber] = useState<bigint | undefined>();
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!isConnected) return;

    const check = async () => {
      const results = await Promise.allSettled([
        checkRelay(),
        checkBundlerHealth(),
        publicClient?.getBlockNumber(),
      ]);

      setServices([
        {
          name: 'Relay',
          status: results[0].status === 'fulfilled' && results[0].value ? 'ok' : 'down',
        },
        {
          name: 'Bundler',
          status: results[1].status === 'fulfilled' && results[1].value ? 'ok' : 'down',
        },
        {
          name: 'RPC',
          status: results[2].status === 'fulfilled' ? 'ok' : 'down',
        },
      ]);

      if (results[2].status === 'fulfilled' && results[2].value) {
        setBlockNumber(results[2].value as bigint);
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [isConnected, checkRelay, checkBundlerHealth, publicClient]);

  if (compact) {
    const overallOk = services.every((s) => s.status === 'ok' || s.status === 'unknown');
    return (
      <div
        className={clsx('network-badge', {
          connected: isConnected && overallOk,
          disconnected: !isConnected || !overallOk,
        })}
      >
        <span
          className={clsx('status-dot', {
            'bg-green-500': isConnected && overallOk,
            'bg-red-500': !isConnected,
            'bg-yellow-500': isConnected && !overallOk,
          })}
        />
        {isConnected
          ? `${CHAIN_NAMES[chainId ?? 1] ?? 'Unknown'}`
          : 'Disconnected'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Network</span>
        <span className="font-medium text-slate-200 text-sm">
          {isConnected
            ? CHAIN_NAMES[chainId ?? 1] ?? `Chain ${chainId}`
            : '—'}
        </span>
      </div>

      {blockNumber !== undefined && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Block</span>
          <span className="font-mono text-sm text-slate-300">
            #{blockNumber.toLocaleString()}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between">
            <span className="text-sm text-slate-400">{service.name}</span>
            <div className="flex items-center gap-2">
              {service.latency !== undefined && (
                <span className="text-xs text-slate-500">{service.latency}ms</span>
              )}
              <span
                className={clsx('badge', {
                  'badge-success': service.status === 'ok',
                  'badge-warning': service.status === 'degraded',
                  'badge-error': service.status === 'down',
                  'bg-slate-500/20 text-slate-400': service.status === 'unknown',
                })}
              >
                {service.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
