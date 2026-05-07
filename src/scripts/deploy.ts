#!/usr/bin/env ts-node
/**
 * Deploy contracts to a target network.
 * Usage: npx ts-node src/scripts/deploy.ts --network sepolia
 */
import { createPublicClient, createWalletClient, http, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia, mainnet, base, arbitrum } from 'viem/chains';

const CHAIN_MAP: Record<string, Chain> = {
  sepolia,
  mainnet,
  base,
  arbitrum,
};

async function main() {
  const args = process.argv.slice(2);
  const networkArg = args.find((a) => a.startsWith('--network='))?.split('=')[1] ?? 'sepolia';

  const chain = CHAIN_MAP[networkArg];
  if (!chain) {
    console.error(`Unknown network: ${networkArg}. Supported: ${Object.keys(CHAIN_MAP).join(', ')}`);
    process.exit(1);
  }

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error('DEPLOYER_PRIVATE_KEY environment variable not set');
    process.exit(1);
  }

  const rpcUrl = process.env[`NEXT_PUBLIC_RPC_URL_${networkArg.toUpperCase()}`]
    ?? process.env.NEXT_PUBLIC_RPC_URL
    ?? chain.rpcUrls.default.http[0];

  const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}`);
  const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });

  console.log(`\n🚀 Deploying to ${networkArg}`);
  console.log(`   Deployer: ${account.address}`);
  console.log(`   RPC:      ${rpcUrl}`);

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`   Balance:  ${Number(balance) / 1e18} ETH\n`);

  if (balance === 0n) {
    console.error('Deployer has no ETH. Fund the account before deploying.');
    process.exit(1);
  }

  console.log('⚠️  No contracts currently in bytecode — add your ABI/bytecode before deploying.');
  console.log('   Update this script with contract deployment logic.');
  console.log('\n✅ Deploy script initialized successfully');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
