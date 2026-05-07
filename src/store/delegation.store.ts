import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Address } from 'viem';
import { type DelegationRecord, type SignedAuthorization } from '@/types/eip7702';

interface DelegationStore {
  // State
  activeDelegation: DelegationRecord | undefined;
  delegationHistory: DelegationRecord[];
  pendingAuthorization: SignedAuthorization | undefined;
  isLoading: boolean;
  error: string | undefined;

  // Actions
  setActiveDelegation: (delegation: DelegationRecord | undefined) => void;
  addDelegationRecord: (record: DelegationRecord) => void;
  updateDelegationStatus: (
    id: string,
    status: DelegationRecord['status'],
  ) => void;
  setPendingAuthorization: (auth: SignedAuthorization | undefined) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | undefined) => void;
  clearHistory: () => void;
  reset: () => void;
}

const initialState = {
  activeDelegation: undefined,
  delegationHistory: [],
  pendingAuthorization: undefined,
  isLoading: false,
  error: undefined,
};

export const useDelegationStore = create<DelegationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveDelegation: (activeDelegation) => set({ activeDelegation }),

      addDelegationRecord: (record) =>
        set((state) => ({
          delegationHistory: [record, ...state.delegationHistory].slice(0, 100),
        })),

      updateDelegationStatus: (id, status) =>
        set((state) => ({
          delegationHistory: state.delegationHistory.map((r) =>
            r.id === id ? { ...r, status } : r,
          ),
          activeDelegation:
            state.activeDelegation?.id === id
              ? { ...state.activeDelegation, status }
              : state.activeDelegation,
        })),

      setPendingAuthorization: (pendingAuthorization) =>
        set({ pendingAuthorization }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearHistory: () => set({ delegationHistory: [] }),
      reset: () => set(initialState),
    }),
    {
      name: 'delegation-store',
      partialize: (state) => ({
        activeDelegation: state.activeDelegation,
        delegationHistory: state.delegationHistory.slice(0, 20),
      }),
    },
  ),
);

// Selectors
export const selectActiveDelegation = (state: DelegationStore) =>
  state.activeDelegation;
export const selectDelegationHistory = (state: DelegationStore) =>
  state.delegationHistory;
export const selectHasActiveDelegation = (state: DelegationStore) =>
  state.activeDelegation?.status === 'active';
