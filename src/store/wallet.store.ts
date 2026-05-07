import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Address } from 'viem';

interface WalletStore {
  // State
  address: Address | undefined;
  chainId: number | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  balance: bigint;
  ens: string | undefined;

  // Actions
  setAddress: (address: Address | undefined) => void;
  setChainId: (chainId: number | undefined) => void;
  setIsConnected: (isConnected: boolean) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setBalance: (balance: bigint) => void;
  setEns: (ens: string | undefined) => void;
  reset: () => void;
}

const initialState = {
  address: undefined,
  chainId: undefined,
  isConnected: false,
  isConnecting: false,
  balance: 0n,
  ens: undefined,
};

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAddress: (address) => set({ address }),
      setChainId: (chainId) => set({ chainId }),
      setIsConnected: (isConnected) => set({ isConnected }),
      setIsConnecting: (isConnecting) => set({ isConnecting }),
      setBalance: (balance) => set({ balance }),
      setEns: (ens) => set({ ens }),

      reset: () => set(initialState),
    }),
    {
      name: 'wallet-store',
      partialize: (state) => ({
        address: state.address,
        chainId: state.chainId,
      }),
    },
  ),
);

// Selectors
export const selectAddress = (state: WalletStore) => state.address;
export const selectChainId = (state: WalletStore) => state.chainId;
export const selectIsConnected = (state: WalletStore) => state.isConnected;
