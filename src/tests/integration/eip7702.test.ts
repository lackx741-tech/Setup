import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { createPublicClient, http, type Address, type Hex } from 'viem';
import { sepolia } from 'viem/chains';
import { buildAuthorizationHash, validateDelegationRequest } from '../../lib/utils/delegation';
import { validateAddress } from '../../lib/utils/validation';

const MOCK_AUTHORITY = '0x1234567890abcdef1234567890abcdef12345678' as Address;
const MOCK_DELEGATE = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address;

describe('EIP-7702 Integration', () => {
  describe('buildAuthorizationHash', () => {
    it('produces a deterministic 32-byte hash', () => {
      const hash1 = buildAuthorizationHash({
        chainId: 11155111,
        address: MOCK_DELEGATE,
        nonce: 0n,
      });
      const hash2 = buildAuthorizationHash({
        chainId: 11155111,
        address: MOCK_DELEGATE,
        nonce: 0n,
      });
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(66); // 0x + 64 hex chars
      expect(hash1.startsWith('0x')).toBe(true);
    });

    it('produces different hashes for different nonces', () => {
      const hash1 = buildAuthorizationHash({ chainId: 11155111, address: MOCK_DELEGATE, nonce: 0n });
      const hash2 = buildAuthorizationHash({ chainId: 11155111, address: MOCK_DELEGATE, nonce: 1n });
      expect(hash1).not.toBe(hash2);
    });

    it('produces different hashes for different chainIds', () => {
      const hashSepolia = buildAuthorizationHash({ chainId: 11155111, address: MOCK_DELEGATE, nonce: 0n });
      const hashMainnet = buildAuthorizationHash({ chainId: 1, address: MOCK_DELEGATE, nonce: 0n });
      expect(hashSepolia).not.toBe(hashMainnet);
    });
  });

  describe('validateDelegationRequest', () => {
    it('accepts a valid delegation request', () => {
      const result = validateDelegationRequest({
        authority: MOCK_AUTHORITY,
        delegate: MOCK_DELEGATE,
        chainId: 11155111,
        nonce: 0n,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects self-delegation', () => {
      const result = validateDelegationRequest({
        authority: MOCK_AUTHORITY,
        delegate: MOCK_AUTHORITY,
        chainId: 11155111,
        nonce: 0n,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects invalid addresses', () => {
      const result = validateDelegationRequest({
        authority: '0xinvalid' as Address,
        delegate: MOCK_DELEGATE,
        chainId: 11155111,
        nonce: 0n,
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateAddress', () => {
    it('accepts valid checksummed address', () => {
      expect(validateAddress(MOCK_AUTHORITY)).toBe(true);
    });

    it('rejects non-hex strings', () => {
      expect(validateAddress('not-an-address')).toBe(false);
    });

    it('rejects addresses of wrong length', () => {
      expect(validateAddress('0x1234')).toBe(false);
    });
  });
});
