import type { Metadata } from 'next';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import '@/styles/dashboard.css';

export const metadata: Metadata = {
  title: 'Dashboard | EIP-7702 & ERC-4337',
  description: 'Manage EIP-7702 delegations, ERC-4337 user operations, and DaaS sweeping',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <Header />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
