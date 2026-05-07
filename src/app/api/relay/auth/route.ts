import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { buildSiweMessage, generateNonce } from '@/lib/auth';
import { type RelayAuthRequest } from '@/types/relay';

const log = logger.child('api:relay:auth');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RelayAuthRequest;

    if (!body.address || !body.signature || !body.message || !body.chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: address, signature, message, chainId' },
        { status: 400 },
      );
    }

    // Verify the SIWE message signature server-side
    // In production, use a proper SIWE library
    const { verifyMessage } = await import('viem');
    const isValid = await verifyMessage({
      address: body.address,
      message: body.message,
      signature: body.signature,
    }).catch(() => false);

    if (!isValid) {
      log.warn('Invalid signature in auth request', { address: body.address });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Generate a session token (use a proper JWT library in production)
    const sessionId = `session-${Date.now()}-${crypto.randomUUID()}`;
    const expiresAt = Math.floor(Date.now() / 1000) + 24 * 3600; // 24h

    const token = {
      token: `mock.jwt.${Buffer.from(JSON.stringify({ sub: body.address, sessionId, exp: expiresAt })).toString('base64')}`,
      expiresAt,
      address: body.address,
      chainId: body.chainId,
    };

    log.info('Auth successful', { address: body.address, chainId: body.chainId });
    return NextResponse.json(token, { status: 200 });
  } catch (err) {
    log.error('Auth request failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Authentication failed' },
      { status: 500 },
    );
  }
}

export async function GET() {
  const nonce = generateNonce();
  return NextResponse.json({ nonce }, { status: 200 });
}
