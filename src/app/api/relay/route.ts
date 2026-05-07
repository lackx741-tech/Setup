import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { relaySDK } from '@/lib/relay-sdk';
import { type RelayRequest } from '@/types/relay';

const log = logger.child('api:relay');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<RelayRequest>;

    if (!body.type || !body.sender || !body.payload) {
      return NextResponse.json(
        { error: 'Missing required fields: type, sender, payload' },
        { status: 400 },
      );
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    log.info('Relay request received', { type: body.type, sender: body.sender });

    // In production, this would forward to the bundler or execute directly
    const response = {
      id: `relay-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: 'pending' as const,
      timestamp: Date.now(),
    };

    return NextResponse.json(response, { status: 202 });
  } catch (err) {
    log.error('Relay request failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'EIP-7702 / ERC-4337 Relay API', version: '0.1.0' },
    { status: 200 },
  );
}
