import { create } from 'zustand';
import { type Address, type Hex } from 'viem';
import { type UserOperation, type UserOperationReceipt, type GasEstimate } from '@/types/erc4337';

interface BundlerStore {
  // State
  isSubmitting: boolean;
  pendingUserOpHash: Hex | undefined;
  lastReceipt: UserOperationReceipt | undefined;
  pendingUserOp: UserOperation | undefined;
  gasEstimate: GasEstimate | undefined;
  bundlerUrl: string;
  entryPointAddress: Address | undefined;
  error: string | undefined;

  // Actions
  setIsSubmitting: (isSubmitting: boolean) => void;
  setPendingUserOpHash: (hash: Hex | undefined) => void;
  setLastReceipt: (receipt: UserOperationReceipt | undefined) => void;
  setPendingUserOp: (userOp: UserOperation | undefined) => void;
  setGasEstimate: (estimate: GasEstimate | undefined) => void;
  setBundlerUrl: (url: string) => void;
  setEntryPointAddress: (address: Address | undefined) => void;
  setError: (error: string | undefined) => void;
  reset: () => void;
}

const initialState = {
  isSubmitting: false,
  pendingUserOpHash: undefined,
  lastReceipt: undefined,
  pendingUserOp: undefined,
  gasEstimate: undefined,
  bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL ?? '',
  entryPointAddress: undefined,
  error: undefined,
};

export const useBundlerStore = create<BundlerStore>()((set) => ({
  ...initialState,

  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setPendingUserOpHash: (pendingUserOpHash) => set({ pendingUserOpHash }),
  setLastReceipt: (lastReceipt) => set({ lastReceipt }),
  setPendingUserOp: (pendingUserOp) => set({ pendingUserOp }),
  setGasEstimate: (gasEstimate) => set({ gasEstimate }),
  setBundlerUrl: (bundlerUrl) => set({ bundlerUrl }),
  setEntryPointAddress: (entryPointAddress) => set({ entryPointAddress }),
  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

// Selectors
export const selectIsSubmitting = (state: BundlerStore) => state.isSubmitting;
export const selectPendingUserOpHash = (state: BundlerStore) =>
  state.pendingUserOpHash;
export const selectLastReceipt = (state: BundlerStore) => state.lastReceipt;
export const selectGasEstimate = (state: BundlerStore) => state.gasEstimate;
