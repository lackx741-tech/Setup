'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { useERC4337 } from '@/hooks/useERC4337';
import { usePaymaster } from '@/hooks/usePaymaster';

export function UserOperationBuilder() {
  const { address } = useAccount();
  const { buildUserOperation, estimateGas, sendUserOperation, isLoading, error, gasEstimate } = useERC4337();
  const { getPaymasterData, paymasterMode, setPaymasterMode } = usePaymaster();

  const [to, setTo] = useState('');
  const [value, setValue] = useState('0');
  const [calldata, setCalldata] = useState('0x');
  const [userOpHash, setUserOpHash] = useState('');

  const handleBuildAndSend = async () => {
    if (!address) return;

    const userOp = buildUserOperation({
      sender: address,
      callData: calldata as Hex,
    });

    const gas = await estimateGas(userOp);
    const finalUserOp = gas ? { ...userOp, ...gas } : userOp;

    if (paymasterMode !== 'none') {
      const pmData = await getPaymasterData(finalUserOp);
      if (pmData) {
        Object.assign(finalUserOp, {
          paymasterAndData: pmData.paymaster + pmData.paymasterData.replace('0x', ''),
        });
      }
    }

    const hash = await sendUserOperation(finalUserOp);
    if (hash) setUserOpHash(hash);
  };

  return (
    <div className="card space-y-4">
      <h3 className="section-title">UserOperation Builder</h3>

      <div className="space-y-3">
        <div>
          <label className="label">Sender</label>
          <input
            type="text"
            value={address ?? ''}
            readOnly
            placeholder="Connect wallet..."
            className="input opacity-60 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="label">Call Target</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="input"
          />
        </div>

        <div>
          <label className="label">Value (wei)</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            className="input"
          />
        </div>

        <div>
          <label className="label">Calldata</label>
          <input
            type="text"
            value={calldata}
            onChange={(e) => setCalldata(e.target.value)}
            placeholder="0x"
            className="input font-mono text-xs"
          />
        </div>

        <div>
          <label className="label">Paymaster Mode</label>
          <select
            value={paymasterMode}
            onChange={(e) => setPaymasterMode(e.target.value as 'verifying' | 'token' | 'none')}
            className="input"
          >
            <option value="verifying">Verifying (Sponsored)</option>
            <option value="token">Token Paymaster</option>
            <option value="none">None (Self-pay)</option>
          </select>
        </div>
      </div>

      {gasEstimate && (
        <div className="bg-surface rounded-lg p-3 space-y-1.5 text-xs">
          <p className="font-medium text-slate-300 mb-2">Gas Estimate</p>
          {[
            ['Call Gas Limit', gasEstimate.callGasLimit.toString()],
            ['Verification Gas', gasEstimate.verificationGasLimit.toString()],
            ['Pre-Verification Gas', gasEstimate.preVerificationGas.toString()],
            ['Max Fee Per Gas', `${Number(gasEstimate.maxFeePerGas) / 1e9} Gwei`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-slate-500">{k}</span>
              <span className="font-mono text-slate-300">{v}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}

      {userOpHash && (
        <p className="text-xs text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20 font-mono break-all">
          UserOp Hash: {userOpHash}
        </p>
      )}

      <button
        onClick={handleBuildAndSend}
        disabled={!address || isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Submitting...' : 'Build & Send UserOperation'}
      </button>
    </div>
  );
}
