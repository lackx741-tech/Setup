import { describe, it, expect } from '@jest/globals';
import { type Address, type Hex } from 'viem';
import {
  encodeExecuteCalldata,
  getUserOperationHash,
  createEmptyUserOperation,
} from '../../lib/utils/userop';

const ENTRY_POINT = '0x0000000071727De22E5E9d8BAf0edAc6f37da032' as Address;
const SENDER = '0x1234567890abcdef1234567890abcdef12345678' as Address;

describe('ERC-4337 Integration', () => {
  describe('createEmptyUserOperation', () => {
    it('creates a well-formed UserOperation', () => {
      const userOp = createEmptyUserOperation(SENDER);
      expect(userOp.sender).toBe(SENDER);
      expect(userOp.nonce).toBe(0n);
      expect(userOp.callData).toBe('0x');
      expect(typeof userOp.callGasLimit).toBe('bigint');
      expect(typeof userOp.verificationGasLimit).toBe('bigint');
      expect(typeof userOp.preVerificationGas).toBe('bigint');
    });
  });

  describe('encodeExecuteCalldata', () => {
    it('encodes a simple call', () => {
      const to = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address;
      const data = encodeExecuteCalldata(to, 0n, '0x' as Hex);
      expect(data.startsWith('0x')).toBe(true);
      expect(data.length).toBeGreaterThan(10);
    });

    it('encodes a call with value', () => {
      const to = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address;
      const data = encodeExecuteCalldata(to, 1_000_000_000_000_000_000n, '0x' as Hex);
      expect(data.startsWith('0x')).toBe(true);
    });
  });

  describe('getUserOperationHash', () => {
    it('produces a consistent 32-byte hash', () => {
      const userOp = createEmptyUserOperation(SENDER);
      const hash = getUserOperationHash(userOp, ENTRY_POINT, 11155111);
      expect(hash.startsWith('0x')).toBe(true);
      expect(hash).toHaveLength(66);
    });

    it('produces different hashes for different chainIds', () => {
      const userOp = createEmptyUserOperation(SENDER);
      const sepoliaHash = getUserOperationHash(userOp, ENTRY_POINT, 11155111);
      const mainnetHash = getUserOperationHash(userOp, ENTRY_POINT, 1);
      expect(sepoliaHash).not.toBe(mainnetHash);
    });
  });
});
