import { create } from 'zustand';
import { type Hex, type Address } from 'viem';
import { type SweepOperation, type BatchOperation } from '@/types/daas';

export type ExecutionStatus =
  | 'idle'
  | 'preparing'
  | 'signing'
  | 'submitting'
  | 'pending'
  | 'confirmed'
  | 'failed';

interface ExecutionStore {
  // State
  status: ExecutionStatus;
  currentTxHash: Hex | undefined;
  currentUserOpHash: Hex | undefined;
  pendingSweeps: SweepOperation[];
  pendingBatch: BatchOperation | undefined;
  executionLog: string[];
  error: string | undefined;

  // Actions
  setStatus: (status: ExecutionStatus) => void;
  setCurrentTxHash: (hash: Hex | undefined) => void;
  setCurrentUserOpHash: (hash: Hex | undefined) => void;
  addSweepOperation: (op: SweepOperation) => void;
  updateSweepStatus: (id: string, status: SweepOperation['status']) => void;
  setPendingBatch: (batch: BatchOperation | undefined) => void;
  addLogEntry: (entry: string) => void;
  clearLog: () => void;
  setError: (error: string | undefined) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as ExecutionStatus,
  currentTxHash: undefined,
  currentUserOpHash: undefined,
  pendingSweeps: [],
  pendingBatch: undefined,
  executionLog: [],
  error: undefined,
};

export const useExecutionStore = create<ExecutionStore>()((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setCurrentTxHash: (currentTxHash) => set({ currentTxHash }),
  setCurrentUserOpHash: (currentUserOpHash) => set({ currentUserOpHash }),

  addSweepOperation: (op) =>
    set((state) => ({
      pendingSweeps: [...state.pendingSweeps, op],
    })),

  updateSweepStatus: (id, status) =>
    set((state) => ({
      pendingSweeps: state.pendingSweeps.map((op) =>
        op.id === id ? { ...op, status } : op,
      ),
    })),

  setPendingBatch: (pendingBatch) => set({ pendingBatch }),

  addLogEntry: (entry) =>
    set((state) => ({
      executionLog: [
        `[${new Date().toISOString()}] ${entry}`,
        ...state.executionLog,
      ].slice(0, 200),
    })),

  clearLog: () => set({ executionLog: [] }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));

// Selectors
export const selectExecutionStatus = (state: ExecutionStore) => state.status;
export const selectIsExecuting = (state: ExecutionStore) =>
  ['preparing', 'signing', 'submitting', 'pending'].includes(state.status);
export const selectExecutionLog = (state: ExecutionStore) => state.executionLog;
