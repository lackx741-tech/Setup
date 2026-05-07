import { Address } from 'viem';

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
  chainId: string;
  selectedAddress: string | null;
}

export type ChainId = 1 | 11155111 | 8453 | 42161;

export interface ChainInfo {
  id: ChainId;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorer: string;
  isTestnet: boolean;
}

export interface NotificationPayload {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  txHash?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

export interface AppConfig {
  appName: string;
  appUrl: string;
  environment: 'development' | 'staging' | 'production';
  defaultChainId: ChainId;
  features: FeatureFlags;
}

export interface FeatureFlags {
  enableEIP7702: boolean;
  enableERC4337: boolean;
  enableDaaS: boolean;
  enableGasless: boolean;
  enableTestnets: boolean;
}

export interface WalletState {
  address?: Address;
  chainId?: number;
  isConnected: boolean;
  isConnecting: boolean;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
