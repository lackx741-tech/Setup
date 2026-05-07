import { encodeAbiParameters, encodeFunctionData, parseAbiParameters, type Hex, type Address } from 'viem';

/**
 * Encode a function call using ABI parameters.
 */
export function encodeFunctionCall(
  abi: readonly unknown[],
  functionName: string,
  args: unknown[],
): Hex {
  return encodeFunctionData({
    abi: abi as Parameters<typeof encodeFunctionData>[0]['abi'],
    functionName,
    args,
  });
}

/**
 * Encode a value as ABI-encoded bytes.
 */
export function abiEncode(types: string, values: unknown[]): Hex {
  return encodeAbiParameters(parseAbiParameters(types), values as never[]);
}

/**
 * Encode an address to 32-byte padded hex.
 */
export function encodeAddress(address: Address): Hex {
  return `0x${address.toLowerCase().replace('0x', '').padStart(64, '0')}` as Hex;
}

/**
 * Encode a uint256 to 32-byte padded hex.
 */
export function encodeUint256(value: bigint): Hex {
  return `0x${value.toString(16).padStart(64, '0')}` as Hex;
}

/**
 * Concatenate multiple hex strings into one.
 */
export function concatHex(parts: Hex[]): Hex {
  return ('0x' + parts.map((p) => p.replace('0x', '')).join('')) as Hex;
}

/**
 * Convert a bigint to a minimal hex string.
 */
export function bigintToHex(value: bigint): Hex {
  return `0x${value.toString(16)}` as Hex;
}

/**
 * Decode a hex string to a bigint.
 */
export function hexToBigint(hex: Hex): bigint {
  return BigInt(hex);
}

/**
 * Zero-pad a hex string to a given byte length.
 */
export function padHex(hex: Hex, byteLength: number): Hex {
  const stripped = hex.replace('0x', '');
  return `0x${stripped.padStart(byteLength * 2, '0')}` as Hex;
}
