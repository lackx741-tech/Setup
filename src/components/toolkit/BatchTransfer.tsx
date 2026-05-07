'use client';

import { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { type Address, type Hex, parseEther } from 'viem';
import { encodeERC20Transfer } from '@/lib/utils/calldata';

interface Recipient {
  address: string;
  amount: string;
}

export function BatchTransfer() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [tokenAddress, setTokenAddress] = useState('');
  const [isETH, setIsETH] = useState(true);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: '', amount: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const addRecipient = () =>
    setRecipients((prev) => [...prev, { address: '', amount: '' }]);
  const removeRecipient = (i: number) =>
    setRecipients((prev) => prev.filter((_, idx) => idx !== i));
  const updateRecipient = (i: number, field: keyof Recipient, value: string) =>
    setRecipients((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );

  const handleSend = async () => {
    if (!address || !walletClient) {
      setError('Connect wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const hashes: string[] = [];

      for (const recipient of recipients) {
        if (!recipient.address || !recipient.amount) continue;

        if (isETH) {
          const hash = await walletClient.sendTransaction({
            account: address,
            to: recipient.address as Address,
            value: parseEther(recipient.amount),
          });
          hashes.push(hash);
        } else if (tokenAddress) {
          const data = encodeERC20Transfer(
            recipient.address as Address,
            parseEther(recipient.amount),
          );
          const hash = await walletClient.sendTransaction({
            account: address,
            to: tokenAddress as Address,
            data,
            value: 0n,
          });
          hashes.push(hash);
        }
      }

      setResults(hashes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = recipients
    .reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0)
    .toFixed(6);

  return (
    <div className="card space-y-4">
      <h3 className="section-title">Batch Transfer</h3>

      <div className="flex gap-3 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={isETH}
            onChange={() => setIsETH(true)}
            className="accent-brand-500"
          />
          <span className="text-sm text-slate-300">ETH</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!isETH}
            onChange={() => setIsETH(false)}
            className="accent-brand-500"
          />
          <span className="text-sm text-slate-300">ERC-20</span>
        </label>
        {!isETH && (
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Token address..."
            className="input flex-1 text-xs"
          />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="label mb-0">Recipients</label>
          <button onClick={addRecipient} className="text-xs text-brand-400 hover:text-brand-300">
            + Add
          </button>
        </div>
        {recipients.map((r, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={r.address}
              onChange={(e) => updateRecipient(i, 'address', e.target.value)}
              placeholder="0x..."
              className="input flex-1 text-xs"
            />
            <input
              type="text"
              value={r.amount}
              onChange={(e) => updateRecipient(i, 'amount', e.target.value)}
              placeholder="0.0"
              className="input w-28 text-xs"
            />
            {recipients.length > 1 && (
              <button
                onClick={() => removeRecipient(i)}
                className="text-red-400 hover:text-red-300 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <p className="text-xs text-slate-500 text-right">
          Total: {totalAmount} {isETH ? 'ETH' : 'tokens'}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <p className="text-xs font-medium text-green-400 mb-1">
            {results.length} transaction{results.length !== 1 ? 's' : ''} sent
          </p>
          {results.map((h, i) => (
            <p key={i} className="text-xs font-mono text-green-300 truncate">{h}</p>
          ))}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={!address || isLoading || recipients.every((r) => !r.address)}
        className="btn-primary w-full"
      >
        {isLoading ? 'Sending...' : `📤 Send to ${recipients.length} recipient(s)`}
      </button>
    </div>
  );
}
