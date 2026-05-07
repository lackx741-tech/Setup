import { Address } from 'viem';

// ERC-4337 EntryPoint v0.6 (canonical deployment)
export const ENTRY_POINT_V06_ADDRESS: Address =
  '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

// ERC-4337 EntryPoint v0.7 (canonical deployment)
export const ENTRY_POINT_V07_ADDRESS: Address =
  '0x0000000071727De22E5E9d8BAf0edAc6f37da032';

export const DEFAULT_ENTRY_POINT_ADDRESS = ENTRY_POINT_V07_ADDRESS;

// EIP-7702 magic prefix for authorization list
export const EIP7702_MAGIC_PREFIX = '0x04' as const;

// Standard gas limits
export const DEFAULT_CALL_GAS_LIMIT = BigInt(100_000);
export const DEFAULT_VERIFICATION_GAS_LIMIT = BigInt(150_000);
export const DEFAULT_PRE_VERIFICATION_GAS = BigInt(50_000);

// Timeouts
export const USER_OP_TIMEOUT_MS = 60_000;
export const RELAY_TIMEOUT_MS = 30_000;
export const TX_CONFIRMATION_TIMEOUT_MS = 120_000;

// Limits
export const MAX_BATCH_SIZE = 10;
export const MAX_CALLDATA_SIZE = 131_072; // 128KB
export const MAX_DELEGATION_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds

// Sweep thresholds (in wei)
export const ETH_SWEEP_THRESHOLD = BigInt('10000000000000000'); // 0.01 ETH
export const TOKEN_SWEEP_THRESHOLD = BigInt('1000000'); // 1 USDC (6 decimals)

// Well-known token addresses (mainnet)
export const USDC_MAINNET: Address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const USDT_MAINNET: Address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
export const WETH_MAINNET: Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const DAI_MAINNET: Address = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

// Well-known token addresses (sepolia)
export const USDC_SEPOLIA: Address = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
export const WETH_SEPOLIA: Address = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';

// Bundler RPC methods
export const BUNDLER_METHODS = {
  ETH_SEND_USER_OPERATION: 'eth_sendUserOperation',
  ETH_GET_USER_OPERATION_RECEIPT: 'eth_getUserOperationReceipt',
  ETH_GET_USER_OPERATION_BY_HASH: 'eth_getUserOperationByHash',
  ETH_ESTIMATE_USER_OPERATION_GAS: 'eth_estimateUserOperationGas',
  ETH_SUPPORTED_ENTRY_POINTS: 'eth_supportedEntryPoints',
} as const;

// Signature modes
export const SIGNATURE_MODE = {
  OWNER: 0,
  GUARDIAN: 1,
  SESSION_KEY: 2,
} as const;

// Paymaster modes
export const PAYMASTER_MODE = {
  SPONSOR: 0,
  TOKEN: 1,
} as const;
