'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useBundler } from '@/hooks/useBundler';
import { useExecutionStore } from '@/store/execution.store';

export function BundlerConsole() {
  const { chainId } = useAccount();
  const { checkBundlerHealth, isConnected, error } = useBundler();
  const { executionLog, clearLog } = useExecutionStore();
  const [rpcMethod, setRpcMethod] = useState('eth_supportedEntryPoints');
  const [rpcParams, setRpcParams] = useState('[]');
  const [rpcResult, setRpcResult] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [executionLog]);

  const handleRpcCall = async () => {
    if (!chainId) {
      setRpcResult('Error: No chain connected');
      return;
    }

    const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL;
    if (!bundlerUrl) {
      setRpcResult('Error: NEXT_PUBLIC_BUNDLER_URL not configured');
      return;
    }

    try {
      let params: unknown[];
      try {
        params = JSON.parse(rpcParams) as unknown[];
      } catch {
        setRpcResult('Error: Invalid JSON params');
        return;
      }

      const res = await fetch(bundlerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: rpcMethod,
          params,
          id: Date.now(),
        }),
      });

      const data = await res.json() as { result?: unknown; error?: { message: string } };
      setRpcResult(JSON.stringify(data.result ?? data.error, null, 2));
    } catch (err) {
      setRpcResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">Bundler Console</h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-slate-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button
            onClick={clearLog}
            className="text-xs text-slate-500 hover:text-slate-300 ml-2"
          >
            Clear
          </button>
        </div>
      </div>

      {/* RPC Tester */}
      <div className="space-y-2">
        <div>
          <label className="label text-xs">RPC Method</label>
          <select
            value={rpcMethod}
            onChange={(e) => setRpcMethod(e.target.value)}
            className="input text-xs"
          >
            <option value="eth_supportedEntryPoints">eth_supportedEntryPoints</option>
            <option value="eth_getUserOperationByHash">eth_getUserOperationByHash</option>
            <option value="eth_getUserOperationReceipt">eth_getUserOperationReceipt</option>
            <option value="eth_estimateUserOperationGas">eth_estimateUserOperationGas</option>
            <option value="eth_sendUserOperation">eth_sendUserOperation</option>
          </select>
        </div>
        <div>
          <label className="label text-xs">Params (JSON)</label>
          <input
            type="text"
            value={rpcParams}
            onChange={(e) => setRpcParams(e.target.value)}
            className="input text-xs font-mono"
          />
        </div>
        <button onClick={handleRpcCall} className="btn-secondary text-xs w-full">
          Send RPC Call
        </button>
        {rpcResult && (
          <pre className="bg-surface text-xs text-green-400 p-3 rounded border border-surface-border overflow-x-auto max-h-32">
            {rpcResult}
          </pre>
        )}
      </div>

      {/* Execution log */}
      <div>
        <p className="label text-xs mb-1">Execution Log</p>
        <div
          ref={logRef}
          className="bg-surface rounded border border-surface-border p-3 h-40 overflow-y-auto"
        >
          {executionLog.length === 0 ? (
            <p className="text-xs text-slate-600">No log entries yet...</p>
          ) : (
            executionLog.map((entry, i) => (
              <p key={i} className="text-xs font-mono text-slate-400 leading-relaxed">
                {entry}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
