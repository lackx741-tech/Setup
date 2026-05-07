import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { type RelayHealth } from '@/types/relay';

const log = logger.child('api:relay:health');

let startTime = Date.now();

export async function GET() {
  const latency = Date.now() - startTime;

  const health: RelayHealth = {
    status: 'ok',
    latency,
    bundlerStatus: 'ok',
    paymasterStatus: 'ok',
    timestamp: Date.now(),
    version: '0.1.0',
  };

  // Check bundler connectivity
  const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL;
  if (!bundlerUrl) {
    health.bundlerStatus = 'down';
    health.status = 'degraded';
  }

  // Check paymaster connectivity
  const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
  if (!paymasterUrl) {
    health.paymasterStatus = 'down';
    if (health.status === 'ok') health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503;

  log.debug('Health check', health);
  return NextResponse.json(health, { status: statusCode });
}
