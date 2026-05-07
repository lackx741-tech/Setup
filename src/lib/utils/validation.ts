import { type Address, type Hex } from 'viem';

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const ETH_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;
const HEX_REGEX = /^0x[0-9a-fA-F]*$/;
const TX_HASH_REGEX = /^0x[0-9a-fA-F]{64}$/;

/**
 * Validate an Ethereum address.
 */
export function validateAddress(address: unknown): ValidationResult {
  if (typeof address !== 'string' || !ETH_ADDRESS_REGEX.test(address)) {
    return { valid: false, errors: ['Invalid Ethereum address format'] };
  }
  return { valid: true, errors: [] };
}

/**
 * Validate a hex string.
 */
export function validateHex(hex: unknown): ValidationResult {
  if (typeof hex !== 'string' || !HEX_REGEX.test(hex)) {
    return { valid: false, errors: ['Invalid hex string'] };
  }
  return { valid: true, errors: [] };
}

/**
 * Validate a transaction hash.
 */
export function validateTxHash(hash: unknown): ValidationResult {
  if (typeof hash !== 'string' || !TX_HASH_REGEX.test(hash)) {
    return { valid: false, errors: ['Invalid transaction hash (must be 32-byte hex)'] };
  }
  return { valid: true, errors: [] };
}

/**
 * Validate a bigint value is within [min, max].
 */
export function validateBigintRange(
  value: bigint,
  min: bigint,
  max: bigint,
  field = 'Value',
): ValidationResult {
  const errors: string[] = [];
  if (value < min) errors.push(`${field} must be >= ${min}`);
  if (value > max) errors.push(`${field} must be <= ${max}`);
  return { valid: errors.length === 0, errors };
}

/**
 * Validate a chain ID is supported.
 */
export function validateChainId(
  chainId: number,
  supported: number[],
): ValidationResult {
  if (!supported.includes(chainId)) {
    return {
      valid: false,
      errors: [`Chain ID ${chainId} is not supported. Supported: ${supported.join(', ')}`],
    };
  }
  return { valid: true, errors: [] };
}

/**
 * Combine multiple validation results into one.
 */
export function combineValidations(
  ...results: ValidationResult[]
): ValidationResult {
  const errors = results.flatMap((r) => r.errors);
  return { valid: errors.length === 0, errors };
}

/**
 * Assert a validation result, throwing an error if invalid.
 */
export function assertValid(result: ValidationResult, prefix?: string): void {
  if (!result.valid) {
    const message = result.errors.map((e) => (prefix ? `${prefix}: ${e}` : e)).join('; ');
    throw new Error(message);
  }
}
