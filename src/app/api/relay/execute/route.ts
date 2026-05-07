import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { type ExecuteRelayPayload } from '@/types/relay';
import { validateAddress, validateHex } from '@/lib/utils/validation';

const log = logger.child('api:relay:execute');

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as ExecuteRelayPayload;

    if (!body.sender || !body.calls || !Array.isArray(body.calls) || body.calls.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: sender, calls (non-empty array)' },
        { status: 400 },
      );
    }

    const senderValidation = validateAddress(body.sender);
    if (!senderValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid sender address', details: senderValidation.errors },
        { status: 400 },
      );
    }

    // Validate each call
    for (const call of body.calls) {
      const toValidation = validateAddress(call.to);
      const dataValidation = validateHex(call.data);
      if (!toValidation.valid || !dataValidation.valid) {
        return NextResponse.json(
          { error: 'Invalid call data' },
          { status: 400 },
        );
      }
    }

    if (body.calls.length > 10) {
      return NextResponse.json(
        { error: 'Too many calls (max 10)' },
        { status: 400 },
      );
    }

    log.info('Execute relay request', {
      sender: body.sender,
      callCount: body.calls.length,
      chainId: body.chainId,
    });

    // In production, this would:
    // 1. Build a UserOperation with the provided calls
    // 2. Get paymaster sponsorship if configured
    // 3. Submit to the bundler
    // 4. Return the userOpHash

    const response = {
      id: `execute-${Date.now()}`,
      status: 'pending' as const,
      userOpHash: undefined,
      timestamp: Date.now(),
    };

    return NextResponse.json(response, { status: 202 });
  } catch (err) {
    log.error('Execute relay failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Execute relay failed' },
      { status: 500 },
    );
  }
}
