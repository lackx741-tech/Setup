import {
  type Address,
  type Hex,
  encodeFunctionData,
  encodePacked,
  keccak256,
} from 'viem';

/**
 * Encode ERC-20 transfer calldata.
 */
export function encodeERC20Transfer(to: Address, amount: bigint): Hex {
  return encodeFunctionData({
    abi: [
      {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ],
    functionName: 'transfer',
    args: [to, amount],
  });
}

/**
 * Encode ERC-20 approve calldata.
 */
export function encodeERC20Approve(spender: Address, amount: bigint): Hex {
  return encodeFunctionData({
    abi: [
      {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ],
    functionName: 'approve',
    args: [spender, amount],
  });
}

/**
 * Encode ERC-20 transferFrom calldata.
 */
export function encodeERC20TransferFrom(
  from: Address,
  to: Address,
  amount: bigint,
): Hex {
  return encodeFunctionData({
    abi: [
      {
        name: 'transferFrom',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ],
    functionName: 'transferFrom',
    args: [from, to, amount],
  });
}

/**
 * Encode a native ETH transfer (empty calldata).
 */
export function encodeETHTransfer(): Hex {
  return '0x';
}

/**
 * Build packed calldata for a multi-call.
 */
export function buildMultiCallData(
  calls: { to: Address; value: bigint; data: Hex }[],
): Hex {
  if (calls.length === 0) return '0x';

  const parts = calls.map((call) =>
    encodePacked(
      ['address', 'uint256', 'uint256', 'bytes'],
      [call.to, call.value, BigInt(call.data.length / 2 - 1), call.data],
    ),
  );

  return ('0x' + parts.map((p) => p.replace('0x', '')).join('')) as Hex;
}

/**
 * Compute a deterministic salt for create2 deployments.
 */
export function computeCreate2Salt(owner: Address, index: number): Hex {
  return keccak256(
    encodePacked(['address', 'uint256'], [owner, BigInt(index)]),
  );
}
