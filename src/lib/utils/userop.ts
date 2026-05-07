import {
  type Address,
  type Hex,
  encodeFunctionData,
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  concat,
  toHex,
} from 'viem';
import { type UserOperation, type GasEstimate } from '@/types/erc4337';
import { ENTRY_POINT_V07_ADDRESS } from '@/contracts/constants';
import SmartAccountABI from '@/contracts/abis/SmartAccount.json';

/**
 * Encode a single execute call into UserOperation calldata.
 */
export function encodeExecuteCalldata(
  dest: Address,
  value: bigint,
  data: Hex,
): Hex {
  return encodeFunctionData({
    abi: SmartAccountABI,
    functionName: 'execute',
    args: [dest, value, data],
  });
}

/**
 * Encode a batch of calls into UserOperation calldata.
 */
export function encodeBatchCalldata(
  dests: Address[],
  values: bigint[],
  datas: Hex[],
): Hex {
  return encodeFunctionData({
    abi: SmartAccountABI,
    functionName: 'executeBatch',
    args: [dests, values, datas],
  });
}

/**
 * Compute the UserOperation hash for ERC-4337 v0.6.
 */
export function getUserOperationHash(
  userOp: UserOperation,
  chainId: number,
  entryPoint: Address = ENTRY_POINT_V07_ADDRESS,
): Hex {
  const packed = encodeAbiParameters(
    parseAbiParameters(
      'address,uint256,bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,bytes32',
    ),
    [
      userOp.sender,
      userOp.nonce,
      keccak256(userOp.initCode),
      keccak256(userOp.callData),
      userOp.callGasLimit,
      userOp.verificationGasLimit,
      userOp.preVerificationGas,
      userOp.maxFeePerGas,
      userOp.maxPriorityFeePerGas,
      keccak256(userOp.paymasterAndData),
    ],
  );

  const opHash = keccak256(packed);

  return keccak256(
    encodeAbiParameters(
      parseAbiParameters('bytes32,address,uint256'),
      [opHash, entryPoint, BigInt(chainId)],
    ),
  );
}

/**
 * Create a default (empty) UserOperation for a given sender.
 */
export function createEmptyUserOperation(sender: Address): UserOperation {
  return {
    sender,
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    callGasLimit: 100_000n,
    verificationGasLimit: 150_000n,
    preVerificationGas: 50_000n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    paymasterAndData: '0x',
    signature: '0x',
  };
}

/**
 * Apply a gas estimate to a UserOperation.
 */
export function applyGasEstimate(
  userOp: UserOperation,
  estimate: GasEstimate,
): UserOperation {
  return {
    ...userOp,
    callGasLimit: estimate.callGasLimit,
    verificationGasLimit: estimate.verificationGasLimit,
    preVerificationGas: estimate.preVerificationGas,
    maxFeePerGas: estimate.maxFeePerGas,
    maxPriorityFeePerGas: estimate.maxPriorityFeePerGas,
  };
}

/**
 * Format paymaster and data field from components.
 */
export function formatPaymasterAndData(
  paymaster: Address,
  data: Hex,
): Hex {
  return concat([paymaster, data]) as Hex;
}
