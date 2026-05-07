import {
  type Address,
  type Hex,
  type WalletClient,
  hashMessage,
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  recoverMessageAddress,
  recoverAddress,
} from 'viem';

/**
 * Hash a message the same way eth_sign does (with Ethereum prefix).
 */
export function hashEthMessage(message: string): Hex {
  return hashMessage(message);
}

/**
 * Hash raw bytes (no Ethereum prefix).
 */
export function hashBytes(data: Hex): Hex {
  return keccak256(data);
}

/**
 * Build the EIP-712 domain separator.
 */
export function buildDomainSeparator(params: {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: Address;
}): Hex {
  const { name, version, chainId, verifyingContract } = params;
  const domainTypeHash = keccak256(
    encodeAbiParameters(
      parseAbiParameters('string'),
      ['EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'],
    ),
  );
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters('bytes32,bytes32,bytes32,uint256,address'),
      [
        domainTypeHash,
        keccak256(encodeAbiParameters(parseAbiParameters('string'), [name])),
        keccak256(encodeAbiParameters(parseAbiParameters('string'), [version])),
        BigInt(chainId),
        verifyingContract,
      ],
    ),
  );
}

/**
 * Split a compact signature into r, s, v components.
 */
export function splitSignature(signature: Hex): {
  r: Hex;
  s: Hex;
  v: number;
} {
  const sig = signature.replace('0x', '');
  return {
    r: `0x${sig.slice(0, 64)}` as Hex,
    s: `0x${sig.slice(64, 128)}` as Hex,
    v: parseInt(sig.slice(128, 130), 16),
  };
}

/**
 * Recover the signing address from a message and its signature.
 */
export async function recoverSigner(
  message: string,
  signature: Hex,
): Promise<Address> {
  return recoverMessageAddress({ message, signature });
}

/**
 * Sign a message using a wallet client.
 */
export async function signMessage(
  walletClient: WalletClient,
  account: Address,
  message: string,
): Promise<Hex> {
  return walletClient.signMessage({ account, message });
}
