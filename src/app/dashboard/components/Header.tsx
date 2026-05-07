'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { NetworkStatus } from './NetworkStatus';

export function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="dashboard-header flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-slate-200">
          EIP-7702 &amp; ERC-4337 Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <NetworkStatus compact />

        {isConnected && address ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-slate-300 bg-surface-elevated px-3 py-1.5 rounded-lg border border-surface-border">
              {formatAddress(address)}
            </span>
            <button
              onClick={() => disconnect()}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            disabled={connectors.length === 0}
            className="btn-primary text-sm disabled:opacity-50"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
