import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { type DelegateRelayPayload } from '@/types/relay';
import { validateAddress } from '@/lib/utils/validation';

const log = logger.child('api:relay:delegate');

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as DelegateRelayPayload;

    const delegatorValidation = validateAddress(body.delegator);
    const delegateeValidation = validateAddress(body.delegatee);

    if (!delegatorValidation.valid || !delegateeValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid addresses', details: [...delegatorValidation.errors, ...delegateeValidation.errors] },
        { status: 400 },
      );
    }

    if (!body.authorization || !body.chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: authorization, chainId' },
        { status: 400 },
      );
    }

    log.info('Delegation relay request', {
      delegator: body.delegator,
      delegatee: body.delegatee,
      chainId: body.chainId,
    });

    // In production, this would:
    // 1. Verify the authorization signature
    // 2. Build and submit the EIP-7702 type-4 transaction
    // 3. Monitor and return the result

    const response = {
      id: `delegate-${Date.now()}`,
      status: 'pending' as const,
      txHash: undefined,
      timestamp: Date.now(),
    };

    return NextResponse.json(response, { status: 202 });
  } catch (err) {
    log.error('Delegation relay failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Delegation relay failed' },
      { status: 500 },
    );
  }
}
