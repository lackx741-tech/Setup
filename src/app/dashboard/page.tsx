'use client';

import { ActivityFeed } from './components/ActivityFeed';
import { NetworkStatus } from './components/NetworkStatus';
import { useAccount } from 'wagmi';
import { useWalletStore } from '@/store/wallet.store';
import { useDelegationStore } from '@/store/delegation.store';

export default function DashboardPage() {
  const { address, chainId, isConnected } = useAccount();
  const { delegationHistory } = useDelegationStore();

  const stats = [
    {
      label: 'Active Delegations',
      value: delegationHistory.filter((d) => d.status === 'active').length.toString(),
      change: '+0',
      icon: '🔑',
    },
    {
      label: 'UserOps Sent',
      value: '0',
      change: '+0',
      icon: '⚡',
    },
    {
      label: 'Gas Saved (ETH)',
      value: '0.00',
      change: '0.00',
      icon: '⛽',
    },
    {
      label: 'Sweep Operations',
      value: '0',
      change: '+0',
      icon: '🧹',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">
          EIP-7702 delegation management &amp; ERC-4337 account abstraction
        </p>
      </div>

      {/* Connection banner */}
      {!isConnected && (
        <div className="bg-brand-900/30 border border-brand-500/30 rounded-lg p-4 text-sm text-brand-300">
          Connect your wallet to get started with EIP-7702 delegations and ERC-4337 user operations.
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-xs text-slate-500">{stat.change}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title">Recent Activity</h2>
          <ActivityFeed />
        </div>

        <div className="card">
          <h2 className="section-title">Network Status</h2>
          <NetworkStatus />
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'New Delegation', href: '#', icon: '➕' },
            { label: 'Send UserOp', href: '#', icon: '📤' },
            { label: 'Sweep ETH', href: '#', icon: '💸' },
            { label: 'Recover Tokens', href: '#', icon: '🔄' },
          ].map((action) => (
            <button
              key={action.label}
              className="btn-secondary flex flex-col items-center gap-2 py-4 text-center"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
