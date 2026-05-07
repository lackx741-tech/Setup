import {
  type Address,
  type Hex,
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  type WalletClient,
} from 'viem';
import { type SignedAuthorization, type DelegationRequest } from '@/types/eip7702';

/**
 * Build the authorization hash for EIP-7702.
 * MAGIC = keccak256("eip7702")
 */
const EIP7702_MAGIC = '0xd3a79d6c0b9e4a3a7c2c95b6b0e7d5a3c9f1e8b4d7e6c5a2f1b3e9d2c7a4f8e1' as const;

export function buildAuthorizationHash(params: {
  chainId: number;
  address: Address;
  nonce: bigint;
}): Hex {
  const { chainId, address, nonce } = params;
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters('bytes1,uint256,address,uint256'),
      ['0x05', BigInt(chainId), address, nonce],
    ),
  );
}

/**
 * Sign an EIP-7702 authorization using a wallet client.
 */
export async function signAuthorization(
  walletClient: WalletClient,
  account: Address,
  params: {
    chainId: number;
    contractAddress: Address;
    nonce: bigint;
  },
): Promise<SignedAuthorization> {
  const hash = buildAuthorizationHash({
    chainId: params.chainId,
    address: params.contractAddress,
    nonce: params.nonce,
  });

  const signature = await walletClient.signMessage({
    account,
    message: { raw: hash },
  });

  const { r, s, v } = splitSignature(signature);

  return {
    chainId: params.chainId,
    address: params.contractAddress,
    nonce: params.nonce,
    yParity: v === 27 ? 0 : 1,
    r,
    s,
    signature,
  };
}

function splitSignature(sig: Hex): { r: Hex; s: Hex; v: number } {
  const stripped = sig.replace('0x', '');
  return {
    r: `0x${stripped.slice(0, 64)}` as Hex,
    s: `0x${stripped.slice(64, 128)}` as Hex,
    v: parseInt(stripped.slice(128, 130), 16),
  };
}

/**
 * Validate that a delegation request has required fields.
 */
export function validateDelegationRequest(req: DelegationRequest): string[] {
  const errors: string[] = [];

  if (!req.delegator || !/^0x[0-9a-fA-F]{40}$/.test(req.delegator)) {
    errors.push('Invalid delegator address');
  }
  if (!req.delegatee || !/^0x[0-9a-fA-F]{40}$/.test(req.delegatee)) {
    errors.push('Invalid delegatee address');
  }
  if (req.delegator?.toLowerCase() === req.delegatee?.toLowerCase()) {
    errors.push('Delegator and delegatee must be different addresses');
  }
  if (req.expiry !== undefined && req.expiry < BigInt(Math.floor(Date.now() / 1000))) {
    errors.push('Expiry must be in the future');
  }

  return errors;
}

/**
 * Serialize a SignedAuthorization to RLP-compatible format.
 */
export function serializeAuthorization(auth: SignedAuthorization): Hex {
  return encodeAbiParameters(
    parseAbiParameters('uint256,address,uint256,uint256,bytes32,bytes32'),
    [BigInt(auth.chainId), auth.address, auth.nonce, BigInt(auth.yParity), auth.r, auth.s],
  );
}
