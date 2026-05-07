'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: '📊' },
  { label: 'EIP-7702', href: '/dashboard/eip7702', icon: '🔐' },
  { label: 'ERC-4337', href: '/dashboard/erc4337', icon: '⚡' },
  { label: 'DaaS Toolkit', href: '/dashboard/toolkit', icon: '🧰' },
  { label: 'Activity', href: '/dashboard/activity', icon: '📋' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

const quickLinks = [
  { label: 'Delegate', href: '/dashboard/eip7702#delegate', icon: '🔑' },
  { label: 'Send UserOp', href: '/dashboard/erc4337#send', icon: '📤' },
  { label: 'Sweep ETH', href: '/dashboard/toolkit#sweep', icon: '💸' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
          W3
        </div>
        <div>
          <p className="text-sm font-bold text-slate-100 leading-none">Web3 Relay</p>
          <p className="text-xs text-slate-500 leading-tight mt-0.5">v0.1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-medium text-slate-600 px-3 mb-2 mt-2 uppercase tracking-wider">
          Navigation
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx('nav-item', {
              active: pathname === item.href,
            })}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <p className="text-xs font-medium text-slate-600 px-3 mb-2 mt-4 uppercase tracking-wider">
          Quick Actions
        </p>
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="nav-item text-xs"
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-border">
        <p className="text-xs text-slate-600 text-center">
          EIP-7702 &amp; ERC-4337
        </p>
      </div>
    </aside>
  );
}
