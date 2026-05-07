'use client';

import { useDelegationStore } from '@/store/delegation.store';
import { useExecutionStore } from '@/store/execution.store';
import { clsx } from 'clsx';

interface ActivityItem {
  id: string;
  type: 'delegation' | 'userOp' | 'sweep' | 'relay';
  title: string;
  subtitle: string;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const typeIcons: Record<ActivityItem['type'], string> = {
  delegation: '🔑',
  userOp: '⚡',
  sweep: '🧹',
  relay: '📡',
};

const statusColors: Record<ActivityItem['status'], string> = {
  success: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  failed: 'bg-red-500/20 text-red-400',
};

export function ActivityFeed() {
  const { delegationHistory } = useDelegationStore();
  const { pendingSweeps } = useExecutionStore();

  const activities: ActivityItem[] = [
    ...delegationHistory.slice(0, 5).map(
      (d): ActivityItem => ({
        id: d.id,
        type: 'delegation',
        title: `Delegation ${d.status}`,
        subtitle: `To ${d.delegatee.slice(0, 10)}...`,
        timestamp: d.timestamp,
        status:
          d.status === 'active'
            ? 'success'
            : d.status === 'pending'
              ? 'pending'
              : 'failed',
      }),
    ),
    ...pendingSweeps.slice(0, 3).map(
      (s): ActivityItem => ({
        id: s.id,
        type: 'sweep',
        title: `${s.type.toUpperCase()} Sweep`,
        subtitle: `${s.from.slice(0, 8)}... → ${s.to.slice(0, 8)}...`,
        timestamp: s.timestamp,
        status:
          s.status === 'complete'
            ? 'success'
            : s.status === 'pending'
              ? 'pending'
              : 'failed',
      }),
    ),
  ].sort((a, b) => b.timestamp - a.timestamp);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        <div className="text-3xl mb-2">📭</div>
        No activity yet. Connect your wallet and start interacting.
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((item) => (
        <div key={item.id} className="activity-item">
          <div
            className={clsx(
              'activity-icon',
              statusColors[item.status],
            )}
          >
            {typeIcons[item.type]}
          </div>
          <div className="activity-content">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-200 truncate">
                {item.title}
              </p>
              <span
                className={clsx('badge flex-shrink-0', statusColors[item.status])}
              >
                {item.status}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-slate-500 font-mono truncate">
                {item.subtitle}
              </p>
              <p className="text-xs text-slate-600 flex-shrink-0 ml-2">
                {timeAgo(item.timestamp)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
